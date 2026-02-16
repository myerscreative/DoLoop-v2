import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task } from '../../types/loop';
import { PriorityBadge } from './PriorityBadge';
import { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { 
  PersonIcon, 
  RecurringIcon, 
  ImageIcon, 
  NoteIcon, 
  CalendarIcon 
} from './TaskIcons';

interface TaskRowProps extends RenderItemParams<Task> {
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  isActive: boolean;
  isDragging?: boolean;
  /** Nesting level from TaskTree: 0 = main step, 1+ = subtask */
  depth?: number;
  /** Whether this task has children */
  hasChildren?: boolean;
  /** Whether children are currently visible */
  isExpanded?: boolean;
  /** Toggle children visibility */
  onToggleExpand?: () => void;
  /** Promote subtask to top-level (move back to main list). Only shown for subtasks. */
  onPromote?: () => void;
  /** When set, show a delete icon that calls this (e.g. swipe alternative on web). */
  onDelete?: () => void;
  /** Visual variant: 'default' (dashboard) or 'modal' (inside edit modal) */
  variant?: 'default' | 'modal';
}

const SUBTASK_INDENT = 32;
const BRAND_GOLD = '#FEC00F';
const ICON_Size = 18;

export const TaskRow: React.FC<TaskRowProps> = ({
  item: task,
  drag,
  isActive: isDragActive,
  onToggle,
  onPress,
  isDragging = false,
  depth: depthProp,
  hasChildren = false,
  isExpanded = false,
  onToggleExpand,
  onPromote,
  onDelete,
  variant = 'default',
}) => {
  const depth = depthProp !== undefined ? depthProp : (task.depth ?? 0);
  const isSubtask = depth > 0 || !!task.parent_task_id;

  const hasAttachments = task.attachments && task.attachments.length > 0;
  // Use task.assigned_to (ID) or task.assigned_user_id (resolved ID from join)
  // @ts-ignore
  const isAssigned = !!task.assigned_to || !!task.assigned_user_id;
  const hasNotes = !!task.notes;
  const hasDueDate = !!task.due_date;
  const isRecurring = !task.is_one_time;

  return (
    <View style={isSubtask ? [styles.subtaskWrapper, { marginLeft: SUBTASK_INDENT }] : undefined}>
        {isSubtask && <View style={styles.subtaskConnector} />}
        <View style={styles.rowOuter}>
        <Pressable
          delayLongPress={200}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress(task);
          }}
          disabled={isDragActive}
          style={[
            styles.container,
            {
              backgroundColor: isSubtask
                ? (variant === 'modal' ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.04)')
                : isDragging 
                  ? 'rgba(255, 255, 255, 0.12)' // More visible when dragging
                  : (variant === 'modal' ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.06)'),
              opacity: isDragging ? 0.9 : 1, // Keep it visible (glassmorphism)
              transform: [{ scale: isDragging ? 1.02 : 1 }], // Slight pop
              // Add shadow for "lifted" effect
              shadowColor: isDragging ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: isDragging ? 4 : 0 },
              shadowOpacity: isDragging ? 0.3 : 0,
              shadowRadius: isDragging ? 8 : 0,
              elevation: isDragging ? 5 : 0,
            },
            isSubtask && styles.subtaskRow,
            onDelete && styles.containerFlex,
          ]}
        >
          {/* Drag Handle */}
          <TouchableOpacity 
            onPressIn={drag}
            delayLongPress={100}
            style={styles.dragHandle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="drag-vertical" size={22} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>

          {/* Checkbox */}
          <RNTouchableOpacity
            onPress={(e) => {
              // Stop propagation to prevent opening the modal
              e?.stopPropagation();
              onToggle(task);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? BRAND_GOLD : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: task.completed ? BRAND_GOLD : 'transparent',
              },
            ]}
          >
            {task.completed && <Ionicons name="checkmark" size={14} color="white" />}
          </RNTouchableOpacity>

          {/* Content: Name + Metadata */}
          <View style={styles.content}>
            <Text
              style={[
                styles.description,
                {
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.5 : 1,
                  fontSize: isSubtask ? 14 : 16,
                  color: 'white', // Always white for readability
                },
              ]}
              numberOfLines={1}
            >
              {task.description}
            </Text>

            <View style={styles.metadata}>
              {task.priority !== 'none' && (
                <PriorityBadge priority={task.priority} size="small" />
              )}
            </View>
          </View>

          {/* Right Side: Status Cluster & Actions */}
          <View style={styles.rightSideContainer}>
            
            {/* Status Cluster */}
            <View style={styles.statusCluster}>
                {isAssigned && (
                    <PersonIcon size={ICON_Size} color="rgba(255, 255, 255, 0.5)" />
                )}
                
                {hasDueDate && (
                    <CalendarIcon size={ICON_Size} color="rgba(255, 255, 255, 0.5)" />
                )}

                {hasAttachments && (
                    <ImageIcon size={ICON_Size} color="rgba(255, 255, 255, 0.5)" />
                )}

                {hasNotes && (
                    <NoteIcon size={ICON_Size} color="rgba(255, 255, 255, 0.5)" />
                )}

                {/* THE LOOP ICON - Only if recurring */}
                {isRecurring && (
                    <RecurringIcon size={ICON_Size} color={BRAND_GOLD} />
                )}
            </View>

            {/* Expand/Collapse (if children) OR Promote (if subtask) */}
            {hasChildren ? (
              <TouchableOpacity
                onPress={() => onToggleExpand?.()}
                style={styles.expandButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.childCountText}>
                  {task.children?.filter((c: Task) => c.completed).length}/{task.children?.length}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={BRAND_GOLD}
                />
              </TouchableOpacity>
            ) : isSubtask ? (
              <View style={styles.subtaskRight}>
                 {onPromote && (
                    <TouchableOpacity
                        onPress={() => onPromote()}
                        style={styles.promoteOutButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-up-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                 )}
              </View>
            ) : !onDelete ? (
               // No arrow or anything for regular tasks implies cleaner look? 
               // Or keep subtle chevron? User requested "Iconic Status system", simpler is better.
               // Let's keep a very subtle chevron for interactivity hinting if needed, or remove.
               // Reference image shows NO chevron on tasks, just the loop icon.
               null
            ) : null}

          </View>
        </Pressable>
          {onDelete ? (
            <TouchableOpacity
              onPress={() => onDelete()}
              style={styles.deleteIconButtonOuter}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="trash-outline" size={18} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  rowOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // We might want to override this in modal too, but it's subtle enough
    maxWidth: '100%', // Prevent expansion on drag
  },
  containerFlex: {
    marginRight: 4,
  },
  deleteIconButtonOuter: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  subtaskRow: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  subtaskWrapper: {
    marginTop: 2,
    marginBottom: 2,
    position: 'relative',
  },
  subtaskConnector: {
    position: 'absolute',
    left: -1,
    top: -4,
    bottom: -4,
    width: 3,
    backgroundColor: 'rgba(254, 192, 15, 0.3)',
    borderRadius: 2,
  },
  dragHandle: {
    paddingHorizontal: 6,
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8, 
    // flex-shrink needed for text wrapping? 
    flexShrink: 1, 
  },
  description: {
    color: 'white',
    fontWeight: '500',
    flexShrink: 1, // Allow text to shrink/truncate
    marginRight: 6,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(254, 192, 15, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  childCountText: {
    color: BRAND_GOLD,
    fontSize: 12,
    fontWeight: '700',
  },
  subtaskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoteOutButton: {
    padding: 4,
  },
});
