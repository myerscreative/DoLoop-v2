-- EMERGENCY FIX: Restore RLS Policies
-- Run this in the Supabase SQL Editor to restore access to Loops and Tasks.

-- 1. Ensure the helper function exists and is SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_loop_member(_loop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.loop_members 
    WHERE loop_id = _loop_id 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Restore LOOPS Policies
ALTER TABLE public.loops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own loops" ON public.loops;
CREATE POLICY "Users can view their own loops" ON public.loops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    is_loop_member(id)
  );

DROP POLICY IF EXISTS "Users can create their own loops" ON public.loops;
CREATE POLICY "Users can create their own loops" ON public.loops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own loops" ON public.loops;
CREATE POLICY "Users can update their own loops" ON public.loops
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    is_loop_member(id)
  );

DROP POLICY IF EXISTS "Users can delete their own loops" ON public.loops;
CREATE POLICY "Users can delete their own loops" ON public.loops
  FOR DELETE USING (owner_id = auth.uid());

-- 3. Restore TASKS Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks from their loops" ON public.tasks;
CREATE POLICY "Users can view tasks from their loops" ON public.tasks
  FOR SELECT USING (
    loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid()) OR
    is_loop_member(loop_id)
  );

DROP POLICY IF EXISTS "Users can create tasks in their loops" ON public.tasks;
CREATE POLICY "Users can create tasks in their loops" ON public.tasks
  FOR INSERT WITH CHECK (
    loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid()) OR
    is_loop_member(loop_id)
  );

DROP POLICY IF EXISTS "Users can update tasks in their loops" ON public.tasks;
CREATE POLICY "Users can update tasks in their loops" ON public.tasks
  FOR UPDATE USING (
    loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid()) OR
    is_loop_member(loop_id)
  );

DROP POLICY IF EXISTS "Users can delete tasks from their loops" ON public.tasks;
CREATE POLICY "Users can delete tasks from their loops" ON public.tasks
  FOR DELETE USING (
    loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid()) OR
    is_loop_member(loop_id)
  );
