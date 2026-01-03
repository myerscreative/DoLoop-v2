-- Phase 1: Sub-tasks and Critical Tasks
-- Migration: 20260103_add_subtasks_and_critical.sql

-- 1. Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add critical task flag to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;

-- 3. Enable RLS on subtasks
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for subtasks (users can manage subtasks in their own loops)
CREATE POLICY "Users can view subtasks" ON public.subtasks
    FOR SELECT USING (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.loop_members lm 
                WHERE lm.loop_id = l.id AND lm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create subtasks" ON public.subtasks
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.loop_members lm 
                WHERE lm.loop_id = l.id AND lm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update subtasks" ON public.subtasks
    FOR UPDATE USING (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.loop_members lm 
                WHERE lm.loop_id = l.id AND lm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete subtasks" ON public.subtasks
    FOR DELETE USING (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.loop_members lm 
                WHERE lm.loop_id = l.id AND lm.user_id = auth.uid()
            )
        )
    );

-- 5. Enable realtime for subtasks
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 6. Create index for performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
