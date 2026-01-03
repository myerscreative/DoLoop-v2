import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { TaskWithDetails } from '../../types/loop';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { PriorityBadge } from './PriorityBadge';
import { TaskTag } from './TaskTag';
import { AssigneeDot } from '../ui/AssigneeDot';

interface EnhancedTaskCardProps {
  task: TaskWithDetails;
  onPress: () => void;
  onToggle: () => void;
}

export const EnhancedTaskCard: React.FC<EnhancedTaskCardProps> = ({
  task,
  onPress,
  onToggle,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDueDate = (dueDate: string) => {
    // Parse the UTC date components directly to properly treat it as a "Date" (ignoring time)
    // This ensures "2026-01-02T..." is always treated as Jan 2nd Local
    const due = new Date(dueDate);
    const dueMidnight = new Date(
        due.getUTCFullYear(),
        due.getUTCMonth(),
        due.getUTCDate()
    );

    const now = new Date();
    const todayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const diffTime = dueMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays}d`;
    return dueMidnight.toLocaleDateString();
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(st => st.status === 'done').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const taskStatus = task.completed ? 'done' : 'pending';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
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
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>

        {/* Task Content */}
        <View style={styles.content}>
          {/* Title and Priority Row */}
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
            <View style={styles.actionIcons}>
              {task.notes && (
                <TouchableOpacity
                  onPress={() => setIsExpanded(!isExpanded)}
                  style={styles.infoButton}
                >
                  <Text style={[styles.infoIcon, { color: isExpanded ? colors.primary : colors.textSecondary }]}>
                    ⓘ
                  </Text>
                </TouchableOpacity>
              )}
              {task.priority !== 'none' && (
                <View style={styles.priorityContainer}>
                  <PriorityBadge priority={task.priority} size="small" />
                </View>
              )}
            </View>
          </View>

          {/* Tags */}
          {task.tag_details && task.tag_details.length > 0 && (
            <View style={styles.tagsRow}>
              {task.tag_details.map((tag) => (
                <TaskTag key={tag.id} tag={tag} size="small" />
              ))}
            </View>
          )}

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {/* Due Date */}
            {task.due_date && (
              <View style={styles.metadataItem}>
                <Text
                  style={[
                    styles.metadataText,
                    {
                      color: isOverdue ? '#EF4444' : colors.textSecondary,
                    },
                  ]}
                >
                  📅 {formatDueDate(task.due_date)}
                </Text>
              </View>
            )}

            {/* Time Estimate */}
            {task.time_estimate_minutes && (
              <View style={styles.metadataItem}>
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  ⏱️ {task.time_estimate_minutes}m
                </Text>
              </View>
            )}

            {/* Subtasks Progress */}
            {hasSubtasks && (
              <View style={styles.metadataItem}>
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  ☑️ {completedSubtasks}/{totalSubtasks}
                </Text>
              </View>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <View style={styles.metadataItem}>
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  📎 {task.attachments.length}
                </Text>
              </View>
            )}

            {/* Reminder */}
            {task.reminder_at && !task.reminder?.is_sent && (
              <View style={styles.metadataItem}>
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  🔔
                </Text>
              </View>
            )}

            {/* Assigned To */}
            {task.assigned_to && (
              <View style={styles.metadataItem}>
                 <AssigneeDot 
                    initials={task.assigned_user_id === user?.id ? 'ME' : 'AS'} 
                    size={20} 
                 />
              </View>
            )}
          </View>

          {/* Notes Preview / Expanded Notes */}
          {task.notes && (
            <View style={[
              styles.notesContainer,
              isExpanded && styles.notesContainerExpanded,
              { backgroundColor: isExpanded ? '#FFFBEB' : 'transparent' }
            ]}>
              <Text
                style={[
                  styles.notes,
                  { color: colors.textSecondary },
                  isExpanded && styles.notesExpanded
                ]}
                numberOfLines={isExpanded ? undefined : 1}
              >
                {isExpanded && <Text style={styles.lightbulb}>💡 </Text>}
                {task.notes}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    padding: 4,
    marginRight: 4,
  },
  infoIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  priorityContainer: {
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metadataItem: {
    marginRight: 12,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 13,
  },
  notesContainer: {
    marginTop: 8,
    borderRadius: 6,
  },
  notesContainerExpanded: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notes: {
    fontSize: 13,
    lineHeight: 18,
  },
  notesExpanded: {
    color: '#92400E',
  },
  lightbulb: {
    fontSize: 14,
  },
});
