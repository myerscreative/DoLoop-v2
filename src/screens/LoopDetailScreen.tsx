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
import { TaskEditModal } from '../components/native/TaskEditModal';
import { InviteModal } from '../components/native/InviteModal';
import CreateLoopModal from '../components/native/CreateLoopModal';
import { MemberAvatars, MemberListModal } from '../components/native/MemberAvatars';
import { BeeIcon } from '../components/native/BeeIcon';
import { getUserTags, getTaskTags, getTaskSubtasks, getTaskAttachments, updateTaskExtended, createTag, ensureLoopMember, createSubtask, uploadAttachment } from '../lib/taskHelpers';
import { getLoopMemberProfiles, LoopMemberProfile } from '../lib/profileHelpers';
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

  // NEW: Loop Info Modal state
  const [showLoopInfoModal, setShowLoopInfoModal] = useState(false);

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
        if (pendingSubtasks && pendingSubtasks.length > 0) {
            for (const sub of pendingSubtasks) {
                await createSubtask(savedTaskId, sub.description, sub.order_index);
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
      setShowResetMenu(false);
      setShowLoopInfoModal(false); // Close modal after reloop
    } catch (error) {
      console.error('Error resetting loop:', error);
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

  // Get category label
  const getCategoryLabel = () => {
    const type = loopData.category || 'personal';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{
        flex: 1,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#f8f9fa',
      }}>
        {/* Header Row: Back + Title + Icons */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backChevron, { color: BRAND_GOLD }]}>‹</Text>
            <Text style={[styles.backText, { color: BRAND_GOLD }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Centered Progress Ring */}
          <View style={styles.ringContainer}>
            <View style={styles.ringWrapper}>
              <LoopIcon
                size={100}
                color={loopData.color || BRAND_GOLD}
              />
              <View style={styles.ringCountOverlay}>
                <Text style={styles.ringCountText}>
                  {loopData.completedCount}/{loopData.totalCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Title Row with Eye Icon and Member Avatars */}
          <View style={styles.titleContainer}>
            <Text style={styles.loopTitle}>{loopData.name}</Text>

            <View style={styles.titleActions}>
              {/* Eye Icon - Opens Loop Info Modal */}
              <TouchableOpacity
                onPress={() => setShowLoopInfoModal(true)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="eye-outline" size={22} color="#6b7280" />
              </TouchableOpacity>

              {/* Member Avatars */}
              {loopMembers.length > 0 && (
                <MemberAvatars
                  members={loopMembers}
                  maxVisible={3}
                  size={28}
                  onPress={() => setShowMemberList(true)}
                />
              )}
            </View>
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
              <Text style={styles.stepsHeader}>
                Steps ({loopData.completedCount}/{loopData.totalCount})
              </Text>

              {/* Glassmorphic Task Cards Container */}
              <View style={styles.taskCardsContainer}>
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

              {/* Add Step Button */}
              <TouchableOpacity
                style={styles.addStepButton}
                onPress={openAddTaskModal}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={BRAND_GOLD} />
                <Text style={styles.addStepText}>Add Step</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* One-time Tasks */}
          {oneTimeTasks.length > 0 && (
            <View style={styles.stepsSection}>
              <Text style={styles.stepsHeader}>One-time Tasks</Text>
              <View style={styles.taskCardsContainer}>
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

          {/* Invite Collaborator Link - Compact */}
          {loopData.owner_id === user?.id && (
            <View style={styles.inviteSection}>
              <TouchableOpacity
                style={styles.inviteLink}
                onPress={() => setShowInviteModal(true)}
              >
                <Ionicons name="checkbox-outline" size={18} color={BRAND_GOLD} />
                <Text style={styles.inviteLinkText}>Invite Collaborator</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* AI Synopsis FAB - Sparkle Button */}
        {recurringTasks.length > 0 && !loopData.description && (
          <TouchableOpacity
            style={styles.synopsisFab}
            onPress={handleGenerateSynopsis}
            disabled={generatingSynopsis}
          >
            <LinearGradient
              colors={['#f8fafc', '#f1f5f9']}
              style={styles.synopsisFabGradient}
            >
              <Text style={styles.synopsisFabText}>
                {generatingSynopsis ? '...' : '✨ Create AI Synopsis'}
              </Text>
            </LinearGradient>
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
                        <Ionicons name="book-outline" size={24} color={BRAND_GOLD} />
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
                      {loopData.total_ratings !== undefined && loopData.total_ratings > 0 && (
                        <Text style={styles.ratingStats}>
                          Average: {(loopData.average_rating || 0).toFixed(1)} ({loopData.total_ratings} ratings)
                        </Text>
                      )}
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

                {/* Reloop Early Button - Moved here */}
                {recurringTasks.length > 0 && (
                  <TouchableOpacity
                    style={styles.reloopButton}
                    onPress={handleReloop}
                  >
                    <Text style={styles.reloopButtonText}>
                      {loopData.reset_rule === 'manual'
                        ? 'Complete Checklist'
                        : (currentProgress >= 100 ? 'Reloop' : 'Reloop Early')}
                    </Text>
                  </TouchableOpacity>
                )}
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
                    colors={[BRAND_GOLD, '#ffa500']}
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
          existingTasks={recurringTasks}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

  // Ring
  ringContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCountOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },

  // Title
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  loopTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    flex: 1,
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepsHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  taskCardsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 12,
  },
  addStepText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 8,
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
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '500',
  },
  synopsisFab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 100,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  synopsisFabGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  synopsisFabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#1f2937',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },

  // Provenance Card
  provenanceCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
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

  // Reloop Button
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
