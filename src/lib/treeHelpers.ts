import { Task } from '../types/loop';

/**
 * Rebuilds a nested tree from a flat list of items at the same level.
 * This is primarily used after a drag-and-drop operation at a specific level.
 */
export function rebuildNestedTree(flatData: Task[]): Task[] {
  return flatData.map((task, idx) => ({
    ...task,
    order_index: idx,
    // Recursively rebuild children if they exist
    children: task.children ? rebuildNestedTree(task.children) : undefined,
  }));
}

/**
 * flattens a tree into a list of updates required for Supabase.
 * Each update includes id, order_index, and parent_task_id.
 */
export function flattenTreeForSync(tree: Task[], parentId: string | null = null): { id: string; order_index: number; parent_task_id: string | null }[] {
  let updates: { id: string; order_index: number; parent_task_id: string | null }[] = [];
  
  tree.forEach((task, index) => {
    updates.push({
      id: task.id,
      order_index: index,
      parent_task_id: parentId,
    });
    
    if (task.children && task.children.length > 0) {
      updates = [...updates, ...flattenTreeForSync(task.children, task.id)];
    }
  });
  
  return updates;
}

/**
 * Promotes a child task to become a sibling of its parent.
 * Returns the updated tree.
 */
export function promoteTaskInTree(tree: Task[], taskId: string): Task[] {
  let promotedTask: Task | null = null;
  let formerParentIndex: number = -1;

  // 1. Find and remove the task from its current parent
  function findAndRemove(nodes: Task[]): Task[] {
    return nodes.map((node, index) => {
      if (node.children) {
        const childIndex = node.children.findIndex(c => c.id === taskId);
        if (childIndex !== -1) {
          promotedTask = { ...node.children[childIndex] };
          promotedTask.parent_task_id = node.parent_task_id; // Sibling of parent
          formerParentIndex = index;
          return {
            ...node,
            children: node.children.filter(c => c.id !== taskId),
          };
        }
        return {
          ...node,
          children: findAndRemove(node.children),
        };
      }
      return node;
    });
  }

  let updatedTree = findAndRemove(tree);

  // 2. Insert the promoted task as a sibling of its former parent
  if (promotedTask && formerParentIndex !== -1) {
    // If it was top-level (not possible since it must have a parent to be promoted), it would be in tree.
    // The findAndRemove handles nested structures.
    // If promotedTask.parent_task_id is null, it moves to the root.
    
    // We need to insert it into the array where the former parent lives.
    function insertAsSibling(nodes: Task[]): Task[] {
      const idx = nodes.findIndex((_, i) => i === formerParentIndex);
      if (idx !== -1) {
        const newNodes = [...nodes];
        newNodes.splice(idx + 1, 0, promotedTask!);
        return newNodes;
      }
      return nodes.map(node => ({
        ...node,
        children: node.children ? insertAsSibling(node.children) : undefined,
      }));
    }

    updatedTree = insertAsSibling(updatedTree);
  }

  return updatedTree;
}

function collectIds(nodes: Task[]): string[] {
  return nodes.flatMap(n => [n.id, ...(n.children ? collectIds(n.children) : [])]);
}

/** Returns ids of taskId and all its descendants so we can detect cycle (parent must not be in this set). */
function selfAndDescendantIds(tree: Task[], taskId: string): Set<string> {
  const set = new Set<string>();
  function walk(nodes: Task[]): Task | null {
    for (const node of nodes) {
      if (node.id === taskId) {
        set.add(node.id);
        if (node.children) collectIds(node.children).forEach(id => set.add(id));
        return node;
      }
      if (node.children) {
        const found = walk(node.children);
        if (found) return found;
      }
    }
    return null;
  }
  walk(tree);
  return set;
}

/**
 * Nests a task under a new parent (moves it from its current position to be a child of parentTaskId).
 * Returns the updated tree. Does nothing if taskId === parentTaskId or parent is a descendant of task.
 */
export function nestTaskInTree(tree: Task[], taskId: string, parentTaskId: string): Task[] {
  if (taskId === parentTaskId) return tree;

  let extracted: Task | null = null;

  function removeTask(nodes: Task[]): Task[] {
    return nodes.flatMap(node => {
      if (node.id === taskId) {
        extracted = { ...node, parent_task_id: parentTaskId };
        return [];
      }
      return [{
        ...node,
        children: node.children ? removeTask(node.children) : undefined,
      }];
    });
  }

  const withoutTask = removeTask(tree);
  if (!extracted) return tree;

  // Prevent nesting onto self or onto a descendant (cycle)
  const selfAndDesc = selfAndDescendantIds(tree, taskId);
  if (selfAndDesc.has(parentTaskId)) return tree;

  function addAsChild(nodes: Task[]): Task[] {
    return nodes.map(node => {
      if (node.id === parentTaskId) {
        const children = [...(node.children || []), extracted!];
        return { ...node, children };
      }
      return {
        ...node,
        children: node.children ? addAsChild(node.children) : undefined,
      };
    });
  }

  return addAsChild(withoutTask);
}

/**
 * Converts a flat array of tasks from database into a nested tree structure.
 */
export function buildTreeFromFlatList(tasks: any[]): Task[] {
  const topLevelTasks = tasks.filter((t) => !t.parent_task_id);
  const childTaskMap = new Map<string, any[]>();
  
  for (const task of tasks) {
    if (task.parent_task_id) {
      const siblings = childTaskMap.get(task.parent_task_id) || [];
      siblings.push(task);
      childTaskMap.set(task.parent_task_id, siblings);
    }
  }

  function hydrate(task: any, depth: number = 0): Task {
    const rawChildren = childTaskMap.get(task.id) || [];
    const children = rawChildren
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(c => hydrate(c, depth + 1));
      
    return {
      ...task,
      depth,
      children: children.length > 0 ? children : undefined,
      subtasks: children, // compatibility
    };
  }

  return topLevelTasks
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(t => hydrate(t));
}
