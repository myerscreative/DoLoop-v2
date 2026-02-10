import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Task } from '../../types/loop';
import { PriorityBadge } from './PriorityBadge';
import { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

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
}

const SUBTASK_INDENT = 32;
const BRAND_GOLD = '#FEC00F';

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
}) => {
  const depth = depthProp !== undefined ? depthProp : (task.depth ?? 0);
  const isSubtask = depth > 0 || !!task.parent_task_id;

  return (
    <ScaleDecorator activeScale={1.04}>
      <View style={isSubtask ? [styles.subtaskWrapper, { marginLeft: SUBTASK_INDENT }] : undefined}>
        {isSubtask && <View style={styles.subtaskConnector} />}
        <View style={styles.rowOuter}>
        <Pressable
          onLongPress={drag}
          delayLongPress={200}
          onPress={() => onPress(task)}
          disabled={isDragActive}
          style={[
            styles.container,
            {
              backgroundColor: isSubtask
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(255, 255, 255, 0.06)',
              opacity: isDragging ? 0.4 : 1,
            },
            isSubtask && styles.subtaskRow,
            onDelete && styles.containerFlex,
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <MaterialCommunityIcons name="drag-vertical" size={22} color="rgba(255,255,255,0.35)" />
          </View>

          {/* Checkbox */}
          <Pressable
            onPress={() => onToggle(task)}
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? BRAND_GOLD : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: task.completed ? BRAND_GOLD : 'transparent',
              },
            ]}
          >
            {task.completed && <Ionicons name="checkmark" size={14} color="white" />}
          </Pressable>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[
                styles.description,
                {
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.5 : 1,
                  fontSize: isSubtask ? 14 : 16,
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

          {/* Right side indicator */}
          {hasChildren ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleExpand?.();
              }}
              style={styles.expandButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={18}
                color={BRAND_GOLD}
              />
              <Text style={styles.childCountText}>
                {task.children?.filter((c: Task) => c.completed).length}/{task.children?.length}
              </Text>
            </Pressable>
          ) : isSubtask ? (
            <View style={styles.subtaskRight}>
              {onPromote ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onPromote();
                  }}
                  style={styles.promoteOutButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="arrow-up-circle-outline" size={20} color={BRAND_GOLD} />
                  <Text style={styles.promoteOutText}>Move out</Text>
                </Pressable>
              ) : null}
              <View style={styles.subtaskBadge}>
                <Text style={styles.subtaskBadgeText}>Substep</Text>
              </View>
            </View>
          ) : !onDelete ? (
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.3)" />
          ) : null}
        </Pressable>
          {onDelete ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onDelete();
              }}
              style={({ pressed }) => [
                styles.deleteIconButtonOuter,
                pressed && { opacity: 0.5 }
              ]}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="trash-outline" size={18} color="rgba(255, 255, 255, 0.5)" />
            </Pressable>
          ) : null}
        </View>
      </View>
    </ScaleDecorator>
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    justifyContent: 'space-between',
    marginRight: 8,
  },
  description: {
    color: 'white',
    fontWeight: '500',
    flex: 1,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  childCountText: {
    color: BRAND_GOLD,
    fontSize: 12,
    fontWeight: '700',
  },
  subtaskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteIconButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  promoteOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  promoteOutText: {
    color: BRAND_GOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  subtaskBadge: {
    backgroundColor: 'rgba(254, 192, 15, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subtaskBadgeText: {
    color: '#FEC00F',
    fontSize: 10,
    fontWeight: '700',
  },
});
