import React from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { TaskWithDetails } from '../../types/loop';
import { ExpandableTaskCard } from './ExpandableTaskCard';

interface DraggableTaskCardProps {
  task: TaskWithDetails;
  index: number;
  isActive: boolean;
  isShelved: boolean;
  isNested: boolean;
  isPracticeLoop: boolean;
  onPress: () => void;
  onToggle: () => void;
  onSubtaskChange: () => void;
  onLayout?: (id: string, layout: { y: number; height: number }) => void;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  isActive,
  isShelved,
  isNested,
  isPracticeLoop,
  onPress,
  onToggle,
  onSubtaskChange,
  onLayout,
}) => {
  const handleLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    onLayout?.(task.id, { y, height });
  };

  return (
    <View onLayout={handleLayout}>
      <ExpandableTaskCard
        task={task}
        onPress={onPress}
        onToggle={onToggle}
        onSubtaskChange={onSubtaskChange}
        isPracticeLoop={isPracticeLoop}
        isActive={isActive}
        isShelved={isShelved}
        isNested={isNested}
      />
    </View>
  );
};
