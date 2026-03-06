import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';
import { flattenTaskTree, rebuildTreeFromFlat, FlatTask } from '../../lib/flatTreeHelpers';

interface DraggableTaskListProps {
  tasks: Task[];
  onUpdateTree: (newTree: Task[]) => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task, shouldExpand?: boolean) => void;
  onNestTask?: (taskId: string, parentTaskId: string) => Promise<void>;
  /** Promote a subtask to top-level (move back to main list). */
  onPromoteTask?: (taskId: string) => void;
  /** Delete a task. */
  onDeleteTask?: (task: Task) => void;
  /** Header component for the list (passed from screen) */
  ListHeaderComponent?: React.ReactElement;
  /** Footer component for the list (passed from screen) */
  ListFooterComponent?: React.ReactElement;
  /** Custom empty component */
  ListEmptyComponent?: React.ReactElement;
  /** Whether the list should scroll (default true) */
  scrollEnabled?: boolean;
  /** One-time tasks currently animating out during reloop. */
  exitingOneTimeTaskIds?: Set<string>;
  /** Staggered exit delay map in milliseconds by task ID. */
  oneTimeExitDelayById?: Record<string, number>;
}

export const DraggableTaskList: React.FC<DraggableTaskListProps> = ({ 
  tasks, 
  onUpdateTree, 
  onToggleTask, 
  onEditTask, 
  onPromoteTask, 
  onDeleteTask,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  scrollEnabled = true,
  exitingOneTimeTaskIds,
  oneTimeExitDelayById,
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
    
    return (
      <View style={{ zIndex: isActive ? 999 : 1, elevation: isActive ? 5 : 0 }}>
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
          isExitingOneTime={!!item.is_one_time && !!exitingOneTimeTaskIds?.has(item.id)}
          oneTimeExitDelayMs={oneTimeExitDelayById?.[item.id] ?? 0}
        />
      </View>
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
      activationDistance={10}
      containerStyle={{ flex: 1 }}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 10,
  },
});
