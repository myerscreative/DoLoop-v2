import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskWithDetails, Task } from '../../types/loop';
import { DraggableTaskCard } from './DraggableTaskCard';
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
  const handleReorder = useCallback(async (taskIndex: number, direction: 'up' | 'down') => {
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

            {/* Task Row with Reorder Buttons */}
            <View style={styles.taskRow}>
              <View style={styles.reorderButtons}>
                <TouchableOpacity
                  onPress={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                >
                  <Ionicons name="chevron-up" size={18} color={index === 0 ? 'rgba(255,255,255,0.15)' : '#FEC00F'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReorder(index, 'down')}
                  disabled={index === tasks.length - 1}
                  style={[styles.reorderBtn, index === tasks.length - 1 && styles.reorderBtnDisabled]}
                >
                  <Ionicons name="chevron-down" size={18} color={index === tasks.length - 1 ? 'rgba(255,255,255,0.15)' : '#FEC00F'} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.taskCardFlex}>
                <DraggableTaskCard
                  task={task}
                  index={index}
                  isActive={isActive}
                  isShelved={isShelved}
                  isNested={false}
                  isPracticeLoop={isPracticeLoop}
                  onPress={() => onEditTask(task)}
                  onToggle={() => onToggleTask(task)}
                  onSubtaskChange={onSubtaskChange}
                />
              </View>
            </View>

            {/* Child tasks (nested under parent) */}
            {task.children && task.children.length > 0 && (
              <View style={styles.childrenContainer}>
                <View style={[styles.nestingLine, { backgroundColor: colors.primary + '40' }]} />
                <View style={styles.childrenList}>
                  {task.children.map((child, childIndex) => {
                    return (
                      <DraggableTaskCard
                        key={child.id}
                        task={child}
                        index={childIndex}
                        isActive={false}
                        isShelved={child.completed}
                        isNested={true}
                        isPracticeLoop={isPracticeLoop}
                        onPress={() => onEditTask(child)}
                        onToggle={() => onToggleTask(child)}
                        onSubtaskChange={onSubtaskChange}
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
    left: 44, // Adjusted for reorder buttons
    top: -8,
    width: 2,
    height: 8,
    borderRadius: 1,
  },
  childrenContainer: {
    flexDirection: 'row',
    marginLeft: 38, // Adjusted for reorder buttons
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
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCardFlex: {
    flex: 1,
  },
  reorderButtons: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 32,
  },
  reorderBtn: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
});
