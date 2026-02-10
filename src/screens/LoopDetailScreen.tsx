import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Task, LoopWithTasks, TaskWithDetails, Tag, PendingAttachment, Subtask } from '../types/loop';
import { TaskTree } from '../components/native/TaskTree';
import { LoopIcon } from '../components/native/LoopIcon';
import { TaskEditModal } from '../components/native/TaskEditModal';
import { InviteModal } from '../components/native/InviteModal';
import CreateLoopModal from '../components/native/CreateLoopModal';
import { MemberAvatars, MemberListModal } from '../components/native/MemberAvatars';
import { BeeIcon } from '../components/native/BeeIcon';
import { getUserTags, getTaskTags, getTaskAttachments, updateTaskExtended, createTag, ensureLoopMember, uploadAttachment, toggleTaskWithChildren, promoteTask, nestTask } from '../lib/taskHelpers';
import { flattenTreeForSync } from '../lib/treeHelpers';
import { getLoopMemberProfiles, LoopMemberProfile } from '../lib/profileHelpers';
import { MomentumOrb } from '../components/native/MomentumOrb';
import { useSharedMomentum } from '../hooks/useSharedMomentum';
import { LoopType } from '../types/loop';
import { StarRatingInput } from '../components/native/StarRatingInput';
import { getUserRating, submitRating, getLoopRatingStats } from '../lib/ratingHelpers';

type LoopDetailScreenRouteProp = RouteProp<RootStackParamList, 'LoopDetail'>;
type LoopDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoopDetail'>;

const BRAND_GOLD = '#FEC00F';

export const LoopDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<LoopDetailScreenNavigationProp>();
  const route = useRoute<LoopDetailScreenRouteProp>();
  const { loopId } = route.params;

  const [loopData, setLoopData] = useState<LoopWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingSynopsis, setGeneratingSynopsis] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showThemePrompt, setShowThemePrompt] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loopMembers, setLoopMembers] = useState<LoopMemberProfile[]>([]);
  const [showMemberList, setShowMemberList] = useState(false);
  const [isEditingLoop, setEditingLoop] = useState(false);
  const [savingLoop, setSavingLoop] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [memberJoinedAt, setMemberJoinedAt] = useState<string | null>(null);
  const [lastDismissedPrompt, setLastDismissedPrompt] = useState<number | null>(null);

  // NEW: Loop Info Modal state
  const [showLoopInfoModal, setShowLoopInfoModal] = useState(false);


  const loadLoopData = async () => {
    try {
      const { data: loop, error: loopError } = await supabase
        .from('loops')
        .select('*')
        .eq('id', loopId)
        .single();

      if (loopError) throw loopError;

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_member:assigned_to (
            user_id
          ),
          task_tags (
            tags (*)
          ),
          attachments (*)
        `)
        .eq('loop_id', loopId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Build tree: separate top-level tasks from children
      const allTasks = tasks || [];
      const topLevelTasks = allTasks.filter((t: any) => !t.parent_task_id);
      const childTaskMap = new Map<string, any[]>();
      
      // First pass: map children to parents
      for (const task of allTasks) {
        if (task.parent_task_id) {
          const siblings = childTaskMap.get(task.parent_task_id) || [];
          siblings.push(task);
          childTaskMap.set(task.parent_task_id, siblings);
        }
      }

      // Hydrate from embedded data (no more N+1 queries)
      const tasksWithDetails = topLevelTasks.map((task: any) => {
        // Extract tags from junction table
        const tags = task.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || [];
        const attachments = task.attachments || [];
        
        const childTasks = childTaskMap.get(task.id) || [];
        
        const hydratedChildren = childTasks.map((child: any) => {
          const childTags = child.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || [];
          const childAttachments = child.attachments || [];
          
          return {
            ...child,
            tag_details: childTags,
            attachments: childAttachments,
            assigned_user_id: child.assigned_member?.user_id,
          };
        });

        return {
          ...task,
          tag_details: tags,
          subtasks: hydratedChildren,
          children: hydratedChildren,
          attachments,
          assigned_user_id: task.assigned_member?.user_id,
        };
      });

      // Count only top-level tasks for loop progress
      const completedCount = tasksWithDetails?.filter(task => task.completed && !task.is_one_time).length || 0;
      const totalCount = tasksWithDetails?.filter(task => !task.is_one_time).length || 0;

      const { data: streaks } = await supabase
        .from('loop_streaks')
        .select('*')
        .eq('loop_id', loopId)
        .maybeSingle();

      const loopWithTasks: LoopWithTasks = {
        ...loop,
        tasks: tasksWithDetails || [],
        completedCount,
        totalCount,
        currentStreak: streaks?.current_streak || 0,
        longestStreak: streaks?.longest_streak || 0,
        lastCompletedDate: streaks?.last_completed_date
      };

      setLoopData(loopWithTasks);

      const members = await getLoopMemberProfiles(loopId);
      setLoopMembers(members);

      if (user) {
        const { data: membership } = await supabase
          .from('loop_members')
          .select('joined_at')
          .eq('loop_id', loopId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (membership) {
          setMemberJoinedAt(membership.joined_at);
        }
      }

      const dismissed = await AsyncStorage.getItem(`last_rating_dismissed_${loopId}`);
      if (dismissed) {
        setLastDismissedPrompt(parseInt(dismissed, 10));
      }

      return loopWithTasks;
    } catch (error) {
      console.error('Error loading loop data:', error);
      Alert.alert('Error', 'Failed to load loop data');
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateLoop = async (data: any) => {
    if (!loopData) return;
    setSavingLoop(true);

    try {
      const isGoal = data.type === 'goals';
      const category = data.type as LoopType;
      const dbResetRule = isGoal ? 'manual' : data.type;

      let nextResetAt: string | null = loopData.next_reset_at || null;

      if (dbResetRule === 'manual') {
        nextResetAt = null;
      } else if (data.type === 'daily' || data.type === 'weekly' || data.type === 'weekdays' || data.type === 'custom') {
        if (loopData.reset_rule !== dbResetRule || !loopData.next_reset_at) {
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
          loop_type: category,
          reset_rule: dbResetRule,
          function_type: data.function_type,
          custom_days: data.custom_days || null,
          next_reset_at: nextResetAt,
          due_date: data.due_date,
        })
        .eq('id', loopId);

      if (error) throw error;

      await loadLoopData();
      setEditingLoop(false);
    } catch (error: any) {
      console.error('Error updating loop:', error);
      Alert.alert('Error', `Failed to update loop: ${error?.message}`);
    } finally {
      setSavingLoop(false);
    }
  };

  const formatResetSchedule = () => {
    if (!loopData) return '';
    const rule = loopData.reset_rule;

    if (rule === 'daily') return 'Daily at 8 AM';
    if (rule === 'weekdays') return 'Weekdays at 8 AM';
    if (rule === 'weekly') return 'Weekly at 8 AM';
    if (rule === 'manual') return 'Manual';
    return rule || 'Manual';
  };

  const safeHapticImpact = async (style: Haptics.ImpactFeedbackStyle) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(style);
      }
    } catch (error) {
      console.warn('[LoopDetail] Haptics not available:', error);
    }
  };

  const checkAndShowThemePrompt = async () => {
    return;
  };

  const handleThemePromptLater = async () => {
    setShowThemePrompt(false);
  };

  const handleThemePromptCustomize = () => {
    setShowThemePrompt(false);
    navigation.navigate('Settings');
  };

  useEffect(() => {
    loadLoopData();
    loadTags();
    loadUserRating();
  }, [loopId]);

  useSharedMomentum(loopId, () => {
    console.log('[LoopDetail] Realtime update triggered - reloading data...');
    loadLoopData();
  });

  const loadTags = async () => {
    if (!user) return;
    const tags = await getUserTags(user.id);
    setAvailableTags(tags);
  };

  const loadUserRating = async () => {
    const rating = await getUserRating(loopId);
    setUserRating(rating || 0);
  };

  const handleSubmitRating = async (score: number) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to rate loops.');
      return;
    }

    setIsSubmittingRating(true);
    setUserRating(score);

    const success = await submitRating(loopId, score);

    if (success) {
      const stats = await getLoopRatingStats(loopId);
      if (stats && loopData) {
        setLoopData({
          ...loopData,
          average_rating: stats.average,
          total_ratings: stats.total,
        });
      }
    } else {
      const originalRating = await getUserRating(loopId);
      setUserRating(originalRating || 0);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }

    setIsSubmittingRating(false);
  };


  const toggleTask = async (task: Task) => {
    try {
      const newCompleted = !task.completed;

      // Use cascading toggle that also updates children
      const success = await toggleTaskWithChildren(task.id, newCompleted);
      if (!success) throw new Error('Toggle failed');

      if (newCompleted) {
        await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
      }

      if (task.is_one_time && newCompleted) {
        await supabase.from('archived_tasks').insert({
          original_task_id: task.id,
          loop_id: task.loop_id,
          description: task.description,
          completed_at: new Date().toISOString(),
        });

        // Children cascade via ON DELETE CASCADE
        await supabase.from('tasks').delete().eq('id', task.id);
      }

      const updatedLoopData = await loadLoopData();

      if (updatedLoopData) {
        await checkAndShowThemePrompt();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleGenerateSynopsis = async () => {
    if (!loopData || loopData.tasks.length === 0) return;

    try {
      setGeneratingSynopsis(true);

      const recurringTasks = loopData.tasks.filter(t => !t.is_one_time);
      const summary = `This loop helps you manage "${loopData.name}" by tracking ${recurringTasks.length} key steps including ${recurringTasks[0].description.toLowerCase()}.`;

      const { error } = await supabase
        .from('loops')
        .update({ description: summary })
        .eq('id', loopId);

      if (error) throw error;

      setLoopData({ ...loopData, description: summary });
      Alert.alert('AI Synopsis Generated', 'A summary has been created for your loop.');
    } catch (err) {
      console.error('Error generating synopsis:', err);
      Alert.alert('Error', 'Failed to generate synopsis. Please try again.');
    } finally {
      setGeneratingSynopsis(false);
    }
  };

  const handleEditTask = (task: TaskWithDetails) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = async (task: Task) => {
    Alert.alert('Delete Task', `Delete "${task.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('tasks').delete().eq('id', task.id);
            if (error) throw error;
            await loadLoopData();
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const handleSaveTask = async (
    taskData: Partial<TaskWithDetails>,
    pendingSubtasks?: Subtask[],
    pendingAttachments?: PendingAttachment[],
    closeModal: boolean = true
  ): Promise<string | null | void> => {
    try {
      let finalAssignedTo = taskData.assigned_to;
      if (finalAssignedTo) {
         const memberId = await ensureLoopMember(finalAssignedTo, loopId);
         finalAssignedTo = memberId || null;
      }

      let savedTaskId: string | null = null;

      if (editingTask) {
        await updateTaskExtended(editingTask.id, {
            ...taskData,
            assigned_to: finalAssignedTo
        });
        savedTaskId = editingTask.id;
      } else {
        // Calculate order_index for new top-level task
        const topLevelCount = loopData?.tasks.filter(t => !t.parent_task_id).length || 0;
        const { data: newTask, error } = await supabase.from('tasks').insert({
          loop_id: loopId,
          description: taskData.description,
          is_one_time: taskData.is_one_time ?? false,
          completed: false,
          assigned_to: finalAssignedTo,
          priority: taskData.priority || 'none',
          due_date: taskData.due_date,
          notes: taskData.notes,
          time_estimate_minutes: taskData.time_estimate_minutes,
          reminder_at: taskData.reminder_at,
          order_index: topLevelCount,
        })
        .select('id')
        .single();

        if (error) throw error;

        if (newTask) {
            savedTaskId = newTask.id;
            if (taskData.tags && taskData.tags.length > 0) {
                await updateTaskExtended(newTask.id, { tags: taskData.tags });
            }
        }
      }

      if (savedTaskId) {
        // Create child tasks (replaces old subtasks table)
        if (pendingSubtasks && pendingSubtasks.length > 0) {
            for (const sub of pendingSubtasks) {
                await supabase.from('tasks').insert({
                  loop_id: loopId,
                  description: sub.description,
                  completed: false,
                  is_one_time: taskData.is_one_time ?? false,
                  priority: 'none',
                  parent_task_id: savedTaskId,
                  order_index: sub.order_index,
                });
            }
        }

        if (pendingAttachments && pendingAttachments.length > 0 && user) {
            for (const att of pendingAttachments) {
                try {
                  await uploadAttachment(savedTaskId, {
                      name: att.name,
                      type: att.mimeType || (att.type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
                      uri: att.uri,
                      size: att.size || 0,
                  }, user.id);
                } catch (attachError) {
                  console.error('[LoopDetail] Error uploading attachment:', attachError);
                }
            }
        }
      }

      await loadLoopData();

      if (closeModal) {
        setModalVisible(false);
        setEditingTask(null);
      }

      return savedTaskId;
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
      return null;
    }
  };

  const handlePromoteTask = async (taskId: string) => {
    try {
      const topLevelCount = loopData?.tasks.filter(t => !t.parent_task_id).length || 0;
      const success = await promoteTask(taskId, topLevelCount);
      if (success) {
        await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
        setModalVisible(false);
        setEditingTask(null);
        await loadLoopData();
      }
    } catch (error) {
      console.error('Error promoting task:', error);
      Alert.alert('Error', 'Failed to promote task');
    }
  };

  const handleNestTask = async (parentTaskId: string) => {
    if (!editingTask) return;
    try {
      const parentTask = loopData?.tasks.find(t => t.id === parentTaskId) as TaskWithDetails | undefined;
      const childCount = parentTask?.children?.length || 0;
      const success = await nestTask(editingTask.id, parentTaskId, childCount);
      if (success) {
        await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
        setModalVisible(false);
        setEditingTask(null);
        await loadLoopData();
      }
    } catch (error) {
      console.error('Error nesting task:', error);
      Alert.alert('Error', 'Failed to nest task');
    }
  };

  const handleCreateTag = async (name: string, color: string) => {
    if (!user) throw new Error('User not logged in');
    const tag = await createTag(user.id, name, color);
    if (!tag) {
        throw new Error('Failed to create tag');
    }
    setAvailableTags(prev => [...prev, tag]);
    return tag;
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleReloop = async () => {
    if (currentProgress < 100) {
      Alert.alert(
        'Reset Incomplete Loop?',
        'You haven\'t finished all tasks. Do you want to reset anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset Loop', onPress: () => resetLoop() }
        ]
      );
      return;
    }
    await resetLoop();
  };

  const resetLoop = async () => {
    try {
      await safeHapticImpact(Haptics.ImpactFeedbackStyle.Medium);

      if (loopData && loopData.function_type === 'practice' && loopData.completedCount === loopData.totalCount) {
          const today = new Date().toISOString().split('T')[0];
          const lastDate = loopData.lastCompletedDate?.split('T')[0];

          let newStreak = 1;
          if (lastDate) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              if (lastDate === yesterdayStr) {
                  newStreak = (loopData.currentStreak || 0) + 1;
              } else if (lastDate === today) {
                  newStreak = loopData.currentStreak || 0;
              }
          }

          const longestStreak = Math.max(newStreak, loopData.longestStreak || 0);

          await supabase
            .from('loop_streaks')
            .upsert({
              loop_id: loopId,
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_completed_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
      }

      if (loopData && loopData.reset_rule === 'daily' && loopData.completedCount === loopData.totalCount) {
        const { data: allDailyLoops } = await supabase
          .from('loops')
          .select('id')
          .eq('owner_id', user?.id)
          .eq('reset_rule', 'daily');

        let allDailyLoopsComplete = true;

        if (allDailyLoops && allDailyLoops.length > 0) {
          for (const loop of allDailyLoops) {
            const { data: tasks } = await supabase
              .from('tasks')
              .select('id, completed, is_one_time')
              .eq('loop_id', loop.id)
              .eq('is_one_time', false);

            const completed = tasks?.filter(t => t.completed).length || 0;
            const total = tasks?.length || 0;

            if (total > 0 && completed < total && loop.id !== loopId) {
              allDailyLoopsComplete = false;
              break;
            }
          }
        }

        if (allDailyLoopsComplete) {
          const today = new Date().toISOString().split('T')[0];

          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user?.id)
            .limit(1);

          const currentStreak = streakData?.[0] || null;

          let newStreak = 1;
          let longestStreak = 1;

          if (currentStreak) {
            const lastDate = currentStreak.last_completed_date?.split('T')[0];

            if (lastDate && lastDate !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              if (lastDate === yesterdayStr) {
                newStreak = currentStreak.current_streak + 1;
              } else {
                newStreak = 1;
              }
            } else if (lastDate === today) {
              newStreak = currentStreak.current_streak;
            }

            longestStreak = Math.max(newStreak, currentStreak.longest_streak || 0);
          }

          await supabase
            .from('user_streaks')
            .upsert({
              user_id: user?.id,
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_completed_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
        }
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          completed: false
        })
        .eq('loop_id', loopId)
        .eq('is_one_time', false);

      if (error) throw error;

      if (loopData && loopData.reset_rule !== 'manual') {
        let nextResetAt: string;
        if (loopData.reset_rule === 'daily') {
          nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        } else {
          nextResetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        await supabase
          .from('loops')
          .update({ next_reset_at: nextResetAt })
          .eq('id', loopId);
      }

      await loadLoopData();
      setShowLoopInfoModal(false); // Close modal after reloop
    } catch {
      Alert.alert('Error', 'Failed to reset loop');
    }
  };

  useEffect(() => {
    const checkPromptVisibility = () => {
      if (userRating > 0) {
        setShowRatingPrompt(true);
        return;
      }

      if (!memberJoinedAt) {
        setShowRatingPrompt(false);
        return;
      }

      const joined = new Date(memberJoinedAt).getTime();
      const now = Date.now();
      const daysSinceJoined = (now - joined) / (1000 * 60 * 60 * 24);

      if (daysSinceJoined < 2) {
        setShowRatingPrompt(false);
        return;
      }

      if (lastDismissedPrompt) {
        const daysSinceDismissed = (now - lastDismissedPrompt) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 30) {
          setShowRatingPrompt(false);
          return;
        }
      }

      setShowRatingPrompt(true);
    };

    checkPromptVisibility();
  }, [userRating, memberJoinedAt, lastDismissedPrompt]);

  if (loading && !refreshing && !loopData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Loading Atmosphere...</Text>
      </View>
    );
  }

  if (!loopData) return null;

  // Derived state
  const recurringTasks = loopData.tasks.filter(t => !t.is_one_time) || [];
  const oneTimeTasks = loopData.tasks.filter(t => t.is_one_time) || [];
  const currentProgress = loopData.totalCount && loopData.totalCount > 0
    ? Math.round((loopData.completedCount / loopData.totalCount) * 100)
    : 0;

  // Get category label
  const getCategoryLabel = () => {
    const type = loopData.category || 'personal';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <View style={styles.container}>
      <MomentumOrb />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <NestableScrollContainer
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadLoopData} tintColor={colors.primary} />
          }
        >
          {/* Header Row: Back + Title + Icons */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Home');
                }
              }}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.backChevron, { color: colors.primary }]}>‹</Text>
              <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Compact Header: Icon + Title + Actions in one row */}
          <View style={styles.compactHeader}>
            <View style={styles.compactRingWrapper}>
              <LoopIcon
                size={48}
                color={loopData.color || colors.primary}
              />
              <View style={styles.ringCountOverlay}>
                <Text style={[styles.compactRingCountText, { color: colors.text }]}>
                  {loopData.completedCount}/{loopData.totalCount}
                </Text>
              </View>
            </View>

            <View style={styles.compactTitleArea}>
              <Text style={[styles.compactLoopTitle, { fontFamily: 'Outfit_700Bold', color: colors.text }]} numberOfLines={1}>
                {loopData.name}
              </Text>
              <View style={styles.compactTitleActions}>
                {loopMembers.length > 0 && (
                  <MemberAvatars
                    members={loopMembers}
                    maxVisible={3}
                    size={22}
                    onPress={() => setShowMemberList(true)}
                  />
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowLoopInfoModal(true)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="eye-outline" size={22} color={colors.primary} />
              {loopData.description && (
                <View style={styles.unreadBadge} />
              )}
            </TouchableOpacity>
          </View>

          {/* Steps Section */}
          {recurringTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <BeeIcon size={100} />
              <Text style={styles.emptyTitle}>No steps yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button to add your first step
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={openAddTaskModal}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyAddButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stepsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>
                  Steps 
                  <Text style={[styles.sectionHeaderCount, { color: colors.textSecondary }]}> ({loopData.completedCount}/{loopData.totalCount})</Text>
                </Text>

                <TouchableOpacity 
                   onPress={() => {
                     if (currentProgress < 100) {
                         Alert.alert(
                             'Reset Incomplete Loop?',
                             'You haven\'t finished all tasks. Do you want to reset anyway?',
                             [
                                 { text: 'Cancel', style: 'cancel' },
                                 { text: 'Reset Loop', onPress: () => resetLoop() }
                             ]
                         );
                     } else {
                         resetLoop();
                     }
                   }}
                   activeOpacity={0.6}
                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                 >
                   <Text style={styles.resetLoopText}>Reset Loop</Text>
                 </TouchableOpacity>
              </View>

              {/* Draggable Task Cards with reorder and nesting */}
              <TaskTree
                tasks={recurringTasks as Task[]}
                onDeleteTask={handleDeleteTask}
                onUpdateTree={async (newTree) => {
                  setLoopData(prev => prev ? { ...prev, tasks: [...newTree, ...oneTimeTasks] } : null);
                  // Sync to DB
                  try {
                    const flatUpdates = flattenTreeForSync(newTree);
                    const updates = flatUpdates.map(u => 
                      supabase.from('tasks').update({ 
                        order_index: u.order_index, 
                        parent_task_id: u.parent_task_id,
                        updated_at: new Date().toISOString()
                      }).eq('id', u.id)
                    );
                    await Promise.all(updates);
                  } catch (err) {
                    console.error('Failed to sync tree reorder:', err);
                  }
                }}
                onNestTask={async () => {
                  await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
                }}
                onPromoteTask={handlePromoteTask}
                onEditTask={handleEditTask}
                onToggleTask={toggleTask}
              />

              {/* Add Step Button */}
              <TouchableOpacity
                style={styles.floatingAddStepButton}
                onPress={openAddTaskModal}
                activeOpacity={0.7}
              >
                <View style={styles.addStepInner}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addStepText}>Add new step</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* One-time Tasks */}
          {oneTimeTasks.length > 0 && (
            <View style={styles.stepsSection}>
              <Text style={styles.sectionHeader}>One-time Tasks</Text>
              <TaskTree
                tasks={oneTimeTasks as Task[]}
                onDeleteTask={handleDeleteTask}
                onUpdateTree={async (newTree) => {
                  setLoopData(prev => prev ? { ...prev, tasks: [...recurringTasks, ...newTree] } : null);
                  try {
                    const flatUpdates = flattenTreeForSync(newTree);
                    const updates = flatUpdates.map(u => 
                      supabase.from('tasks').update({ 
                        order_index: u.order_index, 
                        parent_task_id: u.parent_task_id,
                        updated_at: new Date().toISOString()
                      }).eq('id', u.id)
                    );
                    await Promise.all(updates);
                  } catch (err) {
                    console.error('Failed to sync one-time tree:', err);
                  }
                }}
                onNestTask={async () => {
                  await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
                }}
                onPromoteTask={handlePromoteTask}
                onEditTask={handleEditTask}
                onToggleTask={toggleTask}
              />
            </View>
          )}

        </NestableScrollContainer>

        {/* Readability Anchor: Dark gradient at bottom to isolate floating buttons */}
        <LinearGradient
          colors={['transparent', 'rgba(15, 17, 21, 0.8)', 'rgba(15, 17, 21, 1)']}
          style={styles.bottomReadabilityAnchor}
          pointerEvents="none"
        />

        {/* AI Synopsis Button */}
        {recurringTasks.length > 0 && !loopData.description && (
          <TouchableOpacity
            style={styles.synopsisFab}
            onPress={handleGenerateSynopsis}
            disabled={generatingSynopsis}
          >
            <View style={styles.synopsisFabInner}>
              <Text style={styles.synopsisFabText}>
                {generatingSynopsis ? '...' : '✨ Create AI Synopsis'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Add Task FAB */}
        {recurringTasks.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddTask}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}

        {/* =====================================================
            LOOP INFO MODAL (Glassmorphic Bottom Sheet)
            ===================================================== */}
        <Modal
          visible={showLoopInfoModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLoopInfoModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLoopInfoModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.infoModalContent}
            >
              {/* Modal Header */}
              <View style={styles.infoModalHeader}>
                <Text style={styles.infoModalTitle}>Loop Details & Settings</Text>
                <TouchableOpacity
                  onPress={() => setShowLoopInfoModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                {/* Loop Specs Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Loop Specs</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Resets:</Text>
                    <Text style={styles.infoValue}>{formatResetSchedule()}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Category:</Text>
                    <Text style={styles.infoValue}>{getCategoryLabel()}</Text>
                  </View>

                  {loopData.source_title && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Source:</Text>
                      <Text style={styles.infoValue}>{loopData.source_title}</Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Notifications:</Text>
                    <Text style={styles.infoValue}>On</Text>
                  </View>
                </View>

                {/* Provenance Section */}
                {(loopData.author_name || loopData.source_title) && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>Provenance (Expert System)</Text>
                    <View style={styles.provenanceCard}>
                      <View style={styles.provenanceContent}>
                        <Ionicons name="book-outline" size={24} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.provenanceStreakText}>
                            Current Streak: {loopData.currentStreak || 0} days
                          </Text>
                          <Text style={styles.provenanceCompletionText}>
                            Completion Rate: {currentProgress}%
                          </Text>
                        </View>
                        <View style={styles.expertBadge}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                          <Text style={styles.expertBadgeText}>Expert</Text>
                        </View>
                      </View>

                      {loopData.affiliate_link && (
                        <TouchableOpacity
                          style={styles.affiliateLink}
                          onPress={() => Linking.openURL(loopData.affiliate_link!)}
                        >
                          <Text style={styles.affiliateLinkText}>
                            Buy on Amazon (Affiliate Link)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* Stats Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Stats</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Times Looped</Text>
                      <Text style={styles.statValue}>{loopData.longestStreak || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Completion Rate</Text>
                      <Text style={styles.statValue}>{currentProgress}%</Text>
                    </View>
                  </View>
                </View>

                {/* Reloop Early & Invite Section - Consistent with plan */}
                <View style={styles.actionSheet}>
                  {recurringTasks.length > 0 && (
                    <TouchableOpacity
                      style={styles.primarySheetButton}
                      onPress={handleReloop}
                    >
                      <Ionicons name="refresh-circle-outline" size={24} color="white" />
                      <Text style={styles.primarySheetButtonText}>
                        {loopData.reset_rule === 'manual'
                          ? 'Complete Checklist'
                          : (currentProgress >= 100 ? 'Reloop Now' : 'Reloop Early')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {loopData.owner_id === user?.id && (
                    <TouchableOpacity
                      style={styles.secondarySheetButton}
                      onPress={() => {
                        setShowLoopInfoModal(false);
                        setShowInviteModal(true);
                      }}
                    >
                      <Ionicons name="person-add-outline" size={20} color={colors.primary} />
                      <Text style={styles.secondarySheetButtonText}>Invite Collaborator</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Rating Section */}
                {showRatingPrompt && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>Rate this Loop</Text>
                    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                      <StarRatingInput
                        value={userRating}
                        onChange={handleSubmitRating}
                        disabled={isSubmittingRating}
                        size={32}
                      />
                    </View>
                  </View>
                )}

                {/* Edit Loop Button */}
                <TouchableOpacity
                  style={styles.editLoopButton}
                  onPress={() => {
                    setShowLoopInfoModal(false);
                    setEditingLoop(true);
                  }}
                >
                  <Ionicons name="settings-outline" size={18} color="#6b7280" />
                  <Text style={styles.editLoopButtonText}>Edit Loop Settings</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Theme Customization Prompt Modal */}
        <Modal
          visible={showThemePrompt}
          transparent={true}
          animationType="slide"
          onRequestClose={handleThemePromptLater}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.themeModalContent, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
              <Text style={[styles.themeModalTitle, { color: colors.text }]}>
                Nice work!
              </Text>
              <Text style={[styles.themeModalMessage, { color: colors.textSecondary }]}>
                Want to personalize your DoLoop theme?
              </Text>

              <View style={styles.themeModalButtons}>
                <TouchableOpacity
                  style={styles.themeModalButtonSecondary}
                  onPress={handleThemePromptLater}
                >
                  <Text style={[styles.themeModalButtonTextSecondary, { color: colors.textSecondary }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.themeModalButtonPrimary}
                  onPress={handleThemePromptCustomize}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themeModalButtonGradient}
                  >
                    <Text style={styles.themeModalButtonTextPrimary}>
                      Customize Theme
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Task Edit Modal */}
        <TaskEditModal
          visible={modalVisible}
          onClose={() => {
              setModalVisible(false);
              setEditingTask(null);
          }}
          onSave={handleSaveTask}
          task={editingTask}
          user={user}
          availableTags={availableTags}
          onCreateTag={handleCreateTag}
          onPromote={editingTask?.parent_task_id ? () => handlePromoteTask(editingTask.id) : undefined}
          availableParentTasks={
            editingTask && !editingTask.parent_task_id
              ? (loopData?.tasks.filter(t => t.id !== editingTask.id && !t.parent_task_id) as TaskWithDetails[])
              : undefined
          }
          onNestUnder={editingTask && !editingTask.parent_task_id ? handleNestTask : undefined}
        />

        {/* Invite Modal */}
        <InviteModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          loopId={loopId}
          loopName={loopData?.name || 'Loop'}
          onInviteSent={() => {
            getLoopMemberProfiles(loopId).then(setLoopMembers);
          }}
        />

        {/* Member List Modal */}
        <MemberListModal
          visible={showMemberList}
          onClose={() => setShowMemberList(false)}
          members={loopMembers}
          loopName={loopData?.name || 'Loop'}
        />

        {/* Create/Edit Loop Modal */}
        <CreateLoopModal
          visible={isEditingLoop}
          onClose={() => setEditingLoop(false)}
          onSave={handleUpdateLoop}
          initialData={loopData ? {
            name: loopData.name || '',
            description: loopData.description || '',
            affiliate_link: loopData.affiliate_link || '',
            reset_rule: loopData.reset_rule || 'manual',
            color: loopData.color,
            due_date: loopData.due_date,
            function_type: loopData.function_type,
          } : null}
          loading={savingLoop}
          isEditing={true}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  // Header
  headerRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: -8,
  },
  backChevron: {
    fontSize: 28,
    lineHeight: 28,
  },
  backText: {
    fontSize: 17,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Compact Header
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  compactRingWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  ringCountOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRingCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  compactTitleArea: {
    flex: 1,
  },
  compactLoopTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  compactTitleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeButton: {
    padding: 4,
  },

  // Steps
  stepsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: '#000', // Override inline
    marginLeft: 4,
  },
  resetLoopText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_GOLD,
  },
  sectionHeaderCount: {
    fontSize: 14,
    color: '#666', // Override inline
    fontWeight: '600',
  },
  taskCardsGrid: {
    gap: 0, // Cards have their own marginBottom
  },
  floatingAddStepButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BRAND_GOLD + '50',
    backgroundColor: BRAND_GOLD + '12',
  },
  addStepInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addStepText: {
    fontSize: 15,
    color: BRAND_GOLD,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    minHeight: 350,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyAddButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND_GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    marginTop: -2,
  },

  // Invite Section
  inviteSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  inviteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_GOLD,
  },

  // FABs
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  fabText: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  taskCardWrapper: {
    position: 'relative',
  },
  trailConnector: {
    position: 'absolute',
    left: 30, // Centered with cardboard checkbox (approx)
    top: 60,
    bottom: -16,
    width: 2,
    zIndex: -1,
  },
  synopsisFab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND_GOLD + '60',
    backgroundColor: BRAND_GOLD,
    zIndex: 10,
  },
  synopsisFabInner: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  synopsisFabText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  bottomReadabilityAnchor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 1,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  // Loop Info Modal
  infoModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoModalTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: '#000', // Override inline
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: BRAND_GOLD,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666', // Override inline
  },
  infoValue: {
    fontSize: 14,
    color: '#000', // Override inline
    fontWeight: '500',
  },

  // Ketchup Slot
  ketchupSlot: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -4,
  },
  ketchupSlotLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  ketchupSlotCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },

  // Provenance Card
  provenanceCard: {
    backgroundColor: 'rgba(254, 192, 15, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND_GOLD + '20',
  },
  provenanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  provenanceStreakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  provenanceCompletionText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expertBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  affiliateLink: {
    marginTop: 12,
  },
  affiliateLinkText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: BRAND_GOLD,
  },
  ratingStats: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
  },

  // Edit Loop Button
  editLoopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  editLoopButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Action Sheet in Modal
  actionSheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  primarySheetButton: {
    backgroundColor: BRAND_GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primarySheetButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  secondarySheetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND_GOLD + '40',
    gap: 10,
  },
  secondarySheetButtonText: {
    color: BRAND_GOLD,
    fontSize: 15,
    fontWeight: '700',
  },

  reloopButton: {
    backgroundColor: BRAND_GOLD,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  reloopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Theme Modal
  themeModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  themeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  themeModalMessage: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  themeModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  themeModalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  themeModalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeModalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeModalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  themeModalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default LoopDetailScreen;
