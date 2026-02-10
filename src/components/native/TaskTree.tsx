import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { NestableDraggableFlatList, RenderItemParams } from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';
import { nestTaskInTree } from '../../lib/treeHelpers';

interface TaskTreeProps {
  tasks: Task[];
  onUpdateTree: (newTree: Task[]) => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNestTask?: (taskId: string, parentTaskId: string) => Promise<void>;
  /** Promote a subtask to top-level (move back to main list). */
  onPromoteTask?: (taskId: string) => void;
  /** Delete a task (swipe left to reveal delete button). */
  onDeleteTask?: (task: Task) => void;
  /** Nesting level: 0 = top-level steps, 1+ = subtasks */
  depth?: number;
}

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onUpdateTree, onToggleTask, onEditTask, onNestTask, onPromoteTask, onDeleteTask, depth = 0 }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const rowLayoutsRef = useRef<Record<string, { y: number; height: number }>>({});
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  const toggleExpanded = useCallback((taskId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // Use TouchableOpacity so onPress fires reliably (RectButton can fail in nested gesture contexts)
  const renderRightActions = (taskId: string, task: Task) => {
    const handleDelete = () => {
      console.log('[TaskTree] Swipe delete button pressed for task:', task.id);
      // Close the swipeable first to prevent UI glitches
      swipeableRefs.current[taskId]?.close();
      // Call delete handler - it will show confirmation dialog
      onDeleteTask?.(task);
    };

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={22} color="white" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = (params: RenderItemParams<Task>) => {
    const { item } = params;
    const hasChildren = item.children && item.children.length > 0;
    const isDragging = draggedTaskId === item.id;
    const isExpanded = expandedIds.has(item.id);
    const isSubtask = depth > 0 || !!item.parent_task_id;

    const rowContent = (
      <View
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          rowLayoutsRef.current[item.id] = { y, height };
        }}
      >
        <TaskRow
          {...params}
          depth={depth}
          onToggle={onToggleTask}
          onPress={onEditTask}
          isActive={params.isActive}
          isDragging={isDragging}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleExpanded(item.id)}
          onPromote={isSubtask && onPromoteTask ? () => onPromoteTask(item.id) : undefined}
          // Don't show delete button in TaskRow when swipe-to-delete is available
          // This prevents duplicate delete UI and gesture conflicts
          onDelete={undefined}
        />
        {hasChildren && isExpanded && (
          <View style={styles.childContainer}>
            <TaskTree
              tasks={item.children!}
              depth={depth + 1}
              onUpdateTree={(newChildren) => {
                const newTree = tasks.map(t =>
                  t.id === item.id ? { ...t, children: newChildren } : t
                );
                onUpdateTree(newTree);
              }}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
              onNestTask={onNestTask}
              onPromoteTask={onPromoteTask}
              onDeleteTask={onDeleteTask}
            />
          </View>
        )}
      </View>
    );

    if (onDeleteTask) {
      return (
        <Swipeable
          ref={(r) => { swipeableRefs.current[item.id] = r; }}
          renderRightActions={() => renderRightActions(item.id, item)}
          overshootRight={false}
          friction={2}
          rightThreshold={40}
          enabled={!isDragging}
          // Close other swipeables when this one opens
          onSwipeableWillOpen={() => {
            Object.keys(swipeableRefs.current).forEach((id) => {
              if (id !== item.id && swipeableRefs.current[id]) {
                swipeableRefs.current[id]?.close();
              }
            });
          }}
        >
          {rowContent}
        </Swipeable>
      );
    }

    return rowContent;
  };

  return (
    <NestableDraggableFlatList
      data={tasks}
      onDragBegin={(index: number) => {
        if (index >= 0 && index < tasks.length) {
          setDraggedTaskId(tasks[index].id);
          // Close all open swipeables when dragging starts
          Object.values(swipeableRefs.current).forEach((swipeable) => {
            swipeable?.close();
          });
        }
      }}
      onDragEnd={async ({ data, from, releaseY }) => {
        setDraggedTaskId(null);

        const draggedId = tasks[from]?.id;
        if (!draggedId) {
          const reordered = data.map((task, index) => ({
            ...task,
            order_index: index,
            children: task.children || undefined,
          }));
          onUpdateTree(reordered);
          return;
        }

        let didNest = false;
        if (releaseY != null && typeof releaseY === 'number') {
          const layouts = rowLayoutsRef.current;
          for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            const layout = layouts[t.id];
            if (!layout) continue;
            const { y, height } = layout;
            if (releaseY >= y && releaseY < y + height) {
              if (t.id === draggedId) {
                break;
              }
              const newTree = nestTaskInTree(tasks, draggedId, t.id);
              if (newTree !== tasks) {
                onUpdateTree(newTree);
                setExpandedIds(prev => new Set(prev).add(t.id));
                if (onNestTask) await onNestTask(draggedId, t.id);
                didNest = true;
              }
              break;
            }
          }
        }

        if (!didNest) {
          const reordered = data.map((task, index) => ({
            ...task,
            order_index: index,
            children: task.children || undefined,
          }));
          onUpdateTree(reordered);
        }
      }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      activationDistance={8}
      dragItemOverflow={true}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  childContainer: {
    // Indentation is handled inside TaskRow via depth
  },
  deleteAction: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
