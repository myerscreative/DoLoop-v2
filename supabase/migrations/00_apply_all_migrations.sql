-- =====================================================
-- DoLoop Complete Database Schema Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add loop_type column to loops table
ALTER TABLE loops ADD COLUMN IF NOT EXISTS loop_type TEXT DEFAULT 'personal';
ALTER TABLE loops ADD CONSTRAINT IF NOT EXISTS check_loop_type CHECK (loop_type IN ('personal', 'work', 'daily', 'shared'));
CREATE INDEX IF NOT EXISTS idx_loops_loop_type ON loops(loop_type);

-- 1b. Add next_reset_at column to loops table for scheduled resets
ALTER TABLE loops ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMP WITH TIME ZONE;
UPDATE loops 
SET next_reset_at = CASE 
  WHEN reset_rule = 'daily' THEN NOW() + INTERVAL '1 day'
  WHEN reset_rule = 'weekly' THEN NOW() + INTERVAL '7 days'
  ELSE NULL
END
WHERE next_reset_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_loops_next_reset_at ON loops(next_reset_at);

-- 2. Add is_one_time column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT FALSE;
UPDATE tasks SET is_one_time = FALSE WHERE is_one_time IS NULL;
ALTER TABLE tasks ALTER COLUMN is_one_time SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_is_one_time ON tasks(is_one_time);

-- 3. Add archived_tasks table
CREATE TABLE IF NOT EXISTS archived_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_task_id UUID NOT NULL,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add user_streaks table (global user-level streak)
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INT DEFAULT 0 NOT NULL,
  longest_streak INT DEFAULT 0 NOT NULL,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_archived_tasks_loop_id ON archived_tasks(loop_id);
CREATE INDEX IF NOT EXISTS idx_archived_tasks_completed_at ON archived_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- 6. Enable RLS
ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for archived_tasks
DROP POLICY IF EXISTS "Users can view archived tasks from their loops" ON archived_tasks;
CREATE POLICY "Users can view archived tasks from their loops" ON archived_tasks
  FOR SELECT USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert archived tasks for their loops" ON archived_tasks;
CREATE POLICY "Users can insert archived tasks for their loops" ON archived_tasks
  FOR INSERT WITH CHECK (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

-- 8. RLS Policies for user_streaks (global streak)
DROP POLICY IF EXISTS "Users can view own streak" ON user_streaks;
CREATE POLICY "Users can view own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;
CREATE POLICY "Users can update own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify own streak" ON user_streaks;
CREATE POLICY "Users can modify own streak" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. Initialize streaks for existing users
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
SELECT DISTINCT id, 0, 0, NULL, NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Migration Complete!
-- =====================================================

