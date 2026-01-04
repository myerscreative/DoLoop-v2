-- =====================================================
-- Fix Infinite Recursion in RLS Policies (The "Nuke" approach)
-- =====================================================

-- 1. Drop ALL policies on relevant tables to start fresh
-- We use dynamic SQL to ensure we catch everything regardless of naming
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('loops', 'loop_members', 'tasks', 'archived_tasks', 'user_streaks')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. Create Security Definer Function to break recursion
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

-- 3. Create Safe Policies for LOOPS

-- View: Owner OR Member
-- The member check queries loop_members, which will use a safe policy
CREATE POLICY "loops_select_policy" ON loops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loop_members 
      WHERE loop_id = loops.id 
      AND user_id = auth.uid()
    )
  );

-- Insert: Owner only (when creating, you are the owner)
CREATE POLICY "loops_insert_policy" ON loops
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

-- Update: Owner only
CREATE POLICY "loops_update_policy" ON loops
  FOR UPDATE USING (
    owner_id = auth.uid()
  );

-- Delete: Owner only
CREATE POLICY "loops_delete_policy" ON loops
  FOR DELETE USING (
    owner_id = auth.uid()
  );

-- 4. Create Safe Policies for LOOP_MEMBERS

-- View: Self OR Loop Owner
-- The Loop Owner check uses fn_is_loop_owner (SECURITY DEFINER)
-- causing it to NOT trigger the 'loops' RLS, preventing recursion.
CREATE POLICY "loop_members_select_policy" ON loop_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    fn_is_loop_owner(loop_id)
  );

-- Manage: Loop Owner only
CREATE POLICY "loop_members_all_policy" ON loop_members
  FOR ALL USING (
    fn_is_loop_owner(loop_id)
  )
  WITH CHECK (
    fn_is_loop_owner(loop_id)
  );

-- Users can join (for invite systems if needed, keeping simple for now)
-- Assuming invites are handled by edge functions or owner directly inserting

-- 5. Create Safe Policies for TASKS

-- Manage: Loop Owner OR Member (depending on role logic, but keeping broad for now)
-- Using the function for ownership check is safest
CREATE POLICY "tasks_all_policy" ON tasks
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

-- 6. Create Safe Policies for ARCHIVED_TASKS
CREATE POLICY "archived_tasks_all_policy" ON archived_tasks
  FOR ALL USING (
    fn_is_loop_owner(loop_id) OR
    EXISTS (
      SELECT 1 FROM loop_members
      WHERE loop_id = archived_tasks.loop_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    fn_is_loop_owner(loop_id) OR
    EXISTS (
      SELECT 1 FROM loop_members
      WHERE loop_id = archived_tasks.loop_id
      AND user_id = auth.uid()
    )
  );

-- 7. Create Safe Policies for USER_STREAKS
CREATE POLICY "user_streaks_all_policy" ON user_streaks
  FOR ALL USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());
