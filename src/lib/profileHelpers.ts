/**
 * Profile Helpers
 * Functions for managing user profiles and fetching collaborator info
 */

import { supabase } from './supabase';

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoopMemberProfile extends UserProfile {
  role: 'owner' | 'sous-chef' | 'viewer';
}

/**
 * Get or create the current user's profile
 */
export async function getOrCreateProfile(): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_or_create_profile');
    if (error) {
      console.error('Error getting profile:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    return null;
  }
}

/**
 * Get profiles of all members in a loop
 */
export async function getLoopMemberProfiles(loopId: string): Promise<LoopMemberProfile[]> {
  try {
    const { data, error } = await supabase.rpc('get_loop_member_profiles', {
      p_loop_id: loopId,
    });
    
    if (error) {
      console.error('Error getting loop member profiles:', error);
      return [];
    }
    
    // Map the out_ prefixed columns to our interface
    return (data || []).map((row: any) => ({
      user_id: row.out_user_id,
      display_name: row.out_display_name,
      avatar_url: row.out_avatar_url,
      role: row.out_role,
    }));
  } catch (error) {
    console.error('Error in getLoopMemberProfiles:', error);
    return [];
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  displayName?: string,
  avatarUrl?: string
): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const updates: Partial<UserProfile> = {
      updated_at: new Date().toISOString(),
    };
    
    if (displayName !== undefined) updates.display_name = displayName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.user.id,
        ...updates,
      });

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return false;
  }
}

/**
 * Get initials from a display name
 */
export function getInitials(displayName: string | null): string {
  if (!displayName) return '?';
  
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get a consistent color based on user ID
 */
export function getAvatarColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CEC9',
  ];
  
  // Simple hash based on user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
}
