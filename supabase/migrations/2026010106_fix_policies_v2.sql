-- FIX: Revert to standard EXISTS clause for non-recursive tables
-- This ensures that simple ownership checks work even if the function is misbehaving.

-- 1. LOOPS Policy Update
DROP POLICY IF EXISTS "Users can view their own loops" ON public.loops;

CREATE POLICY "Users can view their own loops" ON public.loops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.loop_members 
      WHERE loop_id = loops.id 
      AND user_id = auth.uid()
    )
  );

-- 2. TASKS Policy Update
DROP POLICY IF EXISTS "Users can view tasks from their loops" ON public.tasks;

CREATE POLICY "Users can view tasks from their loops" ON public.tasks
  FOR SELECT USING (
    loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.loop_members 
      WHERE loop_id = tasks.loop_id 
      AND user_id = auth.uid()
    )
  );
