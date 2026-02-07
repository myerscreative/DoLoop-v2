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
  onOptimisticUpdate?: (newTasks: TaskWithDetails[]) => void;
}

export function useDragReorder({ tasks, loopId, loadLoopData, onOptimisticUpdate }: UseDragReorderProps) {
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

    const activeTask = tasks.find(t => t.id === activeId) ||
                       tasks.flatMap(t => t.children || []).find(c => c.id === activeId);

    if (!activeTask) return;

    // Calculate the current center Y position: initial absolute center + translation
    const activeCenterY = activeLayout.y + activeLayout.height / 2 + translationY;

    let closestId: string | null = null;
    let closestAction: HoverAction = null;
    let closestDistance = Infinity;

    cardLayoutsRef.current.forEach((layout, id) => {
      // Skip self
      if (id === activeId) return;

      // Skip if parent/child relationship exists to prevent weird nesting issues during drag
      // (Simplified: only allow reordering within same level/parent for now to fix basic DnD)
      if (activeLayout.parentTaskId !== layout.parentTaskId) {
         // Allow nesting if target is a potential parent (top-level) and active is top-level
         if (activeLayout.parentTaskId || layout.parentTaskId) return;
      }

      const targetTop = layout.y;
      const targetBottom = layout.y + layout.height;
      const targetCenter = layout.y + layout.height / 2;

      // Skip if not strictly overlapping vertically with the target's bounds
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
    // Read from ref to avoid stale closure
    const { activeId, hoveredId, hoveredAction } = dragStateRef.current;

    if (!activeId || !hoveredId || !hoveredAction) {
      dragStateRef.current = initialDragState;
      setDragState(initialDragState);
      lastHoveredIdRef.current = null;
      return;
    }

    // 1. Optimistic Update
    // Clone the tasks tree
    let newTasks = JSON.parse(JSON.stringify(tasks));

    // Find the active task and remove it from its current position
    // We need to handle both top-level and nested tasks
    let activeTask: any = null;

    // Search top-level
    const sourceIndex = newTasks.findIndex((t: any) => t.id === activeId);
    if (sourceIndex !== -1) {
        activeTask = newTasks[sourceIndex];
        newTasks.splice(sourceIndex, 1);
    } else {
        // Search children
        for (const parent of newTasks) {
            if (parent.children) {
                const childIdx = parent.children.findIndex((c: any) => c.id === activeId);
                if (childIdx !== -1) {
                    activeTask = parent.children[childIdx];
                    parent.children.splice(childIdx, 1);
                    break;
                }
            }
        }
    }

    if (!activeTask) {
        // console.error('Could not find active task for optimistic update');
        dragStateRef.current = initialDragState;
        setDragState(initialDragState);
        return;
    }

    // Insert into new position
    if (hoveredAction === 'nest') {
        // Find target parent
        const targetParent = newTasks.find((t: any) => t.id === hoveredId);
        if (targetParent) {
            if (!targetParent.children) targetParent.children = [];
            targetParent.children.push({ ...activeTask, parent_task_id: hoveredId });
             // Also update the task itself to reflect the new parent
             activeTask.parent_task_id = hoveredId;
        }
    } else {
        // Reorder
        // Find target list and index
        let targetList: any[] = newTasks;
        let targetIndex = -1;

        // Try top-level first
        targetIndex = newTasks.findIndex((t: any) => t.id === hoveredId);

        if (targetIndex === -1) {
             // Try children
             for (const parent of newTasks) {
                if (parent.children) {
                    const childIdx = parent.children.findIndex((c: any) => c.id === hoveredId);
                    if (childIdx !== -1) {
                        targetList = parent.children;
                        targetIndex = childIdx;
                        break;
                    }
                }
            }
        }

        if (targetIndex !== -1) {
            const insertIndex = hoveredAction === 'reorder-above' ? targetIndex : targetIndex + 1;
            targetList.splice(insertIndex, 0, activeTask);
        }
    }

    // Trigger optimistic UI update
    if (onOptimisticUpdate) {
        onOptimisticUpdate(newTasks);
    }

    // Reset drag state immediately so UI reflects "dropped" state
    dragStateRef.current = initialDragState;
    setDragState(initialDragState);
    lastHoveredIdRef.current = null;

    // 2. Perform Async Server Update
    try {
      if (hoveredAction === 'nest') {
        const targetTask = tasks.find(t => t.id === hoveredId);
        const childCount = targetTask?.children?.length || 0;
        await nestTask(activeId, hoveredId, childCount);
        // await safeHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        // Re-fetch fresh data to ensure we have the correct indices before calculating reorder
        // (Optimistic update handles the UI, this handles the DB)

        // Reconstruct the ordered list of IDs for the affecting list (top-level or child list)
        // For simplicity in this implementation, we re-use the 'newTasks' structure we just built
        // to determine the new order_index for everyone in that list.

        // Flatten the list to find where the active task ended up
        let updatedList: any[] = [];

        // Check if it's now top-level
        if (newTasks.find((t: any) => t.id === activeId)) {
            updatedList = newTasks;
        } else {
            // Check children
             for (const parent of newTasks) {
                if (parent.children && parent.children.find((c: any) => c.id === activeId)) {
                    updatedList = parent.children;
                    break;
                }
            }
        }

        const orderedIds = updatedList.map((t, i) => ({
          id: t.id,
          order_index: i,
          parent_task_id: t.parent_task_id || null,
        }));

        await reorderTasks(loopId, orderedIds);
        // await safeHaptic(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_error) {
      // console.error('Error completing drag:', _error);
      await loadLoopData();
    }
  }, [tasks, loopId, loadLoopData, safeHaptic, onOptimisticUpdate]);

  const cancelDrag = useCallback(() => {
    dragStateRef.current = initialDragState;
    setDragState(initialDragState);
    lastHoveredIdRef.current = null;
  }, []);

  // Helper to calculate visual shift for a task
  const getVerticalShift = useCallback((taskId: string, index: number): number => {
    const { activeId, activeIndex, hoveredId, hoveredAction } = dragStateRef.current;

    if (!activeId || !hoveredId) return 0;

    // If this is the active card, it doesn't shift (it drags)
    if (taskId === activeId) return 0;

    // If nesting, no shift
    if (hoveredAction === 'nest') return 0;

    // We need the height of the active card to know how much to shift
    const activeLayout = cardLayoutsRef.current.get(activeId);
    if (!activeLayout) return 0;

    const shiftAmount = activeLayout.height;

    // Create a flattened list of all tasks with their global indices
    // This handles both top-level and nested tasks
    const flattenedTasks: Array<{ id: string; globalIndex: number; parentId: string | null }> = [];
    let globalIdx = 0;

    tasks.forEach(task => {
      flattenedTasks.push({ id: task.id, globalIndex: globalIdx++, parentId: null });
      if (task.children && task.children.length > 0) {
        task.children.forEach(child => {
          flattenedTasks.push({ id: child.id, globalIndex: globalIdx++, parentId: task.id });
        });
      }
    });

    // Find the active and hovered items in the flattened list
    const activeItem = flattenedTasks.find(t => t.id === activeId);
    const hoveredItem = flattenedTasks.find(t => t.id === hoveredId);
    const currentItem = flattenedTasks.find(t => t.id === taskId);

    if (!activeItem || !hoveredItem || !currentItem) return 0;

    // Only shift items that are in the same parent context as the active item
    // (This prevents shifts in different nesting levels)
    if (currentItem.parentId !== activeItem.parentId) return 0;

    const activeGlobalIndex = activeItem.globalIndex;
    const hoveredGlobalIndex = hoveredItem.globalIndex;
    const currentGlobalIndex = currentItem.globalIndex;

    // Dragging Down
    if (activeGlobalIndex < hoveredGlobalIndex) {
        // Items between active and hovered should shift UP
        // If reorder-below: shift items up to and including hoveredIndex
        // If reorder-above: shift items up to hoveredIndex - 1

        const limitIndex = hoveredAction === 'reorder-below' ? hoveredGlobalIndex : hoveredGlobalIndex - 1;

        if (currentGlobalIndex > activeGlobalIndex && currentGlobalIndex <= limitIndex) {
            return -shiftAmount;
        }
    }
    // Dragging Up
    else if (activeGlobalIndex > hoveredGlobalIndex) {
        // Items between hovered and active should shift DOWN
        // If reorder-above: shift items from hoveredIndex
        // If reorder-below: shift items from hoveredIndex + 1

        const startIndex = hoveredAction === 'reorder-above' ? hoveredGlobalIndex : hoveredGlobalIndex + 1;

        if (currentGlobalIndex >= startIndex && currentGlobalIndex < activeGlobalIndex) {
            return shiftAmount;
        }
    }

    return 0;
  }, [tasks]);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    cancelDrag,
    registerLayout,
    getVerticalShift,
  };
}
