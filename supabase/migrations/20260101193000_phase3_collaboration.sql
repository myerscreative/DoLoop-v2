-- Phase 3: Collaboration & Shared Recipes
-- CLEANUP: Drop table if it exists to ensure schema correctness
DROP TABLE IF EXISTS public.loop_members CASCADE;

-- 1. Create LoopMembers table
CREATE TABLE public.loop_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loop_id UUID NOT NULL REFERENCES public.loops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role TEXT DEFAULT 'sous-chef',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(loop_id, user_id)
);

-- 2. Add assignment support to tasks
ALTER TABLE public.tasks 
DROP COLUMN IF EXISTS assigned_to;

ALTER TABLE public.tasks 
ADD COLUMN assigned_to UUID REFERENCES public.loop_members(id) ON DELETE SET NULL;

-- 3. Real-time sync
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE loop_members;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 4. RLS Support Functions (Security Definier to break recursion)
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

-- 5. RLS
ALTER TABLE public.loop_members ENABLE ROW LEVEL SECURITY;

-- Policy: View self or peers
CREATE POLICY "Members can view fellow loop members" ON public.loop_members
    FOR SELECT USING (
        user_id = auth.uid() 
        OR 
        is_loop_member(loop_id)
    );

-- Policy: Join (Insert self)
CREATE POLICY "Users can join loops" ON public.loop_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Policy: Leave (Delete self)
CREATE POLICY "Users can leave loops" ON public.loop_members
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- 6. Restore RLS Policies (Dropped by CASCADE)
-- Note: When we dropped loop_members with CASCADE, it deleted policies on loops/tasks that referenced it.

-- LOOPS
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

-- TASKS
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
