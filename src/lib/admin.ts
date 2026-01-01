/**
 * Admin Utilities
 * Helper functions for admin operations
 */

import { supabase } from './supabase';
import { LoopTemplate, TemplateCreator, TemplateTask } from '../types/loop';

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
}

/**
 * Track an affiliate link click
 */
export async function trackAffiliateClick(
  templateId: string,
  affiliateLink: string
): Promise<void> {
  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    // Call the database function to track the click
    const { error } = await supabase.rpc('track_affiliate_click', {
      p_template_id: templateId,
      p_user_agent: userAgent,
      p_referrer: referrer,
    });

    if (error) {
      console.error('Error tracking affiliate click:', error);
    }

    // Open the affiliate link
    if (typeof window !== 'undefined') {
      window.open(affiliateLink, '_blank');
    }
  } catch (error) {
    console.error('Error in trackAffiliateClick:', error);
  }
}

/**
 * Admin Analytics Types
 */
export interface DashboardStats {
  total_users: number;
  new_users_30d: number;
  total_loops: number;
  total_templates: number;
  total_affiliate_clicks: number;
  total_conversions: number;
  total_revenue: number;
}

export interface TemplatePerformance {
  id: string;
  title: string;
  creator_id: string;
  creator_name: string;
  category: string;
  popularity_score: number;
  average_rating: number;
  review_count: number;
  total_uses: number;
  affiliate_clicks: number;
  affiliate_conversions: number;
  affiliate_revenue: number;
  created_at: string;
}

export interface UserSummary {
  id: string;
  email: string;
  created_at: string;
  theme_vibe: string;
  is_admin: boolean;
  loop_count: number;
  task_count: number;
  templates_used: number;
  last_activity: string | null;
}

/**
 * Fetch admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<DashboardStats | null> {
  try {
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getAdminDashboardStats:', error);
    return null;
  }
}

/**
 * Fetch template performance metrics
 */
export async function getTemplatePerformance(): Promise<TemplatePerformance[]> {
  try {
    const { data, error } = await supabase
      .from('admin_template_performance')
      .select('*');

    if (error) {
      console.error('Error fetching template performance:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTemplatePerformance:', error);
    return [];
  }
}

/**
 * Fetch user summary for admin user management
 */
export async function getUserSummary(): Promise<UserSummary[]> {
  try {
    const { data, error } = await supabase
      .from('admin_user_summary')
      .select('*');

    if (error) {
      console.error('Error fetching user summary:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserSummary:', error);
    return [];
  }
}

/**
 * TEMPLATE CREATOR MANAGEMENT
 */

export async function createTemplateCreator(
  creator: Omit<TemplateCreator, 'id' | 'created_at' | 'updated_at'>
): Promise<TemplateCreator | null> {
  try {
    const { data, error } = await supabase
      .from('template_creators')
      .insert([creator])
      .select()
      .single();

    if (error) {
      console.error('Error creating template creator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTemplateCreator:', error);
    throw error;
  }
}

export async function updateTemplateCreator(
  id: string,
  updates: Partial<Omit<TemplateCreator, 'id' | 'created_at' | 'updated_at'>>
): Promise<TemplateCreator | null> {
  try {
    const { data, error } = await supabase
      .from('template_creators')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template creator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTemplateCreator:', error);
    throw error;
  }
}

export async function deleteTemplateCreator(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('template_creators')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template creator:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTemplateCreator:', error);
    throw error;
  }
}

export async function getAllTemplateCreators(): Promise<TemplateCreator[]> {
  try {
    const { data, error } = await supabase
      .from('template_creators')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching template creators:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllTemplateCreators:', error);
    return [];
  }
}

/**
 * LOOP TEMPLATE MANAGEMENT
 */

export interface CreateLoopTemplateInput {
  creator_id: string;
  title: string;
  description: string;
  book_course_title: string;
  affiliate_link?: string;
  color?: string;
  category?: string;
  is_featured?: boolean;
}

export async function createLoopTemplate(
  template: CreateLoopTemplateInput,
  tasks: Array<{ description: string; is_recurring?: boolean; is_one_time?: boolean; display_order: number }>
): Promise<LoopTemplate | null> {
  try {
    // Insert the template
    const { data: templateData, error: templateError } = await supabase
      .from('loop_templates')
      .insert([{
        ...template,
        color: template.color || '#667eea',
        category: template.category || 'personal',
        is_featured: template.is_featured || false,
      }])
      .select()
      .single();

    if (templateError) {
      console.error('Error creating loop template:', templateError);
      throw templateError;
    }

    // Insert the tasks
    if (tasks.length > 0) {
      const tasksToInsert = tasks.map(task => ({
        template_id: templateData.id,
        description: task.description,
        is_recurring: task.is_recurring ?? true,
        is_one_time: task.is_one_time ?? false,
        display_order: task.display_order,
      }));

      const { error: tasksError } = await supabase
        .from('template_tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Error creating template tasks:', tasksError);
        // Rollback: delete the template
        await supabase.from('loop_templates').delete().eq('id', templateData.id);
        throw tasksError;
      }
    }

    return templateData;
  } catch (error) {
    console.error('Error in createLoopTemplate:', error);
    throw error;
  }
}

export async function updateLoopTemplate(
  id: string,
  updates: Partial<Omit<LoopTemplate, 'id' | 'created_at' | 'updated_at' | 'popularity_score' | 'average_rating' | 'review_count'>>
): Promise<LoopTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('loop_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating loop template:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateLoopTemplate:', error);
    throw error;
  }
}

export async function deleteLoopTemplate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('loop_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting loop template:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteLoopTemplate:', error);
    throw error;
  }
}

/**
 * TEMPLATE TASK MANAGEMENT
 */

export async function createTemplateTask(
  task: Omit<TemplateTask, 'id' | 'created_at'>
): Promise<TemplateTask | null> {
  try {
    const { data, error } = await supabase
      .from('template_tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Error creating template task:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTemplateTask:', error);
    throw error;
  }
}

export async function updateTemplateTask(
  id: string,
  updates: Partial<Omit<TemplateTask, 'id' | 'created_at'>>
): Promise<TemplateTask | null> {
  try {
    const { data, error } = await supabase
      .from('template_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template task:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTemplateTask:', error);
    throw error;
  }
}

export async function deleteTemplateTask(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('template_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template task:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTemplateTask:', error);
    throw error;
  }
}

export async function getTemplateTasks(templateId: string): Promise<TemplateTask[]> {
  try {
    const { data, error } = await supabase
      .from('template_tasks')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order');

    if (error) {
      console.error('Error fetching template tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTemplateTasks:', error);
    return [];
  }
}

/**
 * AFFILIATE CONVERSION TRACKING
 */

export interface AffiliateClick {
  id: string;
  template_id: string;
  user_id: string | null;
  clicked_at: string;
  user_agent: string | null;
  ip_address: string | null;
  referrer: string | null;
  converted: boolean;
  conversion_date: string | null;
  conversion_amount: number | null;
  template_title?: string;
  user_email?: string;
}

export async function getUnconvertedClicks(): Promise<AffiliateClick[]> {
  try {
    const { data, error } = await (supabase
      .from('affiliate_clicks')
      .select(`
        *,
        loop_templates!inner(title)
      `) as any)
      .eq('converted', false)
      .order('clicked_at', { ascending: false });

    if (error) {
      console.error('Error fetching unconverted clicks:', error);
      return [];
    }

    return data?.map((click: any) => ({
      ...click,
      template_title: click.loop_templates?.title,
      user_email: click.users?.email || 'Anonymous',
    })) || [];
  } catch (error) {
    console.error('Error in getUnconvertedClicks:', error);
    return [];
  }
}

export async function getAllAffiliateClicks(): Promise<AffiliateClick[]> {
  try {
    const { data, error } = await (supabase
      .from('affiliate_clicks')
      .select(`
        *,
        loop_templates!inner(title)
      `) as any)
      .order('clicked_at', { ascending: false })
      .limit(1000); // Limit for performance

    if (error) {
      console.error('Error fetching affiliate clicks:', error);
      return [];
    }

    return data?.map((click: any) => ({
      ...click,
      template_title: click.loop_templates?.title,
      user_email: click.users?.email || 'Anonymous',
    })) || [];
  } catch (error) {
    console.error('Error in getAllAffiliateClicks:', error);
    return [];
  }
}

/**
 * Mark an affiliate conversion (admin only)
 */
export async function markAffiliateConversion(
  clickId: string,
  conversionAmount?: number
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('mark_affiliate_conversion', {
      p_click_id: clickId,
      p_conversion_amount: conversionAmount,
    });

    if (error) {
      console.error('Error marking affiliate conversion:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in markAffiliateConversion:', error);
    throw error;
  }
}

/**
 * Toggle admin status for a user (super admin only)
 */
export async function toggleUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling admin status:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in toggleUserAdminStatus:', error);
    throw error;
  }
}

/**
 * TEMPLATE REVIEWS MANAGEMENT
 */

export interface TemplateReview {
  id: string;
  template_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  template_title?: string;
}

export async function getAllTemplateReviews(): Promise<TemplateReview[]> {
  try {
    const { data, error } = await (supabase
      .from('template_reviews')
      .select(`
        *,
        loop_templates!inner(title)
      `) as any)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching template reviews:', error);
      return [];
    }

    return data?.map((review: any) => ({
      ...review,
      user_email: review.users?.email,
      template_title: review.loop_templates?.title,
    })) || [];
  } catch (error) {
    console.error('Error in getAllTemplateReviews:', error);
    return [];
  }
}

export async function updateTemplateReview(
  id: string,
  updates: Partial<Pick<TemplateReview, 'rating' | 'review_text'>>
): Promise<TemplateReview | null> {
  try {
    const { data, error } = await supabase
      .from('template_reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTemplateReview:', error);
    throw error;
  }
}

export async function deleteTemplateReview(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('template_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template review:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTemplateReview:', error);
    throw error;
  }
}

export async function getReviewsForTemplate(templateId: string): Promise<TemplateReview[]> {
  try {
    const { data, error } = await (supabase
      .from('template_reviews')
      .select('*') as any)
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews for template:', error);
      return [];
    }

    return data?.map((review: any) => ({
      ...review,
      user_email: review.users?.email,
    })) || [];
  } catch (error) {
    console.error('Error in getReviewsForTemplate:', error);
    return [];
  }
}

/**
 * TEMPLATE GROUP MANAGEMENT
 */

export interface TemplateGroup {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function getAllTemplateGroups(): Promise<TemplateGroup[]> {
  try {
    const { data, error } = await supabase
      .from('template_groups')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching template groups:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllTemplateGroups:', error);
    return [];
  }
}

export async function createTemplateGroup(
  group: Omit<TemplateGroup, 'id' | 'created_at' | 'updated_at'>
): Promise<TemplateGroup | null> {
  try {
    const { data, error } = await supabase
      .from('template_groups')
      .insert([group])
      .select()
      .single();

    if (error) {
      console.error('Error creating template group:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTemplateGroup:', error);
    throw error;
  }
}

export async function updateTemplateGroup(
  id: string,
  updates: Partial<Omit<TemplateGroup, 'id' | 'created_at' | 'updated_at'>>
): Promise<TemplateGroup | null> {
  try {
    const { data, error } = await supabase
      .from('template_groups')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template group:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTemplateGroup:', error);
    throw error;
  }
}

export async function deleteTemplateGroup(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('template_groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template group:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTemplateGroup:', error);
    throw error;
  }
}

export async function assignTemplateToGroup(templateId: string, groupId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('assign_template_to_group', {
      p_template_id: templateId,
      p_group_id: groupId,
    });

    if (error) {
      console.error('Error assigning template to group:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in assignTemplateToGroup:', error);
    throw error;
  }
}

export async function unassignTemplateFromGroup(templateId: string, groupId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('unassign_template_from_group', {
      p_template_id: templateId,
      p_group_id: groupId,
    });

    if (error) {
      console.error('Error unassigning template from group:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in unassignTemplateFromGroup:', error);
    throw error;
  }
}

export async function getGroupsForTemplate(templateId: string): Promise<TemplateGroup[]> {
  try {
    const { data, error } = await supabase.rpc('get_groups_for_template', {
      p_template_id: templateId,
    });

    if (error) {
      console.error('Error fetching groups for template:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGroupsForTemplate:', error);
    return [];
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - AUDIT LOGS
 * ============================================================================
 */

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
}

export async function getAuditLogs(params?: {
  userId?: string;
  action?: string;
  resourceType?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  try {
    let query = (supabase
      .from('audit_logs')
      .select('*, user_id') as any)
      .order('created_at', { ascending: false });

    if (params?.userId) {
      query = query.eq('user_id', params.userId);
    }
    if (params?.action) {
      query = query.eq('action', params.action);
    }
    if (params?.resourceType) {
      query = query.eq('resource_type', params.resourceType);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    } else {
      query = query.limit(500);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data?.map((log: any) => ({
      ...log,
      user_email: log.user?.email || 'System',
    })) || [];
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return [];
  }
}

export async function logAuditEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('log_audit_event', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_old_values: oldValues,
      p_new_values: newValues,
    });

    if (error) {
      console.error('Error logging audit event:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in logAuditEvent:', error);
    return null;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - ROLE-BASED PERMISSIONS
 * ============================================================================
 */

export type AdminRole = 'super_admin' | 'moderator' | 'analyst' | 'affiliate_manager';

export interface AdminRoleAssignment {
  id: string;
  user_id: string;
  role: AdminRole;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  user_email?: string;
  granted_by_email?: string;
}

export async function getUserRoles(userId: string): Promise<AdminRole[]> {
  try {
    const { data, error } = await supabase
      .from('admin_role_assignments')
      .select('role')
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.map((item: any) => item.role) || [];
  } catch (error) {
    console.error('Error in getUserRoles:', error);
    return [];
  }
}

export async function getAllRoleAssignments(): Promise<AdminRoleAssignment[]> {
  try {
    const { data, error } = await (supabase
      .from('admin_role_assignments')
      .select(`
        *,
        user_id,
        granted_by
      `) as any)
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('Error fetching role assignments:', error);
      return [];
    }

    return data?.map((assignment: any) => ({
      ...assignment,
      user_email: assignment.user?.email,
      granted_by_email: assignment.granter?.email,
    })) || [];
  } catch (error) {
    console.error('Error in getAllRoleAssignments:', error);
    return [];
  }
}

export async function grantAdminRole(
  userId: string,
  role: AdminRole,
  expiresAt?: Date
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_role_assignments')
      .insert([{
        user_id: userId,
        role,
        expires_at: expiresAt?.toISOString(),
      }]);

    if (error) {
      console.error('Error granting admin role:', error);
      throw error;
    }

    await logAuditEvent('grant_role', 'user', userId, null, { role, expires_at: expiresAt });
    return true;
  } catch (error) {
    console.error('Error in grantAdminRole:', error);
    throw error;
  }
}

export async function revokeAdminRole(userId: string, role: AdminRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_role_assignments')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      console.error('Error revoking admin role:', error);
      throw error;
    }

    await logAuditEvent('revoke_role', 'user', userId, { role }, null);
    return true;
  } catch (error) {
    console.error('Error in revokeAdminRole:', error);
    throw error;
  }
}

export async function hasAdminRole(role: AdminRole): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_admin_role', {
      required_role: role,
    });

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in hasAdminRole:', error);
    return false;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - TEMPLATE VERSIONING
 * ============================================================================
 */

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  icon_name: string;
  color: string;
  is_featured: boolean;
  affiliate_link: string;
  tasks: any;
  created_by: string | null;
  created_at: string;
  change_summary: string | null;
  created_by_email?: string;
}

export async function getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
  try {
    const { data, error } = await (supabase
      .from('template_versions')
      .select('*') as any)
      .eq('template_id', templateId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching template versions:', error);
      return [];
    }

    return data?.map((version: any) => ({
      ...version,
      created_by_email: version.creator?.email,
    })) || [];
  } catch (error) {
    console.error('Error in getTemplateVersions:', error);
    return [];
  }
}

export async function createTemplateVersion(
  templateId: string,
  changeSummary?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('create_template_version', {
      p_template_id: templateId,
      p_change_summary: changeSummary,
    });

    if (error) {
      console.error('Error creating template version:', error);
      throw error;
    }

    await logAuditEvent('create_version', 'template', templateId, null, { change_summary: changeSummary });
    return data;
  } catch (error) {
    console.error('Error in createTemplateVersion:', error);
    throw error;
  }
}

export async function restoreTemplateVersion(versionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('restore_template_version', {
      p_version_id: versionId,
    });

    if (error) {
      console.error('Error restoring template version:', error);
      throw error;
    }

    return data || false;
  } catch (error) {
    console.error('Error in restoreTemplateVersion:', error);
    throw error;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - CONTENT SCHEDULING
 * ============================================================================
 */

export type TemplateStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export async function updateTemplateStatus(
  templateId: string,
  status: TemplateStatus,
  scheduledPublishAt?: Date
): Promise<boolean> {
  try {
    const updates: any = { status };

    if (status === 'scheduled' && scheduledPublishAt) {
      updates.scheduled_publish_at = scheduledPublishAt.toISOString();
    } else if (status === 'published') {
      updates.published_at = new Date().toISOString();
      updates.scheduled_publish_at = null;
    } else if (status === 'archived') {
      updates.archived_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('loop_templates')
      .update(updates)
      .eq('id', templateId);

    if (error) {
      console.error('Error updating template status:', error);
      throw error;
    }

    await logAuditEvent('update_status', 'template', templateId, null, { status, scheduled_publish_at: scheduledPublishAt });
    return true;
  } catch (error) {
    console.error('Error in updateTemplateStatus:', error);
    throw error;
  }
}

export async function publishScheduledTemplates(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('publish_scheduled_templates');

    if (error) {
      console.error('Error publishing scheduled templates:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in publishScheduledTemplates:', error);
    return 0;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - A/B TESTING
 * ============================================================================
 */

export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed';
export type ABTestVariantType = 'control' | 'variant';
export type ABTestEventType = 'impression' | 'click' | 'usage' | 'completion';

export interface ABTestExperiment {
  id: string;
  name: string;
  description: string | null;
  template_id: string;
  status: ABTestStatus;
  start_date: string | null;
  end_date: string | null;
  traffic_split: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ABTestVariant {
  id: string;
  experiment_id: string;
  variant_type: ABTestVariantType;
  title: string | null;
  description: string | null;
  tasks: any;
  icon_name: string | null;
  color: string | null;
  created_at: string;
}

export interface ABTestResult {
  variant_type: ABTestVariantType;
  impressions: number;
  clicks: number;
  usages: number;
  completions: number;
  click_rate: number;
  usage_rate: number;
  completion_rate: number;
}

export async function getABTestExperiments(templateId?: string): Promise<ABTestExperiment[]> {
  try {
    let query = supabase
      .from('ab_test_experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching AB test experiments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getABTestExperiments:', error);
    return [];
  }
}

export async function createABTestExperiment(
  experiment: Omit<ABTestExperiment, 'id' | 'created_at' | 'updated_at'>
): Promise<ABTestExperiment | null> {
  try {
    const { data, error } = await supabase
      .from('ab_test_experiments')
      .insert([experiment])
      .select()
      .single();

    if (error) {
      console.error('Error creating AB test experiment:', error);
      throw error;
    }

    await logAuditEvent('create_ab_test', 'ab_test_experiment', data.id, null, experiment);
    return data;
  } catch (error) {
    console.error('Error in createABTestExperiment:', error);
    throw error;
  }
}

export async function updateABTestExperiment(
  id: string,
  updates: Partial<Omit<ABTestExperiment, 'id' | 'created_at' | 'updated_at'>>
): Promise<ABTestExperiment | null> {
  try {
    const { data, error } = await supabase
      .from('ab_test_experiments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating AB test experiment:', error);
      throw error;
    }

    await logAuditEvent('update_ab_test', 'ab_test_experiment', id, null, updates);
    return data;
  } catch (error) {
    console.error('Error in updateABTestExperiment:', error);
    throw error;
  }
}

export async function createABTestVariant(
  variant: Omit<ABTestVariant, 'id' | 'created_at'>
): Promise<ABTestVariant | null> {
  try {
    const { data, error } = await supabase
      .from('ab_test_variants')
      .insert([variant])
      .select()
      .single();

    if (error) {
      console.error('Error creating AB test variant:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createABTestVariant:', error);
    throw error;
  }
}

export async function getABTestVariants(experimentId: string): Promise<ABTestVariant[]> {
  try {
    const { data, error } = await supabase
      .from('ab_test_variants')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('variant_type');

    if (error) {
      console.error('Error fetching AB test variants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getABTestVariants:', error);
    return [];
  }
}

export async function logABTestEvent(
  experimentId: string,
  variantId: string,
  eventType: ABTestEventType,
  eventData?: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ab_test_results')
      .insert([{
        experiment_id: experimentId,
        variant_id: variantId,
        event_type: eventType,
        event_data: eventData,
      }]);

    if (error) {
      console.error('Error logging AB test event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logABTestEvent:', error);
    return false;
  }
}

export async function getABTestResults(experimentId: string): Promise<ABTestResult[]> {
  try {
    const { data, error } = await supabase
      .from('ab_test_results')
      .select(`
        variant_id,
        event_type,
        ab_test_variants!inner(variant_type)
      `)
      .eq('experiment_id', experimentId);

    if (error) {
      console.error('Error fetching AB test results:', error);
      return [];
    }

    // Aggregate results by variant type
    const resultsByVariant = new Map<ABTestVariantType, any>();

    data?.forEach(result => {
      const variantType = (result.ab_test_variants as any).variant_type;
      if (!resultsByVariant.has(variantType)) {
        resultsByVariant.set(variantType, {
          variant_type: variantType,
          impressions: 0,
          clicks: 0,
          usages: 0,
          completions: 0,
        });
      }

      const stats = resultsByVariant.get(variantType);
      if (result.event_type === 'impression') stats.impressions++;
      if (result.event_type === 'click') stats.clicks++;
      if (result.event_type === 'usage') stats.usages++;
      if (result.event_type === 'completion') stats.completions++;
    });

    // Calculate rates
    return Array.from(resultsByVariant.values()).map(stats => ({
      ...stats,
      click_rate: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      usage_rate: stats.clicks > 0 ? (stats.usages / stats.clicks) * 100 : 0,
      completion_rate: stats.usages > 0 ? (stats.completions / stats.usages) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error in getABTestResults:', error);
    return [];
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - TWO-FACTOR AUTHENTICATION
 * ============================================================================
 */

export interface Admin2FASettings {
  user_id: string;
  enabled: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function get2FASettings(userId: string): Promise<Admin2FASettings | null> {
  try {
    const { data, error } = await supabase
      .from('admin_2fa_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching 2FA settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in get2FASettings:', error);
    return null;
  }
}

export async function enable2FA(secret: string, backupCodes: string[]): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('admin_2fa_settings')
      .upsert([{
        user_id: user.id,
        enabled: true,
        secret,
        backup_codes: backupCodes,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }

    await logAuditEvent('enable_2fa', 'user', user.id, null, { enabled: true });
    return true;
  } catch (error) {
    console.error('Error in enable2FA:', error);
    throw error;
  }
}

export async function disable2FA(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('admin_2fa_settings')
      .update({
        enabled: false,
        secret: null,
        backup_codes: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }

    await logAuditEvent('disable_2fa', 'user', user.id, { enabled: true }, { enabled: false });
    return true;
  } catch (error) {
    console.error('Error in disable2FA:', error);
    throw error;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - NOTIFICATION SYSTEM
 * ============================================================================
 */

export interface NotificationPreferences {
  user_id: string;
  notify_new_user: boolean;
  notify_new_template: boolean;
  notify_new_review: boolean;
  notify_affiliate_conversion: boolean;
  notify_system_alerts: boolean;
  notify_ab_test_complete: boolean;
  email_digest_frequency: 'none' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface NotificationQueueItem {
  id: string;
  user_id: string;
  notification_type: string;
  subject: string;
  body: string;
  data: any;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  last_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getNotificationPreferences:', error);
    return null;
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert([{
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error);
    throw error;
  }
}

export async function getNotificationQueue(params?: {
  status?: 'pending' | 'sent' | 'failed';
  limit?: number;
}): Promise<NotificationQueueItem[]> {
  try {
    let query = supabase
      .from('notification_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notification queue:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNotificationQueue:', error);
    return [];
  }
}

export async function queueNotification(
  userId: string,
  notificationType: string,
  subject: string,
  body: string,
  data?: any
): Promise<string | null> {
  try {
    const { data: result, error } = await supabase.rpc('queue_notification', {
      p_user_id: userId,
      p_notification_type: notificationType,
      p_subject: subject,
      p_body: body,
      p_data: data,
    });

    if (error) {
      console.error('Error queueing notification:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error in queueNotification:', error);
    return null;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - WEBHOOK SYSTEM
 * ============================================================================
 */

export interface WebhookConfiguration {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  active: boolean;
  retry_attempts: number;
  timeout_seconds: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  http_status_code: number | null;
  response_body: string | null;
  attempts: number;
  last_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
  delivered_at: string | null;
}

export async function getWebhookConfigurations(): Promise<WebhookConfiguration[]> {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching webhook configurations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWebhookConfigurations:', error);
    return [];
  }
}

export async function createWebhookConfiguration(
  webhook: Omit<WebhookConfiguration, 'id' | 'created_at' | 'updated_at'>
): Promise<WebhookConfiguration | null> {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert([webhook])
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook configuration:', error);
      throw error;
    }

    await logAuditEvent('create_webhook', 'webhook', data.id, null, webhook);
    return data;
  } catch (error) {
    console.error('Error in createWebhookConfiguration:', error);
    throw error;
  }
}

export async function updateWebhookConfiguration(
  id: string,
  updates: Partial<Omit<WebhookConfiguration, 'id' | 'created_at' | 'updated_at'>>
): Promise<WebhookConfiguration | null> {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating webhook configuration:', error);
      throw error;
    }

    await logAuditEvent('update_webhook', 'webhook', id, null, updates);
    return data;
  } catch (error) {
    console.error('Error in updateWebhookConfiguration:', error);
    throw error;
  }
}

export async function deleteWebhookConfiguration(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('webhook_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting webhook configuration:', error);
      throw error;
    }

    await logAuditEvent('delete_webhook', 'webhook', id, null, null);
    return true;
  } catch (error) {
    console.error('Error in deleteWebhookConfiguration:', error);
    throw error;
  }
}

export async function getWebhookDeliveries(webhookId?: string, limit = 100): Promise<WebhookDelivery[]> {
  try {
    let query = supabase
      .from('webhook_deliveries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (webhookId) {
      query = query.eq('webhook_id', webhookId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching webhook deliveries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWebhookDeliveries:', error);
    return [];
  }
}

export async function triggerWebhook(eventType: string, payload: any): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('trigger_webhook', {
      p_event_type: eventType,
      p_payload: payload,
    });

    if (error) {
      console.error('Error triggering webhook:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in triggerWebhook:', error);
    return 0;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - CUSTOM REPORTS
 * ============================================================================
 */

export interface CustomReport {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  query_config: any;
  chart_config: any;
  schedule: 'none' | 'daily' | 'weekly' | 'monthly';
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCustomReports(): Promise<CustomReport[]> {
  try {
    const { data, error } = await supabase
      .from('custom_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom reports:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCustomReports:', error);
    return [];
  }
}

export async function createCustomReport(
  report: Omit<CustomReport, 'id' | 'created_at' | 'updated_at' | 'last_run_at'>
): Promise<CustomReport | null> {
  try {
    const { data, error } = await supabase
      .from('custom_reports')
      .insert([report])
      .select()
      .single();

    if (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }

    await logAuditEvent('create_report', 'custom_report', data.id, null, report);
    return data;
  } catch (error) {
    console.error('Error in createCustomReport:', error);
    throw error;
  }
}

export async function updateCustomReport(
  id: string,
  updates: Partial<Omit<CustomReport, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
): Promise<CustomReport | null> {
  try {
    const { data, error } = await supabase
      .from('custom_reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom report:', error);
      throw error;
    }

    await logAuditEvent('update_report', 'custom_report', id, null, updates);
    return data;
  } catch (error) {
    console.error('Error in updateCustomReport:', error);
    throw error;
  }
}

export async function deleteCustomReport(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('custom_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom report:', error);
      throw error;
    }

    await logAuditEvent('delete_report', 'custom_report', id, null, null);
    return true;
  } catch (error) {
    console.error('Error in deleteCustomReport:', error);
    throw error;
  }
}

/**
 * ============================================================================
 * ENTERPRISE FEATURES - BULK OPERATIONS & EXPORT
 * ============================================================================
 */

export async function exportTemplatesToCSV(): Promise<string> {
  try {
    const { data: templates, error } = await supabase
      .from('loop_templates')
      .select(`
        *,
        template_creators(name),
        template_tasks(*)
      `);

    if (error) throw error;

    // Convert to CSV format
    const headers = ['ID', 'Title', 'Creator', 'Category', 'Status', 'Rating', 'Reviews', 'Created'];
    const rows = templates?.map(t => [
      t.id,
      t.title,
      t.template_creators?.name || '',
      t.category,
      t.status || 'published',
      t.average_rating || 0,
      t.review_count || 0,
      new Date(t.created_at).toLocaleDateString(),
    ]) || [];

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting templates to CSV:', error);
    throw error;
  }
}

export async function exportUsersToCSV(): Promise<string> {
  try {
    const users = await getUserSummary();

    const headers = ['ID', 'Email', 'Created', 'Admin', 'Loops', 'Tasks', 'Templates Used', 'Last Activity'];
    const rows = users.map(u => [
      u.id,
      u.email,
      new Date(u.created_at).toLocaleDateString(),
      u.is_admin ? 'Yes' : 'No',
      u.loop_count,
      u.task_count,
      u.templates_used,
      u.last_activity ? new Date(u.last_activity).toLocaleDateString() : 'Never',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting users to CSV:', error);
    throw error;
  }
}

export async function exportAuditLogsToCSV(params?: {
  userId?: string;
  action?: string;
  resourceType?: string;
  limit?: number;
}): Promise<string> {
  try {
    const logs = await getAuditLogs(params);

    const headers = ['ID', 'User', 'Action', 'Resource Type', 'Resource ID', 'Created'];
    const rows = logs.map(log => [
      log.id,
      log.user_email || 'System',
      log.action,
      log.resource_type,
      log.resource_id || '',
      new Date(log.created_at).toLocaleString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    throw error;
  }
}

export function downloadCSV(csv: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Import templates from CSV
 * CSV format: title,description,creator_name,category,difficulty,duration_minutes,task1,task2,task3,...
 */
export async function importTemplatesFromCSV(csvContent: string): Promise<{ success: number; errors: string[] }> {
  const results = { success: 0, errors: [] as string[] };

  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Find or create creator
        let creator = (await getAllTemplateCreators()).find(c => c.name === row.creator_name);
        if (!creator) {
          const newCreator = await createTemplateCreator({
            name: row.creator_name,
            bio: '',
            photo_url: undefined,
            website: null,
            twitter: null,
            instagram: null,
          });
          if (newCreator) creator = newCreator;
        }

        if (!creator) {
          results.errors.push(`Row ${i + 1}: Could not create creator ${row.creator_name}`);
          continue;
        }

        // Extract tasks (columns after duration_minutes)
        const taskColumns = headers.slice(6); // Assuming first 6 are template fields
        const tasks = taskColumns
          .map((col, idx) => ({
            description: values[6 + idx],
            is_recurring: true,
            is_one_time: false,
            display_order: idx,
          }))
          .filter(t => t.description);

        // Create template
        await createLoopTemplate({
          creator_id: creator.id,
          title: row.title,
          description: row.description,
          book_course_title: row.title,
          category: row.category || 'personal',
          color: '#667eea',
          is_featured: false,
        }, tasks);

        results.success++;
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    await logAuditEvent('import_templates_csv', 'template', undefined, undefined, { success: results.success, errors: results.errors.length });
  } catch (error: any) {
    results.errors.push(`CSV parsing error: ${error.message}`);
  }

  return results;
}
