import { create } from 'zustand';
import { Task } from '../types/loop';
import { supabase } from '../lib/supabase';
import { flattenTreeForSync, buildTreeFromFlatList } from '../lib/treeHelpers';

interface TasksState {
  taskTree: Task[];
  loading: boolean;
  setTaskTree: (tree: Task[]) => void;
  loadTasks: (loopId: string) => Promise<void>;
  updateTaskTree: (loopId: string, newTree: Task[]) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set) => ({
  taskTree: [],
  loading: false,

  setTaskTree: (tree) => set({ taskTree: tree }),

  loadTasks: async (loopId) => {
    set({ loading: true });
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('loop_id', loopId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      const tree = buildTreeFromFlatList(tasks || []);
      set({ taskTree: tree });
    } catch {
      // Silence or handle error
    } finally {
      set({ loading: false });
    }
  },

  updateTaskTree: async (loopId, newTree) => {
    // Optimistic update
    set({ taskTree: newTree });
    
    try {
      const flatUpdates = flattenTreeForSync(newTree);
      
      // Batch update in Supabase
      // Note: reorderTasks in taskHelpers.ts already does something similar
      // but we want to ensure we handle parent_task_id changes too.
      const updates = flatUpdates.map(({ id, order_index, parent_task_id }) =>
        supabase
          .from('tasks')
          .update({ 
            order_index, 
            parent_task_id, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .eq('loop_id', loopId)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(r => r.error);
      if (hasError) throw new Error('Failed to sync tree to database');
      
    } catch {
      // Silence or handle error
      // Optional: Rollback on error if needed, or just let next fetch fix it
    }
  },
}));
