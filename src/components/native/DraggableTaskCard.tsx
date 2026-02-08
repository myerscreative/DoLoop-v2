import React, { useCallback, useRef } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { TaskWithDetails } from '../../types/loop';
import { ExpandableTaskCard } from './ExpandableTaskCard';

interface DraggableTaskCardProps {
  task: TaskWithDetails;
  index: number;
  isActive: boolean;
  isShelved: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  isNested: boolean;
  isPracticeLoop: boolean;
  verticalShift?: number;
  onDragStart: (id: string, index: number) => void;
  onDragMove: (translationY: number) => void;
  onDragEnd: () => void;
  onPress: () => void;
  onToggle: () => void;
  onSubtaskChange: () => void;
  onLayout: (id: string, layout: { y: number; height: number }) => void;
  containerRef?: React.RefObject<View>;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  index,
  isActive,
  isShelved,
  isDragging,
  isDropTarget,
  isNested,
  isPracticeLoop,
  verticalShift = 0,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPress,
  onToggle,
  onSubtaskChange,
  onLayout,
  containerRef,
}) => {
  const translateY = useSharedValue(0);
  const shiftY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const isDragActive = useSharedValue(false);
  const viewRef = useRef<View>(null);

  // Sync shiftY with prop
  // We use a useEffect or useAnimatedReaction equivalent logic
  // But since proper react-native-reanimated usage inside FC usually relies on dependency array for shared values updates
  // if they come from props, we can set it here.
  React.useEffect(() => {
    shiftY.value = withSpring(verticalShift, { damping: 20, stiffness: 150 });
  }, [verticalShift]);

  const triggerDragStart = useCallback(() => {
    // Refresh position before drag starts - measure relative to container
    if (viewRef.current && containerRef?.current) {
      viewRef.current.measureLayout(
        containerRef.current,
        (x, y, width, height) => {
          console.log(`Drag start - measuring ${task.id}: y=${y}, height=${height}`);
          onLayout(task.id, { y, height });
        },
        () => console.error(`Failed to measure ${task.id}`)
      );
    }
    onDragStart(task.id, index);
  }, [onDragStart, onLayout, task.id, index, containerRef]);

  const triggerDragMove = useCallback((translationY: number) => {
    onDragMove(translationY);
  }, [onDragMove]);

  const triggerDragEnd = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  // Single pan gesture that activates after long press
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart(() => {
      'worklet';
      isDragActive.value = true;
      scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
      zIndex.value = 1000;
      runOnJS(triggerDragStart)();
    })
    .onUpdate((event) => {
      'worklet';
      if (!isDragActive.value) return;
      translateY.value = event.translationY;
      runOnJS(triggerDragMove)(event.translationY);
    })
    .onEnd(() => {
      'worklet';
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      zIndex.value = 0;
      isDragActive.value = false;
      runOnJS(triggerDragEnd)();
    })
    .onFinalize(() => {
      'worklet';
      // Safety reset if gesture is cancelled
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      isDragActive.value = false;
    });

  // Use the same gesture for all platforms
  const gesture = panGesture;

  const animatedDragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value + shiftY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    elevation: isDragActive.value ? 10 : 0,
  }));

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    // Measure position relative to container for consistent coordinate space
    if (viewRef.current && containerRef?.current) {
      viewRef.current.measureLayout(
        containerRef.current,
        (x, y, width, measuredHeight) => {
          console.log(`Layout - measuring ${task.id}: y=${y}, height=${measuredHeight || height}`);
          onLayout(task.id, { y, height: measuredHeight || height });
        },
        () => {
          // Fallback if measureLayout fails - this shouldn't happen but just in case
          console.warn(`measureLayout failed for ${task.id}, using fallback`);
        }
      );
    }
  }, [onLayout, task.id, containerRef]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        ref={viewRef}
        style={animatedDragStyle}
        onLayout={handleLayout}
      >
        <ExpandableTaskCard
          task={task}
          onPress={onPress}
          onToggle={onToggle}
          onSubtaskChange={onSubtaskChange}
          isPracticeLoop={isPracticeLoop}
          isActive={isActive}
          isShelved={isShelved}
          isBeingDragged={isDragging}
          isDropTarget={isDropTarget}
          isNested={isNested}
        />
      </Animated.View>
    </GestureDetector>
  );
};
