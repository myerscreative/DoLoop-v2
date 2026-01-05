-- =====================================================
-- Add Practice Loops Feature
-- Distinguishes between Execution Loops (checklists) 
-- and Practice Loops (daily habits with streak tracking)
-- =====================================================

-- 1. Add function_type column to loops table
ALTER TABLE loops ADD COLUMN IF NOT EXISTS function_type TEXT DEFAULT 'execution' 
  CHECK (function_type IN ('execution', 'practice'));

-- 2. Create per-loop streak tracking table
CREATE TABLE IF NOT EXISTS loop_streaks (
  loop_id UUID PRIMARY KEY REFERENCES loops(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_loop_streaks_loop_id ON loop_streaks(loop_id);

-- 4. Enable RLS on loop_streaks
ALTER TABLE loop_streaks ENABLE ROW LEVEL SECURITY;

-- 5. RLS policy: Users can view streaks for their own loops
DROP POLICY IF EXISTS "Users can view own loop streaks" ON loop_streaks;
CREATE POLICY "Users can view own loop streaks" ON loop_streaks
  FOR SELECT USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

-- 6. RLS policy: Users can insert streaks for their own loops
DROP POLICY IF EXISTS "Users can insert own loop streaks" ON loop_streaks;
CREATE POLICY "Users can insert own loop streaks" ON loop_streaks
  FOR INSERT WITH CHECK (
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

-- 7. RLS policy: Users can update streaks for their own loops
DROP POLICY IF EXISTS "Users can update own loop streaks" ON loop_streaks;
CREATE POLICY "Users can update own loop streaks" ON loop_streaks
  FOR UPDATE USING (
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

-- 8. RLS policy: Users can delete streaks for their own loops
DROP POLICY IF EXISTS "Users can delete own loop streaks" ON loop_streaks;
CREATE POLICY "Users can delete own loop streaks" ON loop_streaks
  FOR DELETE USING (
    loop_id IN (SELECT id FROM loops WHERE owner_id = auth.uid())
  );

-- =====================================================
-- Migration Complete!
-- =====================================================
