import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Folder, LoopType, FOLDER_ICONS, FOLDER_COLORS } from '../types/loop';
import { Header } from '../components/Header';
import { LoopSelectionModal } from '../components/LoopSelectionModal';
import { LoopCard } from '../components/native/LoopCard';
import CreateLoopModal from '../components/native/CreateLoopModal';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type FilterType = 'all' | 'manual' | 'daily' | 'weekly';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, signOut, loading } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [loops, setLoops] = useState<any[]>([]);
  const [todayLoops, setTodayLoops] = useState<any[]>([]);
  const [upcomingLoops, setUpcomingLoops] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [totalStreak, setTotalStreak] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [creating, setCreating] = useState(false);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [loopsToSelect, setLoopsToSelect] = useState<any[]>([]);
  const [selectedFolderName, setSelectedFolderName] = useState('');

  // Loop editing state
  const [editingLoop, setEditingLoop] = useState<any | null>(null);
  const [isEditingLoop, setIsEditingLoop] = useState(false);

  useEffect(() => {
    updateDate();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterLoops();
  }, [loops, selectedFilter]);

  const filterLoops = () => {
    let filtered = [...loops];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(loop => loop.reset_rule === selectedFilter);
    }

    const now = new Date();
    // Use the end of today as boundary (anything tomorrow onwards is upcoming)
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const today = filtered.filter(loop => {
      if (loop.reset_rule !== 'manual') return true;
      if (!loop.due_date) return true;
      const dueDate = new Date(loop.due_date);
      return dueDate <= endOfToday;
    });

    const upcoming = filtered.filter(loop => {
      if (loop.reset_rule !== 'manual') return false;
      if (!loop.due_date) return false;
      const dueDate = new Date(loop.due_date);
      return dueDate > endOfToday;
    });

    setTodayLoops(today);
    setUpcomingLoops(upcoming);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Login');
    }
  }, [loading, user, navigation]);

  const updateDate = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formatted);
  };

  const loadData = async () => {
    if (!user) return;

    try {
      // Get all loops for the user
      const { data: userLoops, error: loopsError } = await supabase
        .from('loops')
        .select('*')
        .eq('owner_id', user.id);

      if (loopsError) throw loopsError;

      // Fetch task stats for each loop in one go
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('loop_id, completed, is_one_time')
        .in('loop_id', (userLoops || []).map(l => l.id));

      let loopsWithStats = userLoops || [];
      if (!tasksError && allTasks) {
        loopsWithStats = (userLoops || []).map(loop => {
          const loopTasks = allTasks.filter(t => t.loop_id === loop.id && !t.is_one_time);
          const completedCount = loopTasks.filter(t => t.completed).length;
          const totalCount = loopTasks.length;
          return {
            ...loop,
            completedCount,
            totalCount
          };
        });
      }

      // Get global user streak
      const { data: streakData, error: streaksError } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (!streaksError && streakData) {
        setTotalStreak(streakData.current_streak || 0);
      } else {
        setTotalStreak(0);
      }

      setLoops(loopsWithStats);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLoopPress = (loop: any) => {
    navigation.navigate('LoopDetail', { loopId: loop.id });
  };

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Login');
  };

  const openCreateLoopModal = () => {
    setIsEditingLoop(false);
    setEditingLoop(null);
    setModalVisible(true);
  };

  const handleCreateLoop = async (data: any) => {
    setCreating(true);

    try {
      let nextResetAt: string | null = null;
      if (data.type === 'daily') {
        nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (data.type === 'weekly') {
        nextResetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data: loop, error } = await supabase
        .from('loops')
        .insert({
          name: data.name,
          owner_id: user?.id,
          description: data.description,
          affiliate_link: data.affiliate_link,
          color: FOLDER_COLORS[data.type as LoopType] || FOLDER_COLORS.personal,
          reset_rule: data.type,
          next_reset_at: nextResetAt,
          due_date: data.due_date,
        })
        .select()
        .single();

      if (error) throw error;

      setModalVisible(false);
      await loadData();

      if (loop) {
        navigation.navigate('LoopDetail', { loopId: loop.id });
      }
    } catch (error: any) {
      console.error('[HomeScreen] Error creating loop:', error);
      Alert.alert('Error', `Failed to create loop: ${error?.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateAI = () => {
    // Deprecated for now
  };

  const handleUpdateLoop = async (data: any) => {
    if (!editingLoop) return;
    setCreating(true);

    try {
      let nextResetAt: string | null = editingLoop.next_reset_at ?? null;

      if (data.type === 'manual') {
        nextResetAt = null;
      } else if (data.type === 'daily' || data.type === 'weekly') {
        if (editingLoop.reset_rule !== data.type || !editingLoop.next_reset_at) {
          const days = data.type === 'daily' ? 1 : 7;
          nextResetAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      const { error } = await supabase
        .from('loops')
        .update({
          name: data.name,
          description: data.description,
          affiliate_link: data.affiliate_link,
          reset_rule: data.type,
          next_reset_at: nextResetAt,
          due_date: data.due_date,
        })
        .eq('id', editingLoop.id);

      if (error) throw error;

      setModalVisible(false);
      setEditingLoop(null);
      await loadData();
    } catch (error: any) {
      console.error('[HomeScreen] Error updating loop:', error);
      Alert.alert('Error', `Failed to update loop: ${error?.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteLoop = (loop: any) => {
    console.log('[HomeScreen] Confirm delete tapped for loop:', loop.id);

    if (Platform.OS === 'web') {
      // Use browser confirm for reliable web behavior
      const confirmed = window.confirm(
        `Are you sure you want to delete "${loop.name}"? This cannot be undone.`
      );
      if (confirmed) {
        handleDeleteLoop(loop);
      }
      return;
    }

    Alert.alert(
      'Delete Loop',
      `Are you sure you want to delete "${loop.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteLoop(loop),
        },
      ]
    );
  };

  const handleDeleteLoop = async (loop: any) => {
    try {
      // Delete tasks first to be safe
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('loop_id', loop.id);

      if (tasksError) {
        console.warn('[HomeScreen] Error deleting loop tasks:', tasksError);
      }

      const { error: loopError } = await supabase
        .from('loops')
        .delete()
        .eq('id', loop.id);

      if (loopError) {
        console.error('[HomeScreen] Error deleting loop:', loopError);
        throw loopError;
      }

      if (editingLoop && editingLoop.id === loop.id) {
        setEditingLoop(null);
        setIsEditingLoop(false);
      }

      await loadData();
    } catch (error: any) {
      console.error('[HomeScreen] Error deleting loop:', error);
      Alert.alert('Error', `Failed to delete loop: ${error?.message || 'Unknown error'}`);
    }
  };

  const startEditLoop = (loop: any) => {
    setEditingLoop(loop);
    setIsEditingLoop(true);
    setModalVisible(true);
  };

  // Deprecated cleanup
  const handleRegenerateAIShim = () => {};

  // Show loading screen while checking auth
  if (loading || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{
        flex: 1,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        {/* Header */}
        <Header currentDate={currentDate} streak={totalStreak} colors={colors} />

        {/* Filter Tabs */}
        <View style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 16,
          }}>
            Your Loops
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {[
              { id: 'all' as FilterType, label: 'All', icon: '⭐' },
              { id: 'manual' as FilterType, label: 'Checklists', icon: '✓' },
              { id: 'daily' as FilterType, label: 'Daily', icon: '☀️' },
              { id: 'weekly' as FilterType, label: 'Weekly', icon: '🎯' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: selectedFilter === tab.id ? colors.primary : colors.border,
                  backgroundColor: selectedFilter === tab.id ? `${colors.primary}20` : 'transparent',
                }}
                onPress={() => setSelectedFilter(tab.id)}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: selectedFilter === tab.id ? 'bold' : 'normal',
                  color: selectedFilter === tab.id ? colors.primary : colors.textSecondary,
                }}>
                  {tab.icon} {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loops */}
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        <View style={{ padding: 20 }}>
          {/* Today's Loop Section */}
          {todayLoops.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#64748b',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Today's Loop
              </Text>
              {todayLoops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onPress={handleLoopPress}
                  onEdit={startEditLoop}
                  onDelete={confirmDeleteLoop}
                />
              ))}
            </View>
          )}

          {/* Upcoming Section */}
          {upcomingLoops.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {todayLoops.length > 0 && (
                <View style={{
                  height: 1,
                  backgroundColor: '#E5E7EB',
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  borderRadius: 1,
                  marginVertical: 24,
                  opacity: 0.5,
                }} />
              )}
              
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#64748b',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Upcoming One-Time Tasks
              </Text>
              {upcomingLoops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  isUpcoming={true}
                  onPress={handleLoopPress}
                  onEdit={startEditLoop}
                  onDelete={confirmDeleteLoop}
                />
              ))}
            </View>
          )}

          {todayLoops.length === 0 && upcomingLoops.length === 0 && (
            <View style={{
              alignItems: 'center',
              paddingVertical: 40,
            }}>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 16,
              }}>
                {selectedFilter === 'all'
                  ? 'No loops yet. Create your first loop to get started!'
                  : `No ${selectedFilter === 'manual' ? 'checklists' : selectedFilter === 'daily' ? 'daily routines' : 'weekly goals'} yet.`}
              </Text>
              {selectedFilter !== 'all' && (
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: colors.primary,
                  }}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: colors.primary,
                  }}>
                    View All Loops
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Loop Library Section */}
          <View style={{ marginTop: 32 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 16,
            }}>
              Discover Loops
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#667eea',
                padding: 20,
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => navigation.navigate('TemplateLibrary')}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Text style={{ fontSize: 28, marginRight: 12 }}>📚</Text>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#fff',
                  flex: 1,
                }}>
                  Loop Library
                </Text>
                <Text style={{ fontSize: 20, color: '#fff' }}>→</Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: '#fff',
                opacity: 0.9,
                lineHeight: 20,
              }}>
                Explore loops inspired by top teachers, coaches, and business leaders
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

        {/* Sign Out Button (temporary) */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 60,
            right: 20,
            padding: 8,
          }}
          onPress={handleSignOut}
        >
          <Text style={{ color: colors.textSecondary }}>Sign Out</Text>
        </TouchableOpacity>

        {/* FAB - Floating Action Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
          onPress={openCreateLoopModal}
        >
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      </View>

      <CreateLoopModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={isEditingLoop ? handleUpdateLoop : handleCreateLoop}
        initialData={editingLoop}
        loading={creating}
        isEditing={isEditingLoop}
      />

      {/* Loop Selection Modal */}
      <LoopSelectionModal
        visible={selectionModalVisible}
        loops={loopsToSelect}
        folderName={selectedFolderName}
        onSelect={(loopId) => {
          console.log('[HomeScreen] Loop selected from modal:', loopId);
          setSelectionModalVisible(false);
          navigation.navigate('LoopDetail', { loopId });
        }}
        onClose={() => setSelectionModalVisible(false)}
      />
    </SafeAreaView>
  );
};
