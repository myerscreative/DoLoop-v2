import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { TaskWithDetails, Task } from '../../types/loop';
import { DraggableTaskCard } from './DraggableTaskCard';
import { useDragReorder } from '../../hooks/useDragReorder';

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
  onOptimisticUpdate?: (tasks: TaskWithDetails[]) => void;
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
  onOptimisticUpdate,
}) => {
  const {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    registerLayout,
    getVerticalShift
  } = useDragReorder({ tasks, loopId, loadLoopData, onOptimisticUpdate });

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



  const firstIncompleteIndex = tasks.findIndex(t => !t.completed);

  return (
    <View style={styles.container}>
      {tasks.map((task, index) => {
        const isActive = index === firstIncompleteIndex;
        const isShelved = task.completed;
        const isDragging = dragState.activeId === task.id;
        const isDropTarget = dragState.hoveredId === task.id;
        const verticalShift = getVerticalShift(task.id, index);

        return (
          <View key={task.id} style={{ zIndex: isDragging ? 100 : 1 }}>
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

            {/* Top-level task */}
            <View>
              <DraggableTaskCard
                task={task}
                index={index}
                isActive={isActive}
                isShelved={isShelved}
                isDragging={isDragging}
                isDropTarget={isDropTarget}
                isNested={false}
                isPracticeLoop={isPracticeLoop}
                verticalShift={verticalShift}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onPress={() => onEditTask(task)}
                onToggle={() => onToggleTask(task)}
                onSubtaskChange={onSubtaskChange}
                onLayout={handleRegisterLayout}
              />
            </View>

            {/* Child tasks (nested under parent) */}
            {task.children && task.children.length > 0 && (
              <View style={styles.childrenContainer}>
                <View style={[styles.nestingLine, { backgroundColor: colors.primary + '40' }]} />
                <View style={styles.childrenList}>
                  {task.children.map((child, childIndex) => {
                    const childIsDragging = dragState.activeId === child.id;
                    const childIsDropTarget = dragState.hoveredId === child.id;
                    const childVerticalShift = getVerticalShift(child.id, childIndex); // Note: Indexing for children needs care if list is flattened in getVerticalShift logic

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
                        verticalShift={childVerticalShift} // Currently logic might calculate 0 if it assumes flattened list.
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

});
