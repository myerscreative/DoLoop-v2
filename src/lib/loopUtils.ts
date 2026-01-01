import { Loop, CompletionRecord, MomentumData } from '@/types/loop';

/**
 * Calculate progress percentage for a loop
 */
export function calculateProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Check if a loop is complete
 */
export function isLoopComplete(loop: Loop): boolean {
  return loop.completedTasks === loop.totalTasks && (loop.totalTasks || 0) > 0;
}

/**
 * Calculate current streak from completion history
 * A streak is consecutive days with at least one completion
 */
export function calculateStreak(history: CompletionRecord[]): number {
  if (history.length === 0) return 0;
  
  // Sort by date descending (most recent first)
  const sorted = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  
  for (const record of sorted) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    
    // If this record is from the date we're checking
    if (recordDate.getTime() === checkDate.getTime()) {
      if (record.completed > 0) {
        streak++;
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    } else if (recordDate.getTime() < checkDate.getTime()) {
      // Gap in history, streak broken
      break;
    }
  }
  
  return streak;
}

/**
 * Generate momentum data for the last N days
 * More recent completions have higher intensity
 */
export function generateMomentumData(
  history: CompletionRecord[],
  days: number = 7
): MomentumData[] {
  const result: MomentumData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create a map for quick lookup
  const historyMap = new Map(
    history.map(record => [record.date, record])
  );
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const record = historyMap.get(dateStr);
    const loopsCompleted = record?.completed || 0;
    
    // Calculate intensity: more recent days weighted higher
    // Scale from 0.3 (oldest) to 1.0 (most recent)
    const recencyWeight = 0.3 + (0.7 * (days - i) / days);
    const completionRate = record ? record.completed / record.total : 0;
    const intensity = completionRate * recencyWeight;
    
    result.push({
      date: dateStr,
      intensity: Math.min(intensity, 1),
      loopsCompleted,
    });
  }
  
  return result;
}

/**
 * Get time of day greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Generate a random ID (temporary until we have a proper backend)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Reloop: Reset all recurring tasks to unchecked
 * One-time tasks stay completed
 * This is core to the "recipe" metaphor - start the recipe over!
 */
export function reloop(loop: Loop): Loop {
  const resetItems = loop.items?.map(item => ({
    ...item,
    // Reset recurring items, keep one-time items as they are
    completed: item.isRecurring ? false : item.completed,
  }));
  
  const newCompletedTasks = resetItems?.filter(item => item.completed).length || 0;
  
  return {
    ...loop,
    items: resetItems,
    completedTasks: newCompletedTasks,
    updatedAt: new Date(),
  };
}

/**
 * Reset Loop: Reset ALL tasks to unchecked
 * Useful for starting fresh regardless of recurring status
 */
export function resetLoop(loop: Loop): Loop {
  const resetItems = loop.items?.map(item => ({
    ...item,
    completed: false,
  }));
  
  return {
    ...loop,
    items: resetItems,
    completedTasks: 0,
    updatedAt: new Date(),
  };
}

