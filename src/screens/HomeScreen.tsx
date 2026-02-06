import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LoopType, FOLDER_COLORS } from '../types/loop';
import { Header } from '../components/Header';
import { LoopSelectionModal } from '../components/LoopSelectionModal';
import { LoopCard } from '../components/native/LoopCard';
import CreateLoopModal from '../components/native/CreateLoopModal';
import { PendingInvitations } from '../components/native/PendingInvitations';
import { ResponsiveContainer } from '../components/layout/ResponsiveContainer';
import { WebSidebar } from '../components/layout/WebSidebar';
import { DesktopLoopDetailPanel } from '../components/dashboard/DesktopLoopDetailPanel';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type FilterType = 'all' | 'manual' | 'daily' | 'weekly';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
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
    const todayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const getDueMidnight = (dateStr: string) => {
        const d = new Date(dateStr);
        // Treat UTC date components as Local Date components
        return new Date(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate()
        );
    };

    const today = filtered.filter(loop => {
      if (loop.reset_rule !== 'manual') return true;
      if (!loop.due_date) return true;
      
      const dueMidnight = getDueMidnight(loop.due_date);
      // If due date is today or in the past
      return dueMidnight <= todayMidnight;
    });

    const upcoming = filtered.filter(loop => {
      if (loop.reset_rule !== 'manual') return false;
      if (!loop.due_date) return false;
      
      const dueMidnight = getDueMidnight(loop.due_date);
      // If due date is strictly after today
      return dueMidnight > todayMidnight;
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
      // Get all loops for the user with their individual streaks
      const { data: userLoops, error: loopsError } = await supabase
        .from('loops')
        .select('*, loop_streaks(*)')
        .eq('owner_id', user.id);
      
      console.log('DEBUG DASHBOARD LOOPS:', userLoops?.map(l => ({ name: l.name, author: l.author_name, type: l.function_type })));

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
          
          // Map joined loop_streak data to top-level properties
          const streakInfo = loop.loop_streaks?.[0] || loop.loop_streaks || null;

          return {
            ...loop,
            completedCount,
            totalCount,
            currentStreak: streakInfo?.current_streak || 0,
            longestStreak: streakInfo?.longest_streak || 0,
            lastCompletedDate: streakInfo?.last_completed_date
          };
        });
      }

      // Get global user streak
      const { data: streakData, error: streaksError } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .limit(1);

      if (!streaksError && streakData && streakData.length > 0) {
        setTotalStreak(streakData[0].current_streak || 0);
      } else {
        setTotalStreak(0);
      }

      setLoops(loopsWithStats);
      if (loopsWithStats.length > 0 && !selectedLoopId) {
        setSelectedLoopId(loopsWithStats[0].id);
      }
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

  const openCreateLoopModal = () => {
    setIsEditingLoop(false);
    setEditingLoop(null);
    setModalVisible(true);
  };

  const handleCreateLoop = async (data: any) => {
    setCreating(true);

    try {
      // Determine reset rule and category
      const isGoal = data.type === 'goals';
      const category = data.type as LoopType;
      // 'goals' uses 'manual' reset rule in DB
      const dbResetRule = isGoal ? 'manual' : data.type;

      let nextResetAt: string | null = null;
      if (data.type === 'daily' || data.type === 'weekdays') {
        nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (data.type === 'weekly') {
        nextResetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (data.type === 'custom' && data.custom_days?.length > 0) {
        // For custom, calculate next reset based on selected days
        nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      const { data: loop, error } = await supabase
        .from('loops')
        .insert({
          name: data.name,
          owner_id: user?.id,
          description: data.description,
          affiliate_link: data.affiliate_link,
          color: data.color || FOLDER_COLORS[data.type as LoopType] || FOLDER_COLORS.personal,
          loop_type: category, // DB column is loop_type
          reset_rule: dbResetRule,
          custom_days: data.custom_days || null,
          next_reset_at: nextResetAt,
          due_date: data.due_date,
          reset_time: data.reset_time || '04:00:00',
          reset_day_of_week: data.reset_day_of_week,
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
      const isGoal = data.type === 'goals';
      const category = data.type as LoopType;
      const dbResetRule = isGoal ? 'manual' : data.type;

      let nextResetAt: string | null = editingLoop.next_reset_at ?? null;

      if (dbResetRule === 'manual') {
        nextResetAt = null;
      } else if (data.type === 'daily' || data.type === 'weekly' || data.type === 'weekdays' || data.type === 'custom') {
        // If type changed or next_reset_at missing, recalculate
        if (editingLoop.reset_rule !== dbResetRule || !editingLoop.next_reset_at) {
          const days = data.type === 'weekly' ? 7 : 1;
          nextResetAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      const { error } = await supabase
        .from('loops')
        .update({
          name: data.name,
          description: data.description,
          affiliate_link: data.affiliate_link,
          color: data.color,
          loop_type: category, // DB column is loop_type
          reset_rule: dbResetRule,
          custom_days: data.custom_days || null,
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

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  // Calculate counts for sidebar
  const counts = {
    all: loops.length,
    manual: loops.filter(l => l.reset_rule === 'manual').length,
    daily: loops.filter(l => l.reset_rule === 'daily').length,
    weekly: loops.filter(l => l.reset_rule === 'weekly').length,
  };

  // 3-Column Desktop Logic
  const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);

  const handleLoopPressDesktop = (loop: any) => {
      setSelectedLoopId(loop.id);
  };

  // Override handleLoopPress based on device
  const onLoopPress = (loop: any) => {
      if (isDesktop) {
          handleLoopPressDesktop(loop);
      } else {
          handleLoopPress(loop);
      }
  };

  const RightPanelContent = isDesktop ? (
      selectedLoopId ? (
          <DesktopLoopDetailPanel 
            loopId={selectedLoopId} 
            onClose={() => setSelectedLoopId(null)}
          />
      ) : (
          /* Empty State for Wide 3rd Column - Matches User Mockup */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 40 }}>
             <Text style={{ fontSize: 72, marginBottom: 24, opacity: 0.2 }}>📋</Text>
             
             <Text style={{ 
               fontSize: 20, 
               fontWeight: '600', 
               color: '#374151', 
               marginBottom: 8,
               textAlign: 'center'
             }}>
               Select a Loop
             </Text>
             
             <Text style={{ 
               fontSize: 16, 
               color: '#6B7280', 
               textAlign: 'center',
               maxWidth: 320,
               lineHeight: 24,
               marginBottom: 32
             }}>
               Choose a loop from the list to view details, manage tasks, and track progress.
             </Text>

             <TouchableOpacity
               style={{
                 paddingVertical: 14,
                 paddingHorizontal: 32,
                 backgroundColor: colors.primary,
                 borderRadius: 12,
                 shadowColor: colors.primary,
                 shadowOffset: { width: 0, height: 4 },
                 shadowOpacity: 0.3,
                 shadowRadius: 10,
                 elevation: 4
               }}
               onPress={openCreateLoopModal}
             >
               <Text style={{ color: colors.textOnPrimary, fontWeight: '700', fontSize: 16 }}>Create New Loop</Text>
             </TouchableOpacity>
          </View>
      )
  ) : null;

  // Show loading screen while checking auth
  if (loading || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Combine loops for the grid
  const allDisplayLoops = [...todayLoops, ...upcomingLoops];

  const getGridTitle = () => {
    switch (selectedFilter) {
      case 'daily': return 'DAILY ROUTINES';
      case 'weekly': return 'WEEKLY GOALS';
      case 'manual': return 'CHECKLISTS';
      default: return "TODAY'S LOOPS";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ResponsiveContainer
        sidebar={
          <WebSidebar 
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            onNavigateToLibrary={() => navigation.navigate('TemplateLibrary')}
            onNavigateToSommelier={() => navigation.navigate('LoopSommelier')}
            onNavigateToSettings={() => navigation.navigate('Settings')}
            counts={counts}
            onCreatePress={openCreateLoopModal}
            activeItem={selectedFilter}
          />
        }
        rightPanel={RightPanelContent}
        layout="productivity"
      >
      <View style={{
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: colors.background,
      }}>
        {isDesktop ? (
          <DashboardGrid 
            loops={allDisplayLoops}
            onCreateLoop={openCreateLoopModal}
            onLoopPress={onLoopPress}
            onLoopEdit={startEditLoop}
            forcedColumns={1}
            title={getGridTitle()}
            activeFilter={selectedFilter}
            selectedLoopId={selectedLoopId}
          />
        ) : (
          <View style={{ flex: 1 }}>
            {/* Header - Mobile Only */}
            <Header currentDate={currentDate} streak={totalStreak} colors={colors} />

            {/* Pending Invitations */}
            <PendingInvitations onInvitationHandled={loadData} />

            {/* Filter Tabs - Mobile Only */}
            <View style={{
              backgroundColor: colors.background, // White background for tabs bar
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
                ].map((tab) => {
                  // UNIFIED GOLD BRAND - all tabs use gold
                  const activeColor = colors.primary; // #FEC00F
                  const isActive = selectedFilter === tab.id;
                  
                  return (
                  <TouchableOpacity
                    key={tab.id}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: isActive ? activeColor : colors.border,
                      backgroundColor: isActive ? `${activeColor}20` : 'transparent',
                    }}
                    onPress={() => setSelectedFilter(tab.id)}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? activeColor : colors.textSecondary,
                    }}>
                      {tab.icon} {tab.label}
                    </Text>
                  </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Loops List - Mobile Style */}
            <ScrollView
              style={{ flex: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
            <View style={{ padding: 20 }}>
              {/* Quick Add Button */}
              <TouchableOpacity 
                onPress={openCreateLoopModal}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background,
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.primary,
                  marginBottom: 24,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${colors.primary}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '700', 
                    color: colors.text 
                  }}>Create a new loop</Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: colors.textSecondary 
                  }}>Track your own custom routine</Text>
                </View>
              </TouchableOpacity>

              {/* Today's Loop Section */}
              {todayLoops.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.textSecondary,
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
                      onPress={onLoopPress}
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
                      backgroundColor: colors.border,
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
                    color: colors.textSecondary,
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
                      onPress={onLoopPress}
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

              {/* Loop Library Section - Mobile Only */}
              <View style={{ marginTop: 32 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 16,
                  marginTop: 24
                }}>
                  Discover Loops
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('TemplateLibrary')}
                  style={{ marginBottom: 16 }}
                >
                  <LinearGradient
                    colors={['#1e1b4b', '#312e81']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      padding: 24,
                      borderRadius: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <Text style={{ fontSize: 28, marginRight: 12 }}>📚</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: '#fff',
                        }}>
                          Loop Library
                        </Text>
                        <View style={{ 
                          height: 2, 
                          backgroundColor: colors.primary, 
                          width: 40, 
                          marginTop: 4,
                          borderRadius: 1 
                        }} />
                      </View>
                      <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: '#fff',
                      opacity: 0.9,
                      lineHeight: 20,
                    }}>
                      Explore loops inspired by top teachers, coaches, and business leaders
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* AI Loop Recommender */}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary, // Bumblebee
                    padding: 20,
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={() => navigation.navigate('LoopSommelier')}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 28, marginRight: 12 }}>✨</Text>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: colors.text,
                      flex: 1,
                    }}>
                      AI Loop Recommender
                    </Text>
                    <Text style={{ fontSize: 20, color: colors.text }}>→</Text>
                  </View>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text,
                    opacity: 0.85,
                    lineHeight: 20,
                  }}>
                    Describe what you want to achieve and get personalized loop recommendations
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            </ScrollView>
            
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
        )}
      </View>
      </ResponsiveContainer>

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
