-- =====================================================
-- DoLoop Complete Database Schema - Initial Setup
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create loops table
CREATE TABLE IF NOT EXISTS loops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#FF6B6B',
  reset_rule TEXT DEFAULT 'daily' CHECK (reset_rule IN ('daily', 'weekly', 'monthly', 'never')),
  next_reset_at TIMESTAMP WITH TIME ZONE,
  loop_type TEXT DEFAULT 'personal' CHECK (loop_type IN ('personal', 'work', 'daily', 'shared')),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_one_time BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create archived_tasks table
CREATE TABLE IF NOT EXISTS archived_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_task_id UUID NOT NULL,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_streaks table (global user-level streak)
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Create loop_members table (for shared loops)
CREATE TABLE IF NOT EXISTS loop_members (
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (loop_id, user_id)
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loops_owner_id ON loops(owner_id);
CREATE INDEX IF NOT EXISTS idx_loops_loop_type ON loops(loop_type);
CREATE INDEX IF NOT EXISTS idx_loops_next_reset_at ON loops(next_reset_at);
CREATE INDEX IF NOT EXISTS idx_tasks_loop_id ON tasks(loop_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_one_time ON tasks(is_one_time);
CREATE INDEX IF NOT EXISTS idx_archived_tasks_loop_id ON archived_tasks(loop_id);
CREATE INDEX IF NOT EXISTS idx_archived_tasks_completed_at ON archived_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_loop_members_user_id ON loop_members(user_id);
CREATE INDEX IF NOT EXISTS idx_loop_members_loop_id ON loop_members(loop_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loop_members ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for loops
DROP POLICY IF EXISTS "Users can view their own loops" ON loops;
CREATE POLICY "Users can view their own loops" ON loops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT loop_id FROM loop_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create their own loops" ON loops;
CREATE POLICY "Users can create their own loops" ON loops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own loops" ON loops;
CREATE POLICY "Users can update their own loops" ON loops
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (SELECT loop_id FROM loop_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete their own loops" ON loops;
CREATE POLICY "Users can delete their own loops" ON loops
  FOR DELETE USING (owner_id = auth.uid());

-- 9. RLS Policies for tasks
DROP POLICY IF EXISTS "Users can view tasks from their loops" ON tasks;
CREATE POLICY "Users can view tasks from their loops" ON tasks
  FOR SELECT USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in their loops" ON tasks;
CREATE POLICY "Users can create tasks in their loops" ON tasks
  FOR INSERT WITH CHECK (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in their loops" ON tasks;
CREATE POLICY "Users can update tasks in their loops" ON tasks
  FOR UPDATE USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks from their loops" ON tasks;
CREATE POLICY "Users can delete tasks from their loops" ON tasks
  FOR DELETE USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

-- 10. RLS Policies for archived_tasks
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

-- 11. RLS Policies for user_streaks
DROP POLICY IF EXISTS "Users can view own streak" ON user_streaks;
CREATE POLICY "Users can view own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streak" ON user_streaks;
CREATE POLICY "Users can insert own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;
CREATE POLICY "Users can update own streak" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- 12. RLS Policies for loop_members
DROP POLICY IF EXISTS "Users can view loop members for their loops" ON loop_members;
CREATE POLICY "Users can view loop members for their loops" ON loop_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Loop owners can manage members" ON loop_members;
CREATE POLICY "Loop owners can manage members" ON loop_members
  FOR ALL USING (
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

-- 13. Initialize streaks for existing users
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
SELECT DISTINCT id, 0, 0, NULL::timestamp with time zone, NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Migration Complete!
-- =====================================================

