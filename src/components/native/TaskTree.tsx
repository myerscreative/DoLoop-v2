import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { NestableDraggableFlatList, RenderItemParams } from 'react-native-draggable-flatlist';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';
import { nestTaskInTree } from '../../lib/treeHelpers';

interface TaskTreeProps {
  tasks: Task[];
  onUpdateTree: (newTree: Task[]) => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNestTask?: (taskId: string, parentTaskId: string) => Promise<void>;
  /** Nesting level: 0 = top-level steps, 1+ = subtasks */
  depth?: number;
}

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onUpdateTree, onToggleTask, onEditTask, onNestTask, depth = 0 }) => {
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
        if (index >= 0 && index < tasks.length) {
          setDraggedTaskId(tasks[index].id);
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
});
