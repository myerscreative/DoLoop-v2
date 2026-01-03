/**
 * Invitation Helpers
 * Functions for managing loop invitations
 */

import { supabase } from './supabase';

export interface LoopInvitation {
  id: string;
  loop_id: string;
  invited_by: string;
  invitee_email: string;
  role: 'sous-chef' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  // Joined data
  loop?: {
    name: string;
    color: string;
  };
}

/**
 * Send an invitation to join a loop
 */
export async function sendInvitation(
  loopId: string,
  inviteeEmail: string,
  role: 'sous-chef' | 'viewer' = 'sous-chef'
): Promise<{ success: boolean; error?: string; invitation?: LoopInvitation }> {
  try {
    // Get current user
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create invitation (RLS will handle ownership check)
    const { data: invitation, error } = await supabase
      .from('loop_invitations')
      .insert({
        loop_id: loopId,
        invited_by: user.user.id,
        invitee_email: inviteeEmail.toLowerCase().trim(),
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { success: false, error: 'An invitation is already pending for this email' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, invitation };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

/**
 * Get pending invitations sent to the current user
 */
export async function getMyInvitations(): Promise<LoopInvitation[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.email) return [];

    // Query without joining auth.users (not accessible via REST)
    const { data, error } = await supabase
      .from('loop_invitations')
      .select(`
        *,
        loop:loop_id (name, color)
      `)
      .eq('invitee_email', user.user.email.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting invitations:', error);
    return [];
  }
}

/**
 * Get pending invitations for a loop (for owners)
 */
export async function getLoopInvitations(loopId: string): Promise<LoopInvitation[]> {
  try {
    const { data, error } = await supabase
      .from('loop_invitations')
      .select('*')
      .eq('loop_id', loopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loop invitations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting loop invitations:', error);
    return [];
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('accept_invitation', {
      invitation_id: invitationId,
    });

    if (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
}

/**
 * Decline an invitation
 */
export async function declineInvitation(invitationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('decline_invitation', {
      invitation_id: invitationId,
    });

    if (error) {
      console.error('Error declining invitation:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error declining invitation:', error);
    return false;
  }
}

/**
 * Cancel/revoke an invitation (for loop owners)
 */
export async function cancelInvitation(invitationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('loop_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error('Error canceling invitation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return false;
  }
}
