import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Linking,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TaskWithDetails, Subtask } from '../../types/loop';
import { useTheme } from '../../contexts/ThemeContext';
import { PriorityBadge } from './PriorityBadge';
import { createSubtask, toggleSubtask, deleteSubtask } from '../../lib/taskHelpers';
import { ReflectionInput } from './ReflectionInput';
import { getTodayReflection, saveReflection } from '../../lib/reflectionHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { ReflectionHistoryModal } from './ReflectionHistoryModal';

interface ExpandableTaskCardProps {
  task: TaskWithDetails;
  onPress: () => void;
  onToggle: () => void;
  onSubtaskChange?: () => void; // Callback to refresh parent data
  isPracticeLoop?: boolean; // New prop for Practice Loop behavior
  isActive?: boolean;       // Second Self: Visual anchor
  isShelved?: boolean;      // Second Self: Completed/Minimized
}

export const ExpandableTaskCard: React.FC<ExpandableTaskCardProps> = ({
  task,
  onPress,
  onToggle,
  onSubtaskChange,
  isPracticeLoop = false,
  isActive = false,
  isShelved = false,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(task.subtasks || []);
  
  // Reflection state
  const [reflectionText, setReflectionText] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  // Sync with parent task updates
  React.useEffect(() => {
    if (task.subtasks) {
        setLocalSubtasks(task.subtasks);
    }
  }, [task.subtasks]);

  // Load reflection if it's a practice loop and task is checked
  React.useEffect(() => {
    if (isPracticeLoop && task.completed && user) {
      loadReflection();
    }
  }, [isPracticeLoop, task.completed, user, task.id]);

  const loadReflection = async () => {
    if (!user) return;
    const text = await getTodayReflection(task.id, user.id);
    if (text) setReflectionText(text);
  };

  const handleSaveReflection = async (text: string) => {
    if (!user) return;
    await saveReflection(task.id, user.id, text);
    setReflectionText(text);
  };

  const hasSubtasks = localSubtasks.length > 0;

  const taskStatus = task.completed ? 'done' : 'pending';

  // Feature indicators
  const hasAssignee = !!task.assigned_to || !!task.assigned_user_id;
  const hasNotes = !!task.notes;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasDueDate = !!task.due_date;
  const isRecurring = !task.is_one_time;
  const hasReminder = !!task.reminder_at;


  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  const handleToggleExpand = () => {
    if (hasSubtasks || showAddSubtask) {
      setExpanded(!expanded);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim()) return;

    try {
      const subtask = await createSubtask(task.id, newSubtaskText.trim(), localSubtasks.length);
      if (subtask) {
        setLocalSubtasks([...localSubtasks, subtask]);
        setNewSubtaskText('');
        setShowAddSubtask(false);
        onSubtaskChange?.();
      }
    } catch {
      Alert.alert('Error', 'Failed to create subtask');
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    try {
      const success = await toggleSubtask(subtask.id, subtask.completed);
      if (success) {
        setLocalSubtasks(localSubtasks.map(st =>
          st.id === subtask.id ? { ...st, completed: !st.completed } : st
        ));
        onSubtaskChange?.();
      }
    } catch {
    }
  };

  const handleDeleteSubtask = async (subtask: Subtask) => {
    Alert.alert(
      'Delete Step',
      `Delete "${subtask.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSubtask(subtask.id);
            if (success) {
              setLocalSubtasks(localSubtasks.filter(st => st.id !== subtask.id));
              onSubtaskChange?.();
            }
          },
        },
      ]
    );
  };

  const getTaskIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('water') || d.includes('drink')) return 'water-outline';
    if (d.includes('pill') || d.includes('gumm') || d.includes('med') || d.includes('odactra')) return 'medical-outline';
    if (d.includes('read') || d.includes('book')) return 'book-outline';
    if (d.includes('exercise') || d.includes('gym') || d.includes('run') || d.includes('workout')) return 'fitness-outline';
    if (d.includes('mail') || d.includes('email')) return 'mail-outline';
    if (d.includes('call') || d.includes('phone')) return 'call-outline';
    if (d.includes('clean') || d.includes('tidy')) return 'sparkles-outline';
    if (d.includes('food') || d.includes('eat') || d.includes('meal')) return 'restaurant-outline';
    return 'ellipse-outline'; // Default soft dot
  };

  const BRAND_GOLD = '#FEC00F';

  return (
    <Animated.View
      layout={Layout.springify()}
      style={[
        styles.container,
        {
          backgroundColor: isShelved ? 'rgba(255, 255, 255, 0.02)' : 
                          isActive ? 'rgba(254, 192, 15, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: isActive ? BRAND_GOLD : 'rgba(255, 255, 255, 0.1)',
          opacity: isShelved ? 0.4 : (isActive ? 1 : 0.6),
          minHeight: isShelved ? 40 : 54,
        }
      ]}
    >
      {/* Main Task Row */}
      <View style={styles.mainRow}>
        {/* Toggle Completion Area (Checkbox + Title + Icons) */}
        <TouchableOpacity 
          onPress={onToggle} 
          style={styles.toggleArea}
          activeOpacity={0.7}
        >
          {/* Checkbox */}
          <View
            style={[
              styles.checkbox,
              {
                borderColor: taskStatus === 'done' ? BRAND_GOLD : colors.border,
                backgroundColor: taskStatus === 'done' ? BRAND_GOLD : 'transparent',
              },
            ]}
          >
            {taskStatus === 'done' && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>

          {/* Task Content */}
          <View style={styles.content}>
            {/* Icon + Title Row */}
            <View style={styles.titleRow}>
              <View style={styles.taskIconContainer}>
                <Ionicons 
                  name={getTaskIcon(task.description)} 
                  size={20} 
                  color={taskStatus === 'done' ? '#94a3b8' : BRAND_GOLD} 
                />
              </View>
              <Text
                style={[
                  styles.description,
                  {
                    color: colors.text,
                    fontFamily: isActive ? 'Outfit_700Bold' : 'Inter_400Regular',
                    textDecorationLine: isShelved ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
              {task.priority !== 'none' && (
                <PriorityBadge priority={task.priority} size="small" />
              )}
            </View>

            {/* Feature Icons Row - Simple line icons */}
            <View style={styles.iconsRow}>
              {hasAssignee && (
                <Ionicons name="person-outline" size={14} color="#9ca3af" />
              )}
              {isRecurring && (
                <Ionicons name="sync-outline" size={14} color="#9ca3af" />
              )}
              {hasDueDate && (
                <Ionicons name="calendar-outline" size={14} color={isOverdue ? '#EF4444' : '#9ca3af'} />
              )}
              {hasAttachments && (
                <Ionicons name="image-outline" size={14} color="#9ca3af" />
              )}
              {hasNotes && (
                <Ionicons name="document-text-outline" size={14} color="#9ca3af" />
              )}
              {hasReminder && (
                <Ionicons name="alarm-outline" size={14} color="#9ca3af" />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={onPress}
          style={styles.editButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil-outline" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Expand/Collapse Button */}
        <TouchableOpacity
          onPress={handleToggleExpand}
          style={styles.expandButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={hasSubtasks ? colors.text : colors.border}
          />
        </TouchableOpacity>
      </View>

      {/* Reflection Input (Practice Mode) */}
      {isPracticeLoop && task.completed && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          style={{ paddingHorizontal: 16, paddingBottom: 8 }}
        >
          <ReflectionInput
            taskId={task.id}
            initialValue={reflectionText}
            onSave={handleSaveReflection}
          />
          <TouchableOpacity 
            onPress={() => setShowHistory(true)}
            style={{ alignSelf: 'flex-end', marginTop: 4, marginRight: 8 }}
          >
            <Text style={{ fontSize: 13, color: '#64748b', textDecorationLine: 'underline' }}>
                View History
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* History Modal */}
      <ReflectionHistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        taskId={task.id}
        taskTitle={task.description}
      />

      {/* Expanded Subtasks Section */}
      {expanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.subtasksSection}
        >
          {/* Subtask List */}
          {localSubtasks.map((subtask) => {
            const isDone = subtask.completed;
            return (
              <View key={subtask.id} style={styles.subtaskRow}>
                <TouchableOpacity
                  onPress={() => handleToggleSubtask(subtask)}
                  style={[
                    styles.subtaskCheckbox,
                    {
                      borderColor: isDone ? colors.primary : colors.border,
                      backgroundColor: isDone ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isDone && (
                    <Ionicons name="checkmark" size={10} color="white" />
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.subtaskText,
                    {
                      color: colors.text,
                      textDecorationLine: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.6 : 1,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {subtask.description}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteSubtask(subtask)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <View style={[styles.attachmentsSection, { borderTopColor: colors.border }]}>
              {task.attachments.map((att) => (
                <View key={att.id} style={styles.attachmentRow}>
                  <Ionicons 
                    name={att.file_type?.startsWith('image/') ? 'image-outline' : 'document-outline'} 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <TouchableOpacity onPress={() => Linking.openURL(att.file_url)} style={{ flex: 1 }}>
                    <Text style={[styles.attachmentName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {att.file_name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* Image Preview Strip */}
              <View style={styles.imagePreviewStrip}>
                {task.attachments
                  .filter(att => att.file_type?.startsWith('image/'))
                  .map(att => (
                    <TouchableOpacity key={att.id} onPress={() => Linking.openURL(att.file_url)}>
                      <Image source={{ uri: att.file_url }} style={styles.previewImage} />
                    </TouchableOpacity>
                  ))
                }
              </View>
            </View>
          )}

          {/* Add Subtask Input */}
          {showAddSubtask ? (
            <View style={styles.addSubtaskInputRow}>
              <TextInput
                style={[styles.subtaskInput, { color: colors.text, borderBottomColor: colors.border }]}
                placeholder="Add a step..."
                placeholderTextColor={colors.textSecondary}
                value={newSubtaskText}
                onChangeText={setNewSubtaskText}
                onSubmitEditing={handleAddSubtask}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddSubtask}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="checkmark" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowAddSubtask(false);
                  setNewSubtaskText('');
                }}
                style={styles.cancelButton}
              >
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setShowAddSubtask(true);
                setExpanded(true);
              }}
              style={styles.addStepButton}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[styles.addStepText, { color: colors.primary }]}>Add Step</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Quick Add Step Button (when collapsed and no subtasks) */}
      {!expanded && !hasSubtasks && (
        <TouchableOpacity
          onPress={() => {
            setShowAddSubtask(true);
            setExpanded(true);
          }}
          style={styles.quickAddButton}
        >
          <Ionicons name="add" size={14} color={colors.textSecondary} />
          <Text style={[styles.quickAddText, { color: colors.textSecondary }]}>Add Step</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    // Elevation for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  toggleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  taskIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 42, // Align with description text
  },
  editButton: {
    padding: 10,
    marginLeft: 4,
  },
  expandButton: {
    padding: 10,
  },
  subtasksSection: {
    paddingLeft: 52, // Align with text (16 padding + 24 checkbox + 12 gap)
    paddingBottom: 12,
    marginTop: -4,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subtaskText: {
    flex: 1,
    fontSize: 15,
  },
  deleteButton: {
    padding: 4,
    opacity: 0.5,
  },
  addSubtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 0, // Inline feel
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginLeft: 8,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
    gap: 6,
  },
  addStepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickAddButton: {
    display: 'none',
  },
  quickAddText: {
    fontSize: 13,
    color: '#666', // Override inline
    fontWeight: '500',
  },
  attachmentsSection: {
    marginTop: 8,
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  attachmentName: {
    fontSize: 13,
    color: '#666', // Override inline
    textDecorationLine: 'underline',
  },
  imagePreviewStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
});
