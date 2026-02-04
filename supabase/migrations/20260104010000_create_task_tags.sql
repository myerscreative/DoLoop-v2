-- Create task_tags junction table
CREATE TABLE IF NOT EXISTS public.task_tags (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON public.task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON public.task_tags(tag_id);

-- Policies

-- Users can view task tags if they own the TAG (Personal tags)
-- This assumes tags are private to the user.
DROP POLICY IF EXISTS "Users can view task tags for their tags" ON public.task_tags;
CREATE POLICY "Users can view task tags for their tags" ON public.task_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tags 
            WHERE tags.id = task_tags.tag_id 
            AND tags.user_id = auth.uid()
        )
    );

-- Users can insert task tags if they own the TAG (and implicitly have access to task via UI, but strictly checking tag ownership is key)
DROP POLICY IF EXISTS "Users can insert task tags for their tags" ON public.task_tags;
CREATE POLICY "Users can insert task tags for their tags" ON public.task_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tags 
            WHERE tags.id = task_tags.tag_id 
            AND tags.user_id = auth.uid()
        )
    );

-- Users can delete task tags if they own the TAG
DROP POLICY IF EXISTS "Users can delete task tags for their tags" ON public.task_tags;
CREATE POLICY "Users can delete task tags for their tags" ON public.task_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.tags 
            WHERE tags.id = task_tags.tag_id 
            AND tags.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.task_tags TO authenticated;
GRANT ALL ON public.task_tags TO service_role;
