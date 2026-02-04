import { supabase } from './supabase';
import { TaskReflection } from '../types/loop';

/**
 * Get the reflection for a specific task for today (local time)
 */
export async function getTodayReflection(taskId: string, userId: string): Promise<string | null> {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('task_reflections')
    .select('reflection_text')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .eq('reflection_date', today)
    .maybeSingle(); // Use maybeSingle to avoid 406 on no rows
    
  if (error) {
    console.error('Error fetching reflection:', error);
    return null;
  }
  
  return data?.reflection_text || null;
}

/**
 * Save or update a reflection for today
 */
export async function saveReflection(taskId: string, userId: string, text: string): Promise<boolean> {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  // If text is empty, we might want to delete it or save empty string
  // For now, let's just save whatever is there.
  
  const { error } = await supabase
    .from('task_reflections')
    .upsert({
      task_id: taskId,
      user_id: userId,
      reflection_date: today,
      reflection_text: text,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'task_id,user_id,reflection_date'
    });
    
  if (error) {
    console.error('Error saving reflection:', error);
    return false;
  }
  return true;
}

/**
 * Get historical reflections for a task
 */
export async function getReflectionHistory(taskId: string, limit = 7): Promise<TaskReflection[]> {
  const { data, error } = await supabase
    .from('task_reflections')
    .select('*')
    .eq('task_id', taskId)
    .order('reflection_date', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching reflection history:', error);
    return [];
  }
  return (data as TaskReflection[]) || [];
}
