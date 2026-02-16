import { Task } from '../types/loop';

export interface FlatTask extends Task {
  depth: number;
  originalIndex: number; // To track where it came from if needed
}

/**
 * Flattens a nested task tree into a linear array for rendering.
 * Respects expanded state: collapsed children are excluded.
 */
export function flattenTaskTree(
  tasks: Task[], 
  expandedIds: Set<string>, 
  depth: number = 0
): FlatTask[] {
  let result: FlatTask[] = [];
  
  tasks.forEach((task, index) => {
    // Add current task
    result.push({
      ...task,
      depth,
      originalIndex: index
    });
    
    // If expanded and has children, recurse
    if (task.children && task.children.length > 0 && expandedIds.has(task.id)) {
      result.push(...flattenTaskTree(task.children, expandedIds, depth + 1));
    }
  });
  
  return result;
}

/**
 * Rebuilds a nested tree structure from a flat list of tasks.
 * Uses the 'depth' property to infer parent-child relationships.
 * 
 * Logic: An item is a child of the nearest preceding item with depth < item.depth.
 * If no such parent exists (e.g. depth > 0 at start), it's clamped to root or kept as is (depending on implementation).
 * Here we'll enforce strict validity: 
 * - Depth can only increase by 1 from previous item.
 * - If depth decreases/stays same, it goes up the stack.
 */
export function rebuildTreeFromFlat(flatTasks: FlatTask[]): Task[] {
  const rootTasks: Task[] = [];
  const stack: { task: Task; children: Task[] }[] = []; 
  // Stack holds "open" parents. 
  // Actually simpler: maintain a stack of { indent: number, list: Task[] }
  
  // Let's use a explicit parent pointer approach
  // We need to return Task[], so we need to populate 'children' arrays.
  
  // Helper to get the current list we should append to
  function getCurrentList(): Task[] {
    if (stack.length === 0) return rootTasks;
    return stack[stack.length - 1].children;
  }
  
  flatTasks.forEach(flatTask => {
    // Clean up the task object (remove flat-specific props)
    const { depth, originalIndex, ...taskProps } = flatTask;
    const newTask: Task = { ...taskProps, children: [] };
    
    // Manage stack based on depth
    // If flatTask.depth > stack level, we need to go deeper?
    // Actually, expected depth is determined by previous item.
    
    // If stack is empty, depth MUST be 0 (or we treat it as 0)
    // If we are deeper than stack, the previous item should be the parent.
    
    // We need to find the correct list for this depth.
    // Logic: 
    // stack[0] is depth 0 list (root) -> WRONG.
    // stack should hold PARENTS.
    
    // Let's refine:
    // We iterate. For each task:
    // 1. Determine its valid parent from the stack.
    //    Pop from stack while stack.top.depth >= task.depth.
    //    After popping, stack.top is the parent (if any).
    // 2. Add task to parent's children (or root).
    // 3. Push task to stack (it might be a parent for next items).
    
    // Note: The flatTask.depth coming in is "visual depth". We respect it as much as possible.
    
    while (stack.length > 0 && stack[stack.length - 1].task.depth! >= depth) {
      stack.pop();
    }
    
    // Now stack.top is either empty (root) or a parent with depth < current depth.
    if (stack.length === 0) {
      rootTasks.push(newTask);
    } else {
      const parent = stack[stack.length - 1];
      parent.children.push(newTask);
      // Update parent's children prop reference if needed? 
      // JavaScript objects are references, so pushing to `parent.children` works.
    }
    
    // Push self to stack with visual depth (stored in map or temp obj) to catch children
    // We add 'depth' to the stack item helper
    stack.push({ task: { ...newTask, depth }, children: newTask.children! });
  });
  
  // Cleanup: Recursively define undefined children for clean output if needed
  // (Our types say children?: Task[], so empty array is fine or undefined)
  const clean = (nodes: Task[]): Task[] => {
    return nodes.map((node, idx) => ({
      ...node,
      order_index: idx, // Update order index based on new position
      children: node.children && node.children.length > 0 ? clean(node.children) : undefined
    }));
  };
  
  return clean(rootTasks);
}
