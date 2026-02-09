import React, { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SortableItem, listToObject, ScrollDirection } from 'react-native-reanimated-dnd';
import * as Haptics from 'expo-haptics';
import { TaskWithDetails, Task } from '../../types/loop';
import { ExpandableTaskCard } from './ExpandableTaskCard';
import { reorderTasks } from '../../lib/taskHelpers';

// Fixed height per sortable item — matches collapsed ExpandableTaskCard
// (paddingVertical:10*2 + checkbox:24 + border:2 + gap:4 ≈ 50px, plus breathing room)
const ITEM_HEIGHT = 56;

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

/**
 * Inner component that owns shared values for the sortable list.
 * Remounted via key when the task list identity changes, which resets
 * the positions shared value cleanly.
 */
const SortableTaskListInner: React.FC<DraggableTaskListProps> = ({
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
  // Shared values for react-native-reanimated-dnd SortableItem
  const positions = useSharedValue(listToObject(tasks));
  const lowerBound = useSharedValue(0);
  const autoScrollDirection = useSharedValue<ScrollDirection>(ScrollDirection.None);

  const firstIncompleteIndex = tasks.findIndex(t => !t.completed);

  const handleDragStart = useCallback((_id: string, _position: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleDrop = useCallback(
    async (id: string, newPosition: number) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const oldIndex = tasks.findIndex(t => t.id === id);
      if (oldIndex === -1 || oldIndex === newPosition) return;

      // Reconstruct the ordered list after the move
      const reordered = [...tasks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newPosition, 0, moved);

      // Optimistic UI update
      if (onOptimisticUpdate) {
        onOptimisticUpdate(reordered);
      }

      // Persist new order to server
      const orderedIds = reordered.map((task, idx) => ({
        id: task.id,
        order_index: idx,
        parent_task_id: task.parent_task_id || null,
      }));

      try {
        await reorderTasks(loopId, orderedIds);
      } catch {
        // Revert on error by reloading
        await loadLoopData();
      }
    },
    [tasks, loopId, onOptimisticUpdate, loadLoopData],
  );

  const containerHeight = tasks.length * ITEM_HEIGHT;

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {tasks.map((task, index) => {
        const isActive = index === firstIncompleteIndex;
        const isShelved = task.completed;
        const childCount = task.children?.length || 0;

        return (
          <SortableItem
            key={task.id}
            id={task.id}
            data={task}
            positions={positions}
            lowerBound={lowerBound}
            autoScrollDirection={autoScrollDirection}
            itemsCount={tasks.length}
            itemHeight={ITEM_HEIGHT}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            animatedStyle={styles.sortableItemOverride}
          >
            {showTrail && (
              <View style={styles.trailConnectorWrapper}>
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
            <ExpandableTaskCard
              task={task}
              onPress={() => onEditTask(task)}
              onToggle={() => onToggleTask(task)}
              onSubtaskChange={onSubtaskChange}
              isPracticeLoop={isPracticeLoop}
              isActive={isActive}
              isShelved={isShelved}
              isNested={false}
              childCount={childCount}
            />
          </SortableItem>
        );
      })}
    </View>
  );
};

/**
 * DraggableTaskList — sortable task list powered by react-native-reanimated-dnd.
 *
 * Uses the library's SortableItem for long-press-to-drag reordering with
 * smooth Reanimated animations. The inner component remounts (via key)
 * whenever the task list identity changes, resetting shared values cleanly.
 *
 * Limitations of the current integration:
 * - Fixed ITEM_HEIGHT means child/nested tasks are shown as a count badge
 *   rather than inline (the library requires uniform item heights).
 * - Auto-scroll during drag is not connected to the parent ScrollView.
 * - Nesting (drag-to-nest) is handled separately via the task edit modal.
 */
export const DraggableTaskList: React.FC<DraggableTaskListProps> = (props) => {
  // Remount the inner component when the set of task IDs changes.
  // This ensures shared values (positions) are recreated for the new list.
  const key = props.tasks.map(t => t.id).join(',');
  return <SortableTaskListInner key={key} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  sortableItemOverride: {
    backgroundColor: 'transparent',
  },
  trailConnectorWrapper: {
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
});
