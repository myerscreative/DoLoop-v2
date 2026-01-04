import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Task, LoopWithTasks, TaskWithDetails, Tag, FOLDER_ICONS, LoopType } from '../../types/loop';
import { AnimatedCircularProgress } from '../native/AnimatedCircularProgress';
import { EnhancedTaskCard } from '../native/EnhancedTaskCard';
import { TaskEditModal } from '../native/TaskEditModal';
import { InviteModal } from '../native/InviteModal';
import { MemberAvatars } from '../native/MemberAvatars';
import { BeeIcon } from '../native/BeeIcon';
import { getUserTags, getTaskTags, updateTaskExtended, ensureLoopMember } from '../../lib/taskHelpers';
import { getLoopMemberProfiles, LoopMemberProfile } from '../../lib/profileHelpers';
import { useSharedMomentum } from '../../hooks/useSharedMomentum';

// Props: accepts loopId directly
interface DesktopLoopDetailPanelProps {
  loopId: string;
  onClose?: () => void;
}

export const DesktopLoopDetailPanel: React.FC<DesktopLoopDetailPanelProps> = ({ 
  loopId, 
  onClose 
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  // We keep navigation for things like 'Settings' or deep linking if needed, but not for params
  const navigation = useNavigation<any>();

  const [loopData, setLoopData] = useState<LoopWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingSynopsis, setGeneratingSynopsis] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loopMembers, setLoopMembers] = useState<LoopMemberProfile[]>([]);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  // Helper formatting
  const formatNextReset = (nextResetAt: string | null) => {
    if (!nextResetAt) return 'Not scheduled';
    const date = new Date(nextResetAt);
    if (isNaN(date.getTime())) return 'Not scheduled';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) return `${diffDays} days`;
    if (diffHours > 1) return `${diffHours} hours`;
    if (diffHours < -24) return 'Overdue';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const safeHapticImpact = async (style: Haptics.ImpactFeedbackStyle) => {
    try {
      if (Platform.OS !== 'web') await Haptics.impactAsync(style);
    } catch (error) {
      console.warn('[LoopDetail] Haptics not available:', error);
    }
  };

  useEffect(() => {
    if (loopId) {
        loadLoopData();
        loadTags();
    }
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

  const loadLoopData = async () => {
    try {
      if (!loopId) return;
      const { data: loop, error: loopError } = await supabase
        .from('loops')
        .select('*')
        .eq('id', loopId)
        .single();

      if (loopError) throw loopError;

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`*, assigned_member:assigned_to (user_id)`)
        .eq('loop_id', loopId)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      const tasksWithTags = await Promise.all(
        (tasks || []).map(async (task: any) => {
          const tags = await getTaskTags(task.id);
          return {
            ...task,
            tag_details: tags,
            assigned_user_id: task.assigned_member?.user_id
          };
        })
      );

      const completedCount = tasksWithTags?.filter(task => task.completed && !task.is_one_time).length || 0;
      const totalCount = tasksWithTags?.filter(task => !task.is_one_time).length || 0;

      const loopWithTasks: LoopWithTasks = {
        ...loop,
        tasks: tasksWithTags || [],
        completedCount,
        totalCount,
      };

      setLoopData(loopWithTasks);
      const [members, streakData] = await Promise.all([
        getLoopMemberProfiles(loopId),
        supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user?.id)
          .maybeSingle()
      ]);
      setLoopMembers(members);
      if (streakData.data) {
        setStreak(streakData.data.current_streak || 0);
      }
      
      return loopWithTasks;
    } catch (error) {
      console.error('Error loading loop data:', error);
      // Don't alert on panel, might just be empty
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
      if (newCompleted) await safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);

      if (task.is_one_time && newCompleted) {
        await supabase.from('archived_tasks').insert({
          original_task_id: task.id,
          loop_id: task.loop_id,
          description: task.description,
          completed_at: new Date().toISOString(),
        });
        await supabase.from('tasks').delete().eq('id', task.id);
      }

      await loadLoopData();
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleGenerateSynopsis = async () => {
    if (!loopData || !loopData.tasks || loopData.tasks.length === 0) return;
    try {
      setGeneratingSynopsis(true);
      const recurringTasks = loopData.tasks.filter(t => !t.is_one_time);
      const summary = `This loop helps you manage "${loopData.name}" by tracking ${recurringTasks.length} key steps including ${recurringTasks[0]?.description?.toLowerCase() || 'tasks'}.`;

      const { error } = await supabase
        .from('loops')
        .update({ description: summary })
        .eq('id', loopId);

      if (error) throw error;
      setLoopData({ ...loopData, description: summary });
    } catch (err) {
      console.error('Error generating synopsis:', err);
    } finally {
      setGeneratingSynopsis(false);
    }
  };

  const handleEditTask = (task: TaskWithDetails) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = async (taskData: Partial<TaskWithDetails>) => {
    try {
      let finalAssignedTo = taskData.assigned_to;
      if (finalAssignedTo) {
         const memberId = await ensureLoopMember(finalAssignedTo, loopId);
         if (memberId) finalAssignedTo = memberId;
         else finalAssignedTo = null; 
      }

      if (editingTask) {
        await updateTaskExtended(editingTask.id, { ...taskData, assigned_to: finalAssignedTo });
      } else {
        const { error } = await supabase.from('tasks').insert({
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
        });
        if (error) throw error;

        if (taskData.tags && taskData.tags.length > 0) {
            // Very simplified tag handling for now
             const { data: newTask } = await supabase
            .from('tasks')
            .select('id')
            .eq('loop_id', loopId)
            .eq('description', taskData.description)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

            if (newTask) {
                await updateTaskExtended(newTask.id, { tags: taskData.tags });
            }
        }
      }

      await loadLoopData();
      setModalVisible(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    // For desktop web, use window.confirm
    if (Platform.OS === 'web') {
        const confirmed = window.confirm(`Delete "${task.description}"?`);
        if (!confirmed) return;
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', task.id);
            if (error) throw error;
            await loadLoopData();
        } catch(e) {
            console.error(e);
        }
        return;
    }
    
    Alert.alert('Delete Task', `Delete "${task.description}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
             const { error } = await supabase.from('tasks').delete().eq('id', task.id);
             if (error) throw error;
             await loadLoopData();
        }}
    ]);
  };
  
  const resetLoop = async () => {
     // Simplified reset Logic
      if (!loopData) return;
      try {
        await safeHapticImpact(Haptics.ImpactFeedbackStyle.Medium);
        const { error } = await supabase
            .from('tasks')
            .update({ completed: false })
            .eq('loop_id', loopId)
            .eq('is_one_time', false);
        if (error) throw error;

        // Update reset time
         if (loopData.reset_rule !== 'manual') {
            let nextResetAt = new Date().toISOString(); 
            // logic skipped for brevity, assumed server or proper logic elsewhere
         }
         await loadLoopData();
      } catch (err) {
        console.error('Reset error', err);
      }
  };

  if (!loopData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Select a loop to view details</Text>
      </View>
    );
  }

  const currentProgress = loopData.totalCount > 0 ? (loopData.completedCount / loopData.totalCount) * 100 : 0;
  const recurringTasks = loopData.tasks.filter(task => !task.is_one_time);

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.heroEmoji}>
            {FOLDER_ICONS[loopData.category as LoopType] || '📋'}
          </Text>
          <View style={styles.headerMain}>
            <Text style={styles.heroTitle}>{loopData.name}</Text>
            <Text style={styles.heroDescription}>{loopData.description}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('LoopDetail', { loopId: loopData.id })}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Complete Loop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* PROGRESS CARD */}
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={currentProgress}
              tintColor="#FEC00F"
              lineCap="round"
            >
              <Text style={styles.progressPercent}>{Math.round(currentProgress)}%</Text>
            </AnimatedCircularProgress>
            
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressLabel}>TODAY'S PROGRESS</Text>
              <Text style={styles.progressStatus}>{loopData.completedCount} of {loopData.totalCount} tasks</Text>
              
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak} day streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TASKS SECTION */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {recurringTasks.map((task) => (
            <View key={task.id} style={styles.taskContainer}>
              <TouchableOpacity 
                style={styles.taskItem}
                onPress={() => toggleTask(task)}
              >
                <View style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked
                ]}>
                  {task.completed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </View>
                <Text style={[
                  styles.taskDescription,
                  task.completed && styles.taskDescriptionCompleted
                ]}>
                  {task.description}
                </Text>
                {task.notes && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      const newHints = new Set(expandedHints);
                      if (newHints.has(task.id)) newHints.delete(task.id);
                      else newHints.add(task.id);
                      setExpandedHints(newHints);
                    }}
                    style={styles.infoButton}
                  >
                    <Ionicons 
                      name="information-circle-outline" 
                      size={20} 
                      color={expandedHints.has(task.id) ? '#FEC00F' : '#9CA3AF'} 
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {task.notes && expandedHints.has(task.id) && (
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>💡 {task.notes}</Text>
                </View>
              )}
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addTaskButton} 
            onPress={openAddTaskModal}
          >
            <Ionicons name="add" size={20} color="#666" />
            <Text style={styles.addTaskText}>Add Step</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TaskEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
        availableTags={availableTags}
        loopMembers={loopMembers}
      />

      <InviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        loopId={loopId}
        loopName={loopData.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  heroEmoji: {
    fontSize: 60,
  },
  headerMain: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 18,
    color: '#666',
    lineHeight: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  editButtonText: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  completeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEC00F',
  },
  completeButtonText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 40,
  },
  progressCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FFF4D1',
    shadowColor: '#FEC00F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  progressTextContainer: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E6A200',
    letterSpacing: 1,
    marginBottom: 8,
  },
  progressStatus: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E6A200',
  },
  tasksSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  taskContainer: {
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 16,
  },
  infoButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  hintContainer: {
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 44,
    padding: 16,
    backgroundColor: '#FFFBE6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FEC00F',
    borderColor: '#FEC00F',
  },
  taskDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  taskDescriptionCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    marginTop: 12,
    gap: 8,
  },
  addTaskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
