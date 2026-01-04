import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TaskWithDetails, Subtask } from '../../types/loop';
import { useTheme } from '../../contexts/ThemeContext';
import { PriorityBadge } from './PriorityBadge';
import { createSubtask, toggleSubtask, deleteSubtask } from '../../lib/taskHelpers';

interface ExpandableTaskCardProps {
  task: TaskWithDetails;
  onPress: () => void;
  onToggle: () => void;
  onSubtaskChange?: () => void; // Callback to refresh parent data
}

export const ExpandableTaskCard: React.FC<ExpandableTaskCardProps> = ({
  task,
  onPress,
  onToggle,
  onSubtaskChange,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(task.subtasks || []);
  
  // Sync with parent task updates
  React.useEffect(() => {
    if (task.subtasks) {
        setLocalSubtasks(task.subtasks);
    }
  }, [task.subtasks]);

  const hasSubtasks = localSubtasks.length > 0;
  const completedSubtasks = localSubtasks.filter(st => st.completed).length;
  const totalSubtasks = localSubtasks.length;
  const taskStatus = task.completed ? 'done' : 'pending';

  // Feature indicators
  const hasAssignee = !!task.assigned_to || !!task.assigned_user_id;
  const hasNotes = !!task.notes;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasDueDate = !!task.due_date;
  const isRecurring = !task.is_one_time;
  const hasReminder = !!task.reminder_at;

  const formatDueDate = (dueDate: string) => {
    const due = new Date(dueDate);
    const dueMidnight = new Date(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dueMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays}d`;
    return dueMidnight.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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
    } catch (error) {
      console.error('Error creating subtask:', error);
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
    } catch (error) {
      console.error('Error toggling subtask:', error);
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

  return (
    <Animated.View
      layout={Layout.springify()}
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      {/* Main Task Row */}
      <View style={styles.mainRow}>
        {/* Checkbox */}
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.checkbox,
            {
              borderColor: taskStatus === 'done' ? colors.primary : colors.border,
              backgroundColor: taskStatus === 'done' ? colors.primary : 'transparent',
            },
          ]}
        >
          {taskStatus === 'done' && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </TouchableOpacity>

        {/* Task Content */}
        <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.7}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.description,
                {
                  color: colors.text,
                  textDecorationLine: taskStatus === 'done' ? 'line-through' : 'none',
                  opacity: taskStatus === 'done' ? 0.6 : 1,
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
                  <Ionicons name="close" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Add Subtask Input */}
          {showAddSubtask ? (
            <View style={styles.addSubtaskInputRow}>
              <TextInput
                style={[styles.subtaskInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Add a step..."
                placeholderTextColor="#94a3b8"
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
                <Ionicons name="close" size={16} color="#64748b" />
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
          <Ionicons name="add" size={14} color="#94a3b8" />
          <Text style={styles.quickAddText}>Add Step</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center', // Center vertically
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
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
    flexDirection: 'row', // Horizontal layout for desktop-like feel or compact mobile
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping if very narrow
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
    lineHeight: 22,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandButton: {
    padding: 8,
    marginLeft: 4,
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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
    color: '#94a3b8',
    fontWeight: '500',
  },
});
