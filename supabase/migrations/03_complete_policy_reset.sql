-- =====================================================
-- Complete Policy Reset - Fix All Infinite Recursion
-- =====================================================

-- 1. Drop ALL policies on ALL tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can create their own loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view shared loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view tasks from their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can create tasks in their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update tasks in their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete tasks from their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view archived tasks from their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert archived tasks for their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own streak" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert own streak" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own streak" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view loop members for their loops" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Loop owners can manage members" ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. Create SIMPLE policies for loops (no joins, no subqueries initially)
DROP POLICY IF EXISTS "loops_select_policy" ON loops;
CREATE POLICY "loops_select_policy" ON loops
  FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "loops_insert_policy" ON loops;
CREATE POLICY "loops_insert_policy" ON loops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "loops_update_policy" ON loops;
CREATE POLICY "loops_update_policy" ON loops
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "loops_delete_policy" ON loops;
CREATE POLICY "loops_delete_policy" ON loops
  FOR DELETE USING (owner_id = auth.uid());

-- 3. Create policies for tasks (simple, just check owner_id directly on loops)
DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
CREATE POLICY "tasks_select_policy" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = tasks.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
CREATE POLICY "tasks_insert_policy" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = tasks.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
CREATE POLICY "tasks_update_policy" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = tasks.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;
CREATE POLICY "tasks_delete_policy" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = tasks.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

-- 4. Create policies for archived_tasks
DROP POLICY IF EXISTS "archived_tasks_select_policy" ON archived_tasks;
CREATE POLICY "archived_tasks_select_policy" ON archived_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = archived_tasks.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "archived_tasks_insert_policy" ON archived_tasks;
CREATE POLICY "archived_tasks_insert_policy" ON archived_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = archived_tasks.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

-- 5. Create policies for user_streaks
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
CREATE POLICY "user_streaks_select_policy" ON user_streaks
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
CREATE POLICY "user_streaks_insert_policy" ON user_streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
CREATE POLICY "user_streaks_update_policy" ON user_streaks
  FOR UPDATE USING (user_id = auth.uid());

-- 6. Create policies for loop_members
DROP POLICY IF EXISTS "loop_members_select_policy" ON loop_members;
CREATE POLICY "loop_members_select_policy" ON loop_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = loop_members.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "loop_members_insert_policy" ON loop_members;
CREATE POLICY "loop_members_insert_policy" ON loop_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = loop_members.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "loop_members_update_policy" ON loop_members;
CREATE POLICY "loop_members_update_policy" ON loop_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = loop_members.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "loop_members_delete_policy" ON loop_members;
CREATE POLICY "loop_members_delete_policy" ON loop_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM loops 
      WHERE loops.id = loop_members.loop_id 
      AND loops.owner_id = auth.uid()
    )
  );

-- =====================================================
-- Migration Complete!
-- =====================================================



