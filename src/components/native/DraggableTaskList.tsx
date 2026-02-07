import React, { useCallback } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskWithDetails, Task } from '../../types/loop';
import { DraggableTaskCard } from './DraggableTaskCard';
import { useDragReorder } from '../../hooks/useDragReorder';
import { reorderTasks } from '../../lib/taskHelpers';

interface DraggableTaskListProps {
  tasks: TaskWithDetails[];
  loopId: string;
  isPracticeLoop: boolean;
  showTrail: boolean;
  onEditTask: (task: TaskWithDetails) => void;
  onToggleTask: (task: Task) => void;
  onSubtaskChange: () => void;
  loadLoopData: () => Promise<any>;
  colors: any;
}

export const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  loopId,
  isPracticeLoop,
  showTrail,
  onEditTask,
  onToggleTask,
  onSubtaskChange,
  loadLoopData,
  colors,
}) => {
  const {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    registerLayout,
  } = useDragReorder({ tasks, loopId, loadLoopData });

  const handleRegisterLayout = useCallback(
    (id: string, layout: { y: number; height: number }) => {
      const task = tasks.find(t => t.id === id) ||
        tasks.flatMap(t => t.children || []).find(c => c.id === id);
      registerLayout(
        id,
        layout,
        task?.parent_task_id || null,
        (task?.children?.length || 0) > 0
      );
    },
    [tasks, registerLayout]
  );

  const isWeb = Platform.OS === 'web';

  const handleWebReorder = useCallback(async (taskIndex: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    if (swapIndex < 0 || swapIndex >= tasks.length) return;

    const reordered = [...tasks];
    [reordered[taskIndex], reordered[swapIndex]] = [reordered[swapIndex], reordered[taskIndex]];

    const orderedIds = reordered.map((t, i) => ({
      id: t.id,
      order_index: i,
      parent_task_id: t.parent_task_id || null,
    }));

    await reorderTasks(loopId, orderedIds);
    await loadLoopData();
  }, [tasks, loopId, loadLoopData]);

  const firstIncompleteIndex = tasks.findIndex(t => !t.completed);

  return (
    <View style={styles.container}>
      {tasks.map((task, index) => {
        const isActive = index === firstIncompleteIndex;
        const isShelved = task.completed;
        const isDragging = dragState.activeId === task.id;
        const isDropTarget = dragState.hoveredId === task.id;

        return (
          <View key={task.id}>
            {/* Trail connector */}
            {showTrail && (
              <View style={styles.taskCardWrapper}>
                <View
                  style={[
                    styles.trailConnector,
                    {
                      backgroundColor: task.completed
                        ? colors.primary + '40'
                        : colors.primary,
                      opacity: task.completed ? 0.3 : 1,
                    },
                  ]}
                />
              </View>
            )}

            {/* Top-level task with optional web reorder buttons */}
            <View style={isWeb ? styles.webTaskRow : undefined}>
              {isWeb && (
                <View style={styles.webReorderButtons}>
                  <TouchableOpacity
                    onPress={() => handleWebReorder(index, 'up')}
                    disabled={index === 0}
                    style={[styles.webReorderBtn, index === 0 && styles.webReorderBtnDisabled]}
                  >
                    <Ionicons name="chevron-up" size={18} color={index === 0 ? 'rgba(255,255,255,0.15)' : '#FEC00F'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleWebReorder(index, 'down')}
                    disabled={index === tasks.length - 1}
                    style={[styles.webReorderBtn, index === tasks.length - 1 && styles.webReorderBtnDisabled]}
                  >
                    <Ionicons name="chevron-down" size={18} color={index === tasks.length - 1 ? 'rgba(255,255,255,0.15)' : '#FEC00F'} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={isWeb ? styles.webTaskCardFlex : undefined}>
                <DraggableTaskCard
                  task={task}
                  index={index}
                  isActive={isActive}
                  isShelved={isShelved}
                  isDragging={isDragging}
                  isDropTarget={isDropTarget}
                  isNested={false}
                  isPracticeLoop={isPracticeLoop}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onPress={() => onEditTask(task)}
                  onToggle={() => onToggleTask(task)}
                  onSubtaskChange={onSubtaskChange}
                  onLayout={handleRegisterLayout}
                />
              </View>
            </View>

            {/* Child tasks (nested under parent) */}
            {task.children && task.children.length > 0 && (
              <View style={styles.childrenContainer}>
                <View style={[styles.nestingLine, { backgroundColor: colors.primary + '40' }]} />
                <View style={styles.childrenList}>
                  {task.children.map((child, childIndex) => {
                    const childIsDragging = dragState.activeId === child.id;
                    const childIsDropTarget = dragState.hoveredId === child.id;

                    return (
                      <DraggableTaskCard
                        key={child.id}
                        task={child}
                        index={childIndex}
                        isActive={false}
                        isShelved={child.completed}
                        isDragging={childIsDragging}
                        isDropTarget={childIsDropTarget}
                        isNested={true}
                        isPracticeLoop={isPracticeLoop}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onPress={() => onEditTask(child)}
                        onToggle={() => onToggleTask(child)}
                        onSubtaskChange={onSubtaskChange}
                        onLayout={handleRegisterLayout}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  taskCardWrapper: {
    position: 'relative',
  },
  trailConnector: {
    position: 'absolute',
    left: 30,
    top: -8,
    width: 2,
    height: 8,
    borderRadius: 1,
  },
  childrenContainer: {
    flexDirection: 'row',
    marginLeft: 14,
    paddingLeft: 10,
  },
  nestingLine: {
    width: 2,
    borderRadius: 1,
    marginRight: 0,
  },
  childrenList: {
    flex: 1,
    paddingLeft: 8,
  },
  webTaskRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  webTaskCardFlex: {
    flex: 1,
  },
  webReorderButtons: {
    marginRight: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 2,
  },
  webReorderBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  webReorderBtnDisabled: {
    opacity: 0.3,
  },
});
