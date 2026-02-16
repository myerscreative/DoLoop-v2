import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, ListRenderItemInfo } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';
import { flattenTaskTree, rebuildTreeFromFlat, FlatTask } from '../../lib/flatTreeHelpers';

interface TaskTreeProps {
  tasks: Task[];
  onUpdateTree: (newTree: Task[]) => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNestTask?: (taskId: string, parentTaskId: string) => Promise<void>;
  /** Promote a subtask to top-level (move back to main list). */
  onPromoteTask?: (taskId: string) => void;
  /** Delete a task. */
  onDeleteTask?: (task: Task) => void;
  /** Custom empty component */
  ListEmptyComponent?: React.ReactElement;
  /** Whether the list should scroll (default true) */
  scrollEnabled?: boolean;
}

export const TaskTree: React.FC<TaskTreeProps> = ({ 
  tasks, 
  onUpdateTree, 
  onToggleTask, 
  onEditTask, 
  onNestTask, 
  onPromoteTask, 
  onDeleteTask,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  scrollEnabled = true
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Flatten tree for display
  const flatTasks = useMemo(() => {
    return flattenTaskTree(tasks, expandedIds);
  }, [tasks, expandedIds]);

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

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<FlatTask>) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isSubtask = item.depth > 0;
    
    // Check if task is actually completed in the source data
    // (flatTasks has ...task props so it should be up to date)

    return (
      <ScaleDecorator>
        <TaskRow
          item={item} // Types compatibility: FlatTask extends Task
          drag={drag}
          isActive={isActive}
          getIndex={getIndex}
          depth={item.depth}
          onToggle={onToggleTask}
          onPress={onEditTask}
          isDragging={isActive}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleExpanded(item.id)}
          onPromote={isSubtask && onPromoteTask ? () => onPromoteTask(item.id) : undefined}
          onDelete={onDeleteTask ? () => onDeleteTask(item) : undefined}
        />
      </ScaleDecorator>
    );
  };

  return (
    <DraggableFlatList
      data={flatTasks}
      onDragEnd={({ data }) => {
        const newTree = rebuildTreeFromFlat(data);
        onUpdateTree(newTree);
      }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      scrollEnabled={scrollEnabled}
      activationDistance={20}
      containerStyle={{ flex: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  childContainer: {
    // Indentation is handled inside TaskRow via depth
  },
});
