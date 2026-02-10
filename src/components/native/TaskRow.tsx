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
  isHovered?: boolean;
  isDragging?: boolean;
  /** Nesting level from TaskTree: 0 = main step, 1+ = subtask */
  depth?: number;
  /** Whether this task has children */
  hasChildren?: boolean;
  /** Whether children are currently visible */
  isExpanded?: boolean;
  /** Toggle children visibility */
  onToggleExpand?: () => void;
}

const SUBTASK_INDENT = 32;
const BRAND_GOLD = '#FEC00F';

export const TaskRow: React.FC<TaskRowProps> = ({
  item: task,
  drag,
  isActive: isDragActive,
  onToggle,
  onPress,
  isHovered = false,
  isDragging = false,
  depth: depthProp,
  hasChildren = false,
  isExpanded = false,
  onToggleExpand,
}) => {
  const depth = depthProp !== undefined ? depthProp : (task.depth ?? 0);
  const isSubtask = depth > 0 || !!task.parent_task_id;

  return (
    <ScaleDecorator activeScale={1.04}>
      <View style={isSubtask ? [styles.subtaskWrapper, { marginLeft: SUBTASK_INDENT }] : undefined}>
        {isSubtask && <View style={styles.subtaskConnector} />}
        <Pressable
          onLongPress={drag}
          delayLongPress={200}
          onPress={() => onPress(task)}
          disabled={isDragActive}
          style={[
            styles.container,
            {
              backgroundColor: isHovered
                ? 'rgba(254, 192, 15, 0.30)'
                : isSubtask
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.06)',
              borderColor: isHovered
                ? BRAND_GOLD
                : isSubtask
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.08)',
              borderLeftWidth: isSubtask ? 4 : 1,
              borderLeftColor: isSubtask ? BRAND_GOLD : undefined,
              opacity: isDragging ? 0.4 : 1,
            },
            isHovered && styles.hoveredShadow,
            isSubtask && styles.subtaskRow,
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
          {isHovered ? (
            <View style={styles.nestHint}>
              <Ionicons name="enter-outline" size={16} color={BRAND_GOLD} />
              <Text style={styles.nestHintText}>Nest</Text>
            </View>
          ) : hasChildren ? (
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
            <View style={styles.subtaskBadge}>
              <Text style={styles.subtaskBadgeText}>Substep</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.3)" />
          )}
        </Pressable>
      </View>
    </ScaleDecorator>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 4,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  hoveredShadow: {
    shadowColor: '#FEC00F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
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
  counts: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  nestHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 192, 15, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  nestHintText: {
    color: '#FEC00F',
    fontSize: 11,
    fontWeight: '700',
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
