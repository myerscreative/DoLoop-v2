import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import { formatDatePST } from '../utils/dateHelpers';
import { supabase } from '../lib/supabase';
import { LoopType, FOLDER_COLORS } from '../types/loop';
import { LoopSelectionModal } from '../components/LoopSelectionModal';
import { LoopCard } from '../components/native/LoopCard';
import CreateLoopModal from '../components/native/CreateLoopModal';
import { PendingInvitations } from '../components/native/PendingInvitations';
import { ResponsiveContainer } from '../components/layout/ResponsiveContainer';
import { NavigationBlade } from '../components/dashboard/NavigationBlade';
import { DynamicStage } from '../components/dashboard/DynamicStage';
import { CommandBar } from '../components/dashboard/CommandBar';
import { DesktopLoopDetailPanel } from '../components/dashboard/DesktopLoopDetailPanel';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type FilterType = 'all' | 'manual' | 'daily' | 'weekly';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [loops, setLoops] = useState<any[]>([]);
  const [todayLoops, setTodayLoops] = useState<any[]>([]);
  const [upcomingLoops, setUpcomingLoops] = useState<any[]>([]);
  const [archivedChecklists, setArchivedChecklists] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [totalStreak, setTotalStreak] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [creationPreset, setCreationPreset] = useState<'loop' | 'checklist-daily' | 'checklist-one-time'>('loop');
  const [checklistTypeModalVisible, setChecklistTypeModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [creating, setCreating] = useState(false);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [loopsToSelect, setLoopsToSelect] = useState<any[]>([]);
  const [selectedFolderName, setSelectedFolderName] = useState('');

  // Loop editing state
  const [editingLoop, setEditingLoop] = useState<any | null>(null);
  const [isEditingLoop, setIsEditingLoop] = useState(false);
  const [commandBarVisible, setCommandBarVisible] = useState(false);

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
      filtered = filtered.filter(loop => {
        if (selectedFilter === 'manual') {
          return loop.reset_rule === 'manual' || loop.reset_rule == null;
        }
        return loop.reset_rule === selectedFilter;
      });
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
      if (loop.reset_rule !== 'manual' && loop.reset_rule != null) return true;
      if (!loop.due_date) return true; // Legacy unscheduled checklists remain visible

      const dueMidnight = getDueMidnight(loop.due_date);
      // Dated manual checklists only show on their exact date
      return dueMidnight.getTime() === todayMidnight.getTime();
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
    const formatted = formatDatePST(now, {
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
        .eq('owner_id', user.id)
        .or('status.is.null,status.neq.archived');
      
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

      // Auto-archive stale dated checklists so they don't linger in active lists.
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const staleDatedChecklistIds = loopsWithStats
        .filter(loop => loop.reset_rule === 'manual' && !!loop.due_date)
        .filter(loop => {
          const due = new Date(loop.due_date);
          const dueMidnight = new Date(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
          return dueMidnight.getTime() < todayMidnight.getTime();
        })
        .map(loop => loop.id);

      if (staleDatedChecklistIds.length > 0) {
        const { error: archiveError } = await supabase
          .from('loops')
          .update({
            status: 'archived',
            archived_at: new Date().toISOString(),
          })
          .in('id', staleDatedChecklistIds);

        if (archiveError) {
          console.warn('[HomeScreen] Failed to auto-archive stale dated checklists:', archiveError);
        } else {
          loopsWithStats = loopsWithStats.filter(loop => !staleDatedChecklistIds.includes(loop.id));
        }
      }

      // Fetch archived manual checklists for one-tap restore UI.
      const { data: archivedLoops, error: archivedLoopsError } = await supabase
        .from('loops')
        .select('*, loop_streaks(*)')
        .eq('owner_id', user.id)
        .eq('status', 'archived')
        .eq('reset_rule', 'manual')
        .order('archived_at', { ascending: false })
        .limit(25);

      if (archivedLoopsError) {
        console.warn('[HomeScreen] Error loading archived checklists:', archivedLoopsError);
        setArchivedChecklists([]);
      } else {
        const archivedIds = (archivedLoops || []).map(l => l.id);
        let archivedWithStats = archivedLoops || [];
        if (archivedIds.length > 0) {
          const { data: archivedTasks, error: archivedTasksError } = await supabase
            .from('tasks')
            .select('loop_id, completed, is_one_time')
            .in('loop_id', archivedIds);

          if (!archivedTasksError && archivedTasks) {
            archivedWithStats = (archivedLoops || []).map(loop => {
              const loopTasks = archivedTasks.filter(t => t.loop_id === loop.id && !t.is_one_time);
              return {
                ...loop,
                completedCount: loopTasks.filter(t => t.completed).length,
                totalCount: loopTasks.length,
              };
            });
          }
        }
        setArchivedChecklists(archivedWithStats);
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

  const openCreateLoopModal = (preset: 'loop' | 'checklist-daily' | 'checklist-one-time' = 'loop') => {
    setCreationPreset(preset);
    setIsEditingLoop(false);
    setEditingLoop(null);
    setModalVisible(true);
    setCommandBarVisible(false); // Close command bar if open
  };

  const openChecklistTypePicker = () => {
    setChecklistTypeModalVisible(true);
  };

  const handleChecklistTypeSelect = (type: 'daily' | 'one-time') => {
    setChecklistTypeModalVisible(false);
    openCreateLoopModal(type === 'daily' ? 'checklist-daily' : 'checklist-one-time');
  };

  const handleCreateLoop = async (data: any) => {
    setCreating(true);

    try {
      // Determine reset rule and category
      const isGoal = data.type === 'goals';
      const category = (data.type ?? 'manual') as LoopType;
      // 'goals' uses 'manual' reset rule in DB
      const selectedType = data.type ?? 'manual';
      const dbResetRule = isGoal ? 'manual' : selectedType;

      let nextResetAt: string | null = null;
      if (dbResetRule === 'daily' || dbResetRule === 'weekdays') {
        nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (dbResetRule === 'weekly') {
        nextResetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dbResetRule === 'custom' && data.custom_days?.length > 0) {
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
          due_date: data.one_time_checklist ? (data.due_date || new Date().toISOString()) : (data.due_date || null),
          reset_time: data.reset_time || '04:00:00',
          reset_day_of_week: data.reset_day_of_week,
          function_type: data.function_type,
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
      const category = (data.type ?? editingLoop.loop_type ?? 'manual') as LoopType;
      const selectedType = data.type ?? (editingLoop.reset_rule ?? 'manual');
      const dbResetRule = isGoal ? 'manual' : selectedType;

      let nextResetAt: string | null = editingLoop.next_reset_at ?? null;

      if (dbResetRule === 'manual') {
        nextResetAt = null;
      } else if (dbResetRule === 'daily' || dbResetRule === 'weekly' || dbResetRule === 'weekdays' || dbResetRule === 'custom') {
        // If type changed or next_reset_at missing, recalculate
        if (editingLoop.reset_rule !== dbResetRule || !editingLoop.next_reset_at) {
          const days = dbResetRule === 'weekly' ? 7 : 1;
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
          due_date: data.one_time_checklist ? (data.due_date || new Date().toISOString()) : (data.due_date || null),
          function_type: data.function_type,
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

  const confirmArchiveLoop = (loop: any) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Move "${loop.name}" out of Today's Loops? You can restore it later from archived loops.`
      );
      if (confirmed) {
        handleArchiveLoop(loop);
      }
      return;
    }

    Alert.alert(
      "Remove from Today's Loops",
      `Move "${loop.name}" out of Today's Loops? You can restore it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleArchiveLoop(loop),
        },
      ]
    );
  };

  const handleArchiveLoop = async (loop: any) => {
    try {
      const { data: archivedRows, error } = await supabase
        .from('loops')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
        })
        .eq('id', loop.id)
        .select('id');

      if (error) throw error;
      if (!archivedRows || archivedRows.length === 0) {
        throw new Error('Archive was blocked. You may not have permission to update this loop.');
      }

      if (selectedLoopId === loop.id) {
        setSelectedLoopId(null);
      }

      // Optimistic local update to avoid stale UI after confirmation.
      setLoops(prev => prev.filter(l => l.id !== loop.id));
      setTodayLoops(prev => prev.filter(l => l.id !== loop.id));
      setUpcomingLoops(prev => prev.filter(l => l.id !== loop.id));
      setArchivedChecklists(prev => [loop, ...prev.filter(l => l.id !== loop.id)]);
      await loadData();
    } catch (error: any) {
      console.error('[HomeScreen] Error archiving loop:', error);
      const message = `Failed to archive loop: ${error?.message || 'Unknown error'}`;
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const handleRestoreChecklist = async (loop: any) => {
    try {
      let nextDueDate = loop.due_date || null;

      // If restoring an old dated checklist, bring it back to today.
      if (loop.due_date) {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d = new Date(loop.due_date);
        const dueMidnight = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        if (dueMidnight.getTime() < todayMidnight.getTime()) {
          nextDueDate = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('loops')
        .update({
          status: 'active',
          archived_at: null,
          due_date: nextDueDate,
        })
        .eq('id', loop.id);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      console.error('[HomeScreen] Error restoring checklist:', error);
      Alert.alert('Error', `Failed to restore checklist: ${error?.message || 'Unknown error'}`);
    }
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
    manual: loops.filter(l => l.reset_rule === 'manual' || l.reset_rule == null).length,
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

  // Cmd+K keyboard shortcut for Command Bar (desktop only)
  useEffect(() => {
    if (!isDesktop || Platform.OS !== 'web') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarVisible(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop]);

  const RightPanelContent = isDesktop ? (
      selectedLoopId ? (
          <DesktopLoopDetailPanel 
            loopId={selectedLoopId} 
            onClose={() => setSelectedLoopId(null)}
          />
      ) : (
          /* Empty State for Wide 3rd Column - Matches User Mockup */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 40 }}>
             <Text style={{ fontSize: 72, marginBottom: 24, opacity: 0.2 }}>📋</Text>
             
             <Text style={{ 
               fontSize: 20, 
               fontWeight: '600', 
               color: colors.text, 
               marginBottom: 8,
               textAlign: 'center'
             }}>
               Select a Loop
             </Text>
             
             <Text style={{ 
               fontSize: 16, 
               color: colors.textSecondary, 
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
              onPress={() => openCreateLoopModal('loop')}
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
          <NavigationBlade
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            onCreatePress={openCreateLoopModal}
            counts={counts}
          />
        }
        rightPanel={null}
        layout="productivity"
      >
      <View style={{
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: colors.background,
        paddingRight: (isDesktop && selectedLoopId) ? 480 : 0,
      }}>
        {isDesktop ? (
          <>
            <DynamicStage
              loops={allDisplayLoops}
              archivedChecklists={archivedChecklists}
              selectedFilter={selectedFilter}
              selectedLoopId={selectedLoopId}
              onLoopPress={onLoopPress}
              onLoopEdit={startEditLoop}
              onLoopDelete={confirmDeleteLoop}
              onLoopArchive={confirmArchiveLoop}
              onRestoreChecklist={handleRestoreChecklist}
              onSelectFilter={setSelectedFilter}
              onCreateLoop={() => openCreateLoopModal('loop')}
              onCreateChecklist={openChecklistTypePicker}
            />
            
            {/* Overlay Detail Panel */}
            {selectedLoopId && (
              <>
                {/* Backdrop */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setSelectedLoopId(null)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 99,
                  }}
                />
                
                {/* Detail Panel */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 480,
                    backgroundColor: Platform.OS === 'web' ? 'rgba(24, 24, 24, 0.95)' : colors.background,
                    zIndex: 100,
                    shadowColor: '#000',
                    shadowOffset: { width: -4, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 20,
                    ...(Platform.OS === 'web' && {
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                    } as any),
                  }}
                >
                  <DesktopLoopDetailPanel 
                    loopId={selectedLoopId} 
                    onClose={() => setSelectedLoopId(null)}
                  />
                </View>
              </>
            )}
            
            {/* CommandBar */}
            <CommandBar 
              visible={commandBarVisible}
              onClose={() => setCommandBarVisible(false)}
              onCreate={(text) => {
                // For now, just open the create loop modal with the text as name
                // Could be enhanced to parse the text for loop creation
                setCommandBarVisible(false);
                openCreateLoopModal();
              }}
              placeholder="Create a new loop... (Cmd+K)"
            />
          </>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Header - Mobile Only */}
            <View style={{ paddingHorizontal: 20, paddingTop: 10, marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>🐝</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
                  Good{' '}
                  {new Date().getHours() < 12
                    ? 'morning'
                    : new Date().getHours() < 18
                    ? 'afternoon'
                    : 'evening'}! 🌅
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>{currentDate}</Text>
            </View>

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
              {/* Quick Add Buttons */}
              {selectedFilter === 'manual' ? (
                <View style={{ marginBottom: 24, gap: 12 }}>
                  <TouchableOpacity
                    onPress={openChecklistTypePicker}
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
                      <Ionicons name="checkbox-outline" size={22} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                      }}>Create a checklist</Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>Choose daily or one-time checklist</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openCreateLoopModal('loop')}
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
                        color: colors.text,
                      }}>Create a loop</Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>Track your own custom routine</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => openCreateLoopModal('loop')}
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
                      color: colors.text,
                    }}>Create a loop</Text>
                    <Text style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                    }}>Track your own custom routine</Text>
                  </View>
                </TouchableOpacity>
              )}

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
                      onArchive={confirmArchiveLoop}
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
                      onArchive={confirmArchiveLoop}
                      onDelete={confirmDeleteLoop}
                    />
                  ))}
                </View>
              )}

              {archivedChecklists.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    Archived Checklists
                  </Text>
                  {archivedChecklists.slice(0, 8).map((loop) => (
                    <View
                      key={loop.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: `${colors.surface}66`,
                        marginBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }} numberOfLines={1}>
                          {loop.name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                          {loop.due_date ? `Originally for ${formatDatePST(loop.due_date)}` : 'No specific date'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRestoreChecklist(loop)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor: `${colors.primary}20`,
                          borderWidth: 1,
                          borderColor: colors.primary,
                        }}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>Restore</Text>
                      </TouchableOpacity>
                    </View>
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
              onPress={() => openCreateLoopModal('loop')}
            >
              <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </ResponsiveContainer>

      <Modal
        visible={checklistTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChecklistTypeModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setChecklistTypeModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e: any) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 18,
              // Use structure color which is always a solid opaque dark/light tone
              backgroundColor: colors.structure,
              borderWidth: 1,
              borderColor: colors.primary + '40',
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 16,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
              Create a checklist
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 18 }}>
              What kind of checklist?
            </Text>

            <TouchableOpacity
              onPress={() => handleChecklistTypeSelect('daily')}
              activeOpacity={0.85}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}22`,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Text style={{ fontSize: 28 }}>☀️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Daily checklist</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                  Repeats every day — resets automatically
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChecklistTypeSelect('one-time')}
              activeOpacity={0.85}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: colors.border,
                backgroundColor: colors.background,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Text style={{ fontSize: 28 }}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>One-time checklist</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                  For a specific date — archives when done
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CreateLoopModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={isEditingLoop ? handleUpdateLoop : handleCreateLoop}
        initialData={editingLoop}
        loading={creating}
        isEditing={isEditingLoop}
        creationPreset={creationPreset}
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
