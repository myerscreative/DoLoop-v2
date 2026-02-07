import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TaskWithDetails } from '../types/loop';
import { reorderTasks, nestTask } from '../lib/taskHelpers';

export type HoverAction = 'reorder-above' | 'reorder-below' | 'nest' | null;

export interface DragState {
  activeId: string | null;
  activeIndex: number;
  hoveredId: string | null;
  hoveredAction: HoverAction;
}

interface CardLayout {
  y: number;
  height: number;
  id: string;
  parentTaskId: string | null;
  hasChildren: boolean;
}

const initialDragState: DragState = {
  activeId: null,
  activeIndex: -1,
  hoveredId: null,
  hoveredAction: null,
};

interface UseDragReorderProps {
  tasks: TaskWithDetails[];
  loopId: string;
  loadLoopData: () => Promise<any>;
}

export function useDragReorder({ tasks, loopId, loadLoopData }: UseDragReorderProps) {
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const dragStateRef = useRef<DragState>(initialDragState);
  const cardLayoutsRef = useRef<Map<string, CardLayout>>(new Map());
  const lastHoveredIdRef = useRef<string | null>(null);

  const registerLayout = useCallback((id: string, layout: { y: number; height: number }, parentTaskId: string | null, hasChildren: boolean) => {
    cardLayoutsRef.current.set(id, { ...layout, id, parentTaskId, hasChildren });
  }, []);

  const safeHaptic = useCallback(async (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(style);
    }
  }, []);

  const handleDragStart = useCallback((id: string, index: number) => {
    const newState = {
      activeId: id,
      activeIndex: index,
      hoveredId: null,
      hoveredAction: null,
    };
    dragStateRef.current = newState;
    setDragState(newState);
    safeHaptic(Haptics.ImpactFeedbackStyle.Medium);
  }, [safeHaptic]);

  const handleDragMove = useCallback((translationY: number) => {
    const { activeId } = dragStateRef.current;
    if (!activeId) return;

    const activeLayout = cardLayoutsRef.current.get(activeId);
    if (!activeLayout) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const activeCenterY = activeLayout.y + activeLayout.height / 2 + translationY;

    let closestId: string | null = null;
    let closestAction: HoverAction = null;
    let closestDistance = Infinity;

    cardLayoutsRef.current.forEach((layout, id) => {
      if (id === activeId) return;

      const targetTop = layout.y;
      const targetBottom = layout.y + layout.height;
      const targetCenter = layout.y + layout.height / 2;

      // Skip if not overlapping vertically
      if (activeCenterY < targetTop || activeCenterY > targetBottom) return;

      const distance = Math.abs(activeCenterY - targetCenter);
      if (distance >= closestDistance) return;

      closestDistance = distance;
      closestId = id;

      // Determine action based on vertical position within target
      const relativePos = (activeCenterY - targetTop) / layout.height;

      // Can we nest here?
      const canNest =
        !layout.parentTaskId &&                  // Target is top-level
        !activeTask?.parent_task_id &&           // Active is top-level
        !(activeTask?.children && activeTask.children.length > 0) && // Active has no children
        relativePos >= 0.3 && relativePos <= 0.7; // Center zone

      if (canNest) {
        closestAction = 'nest';
      } else if (relativePos < 0.5) {
        closestAction = 'reorder-above';
      } else {
        closestAction = 'reorder-below';
      }
    });

    // Trigger haptic when entering a new drop target
    if (closestId !== lastHoveredIdRef.current && closestId !== null) {
      lastHoveredIdRef.current = closestId;
      safeHaptic(Haptics.ImpactFeedbackStyle.Light);
    }

    if (closestId !== dragStateRef.current.hoveredId || closestAction !== dragStateRef.current.hoveredAction) {
      const newState = {
        ...dragStateRef.current,
        hoveredId: closestId,
        hoveredAction: closestAction,
      };
      dragStateRef.current = newState;
      setDragState(newState);
    }
  }, [tasks, safeHaptic]);

  const handleDragEnd = useCallback(async () => {
    // Read from ref to avoid stale closure — React may not have
    // re-rendered since the last handleDragMove setState call.
    const { activeId, hoveredId, hoveredAction } = dragStateRef.current;

    if (!activeId || !hoveredId || !hoveredAction) {
      dragStateRef.current = initialDragState;
      setDragState(initialDragState);
      lastHoveredIdRef.current = null;
      return;
    }

    try {
      if (hoveredAction === 'nest') {
        // Count existing children of the target to determine order_index
        const targetTask = tasks.find(t => t.id === hoveredId);
        const childCount = targetTask?.children?.length || 0;
        await nestTask(activeId, hoveredId, childCount);
        await safeHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        // Reorder: compute new order for all top-level tasks
        const topLevel = tasks.filter(t => !t.parent_task_id);
        const activeIndex = topLevel.findIndex(t => t.id === activeId);
        let targetIndex = topLevel.findIndex(t => t.id === hoveredId);

        if (activeIndex === -1 || targetIndex === -1) {
          dragStateRef.current = initialDragState;
          setDragState(initialDragState);
          lastHoveredIdRef.current = null;
          return;
        }

        // Remove active from list
        const reordered = [...topLevel];
        const [moved] = reordered.splice(activeIndex, 1);

        // Recalculate target index after removal
        targetIndex = reordered.findIndex(t => t.id === hoveredId);
        const insertIndex = hoveredAction === 'reorder-above' ? targetIndex : targetIndex + 1;
        reordered.splice(insertIndex, 0, moved);

        const orderedIds = reordered.map((t, i) => ({
          id: t.id,
          order_index: i,
          parent_task_id: t.parent_task_id || null,
        }));

        await reorderTasks(loopId, orderedIds);
        await safeHaptic(Haptics.ImpactFeedbackStyle.Light);
      }

      await loadLoopData();
    } catch (error) {
      console.error('Error completing drag:', error);
    }

    dragStateRef.current = initialDragState;
    setDragState(initialDragState);
    lastHoveredIdRef.current = null;
  }, [tasks, loopId, loadLoopData, safeHaptic]);

  const cancelDrag = useCallback(() => {
    dragStateRef.current = initialDragState;
    setDragState(initialDragState);
    lastHoveredIdRef.current = null;
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    cancelDrag,
    registerLayout,
  };
}
