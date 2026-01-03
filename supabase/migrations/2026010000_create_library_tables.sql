-- Migration: Create Loop Library Core Tables
-- Date: 2026-01-00

-- Table: template_creators
CREATE TABLE IF NOT EXISTS template_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  title VARCHAR(255),
  photo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: loop_templates
CREATE TABLE IF NOT EXISTS loop_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES template_creators(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  book_course_title VARCHAR(255) NOT NULL,
  affiliate_link TEXT,
  color VARCHAR(7) DEFAULT '#667eea',
  category VARCHAR(50) DEFAULT 'personal',
  is_featured BOOLEAN DEFAULT FALSE,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: template_tasks
CREATE TABLE IF NOT EXISTS template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES loop_templates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  is_one_time BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_template_usage
CREATE TABLE IF NOT EXISTS user_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES loop_templates(id) ON DELETE CASCADE,
  loop_id UUID REFERENCES loops(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id, loop_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loop_templates_creator ON loop_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_loop_templates_category ON loop_templates(category);
CREATE INDEX IF NOT EXISTS idx_loop_templates_featured ON loop_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_template_tasks_template ON template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_user_template_usage_user ON user_template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_usage_template ON user_template_usage(template_id);

-- RLS
ALTER TABLE template_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE loop_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_usage ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view template creators" ON template_creators;
CREATE POLICY "Anyone can view template creators" ON template_creators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view loop templates" ON loop_templates;
CREATE POLICY "Anyone can view loop templates" ON loop_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view template tasks" ON template_tasks;
CREATE POLICY "Anyone can view template tasks" ON template_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own template usage" ON user_template_usage;
CREATE POLICY "Users can view their own template usage" ON user_template_usage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own template usage" ON user_template_usage;
CREATE POLICY "Users can insert their own template usage" ON user_template_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
