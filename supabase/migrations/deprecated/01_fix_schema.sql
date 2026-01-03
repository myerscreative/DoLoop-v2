-- =====================================================
-- DoLoop Schema Fix - Update Existing Tables
-- Run this if you already have tables created
-- =====================================================

-- 1. Fix loops table - rename owner to owner_id if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loops' AND column_name = 'owner'
    ) THEN
        ALTER TABLE loops RENAME COLUMN owner TO owner_id;
    END IF;
END $$;

-- 2. Add missing columns to loops if they don't exist
ALTER TABLE loops ADD COLUMN IF NOT EXISTS loop_type TEXT DEFAULT 'personal';
ALTER TABLE loops ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE loops ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE loops ADD COLUMN IF NOT EXISTS reset_rule TEXT DEFAULT 'daily';
ALTER TABLE loops ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#FF6B6B';

-- 3. Add constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_loop_type'
    ) THEN
        ALTER TABLE loops ADD CONSTRAINT check_loop_type 
        CHECK (loop_type IN ('personal', 'work', 'daily', 'shared'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_reset_rule'
    ) THEN
        ALTER TABLE loops ADD CONSTRAINT check_reset_rule 
        CHECK (reset_rule IN ('daily', 'weekly', 'monthly', 'never'));
    END IF;
END $$;

-- 4. Add missing columns to tasks if they don't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 5. Create archived_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS archived_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_task_id UUID NOT NULL,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create user_streaks table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Create loop_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS loop_members (
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (loop_id, user_id)
);

-- 8. Create indexes
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

-- 9. Enable RLS on all tables
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loop_members ENABLE ROW LEVEL SECURITY;

-- 10. Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own loops" ON loops;
DROP POLICY IF EXISTS "Users can create their own loops" ON loops;
DROP POLICY IF EXISTS "Users can update their own loops" ON loops;
DROP POLICY IF EXISTS "Users can delete their own loops" ON loops;

DROP POLICY IF EXISTS "Users can view tasks from their loops" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks from their loops" ON tasks;

DROP POLICY IF EXISTS "Users can view archived tasks from their loops" ON archived_tasks;
DROP POLICY IF EXISTS "Users can insert archived tasks for their loops" ON archived_tasks;

DROP POLICY IF EXISTS "Users can view own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;

DROP POLICY IF EXISTS "Users can view loop members for their loops" ON loop_members;
DROP POLICY IF EXISTS "Loop owners can manage members" ON loop_members;

-- 11. Create RLS Policies for loops
CREATE POLICY "Users can view their own loops" ON loops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT loop_id FROM loop_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own loops" ON loops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own loops" ON loops
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (SELECT loop_id FROM loop_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own loops" ON loops
  FOR DELETE USING (owner_id = auth.uid());

-- 12. Create RLS Policies for tasks
CREATE POLICY "Users can view tasks from their loops" ON tasks
  FOR SELECT USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their loops" ON tasks
  FOR INSERT WITH CHECK (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their loops" ON tasks
  FOR UPDATE USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks from their loops" ON tasks
  FOR DELETE USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

-- 13. Create RLS Policies for archived_tasks
CREATE POLICY "Users can view archived tasks from their loops" ON archived_tasks
  FOR SELECT USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert archived tasks for their loops" ON archived_tasks
  FOR INSERT WITH CHECK (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

-- 14. Create RLS Policies for user_streaks
CREATE POLICY "Users can view own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- 15. Create RLS Policies for loop_members
CREATE POLICY "Users can view loop members for their loops" ON loop_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Loop owners can manage members" ON loop_members
  FOR ALL USING (
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

-- 16. Initialize streaks for existing users
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
SELECT DISTINCT id, 0, 0, NULL::TIMESTAMP WITH TIME ZONE, NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Migration Complete!
-- =====================================================

