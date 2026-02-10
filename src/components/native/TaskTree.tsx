import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { NestableDraggableFlatList, RenderItemParams } from 'react-native-draggable-flatlist';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';

interface TaskTreeProps {
  tasks: Task[];
  onUpdateTree: (newTree: Task[]) => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNestTask?: (taskId: string, parentTaskId: string) => Promise<void>;
  /** Nesting level: 0 = top-level steps, 1+ = subtasks (controls indentation and styling) */
  depth?: number;
}

// How long (ms) the user must hover over an item before it activates as a nest target
const NEST_HOVER_DELAY = 800;

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onUpdateTree, onToggleTask, onEditTask, onNestTask, depth = 0 }) => {
  // hoveredTaskId tracks the item the placeholder is currently over (before timer fires)
  const [, setHoveredTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [nestTargetId, setNestTargetId] = useState<string | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPlaceholderIndex = useRef<number | null>(null);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const renderItem = (params: RenderItemParams<Task>) => {
    const { item } = params;
    const hasChildren = item.children && item.children.length > 0;
    const isNestTarget = nestTargetId === item.id;
    const isDragging = draggedTaskId === item.id;

    return (
      <View>
        <TaskRow
          {...params}
          depth={depth}
          onToggle={onToggleTask}
          onPress={onEditTask}
          isActive={params.isActive}
          isHovered={isNestTarget && !isDragging}
          isDragging={isDragging}
        />
        {hasChildren && (
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
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <NestableDraggableFlatList
      data={tasks}
      onDragBegin={(index: number) => {
        // onDragBegin receives just the index
        if (index >= 0 && index < tasks.length) {
          setDraggedTaskId(tasks[index].id);
        }
      }}
      onPlaceholderIndexChange={(placeholderIndex: number) => {
        // Called as the dragged item moves over other items
        // If we hover over the same item for NEST_HOVER_DELAY ms, mark it as a nest target
        if (placeholderIndex === lastPlaceholderIndex.current) return;
        lastPlaceholderIndex.current = placeholderIndex;

        // Clear any pending hover timer
        clearHoverTimer();
        // Clear the nest target when moving to a new position
        setNestTargetId(null);
        setHoveredTaskId(null);

        if (placeholderIndex >= 0 && placeholderIndex < tasks.length) {
          const targetTask = tasks[placeholderIndex];

          // Don't target self
          if (targetTask.id === draggedTaskId) return;

          setHoveredTaskId(targetTask.id);

          // Start a timer — if user holds here, activate nest target
          hoverTimerRef.current = setTimeout(() => {
            setNestTargetId(targetTask.id);
          }, NEST_HOVER_DELAY);
        }
      }}
      onDragEnd={async ({ data }) => {
        const currentDraggedId = draggedTaskId;
        const currentNestTargetId = nestTargetId;

        // Reset all state
        setDraggedTaskId(null);
        setHoveredTaskId(null);
        setNestTargetId(null);
        clearHoverTimer();
        lastPlaceholderIndex.current = null;

        // If we have a nest target, nest instead of reorder
        if (currentNestTargetId && currentDraggedId && currentNestTargetId !== currentDraggedId && onNestTask) {
          const draggedTask = tasks.find(t => t.id === currentDraggedId);
          const targetTask = tasks.find(t => t.id === currentNestTargetId);

          if (draggedTask && targetTask) {
            const isAlreadyChild = draggedTask.parent_task_id === targetTask.id;
            const wouldCreateCycle = isTaskDescendant(targetTask, currentDraggedId, tasks);

            if (!isAlreadyChild && !wouldCreateCycle) {
              await onNestTask(currentDraggedId, currentNestTargetId);
              return; // Don't reorder — nesting handles the update
            }
          }
        }

        // Normal reordering
        const reordered = data.map((task, index) => ({
          ...task,
          order_index: index,
          children: task.children || undefined,
        }));
        onUpdateTree(reordered);
      }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      activationDistance={8}
      dragItemOverflow={true}
      scrollEnabled={false}
    />
  );
};

// Helper: check if a task is a descendant of another (prevents cycles)
function isTaskDescendant(task: Task, ancestorId: string, _allTasks: Task[]): boolean {
  if (task.id === ancestorId) return true;
  if (!task.children || task.children.length === 0) return false;
  return task.children.some(child => isTaskDescendant(child, ancestorId, _allTasks));
}

const styles = StyleSheet.create({
  childContainer: {
    // Indentation is handled inside TaskRow via depth
  },
});
