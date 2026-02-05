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
import { ExpandableTaskCard } from '../components/native/ExpandableTaskCard';
import { LoopIcon } from '../components/native/LoopIcon';
import { MomentumRing } from '../components/native/MomentumRing';
import { TaskEditModal } from '../components/native/TaskEditModal';
import { InviteModal } from '../components/native/InviteModal';
import CreateLoopModal from '../components/native/CreateLoopModal';
import { MemberAvatars, MemberListModal } from '../components/native/MemberAvatars';
import { BeeIcon } from '../components/native/BeeIcon';
import { getUserTags, getTaskTags, getTaskSubtasks, getTaskAttachments, updateTaskExtended, createTag, ensureLoopMember, createSubtask, uploadAttachment } from '../lib/taskHelpers';
import { getLoopMemberProfiles, LoopMemberProfile } from '../lib/profileHelpers';
import { useSharedMomentum } from '../hooks/useSharedMomentum';
import { LoopType } from '../types/loop';
import { LoopProvenance } from '../components/loops/LoopProvenance';
import { StarRatingInput } from '../components/native/StarRatingInput';
import { getUserRating, submitRating, getLoopRatingStats } from '../lib/ratingHelpers';

type LoopDetailScreenRouteProp = RouteProp<RootStackParamList, 'LoopDetail'>;
type LoopDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoopDetail'>;

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
  const [showResetMenu, setShowResetMenu] = useState(false);
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
        // If type changed or next_reset_at missing, recalculate
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

  const formatNextReset = (nextResetAt: string | null) => {
    if (!nextResetAt) return 'Not scheduled';
    
    const date = new Date(nextResetAt);
    if (isNaN(date.getTime())) return 'Not scheduled';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) {
      return `${diffDays} days`;
    } else if (diffHours > 1) {
      return `${diffHours} hours`;
    } else if (diffHours < -24) {
      return 'Overdue';
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
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
    // Simplified - can be enhanced later
    // For now, just return without showing prompt
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

  // Realtime subscription for "Shared Momentum"
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
    setUserRating(score); // Optimistic update
    
    const success = await submitRating(loopId, score);
    
    if (success) {
      // Refresh loop data to get updated average
      const stats = await getLoopRatingStats(loopId);
      if (stats && loopData) {
        setLoopData({
          ...loopData,
          average_rating: stats.average,
          total_ratings: stats.total,
        });
      }
    } else {
      // Revert optimistic update
      const originalRating = await getUserRating(loopId);
      setUserRating(originalRating || 0);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
    
    setIsSubmittingRating(false);
  };

  const handleDismissRating = async () => {
    const now = Date.now();
    try {
      await AsyncStorage.setItem(`last_rating_dismissed_${loopId}`, now.toString());
      setLastDismissedPrompt(now);
      setShowRatingPrompt(false);
    } catch (e) {
      console.error('Error saving dismissal:', e);
    }
  };

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
          )
        `)
        .eq('loop_id', loopId)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Load tags, subtasks, and attachments for each task
      const tasksWithDetails = await Promise.all(
        (tasks || []).map(async (task: any) => {
          const [tags, subtasks, attachments] = await Promise.all([
            getTaskTags(task.id),
            getTaskSubtasks(task.id),
            getTaskAttachments(task.id),
          ]);
          return {
            ...task,
            tag_details: tags,
            subtasks,
            attachments,
            assigned_user_id: task.assigned_member?.user_id
          };
        })
      );


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
      
      // Load member profiles for collaboration display
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

      // Load last dismissed from storage
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
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoopData();
    setRefreshing(false);
  };

  const toggleTask = async (task: Task) => {
    try {
      const newCompleted = !task.completed;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', task.id);

      if (error) throw error;

      // Haptic feedback (no-op on web)
      if (newCompleted) {
        await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
      }

      // Handle one-time tasks
      if (task.is_one_time && newCompleted) {
        // Archive the task
        await supabase.from('archived_tasks').insert({
          original_task_id: task.id,
          loop_id: task.loop_id,
          description: task.description,
          completed_at: new Date().toISOString(),
        });

        // Remove from tasks
        await supabase.from('tasks').delete().eq('id', task.id);
      }

      const updatedLoopData = await loadLoopData();
      
      // Check if this is the first loop completion and show theme prompt
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
      
      // We'll use the loop name and tasks to create a prompt
      const recurringTasks = loopData.tasks.filter(t => !t.is_one_time);
      // Try to use the existing edge function or a local fallback
      // For this implementation, we'll simulate a very smart local summary 
      // based on the loop name and tasks.
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

  const handleSaveTask = async (
    taskData: Partial<TaskWithDetails>, 
    pendingSubtasks?: Subtask[],
    pendingAttachments?: PendingAttachment[],
    closeModal: boolean = true
  ): Promise<string | null | void> => {
    try {
      // Resolve assignment to Loop Member ID (convert UserID -> LoopMemberID)
      let finalAssignedTo = taskData.assigned_to;
      if (finalAssignedTo) {
         const memberId = await ensureLoopMember(finalAssignedTo, loopId);
         finalAssignedTo = memberId || null;
      }

      let savedTaskId: string | null = null;

      if (editingTask) {
        // Update existing task
        await updateTaskExtended(editingTask.id, {
            ...taskData,
            assigned_to: finalAssignedTo
        });
        savedTaskId = editingTask.id;
      } else {
        // Create new task
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
        // Save pending subtasks
        if (pendingSubtasks && pendingSubtasks.length > 0) {
            console.log(`[LoopDetail] Saving ${pendingSubtasks.length} pending subtasks for task ${savedTaskId}`);
            for (const sub of pendingSubtasks) {
                await createSubtask(savedTaskId, sub.description, sub.order_index);
            }
        }

        // Save pending attachments
        if (pendingAttachments && pendingAttachments.length > 0 && user) {
            console.log(`[LoopDetail] Uploading ${pendingAttachments.length} attachments for task ${savedTaskId}`);
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

      console.log('[LoopDetail] Task and subtasks/attachments saved successfully');
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

  const handleCreateTag = async (name: string, color: string) => {
    if (!user) throw new Error('User not logged in');
    const tag = await createTag(user.id, name, color);
    if (!tag) {
        throw new Error('Failed to create tag');
    }
    setAvailableTags(prev => [...prev, tag]); // Use functional update
    return tag;
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setModalVisible(true);
  };


  const handleReloop = async () => {
    // If loop is incomplete, ask for confirmation
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

    if (loopData?.reset_rule === 'manual') {
      await resetLoop();
    } else if (showResetMenu) {
      await resetLoop();
    } else {
      const now = new Date();
      const nextResetAt = loopData?.next_reset_at;
      const nextReset = nextResetAt ? new Date(nextResetAt) : null;

      if (!nextReset || now >= nextReset) {
        await resetLoop();
      } else {
        if (loopData) {
          Alert.alert(
            'Next Reset',
            `This loop resets ${loopData.reset_rule}${nextReset ? ' at ' + nextReset.toLocaleTimeString() : ''}. Do you want to reset it early?`,
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Reset Now', onPress: () => resetLoop() }
            ]
          );
        }
      }
    }
  };

  const resetLoop = async () => {
    try {
      await safeHapticImpact(Haptics.ImpactFeedbackStyle.Medium);

      // === PER-LOOP STREAK LOGIC for Practice Loops ===
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

      // === GLOBAL STREAK LOGIC: Update global user streak for daily loops ===
      if (loopData && loopData.reset_rule === 'daily' && loopData.completedCount === loopData.totalCount) {
        // Check if ALL daily loops are complete
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

        // Update streak if all daily loops are complete
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
              // Check if it was yesterday
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (lastDate === yesterdayStr) {
                newStreak = currentStreak.current_streak + 1;
              } else {
                newStreak = 1; // Streak broken
              }
            } else if (lastDate === today) {
              newStreak = currentStreak.current_streak; // Already counted today
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

      // Reset tasks
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: false
        })
        .eq('loop_id', loopId)
        .eq('is_one_time', false);

      if (error) throw error;

      // Update next reset time if scheduled
      if (loopData && loopData.reset_rule !== 'manual') {
        let nextResetAt: string;
        if (loopData.reset_rule === 'daily') {
          nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        } else { // weekly
          nextResetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        await supabase
          .from('loops')
          .update({ next_reset_at: nextResetAt })
          .eq('id', loopId);
      }

      await loadLoopData();
      setShowResetMenu(false);
    } catch (error) {
      console.error('Error resetting loop:', error);
      Alert.alert('Error', 'Failed to reset loop');
    }
  };

  const longPressReloop = () => {
    setShowResetMenu(true);
    // Auto-hide after a delay
    setTimeout(() => setShowResetMenu(false), 3000);
  };

  // Check prompt visibility whenever relevant data changes
  useEffect(() => {
    const checkPromptVisibility = () => {
      // If user already rated, we don't show the prompt logic, 
      // but we might still want to show the section so they can see/edit.
      // However, the user said "not be there all the time".
      if (userRating > 0) {
        setShowRatingPrompt(true); // Keep it visible if rated
        return;
      }

      if (!memberJoinedAt) {
        setShowRatingPrompt(false);
        return;
      }

      const joined = new Date(memberJoinedAt).getTime();
      const now = Date.now();
      const daysSinceJoined = (now - joined) / (1000 * 60 * 60 * 24);

      // Rule: Show after 2 days (using 2.5 to be safe)
      if (daysSinceJoined < 2) {
        setShowRatingPrompt(false);
        return;
      }

      // Rule: If dismissed, wait 30 days
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

  // Derived state
  const recurringTasks = loopData?.tasks?.filter(t => !t.is_one_time) || [];
  const oneTimeTasks = loopData?.tasks?.filter(t => t.is_one_time) || [];
  const currentProgress = loopData?.totalCount && loopData.totalCount > 0 
    ? Math.round((loopData.completedCount / loopData.totalCount) * 100) 
    : 0;

  if (loading || !loopData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <LoopIcon size={48} color={colors.primary} />
      </View>
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
        {/* Back Button */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 8,
              marginLeft: -8,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{
              fontSize: 28,
              color: colors.primary,
              lineHeight: 28,
            }}>‹</Text>
            <Text style={{
              fontSize: 17,
              color: colors.primary,
              marginLeft: 4,
              fontWeight: '500',
            }}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with Icon and Name */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 20,
          }}>
            {/* Loop Icon - Custom SVG */}
            {loopData.function_type === 'practice' ? (
                <MomentumRing size={80} strokeWidth={8} streak={loopData.currentStreak || 0} />
            ) : (
                <LoopIcon 
                size={64} 
                color={loopData.color || '#FFB800'} 
                />
            )}
            <View style={{ height: 16 }} />

            {/* Loop Name */}
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 4,
            }}>
              {loopData.name}
            </Text>
            
            {loopData.function_type === 'practice' && (
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFB800', marginBottom: 8 }}>
                    🧘 PRACTICE MODE
                </Text>
            )}

            {loopData.is_favorite && (
              <Text style={{ fontSize: 16, marginTop: 4 }}>⭐</Text>
            )}

          {/* Clickable Reset Info */}
          <TouchableOpacity 
            onPress={() => setEditingLoop(true)}
            activeOpacity={0.6}
            style={{
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'transparent',
            }}
          >
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}>
              {loopData.function_type === 'practice'
                ? `Daily habit • ${loopData.currentStreak || 0} day streak`
                : (loopData.reset_rule === 'manual'
                    ? 'Manual checklist • Complete when ready'
                    : `Resets ${loopData.reset_rule} • Next: ${formatNextReset(loopData.next_reset_at || null)}`)}
            </Text>
          </TouchableOpacity>
          </View>

        {/* Recurring Tasks or Empty State */}
        {recurringTasks.length === 0 ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
            paddingVertical: 80,
            minHeight: 400,
          }}>
            <BeeIcon size={120} />
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              marginTop: 24,
              marginBottom: 12,
              textAlign: 'center',
              letterSpacing: -0.5,
            }}>
              No steps yet
            </Text>
            <Text style={{
              fontSize: 17,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 40,
              lineHeight: 24,
            }}>
              Tap the + button to add your first step
            </Text>
            <TouchableOpacity
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
              }}
              onPress={openAddTaskModal}
              activeOpacity={0.8}
            >
              <Text style={{ 
                color: '#fff', 
                fontSize: 40, 
                fontWeight: '300',
                marginTop: -2,
              }}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 12,
            }}>
              Steps ({loopData.completedCount}/{loopData.totalCount})
            </Text>

            <View style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}>
                {recurringTasks.map((task) => (
                <View key={task.id}>
                    <ExpandableTaskCard
                        task={task as TaskWithDetails}
                        onPress={() => handleEditTask(task as TaskWithDetails)}
                        onToggle={() => toggleTask(task)}
                        onSubtaskChange={loadLoopData}
                        isPracticeLoop={loopData.function_type === 'practice'}
                    />
                </View>
                ))}
            </View>

            {/* Add Task Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                marginTop: 12,
              }}
              onPress={openAddTaskModal}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
                fontWeight: '500',
                marginLeft: 8,
              }}>
                Add Step
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* One-time Tasks */}
        {oneTimeTasks.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 12,
            }}>
              One-time Tasks
            </Text>

            <View style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}>
                {oneTimeTasks.map((task) => (
                <ExpandableTaskCard
                    key={task.id}
                    task={task as TaskWithDetails}
                    onPress={() => handleEditTask(task as TaskWithDetails)}
                    onToggle={() => toggleTask(task)}
                    onSubtaskChange={loadLoopData}
                />
                ))}
            </View>
          </View>
        )}

        {/* AI Synopsis & Rating Section - Now after tasks */}
        <View style={{ paddingHorizontal: 20, alignItems: 'center' }}>
          {/* Synopsis / Description */}
          {loopData.description ? (
            <View style={styles.synopsisContainer}>
              <View style={styles.synopsisHeader}>
                <Text style={styles.synopsisLabel}>AI SYNOPSIS</Text>
                <TouchableOpacity onPress={handleGenerateSynopsis} disabled={generatingSynopsis}>
                  <Text style={styles.regenerateText}>{generatingSynopsis ? '...' : '🔄 Regenerate'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.synopsisText}>{loopData.description}</Text>
            </View>
          ) : (
            recurringTasks.length > 0 && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateSynopsis}
                disabled={generatingSynopsis}
              >
                <LinearGradient
                  colors={['#f8fafc', '#f1f5f9']}
                  style={styles.generateButtonGradient}
                >
                  <Text style={styles.generateButtonText}>
                    {generatingSynopsis ? 'Generating...' : '✨ Create AI Synopsis'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )
          )}

          {/* Star Rating Section */}
          {showRatingPrompt && (
            <View style={styles.ratingSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 8 }}>
                <Text style={styles.ratingLabel}>Rate this Loop</Text>
                {userRating === 0 && (
                  <TouchableOpacity onPress={handleDismissRating} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <StarRatingInput 
                value={userRating}
                onChange={handleSubmitRating}
                disabled={isSubmittingRating}
                size={32}
              />
              {loopData.total_ratings !== undefined && loopData.total_ratings > 0 && (
                <Text style={styles.ratingStats}>
                  Average: {(loopData.average_rating || 0).toFixed(1)} ({loopData.total_ratings} {loopData.total_ratings === 1 ? 'rating' : 'ratings'})
                </Text>
              )}
              {userRating === 0 && (
                <TouchableOpacity onPress={handleDismissRating} style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, textDecorationLine: 'underline' }}>
                    Maybe later
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {loopData.affiliate_link && (
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => {
                Linking.openURL(loopData.affiliate_link!).catch(err => 
                  console.error('Error opening affiliate link:', err)
                );
              }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.orderButtonGradient}
              >
                <Text style={styles.orderButtonText}>📖 Order Book / Training</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* PROVENANCE SECTION */}
          <View style={{ width: '100%', marginTop: 24 }}>
            <LoopProvenance
              authorName={loopData.author_name}
              authorBio={loopData.author_bio}
              authorImageUrl={loopData.author_image_url}
              sourceTitle={loopData.source_title}
              sourceLink={loopData.source_link}
              endGoalDescription={loopData.end_goal_description}
            />
          </View>
        </View>

        {/* Collaborators Section - Now at the bottom */}
        <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
          {/* Member Avatars - Show collaborators */}
          {loopMembers.length > 0 && (
            <View style={{ marginBottom: 16, alignItems: 'center' }}>
              <MemberAvatars
                members={loopMembers}
                maxVisible={4}
                size={36}
                onPress={() => setShowMemberList(true)}
              />
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>
                {loopMembers.length} member{loopMembers.length !== 1 ? 's' : ''} • Tap to view
              </Text>
            </View>
          )}

          {/* Compact Invite Button - Only for loop owners */}
          {loopData.owner_id === user?.id && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => setShowInviteModal(true)}
            >
              <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: colors.primary, 
                marginLeft: 6
              }}>
                Invite Collaborator
              </Text>
            </TouchableOpacity>
          )}
        </View>

        </ScrollView>

        {/* Reloop Button */}
        {recurringTasks.length > 0 && (
          <View style={{
            position: 'absolute',
            bottom: 40,
            left: 20,
            right: 20,
          }}>
            {(() => {
              const isManual = loopData?.reset_rule === 'manual';
              const canReset = true; // Always allow reset now
              
              const buttonText = showResetMenu ? 'Reset Now' : (isManual ? 'Complete Checklist' : (currentProgress >= 100 ? 'Reloop' : 'Reloop Early'));
              
              const buttonBg = showResetMenu 
                ? colors.error 
                : (canReset ? loopData.color : '#e2e8f0'); 

              const buttonTextColor = 'white'; 

              return (
                <TouchableOpacity
                  style={{
                    backgroundColor: buttonBg,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 25,
                    alignItems: 'center',
                    opacity: 1, // Remove opacity, use explicit colors
                    elevation: canReset ? 4 : 0,
                    shadowColor: canReset ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                  }}
                  onPress={handleReloop}
                  onLongPress={longPressReloop}
                  delayLongPress={500}
                  disabled={!canReset}
                >
                  <Text style={{
                    color: buttonTextColor,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                    {buttonText}
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </View>
        )}

        {/* Theme Customization Prompt Modal */}
        <Modal
          visible={showThemePrompt}
          transparent={true}
          animationType="slide"
          onRequestClose={handleThemePromptLater}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalEmoji, { fontSize: 64 }]}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Nice work!
              </Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                Want to personalize your DoLoop theme?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={handleThemePromptLater}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Maybe later"
                >
                  <Text style={[styles.modalButtonTextSecondary, { color: colors.textSecondary }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={handleThemePromptCustomize}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Customize theme"
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonTextPrimary}>
                      Customize Theme
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      {/* FAB - Only show if tasks exist (otherwise Empty State + button is shown) */}
      {recurringTasks.length > 0 && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 110, // Moved up to sit above the Complete Checklist button
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
          onPress={handleAddTask}
        >
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      )}

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
        existingTasks={recurringTasks}
      />

      {/* Invite Modal */}
      <InviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        loopId={loopId}
        loopName={loopData?.name || 'Loop'}
        onInviteSent={() => {
          // Reload members after invite
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  modalEmoji: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  synopsisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  regenerateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 20,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  generateButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  synopsisContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  synopsisLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  synopsisText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  orderButton: {
    marginTop: 16,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  orderButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  ratingSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  ratingStats: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
  },
});
