/**
 * Supabase Database Types - Core data structures for DoLoop
 */

export type ResetRule = 'manual' | 'daily' | 'weekly';
export type TaskStatus = 'pending' | 'done';

// Database Tables
export interface User {
  id: string;
  email: string;
  // Add other user fields as needed
}

export interface Loop {
  id: string;
  owner_id: string;
  name: string;
  color: string;
  reset_rule: ResetRule;
  next_reset_at: string; // ISO date string
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  loop_id: string;
  description: string;
  notes?: string;
  completed: boolean;
  completed_at?: string;
  is_one_time: boolean;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface ArchivedTask {
  id: string;
  original_task_id: string;
  loop_id: string;
  description: string;
  completed_at: string;
  archived_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  loop_id: string;
  current_streak: number;
  updated_at: string;
}

export interface LoopMember {
  loop_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

/**
 * UI-specific types and helpers
 */

export type LoopType = 'personal' | 'work' | 'daily' | 'shared';

export interface LoopWithTasks extends Loop {
  tasks: Task[];
  completedCount: number;
  totalCount: number;
  streak: number;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
}

// Folder icons mapping
export const FOLDER_ICONS: Record<LoopType, string> = {
  personal: '🏡',
  work: '💼',
  daily: '☀️',
  shared: '👥',
};

// Folder colors
export const FOLDER_COLORS: Record<LoopType, string> = {
  personal: '#FE356C',
  work: '#0CB6CC',
  daily: '#FEC041',
  shared: '#7952B4',
};

