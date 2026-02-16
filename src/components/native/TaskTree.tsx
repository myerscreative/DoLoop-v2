import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { RenderItemParams } from 'react-native-draggable-flatlist';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';

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
  /** Nesting level: 0 = top-level steps, 1+ = subtasks */
  depth?: number;
}

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onUpdateTree, onToggleTask, onEditTask, onNestTask, onPromoteTask, onDeleteTask, depth = 0 }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const rowLayoutsRef = useRef<Record<string, { y: number; height: number }>>({});

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

  const renderItem = (params: RenderItemParams<Task>) => {
    const { item } = params;
    const hasChildren = item.children && item.children.length > 0;
    const isDragging = draggedTaskId === item.id;
    const isExpanded = expandedIds.has(item.id);
    const isSubtask = depth > 0 || !!item.parent_task_id;

    return (
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
          onDelete={onDeleteTask ? () => onDeleteTask(item) : undefined}
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
  };

  return (
    <View>
      {tasks.map((task, index) => (
        <React.Fragment key={task.id}>
          {renderItem({
            item: task,
            drag: () => {},
            isActive: false,
            getIndex: () => index,
            // extraData removed as it's not part of RenderItemParams
          })}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  childContainer: {
    // Indentation is handled inside TaskRow via depth
  },
});
