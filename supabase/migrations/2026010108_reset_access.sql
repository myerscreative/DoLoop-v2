-- RESET RLS: Restore Basic Ownership Access
-- This temporarily removes complex shared logic to ensure you can load your own loops.

-- 1. LOOP MEMBERS (Simplify to avoid any recursion risk)
DROP POLICY IF EXISTS "Members can view fellow loop members" ON public.loop_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.loop_members;

CREATE POLICY "Users can view their own membership" ON public.loop_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- 2. LOOPS (Basic Ownership Only + Simple Membership check)
DROP POLICY IF EXISTS "Users can view their own loops" ON public.loops;

CREATE POLICY "Users can view their own loops" ON public.loops
  FOR SELECT USING (
    owner_id = auth.uid()
  );

-- 3. TASKS
DROP POLICY IF EXISTS "Users can view tasks from their loops" ON public.tasks;

CREATE POLICY "Users can view tasks from their loops" ON public.tasks
  FOR SELECT USING (
    loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid())
  );
