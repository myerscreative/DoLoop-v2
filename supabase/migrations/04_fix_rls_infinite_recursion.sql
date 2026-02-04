-- =====================================================
-- Fix Infinite Recursion in RLS Policies
-- =====================================================

-- The issue: Complex policies with subqueries cause infinite recursion
-- Solution: Simplify policies to direct column checks

-- 1. Drop all existing policies on loops
DROP POLICY IF EXISTS "Users can view their own loops" ON loops;
DROP POLICY IF EXISTS "Users can create loops" ON loops;
DROP POLICY IF EXISTS "Users can update their own loops" ON loops;
DROP POLICY IF EXISTS "Users can delete their own loops" ON loops;
DROP POLICY IF EXISTS "Users can view shared loops" ON loops;
DROP POLICY IF EXISTS "Users can manage their own loops" ON loops;

-- 2. Create simple, non-recursive policies for loops
DROP POLICY IF EXISTS "Users can manage their own loops" ON loops;
CREATE POLICY "Users can manage their own loops"
  ON loops
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 3. Drop all existing policies on tasks
DROP POLICY IF EXISTS "Users can view tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can manage tasks in their loops" ON tasks;

-- 4. Create simple policy for tasks using security definer function
-- First, create a security definer function to check loop ownership
CREATE OR REPLACE FUNCTION user_owns_loop(loop_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM loops 
    WHERE id = loop_uuid 
    AND owner_id = auth.uid()
  );
$$;

-- Now create the policy using this function
DROP POLICY IF EXISTS "Users can manage tasks in their loops" ON tasks;
CREATE POLICY "Users can manage tasks in their loops"
  ON tasks
  FOR ALL
  USING (user_owns_loop(loop_id))
  WITH CHECK (user_owns_loop(loop_id));

-- 5. Fix archived_tasks policies
DROP POLICY IF EXISTS "Users can view archived tasks" ON archived_tasks;
DROP POLICY IF EXISTS "Users can create archived tasks" ON archived_tasks;

DROP POLICY IF EXISTS "Users can manage archived tasks" ON archived_tasks;
CREATE POLICY "Users can manage archived tasks"
  ON archived_tasks
  FOR ALL
  USING (user_owns_loop(loop_id))
  WITH CHECK (user_owns_loop(loop_id));

-- 6. Fix user_streaks policies (simple - direct user_id check)
DROP POLICY IF EXISTS "Users can view their own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can manage their own streaks" ON user_streaks;

DROP POLICY IF EXISTS "Users can manage their own streaks" ON user_streaks;
CREATE POLICY "Users can manage their own streaks"
  ON user_streaks
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. Fix loop_members policies
DROP POLICY IF EXISTS "Users can view loop members" ON loop_members;
DROP POLICY IF EXISTS "Loop owners can manage members" ON loop_members;
DROP POLICY IF EXISTS "Users can manage loop members" ON loop_members;

DROP POLICY IF EXISTS "Users can manage loop members" ON loop_members;
CREATE POLICY "Users can manage loop members"
  ON loop_members
  FOR ALL
  USING (user_owns_loop(loop_id) OR user_id = auth.uid())
  WITH CHECK (user_owns_loop(loop_id));

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to test:
-- SELECT * FROM loops WHERE owner_id = auth.uid();

-- =====================================================
-- Done! The infinite recursion should be fixed.
-- =====================================================

