/**
 * Rating Service - Handles star rating submission and retrieval
 */

import { supabase } from './supabase';

export interface Rating {
  id: string;
  user_id: string;
  loop_id: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the current user's rating for a specific loop
 */
export const getUserRating = async (loopId: string): Promise<number | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('ratings')
      .select('score')
      .eq('loop_id', loopId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found - that's okay
        return null;
      }
      console.error('Error fetching user rating:', error);
      return null;
    }

    return data?.score ?? null;
  } catch (error) {
    console.error('Error in getUserRating:', error);
    return null;
  }
};

/**
 * Submit or update a rating for a loop
 * The database trigger will automatically recalculate the average
 */
export const submitRating = async (loopId: string, score: number): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    // Validate score
    if (score < 1 || score > 5) {
      console.error('Invalid rating score. Must be between 1 and 5.');
      return false;
    }

    // Upsert the rating (insert or update if exists)
    const { error } = await supabase
      .from('ratings')
      .upsert(
        {
          user_id: user.id,
          loop_id: loopId,
          score: score,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,loop_id',
        }
      );

    if (error) {
      console.error('Error submitting rating:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in submitRating:', error);
    return false;
  }
};

/**
 * Get the current rating stats for a loop
 * This is useful for immediate UI updates after rating
 */
export const getLoopRatingStats = async (loopId: string): Promise<{ average: number; total: number } | null> => {
  try {
    const { data, error } = await supabase
      .from('loops')
      .select('average_rating, total_ratings')
      .eq('id', loopId)
      .single();

    if (error) {
      console.error('Error fetching loop rating stats:', error);
      return null;
    }

    return {
      average: data?.average_rating ?? 0,
      total: data?.total_ratings ?? 0,
    };
  } catch (error) {
    console.error('Error in getLoopRatingStats:', error);
    return null;
  }
};

/**
 * Delete the current user's rating for a loop
 */
export const deleteRating = async (loopId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('loop_id', loopId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting rating:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteRating:', error);
    return false;
  }
};
