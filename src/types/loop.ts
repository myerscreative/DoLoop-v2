/**
 * Supabase Database Types - Core data structures for DoLoop
 */

export type ResetRule = 'manual' | 'daily' | 'weekdays' | 'weekly' | 'custom';
export type LoopRole = 'creator' | 'collaborator' | 'assigned' | 'viewer';
export type TaskStatus = 'pending' | 'done';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export type FilterType = 'all' | 'manual' | 'daily' | 'weekly';

// Database Tables
export interface User {
  id: string;
  email: string;
  // Add other user fields as needed
}

export interface Loop {
  id: string;
  owner_id?: string;
  name?: string;
  color?: string;
  description?: string; // AI Synopsis or user description
  affiliate_link?: string; // Link to order book/training
  category?: LoopType;
  reset_rule?: ResetRule;
  custom_days?: number[]; // For custom recurrence: 0=Sun, 1=Mon, etc.
  next_reset_at?: string; // ISO date string
  due_date?: string; // ISO date string для manual loops
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;

  // --- Recipe Provenance (Author & Source) ---
  author_name?: string;           // The creator/expert behind the loop
  author_bio?: string;            // Brief background of the author
  author_image_url?: string;      // Profile picture URL
  source_title?: string;          // Book, Seminar, or Framework name
  source_link?: string;           // Link to buy the book or training
  end_goal_description?: string;  // The "Why" - what success looks like

  // Legacy aliases for utility functions
  title?: string; // alias for name
  items?: Task[]; // alias for tasks
  completedTasks?: number; // alias for completedCount
  totalTasks?: number; // alias for totalCount
  
  // CamelCase aliases for legacy/mock data
  ownerId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastCompletedAt?: string | Date;
  currentStreak?: number;
  longestStreak?: number;
  
  // Other potential fields
  type?: string;
  status?: string;
  last_reset?: string;
  completionHistory?: any[];
  members?: LoopMember[];
}

export interface LoopMember {
  id: string;
  loop_id: string;
  user_id: string;
  role: LoopRole;
  joined_at: string;
  // Optional expanded user details handled by joins
  user?: {
    email: string;
    full_name?: string; // or name/username
    avatar_url?: string;
  };
}

export interface Task {
  id: string;
  loop_id: string;
  description: string;
  notes?: string; // Additional details/description
  completed: boolean;
  completed_at?: string; // When task was completed
  is_one_time: boolean;
  is_critical?: boolean; // Must be completed before Loop can be marked done
  order_index?: number;
  created_at: string;
  updated_at: string;

  // Extended properties
  priority: TaskPriority;
  due_date?: string; // ISO date string
  tags?: string[]; // Array of tag IDs
  time_estimate_minutes?: number; // Estimated time in minutes
  reminder_at?: string; // ISO date string for reminder
  assigned_to?: string | null; // UUID of assigned loop member
  
  // Legacy aliases
  isRecurring?: boolean; // alias for !is_one_time
  
  // Relationships (added for type safety in components)
  subtasks?: Subtask[];
  tag_details?: Tag[];
  attachments?: Attachment[];
  reminder?: TaskReminder;
}

export interface Subtask {
  id: string;
  task_id: string;
  description: string;
  completed: boolean;
  order_index: number;
  created_at?: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at?: string;
}

// Pending attachment from picker (before upload)
export interface PendingAttachment {
  uri: string;
  name: string;
  type: 'image' | 'file';
  mimeType?: string;
  size?: number;
}

export interface TaskReminder {
  id: string;
  task_id: string;
  remind_at: string;
  is_sent: boolean;
  created_at?: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
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

/**
 * Loop Library / Template Types
 */

export interface TemplateCreator {
  id: string;
  name: string;
  bio: string;
  title?: string; // e.g., "Business Coach", "Author", "CEO"
  photo_url?: string;
  website_url?: string;
  website?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoopTemplate {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  book_course_title: string; // The book/course/training that inspired this loop
  affiliate_link?: string;
  color: string;
  category: LoopType;
  is_featured: boolean;
  popularity_score: number;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateTask {
  id: string;
  template_id: string;
  description: string;
  hint?: string; // Detailed explanation of this step
  is_recurring: boolean;
  is_one_time: boolean;
  display_order: number;
  created_at: string;
}

export interface UserTemplateUsage {
  id: string;
  user_id: string;
  template_id: string;
  loop_id?: string;
  added_at: string;
}

export interface TemplateReview {
  id: string;
  template_id: string;
  user_id: string;
  rating: number; // 1-5
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateFavorite {
  id: string;
  template_id: string;
  user_id: string;
  created_at: string;
}

export interface LoopTemplateWithDetails extends LoopTemplate {
  creator: TemplateCreator;
  tasks: TemplateTask[];
  taskCount: number;
  userRating?: number;
  isFavorite?: boolean;
  isAdded?: boolean;
}

/**
 * UI-specific types and helpers
 */

export type LoopType = 'personal' | 'work' | 'daily' | 'shared' | 'manual' | 'weekly' | 'goals';

export interface LibraryFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
  order?: number;
  isDefault?: boolean;
  filterType?: string;
}

export interface CompletionRecord {
  date: string;
  completed: number;
  total: number;
}

export interface MomentumData {
  date: string;
  intensity: number;
  loopsCompleted: number;
}

export interface TaskWithDetails extends Task {
  // Extended properties are now part of the base Task interface
  assigned_user_id?: string;
}

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
  manual: '✓',
  weekly: '🎯',
  goals: '🏆',
};

// Folder colors - UNIFIED GOLD BRAND
export const FOLDER_COLORS: Record<LoopType, string> = {
  personal: '#FEC00F', // Gold
  work: '#FEC00F',     // Gold
  daily: '#FEC00F',    // Gold
  shared: '#FEC00F',   // Gold
  manual: '#FEC00F',   // Gold
  weekly: '#FEC00F',   // Gold
  goals: '#FEC00F',    // Gold
};

// Loop type colors - UNIFIED GOLD BRAND
export const LOOP_TYPE_COLORS = {
  CHECKLIST: '#FEC00F', // Gold
  DAILY: '#FEC00F',     // Gold
  WEEKLY: '#FEC00F',    // Gold
  GOALS: '#FEC00F',     // Gold
};

// Priority colors
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  none: '#9CA3AF',
  low: '#3B82F6',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#DC2626',
};

// Priority labels
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

// Loop Recurrence labels
export const RESET_RULE_LABELS: Record<ResetRule, string> = {
  manual: 'Manual',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  custom: 'Custom',
};

// Loop Recurrence descriptions
export const RESET_RULE_DESCRIPTIONS: Record<ResetRule, string> = {
  manual: 'One-time use, reset manually',
  daily: 'Resets every morning at 4am',
  weekdays: 'Monday - Friday at 4am',
  weekly: 'Resets every Monday at 4am',
  custom: 'Select specific days',
};

/**
 * AI Loop Sommelier Types
 */

export type LoopCourse = 'starter' | 'main' | 'side' | 'dessert';

export const COURSE_CONFIG: Record<LoopCourse, { emoji: string; name: string; description: string }> = {
  starter: { emoji: '🥗', name: 'Starter', description: 'Quick wins and warmup routines' },
  main: { emoji: '🍽️', name: 'Main Course', description: 'Core activities that address your goal' },
  side: { emoji: '🥙', name: 'Side Dish', description: 'Supporting habits for success' },
  dessert: { emoji: '🍰', name: 'Dessert', description: 'Rewards and reflection' },
};

export interface LoopRecommendation {
  course: LoopCourse;
  courseEmoji: string;
  courseName: string;
  template_id?: string;
  loop: {
    name: string;
    description: string;
    color: string;
    resetRule: ResetRule;
    tasks: Array<{ description: string; notes?: string }>;
    // Data fields for experts
    expertName?: string;
    expertTitle?: string;
    bookOrCourse?: string;
    affiliateLink?: string;
    needsAffiliateSetup?: boolean;
  };
  explanation: string;
  isTemplate: boolean;
}

export interface RecommendationSession {
  id: string;
  user_id: string;
  prompt: string;
  parsed_goal: string;
  recommendations: LoopRecommendation[];
  created_at: string;
}

