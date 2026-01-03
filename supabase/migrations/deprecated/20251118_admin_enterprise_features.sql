-- Migration: Admin Enterprise Features
-- Description: Add audit logs, versioning, roles, scheduling, 2FA, A/B testing, notifications, webhooks
-- Date: 2025-11-18

-- ============================================================================
-- PART 1: GRANULAR ROLE-BASED PERMISSIONS
-- ============================================================================

-- Create admin_roles enum type
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM (
    'super_admin',    -- Full access to everything
    'moderator',      -- Can manage templates, reviews, and users
    'analyst',        -- Read-only access to analytics and reports
    'affiliate_manager' -- Can manage affiliates and conversions
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create admin_role_assignments table
CREATE TABLE IF NOT EXISTS admin_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_user ON admin_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_expires ON admin_role_assignments(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE admin_role_assignments ENABLE ROW LEVEL SECURITY;

-- Only super_admins can manage role assignments
CREATE POLICY "Super admins can manage roles"
  ON admin_role_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_role_assignments
      WHERE user_id = auth.uid() AND role = 'super_admin'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================================================
-- PART 2: AUDIT LOG SYSTEM
-- ============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'create_template', 'update_user', 'delete_review'
  resource_type TEXT NOT NULL, -- e.g., 'template', 'user', 'review'
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- PART 3: TEMPLATE VERSIONING SYSTEM
-- ============================================================================

-- Create template_versions table
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES loop_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  duration_minutes INTEGER,
  icon_name TEXT,
  color TEXT,
  is_featured BOOLEAN,
  affiliate_link TEXT,
  tasks JSONB NOT NULL, -- Snapshot of tasks at this version
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_summary TEXT,
  UNIQUE(template_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_template_versions_created ON template_versions(created_at DESC);

-- Enable RLS
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;

-- Anyone can view template versions
CREATE POLICY "Anyone can view template versions"
  ON template_versions FOR SELECT
  USING (true);

-- Only admins can create versions
CREATE POLICY "Admins can create template versions"
  ON template_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- PART 4: CONTENT SCHEDULING & DRAFT/PUBLISH WORKFLOW
-- ============================================================================

-- Add publishing fields to loop_templates
ALTER TABLE loop_templates
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_templates_status ON loop_templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_scheduled ON loop_templates(scheduled_publish_at) WHERE status = 'scheduled';

-- Update existing templates to have published status
UPDATE loop_templates SET status = 'published', published_at = created_at WHERE status IS NULL;

-- ============================================================================
-- PART 5: A/B TESTING FRAMEWORK
-- ============================================================================

-- Create ab_test_experiments table
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID NOT NULL REFERENCES loop_templates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  traffic_split INTEGER DEFAULT 50 CHECK (traffic_split BETWEEN 1 AND 99), -- Percentage for variant
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ab_test_variants table
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL CHECK (variant_type IN ('control', 'variant')),
  title TEXT,
  description TEXT,
  tasks JSONB,
  icon_name TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ab_test_results table
CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'usage', 'completion')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_experiments_template ON ab_test_experiments(template_id);
CREATE INDEX IF NOT EXISTS idx_ab_experiments_status ON ab_test_experiments(status);
CREATE INDEX IF NOT EXISTS idx_ab_variants_experiment ON ab_test_variants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_results_experiment ON ab_test_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_results_variant ON ab_test_results(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_results_event ON ab_test_results(event_type, created_at);

-- Enable RLS
ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- Admins can manage experiments
CREATE POLICY "Admins can manage ab test experiments"
  ON ab_test_experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage ab test variants"
  ON ab_test_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Anyone can log test results
CREATE POLICY "Anyone can log ab test results"
  ON ab_test_results FOR INSERT
  WITH CHECK (true);

-- Admins can view results
CREATE POLICY "Admins can view ab test results"
  ON ab_test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- PART 6: TWO-FACTOR AUTHENTICATION (2FA)
-- ============================================================================

-- Create admin_2fa_settings table
CREATE TABLE IF NOT EXISTS admin_2fa_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  secret TEXT, -- TOTP secret (encrypted)
  backup_codes TEXT[], -- Array of backup codes (encrypted)
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_2fa_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own 2FA settings
CREATE POLICY "Users can manage their own 2FA"
  ON admin_2fa_settings FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- PART 7: EMAIL NOTIFICATION SYSTEM
-- ============================================================================

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_user BOOLEAN DEFAULT true,
  notify_new_template BOOLEAN DEFAULT true,
  notify_new_review BOOLEAN DEFAULT true,
  notify_affiliate_conversion BOOLEAN DEFAULT true,
  notify_system_alerts BOOLEAN DEFAULT true,
  notify_ab_test_complete BOOLEAN DEFAULT true,
  email_digest_frequency TEXT DEFAULT 'daily' CHECK (email_digest_frequency IN ('none', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage notification preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- Admins can view notification queue
CREATE POLICY "Admins can view notification queue"
  ON notification_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- PART 8: WEBHOOK INTEGRATION SYSTEM
-- ============================================================================

-- Create webhook_configurations table
CREATE TABLE IF NOT EXISTS webhook_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT, -- For signature verification
  events TEXT[] NOT NULL, -- Array of event types to trigger on
  active BOOLEAN DEFAULT true,
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhook_configurations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  http_status_code INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_type);

-- Enable RLS
ALTER TABLE webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Admins can manage webhooks
CREATE POLICY "Admins can manage webhooks"
  ON webhook_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view webhook deliveries"
  ON webhook_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- PART 9: ANALYTICS EXTENSIONS
-- ============================================================================

-- Create custom_reports table for report builder
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_config JSONB NOT NULL, -- Stores report configuration
  chart_config JSONB, -- Stores chart visualization settings
  schedule TEXT CHECK (schedule IN ('none', 'daily', 'weekly', 'monthly')),
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_reports_creator ON custom_reports(created_by);

-- Enable RLS
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Admins can manage custom reports
CREATE POLICY "Admins can manage custom reports"
  ON custom_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- PART 10: HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has specific admin role
CREATE OR REPLACE FUNCTION has_admin_role(required_role admin_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_role_assignments
    WHERE user_id = auth.uid()
    AND role = required_role
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION has_any_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_role_assignments
    WHERE user_id = auth.uid()
    AND (expires_at IS NULL OR expires_at > NOW())
  ) OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create template version snapshot
CREATE OR REPLACE FUNCTION create_template_version(
  p_template_id UUID,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_version_id UUID;
  v_version_number INTEGER;
  v_template RECORD;
  v_tasks JSONB;
BEGIN
  -- Get current template data
  SELECT * INTO v_template FROM loop_templates WHERE id = p_template_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Get tasks as JSONB array
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'description', description,
      'order_index', order_index
    ) ORDER BY order_index
  ) INTO v_tasks
  FROM template_tasks
  WHERE template_id = p_template_id;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM template_versions
  WHERE template_id = p_template_id;

  -- Create version
  INSERT INTO template_versions (
    template_id,
    version_number,
    title,
    description,
    category,
    difficulty,
    duration_minutes,
    icon_name,
    color,
    is_featured,
    affiliate_link,
    tasks,
    created_by,
    change_summary
  ) VALUES (
    p_template_id,
    v_version_number,
    v_template.title,
    v_template.description,
    v_template.category,
    v_template.difficulty,
    v_template.duration_minutes,
    v_template.icon_name,
    v_template.color,
    v_template.is_featured,
    v_template.affiliate_link,
    v_tasks,
    auth.uid(),
    p_change_summary
  )
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore template from version
CREATE OR REPLACE FUNCTION restore_template_version(
  p_version_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_version RECORD;
  v_task JSONB;
BEGIN
  -- Check admin permission
  IF NOT has_any_admin_role() THEN
    RAISE EXCEPTION 'Only admins can restore template versions';
  END IF;

  -- Get version data
  SELECT * INTO v_version FROM template_versions WHERE id = p_version_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found';
  END IF;

  -- Update template
  UPDATE loop_templates
  SET
    title = v_version.title,
    description = v_version.description,
    category = v_version.category,
    difficulty = v_version.difficulty,
    duration_minutes = v_version.duration_minutes,
    icon_name = v_version.icon_name,
    color = v_version.color,
    is_featured = v_version.is_featured,
    affiliate_link = v_version.affiliate_link,
    updated_at = NOW()
  WHERE id = v_version.template_id;

  -- Delete existing tasks
  DELETE FROM template_tasks WHERE template_id = v_version.template_id;

  -- Restore tasks from version
  FOR v_task IN SELECT * FROM jsonb_array_elements(v_version.tasks)
  LOOP
    INSERT INTO template_tasks (
      template_id,
      title,
      description,
      order_index
    ) VALUES (
      v_version.template_id,
      v_task->>'title',
      v_task->>'description',
      (v_task->>'order_index')::INTEGER
    );
  END LOOP;

  -- Log the restore
  PERFORM log_audit_event(
    'restore_version',
    'template',
    v_version.template_id,
    NULL,
    jsonb_build_object('version_id', p_version_id, 'version_number', v_version.version_number)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue notification
CREATE OR REPLACE FUNCTION queue_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_subject TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
BEGIN
  -- Check user's notification preferences
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Check if this notification type is enabled
  IF v_preferences IS NULL OR (
    (p_notification_type = 'new_user' AND v_preferences.notify_new_user) OR
    (p_notification_type = 'new_template' AND v_preferences.notify_new_template) OR
    (p_notification_type = 'new_review' AND v_preferences.notify_new_review) OR
    (p_notification_type = 'affiliate_conversion' AND v_preferences.notify_affiliate_conversion) OR
    (p_notification_type = 'system_alert' AND v_preferences.notify_system_alerts) OR
    (p_notification_type = 'ab_test_complete' AND v_preferences.notify_ab_test_complete)
  ) THEN
    INSERT INTO notification_queue (
      user_id,
      notification_type,
      subject,
      body,
      data
    ) VALUES (
      p_user_id,
      p_notification_type,
      p_subject,
      p_body,
      p_data
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger webhook
CREATE OR REPLACE FUNCTION trigger_webhook(
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_webhook RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Find all active webhooks that listen for this event
  FOR v_webhook IN
    SELECT * FROM webhook_configurations
    WHERE active = true
    AND p_event_type = ANY(events)
  LOOP
    -- Queue webhook delivery
    INSERT INTO webhook_deliveries (
      webhook_id,
      event_type,
      payload
    ) VALUES (
      v_webhook.id,
      p_event_type,
      p_payload
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish scheduled templates
CREATE OR REPLACE FUNCTION publish_scheduled_templates()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_template RECORD;
BEGIN
  -- Find templates scheduled for publication
  FOR v_template IN
    SELECT id FROM loop_templates
    WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW()
  LOOP
    UPDATE loop_templates
    SET
      status = 'published',
      published_at = NOW(),
      scheduled_publish_at = NULL
    WHERE id = v_template.id;

    -- Trigger webhook
    PERFORM trigger_webhook(
      'template_published',
      jsonb_build_object('template_id', v_template.id)
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 11: INITIALIZE DEFAULT DATA
-- ============================================================================

-- Create default notification preferences for existing admin users
INSERT INTO notification_preferences (user_id)
SELECT id FROM user_profiles WHERE is_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
