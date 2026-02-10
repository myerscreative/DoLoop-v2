import React, { useState } from 'react';
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
}

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onUpdateTree, onToggleTask, onEditTask, onNestTask }) => {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const renderItem = (params: RenderItemParams<Task>) => {
    const { item } = params;
    const hasChildren = item.children && item.children.length > 0;
    const isHovered = hoveredTaskId === item.id;
    const isDragging = draggedTaskId === item.id;

    return (
      <View
        onLayout={(event) => {
          // This will be used for hover detection
          // We'll track which item we're over based on position
        }}
      >
        <TaskRow 
          {...params} 
          onToggle={onToggleTask} 
          onPress={onEditTask} 
          isActive={params.isActive}
          isHovered={isHovered}
          isDragging={isDragging}
        />
        {hasChildren && (
          <View style={styles.childContainer}>
            <TaskTree 
              tasks={item.children!} 
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
      onDragBegin={(drag) => {
        if (drag && drag.item) {
          setDraggedTaskId(drag.item.id);
        }
      }}
      onDragEnd={async ({ data, from, to }) => {
        const currentDraggedId = draggedTaskId;
        const originalDraggedIndex = tasks.findIndex(t => t.id === currentDraggedId);
        
        setDraggedTaskId(null);
        setHoveredTaskId(null);

        // Check if we dropped on a specific item (not between items)
        // Heuristic: if we drop at index `to` and that's a valid item different from dragged,
        // and the position change is small (0-1), we're likely dropping on that item
        if (currentDraggedId && to !== null && to >= 0 && to < data.length && onNestTask) {
          const draggedTask = data.find(t => t.id === currentDraggedId);
          const targetTask = data[to];
          const positionChange = Math.abs(to - originalDraggedIndex);
          
          // If dropping on a different item and position change is small, nest it
          if (draggedTask && targetTask && targetTask.id !== currentDraggedId && positionChange <= 1) {
            // Don't nest if already a child, or if trying to nest a parent under its child
            const isAlreadyChild = draggedTask.parent_task_id === targetTask.id;
            const wouldCreateCycle = isTaskDescendant(targetTask, currentDraggedId, tasks);
            
            if (!isAlreadyChild && !wouldCreateCycle) {
              // Nest the dragged task under the target task
              await onNestTask(currentDraggedId, targetTask.id);
              return; // Don't update tree here, let onNestTask handle it
            }
          }
        }

        // Normal reordering: rebuild the tree structure with updated order_index values
        const reordered = data.map((task, index) => ({
          ...task,
          order_index: index,
          // Preserve children if they exist
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

// Helper function to check if a task is a descendant (to prevent cycles)
function isTaskDescendant(task: Task, ancestorId: string, allTasks: Task[]): boolean {
  if (task.id === ancestorId) return true;
  if (!task.children || task.children.length === 0) return false;
  return task.children.some(child => isTaskDescendant(child, ancestorId, allTasks));
}

const styles = StyleSheet.create({
  childContainer: {
    // Indentation is handled inside TaskRow via depth, 
    // but we could also do it here if we preferred.
  },
});
