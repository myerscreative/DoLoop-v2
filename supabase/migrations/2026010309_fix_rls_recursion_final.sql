-- =====================================================
-- Fix Infinite Recursion in RLS Policies (Final)
-- =====================================================

-- 1. Create Security Definer Function to break recursion
-- This function accesses the loops table with owner privileges, bypassing RLS.
CREATE OR REPLACE FUNCTION public.fn_is_loop_owner(loop_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM loops 
    WHERE id = loop_uuid 
    AND owner_id = auth.uid()
  );
$$;

-- 2. Clean up conflicting policies on LOOPS
DROP POLICY IF EXISTS "Users can view their own loops" ON loops;
DROP POLICY IF EXISTS "Users can create their own loops" ON loops;
DROP POLICY IF EXISTS "Users can update their own loops" ON loops;
DROP POLICY IF EXISTS "Users can delete their own loops" ON loops;
DROP POLICY IF EXISTS "Users can view shared loops" ON loops;
DROP POLICY IF EXISTS "Users can manage their own loops" ON loops;
DROP POLICY IF EXISTS "Users can view loops" ON loops;

-- 3. Create Safe Policies for LOOPS

-- View: Owner OR Member
-- The member check queries loop_members, which uses the safe policy below.
CREATE POLICY "Users can view loops" ON loops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loop_members 
      WHERE loop_id = loops.id 
      AND user_id = auth.uid()
    )
  );

-- Insert: Owner only
CREATE POLICY "Users can create loops" ON loops
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

-- Update: Owner only
CREATE POLICY "Users can update owned loops" ON loops
  FOR UPDATE USING (
    owner_id = auth.uid()
  );

-- Delete: Owner only
CREATE POLICY "Users can delete owned loops" ON loops
  FOR DELETE USING (
    owner_id = auth.uid()
  );

-- 4. Clean up conflicting policies on LOOP_MEMBERS
DROP POLICY IF EXISTS "Users can view loop members for their loops" ON loop_members;
DROP POLICY IF EXISTS "Loop owners can manage members" ON loop_members;
DROP POLICY IF EXISTS "Users can manage loop members" ON loop_members;
DROP POLICY IF EXISTS "Users can view loop members" ON loop_members;

-- 5. Create Safe Policies for LOOP_MEMBERS

-- View: Self OR Loop Owner
-- The Loop Owner check uses fn_is_loop_owner (SECURITY DEFINER)
-- causing it to NOT trigger the 'loops' RLS, preventing recursion.
CREATE POLICY "Users can view loop members" ON loop_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    fn_is_loop_owner(loop_id)
  );

-- Manage: Loop Owner only
CREATE POLICY "Loop owners can manage members" ON loop_members
  FOR ALL USING (
    fn_is_loop_owner(loop_id)
  )
  WITH CHECK (
    fn_is_loop_owner(loop_id)
  );

-- 6. Clean up User Streaks (ensure simplicity)
DROP POLICY IF EXISTS "Users can manage their own streaks" ON user_streaks;
CREATE POLICY "Users can manage their own streaks" ON user_streaks
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 7. Clean up Tasks (use the function for robust checking)
DROP POLICY IF EXISTS "Users can manage tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks from their loops" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in their loops" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks from their loops" ON tasks;

CREATE POLICY "Users can manage tasks in their loops" ON tasks
  FOR ALL USING (
    fn_is_loop_owner(loop_id) OR
    EXISTS (
      SELECT 1 FROM loop_members
      WHERE loop_id = tasks.loop_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    fn_is_loop_owner(loop_id) OR
    EXISTS (
      SELECT 1 FROM loop_members
      WHERE loop_id = tasks.loop_id
      AND user_id = auth.uid()
    )
  );
