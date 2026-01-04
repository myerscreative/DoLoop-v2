-- =====================================================
-- ATTACHMENTS REPAIR SCRIPT
-- =====================================================
-- Run this in the Supabase SQL Editor (127.0.0.1:54323)
-- to fix the "table not found" errors for attachments.

-- 1. Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- 3. Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Attachment Policies
DROP POLICY IF EXISTS "attachments_select_policy" ON public.attachments;
CREATE POLICY "attachments_select_policy" ON public.attachments
    FOR SELECT TO authenticated
    USING (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.loop_members lm 
                WHERE lm.loop_id = l.id AND lm.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "attachments_insert_policy" ON public.attachments;
CREATE POLICY "attachments_insert_policy" ON public.attachments
    FOR INSERT TO authenticated
    WITH CHECK (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.loop_members lm 
                WHERE lm.loop_id = l.id AND lm.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "attachments_delete_policy" ON public.attachments;
CREATE POLICY "attachments_delete_policy" ON public.attachments
    FOR DELETE TO authenticated
    USING (
        auth.uid() = uploaded_by OR
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid()
        )
    );

-- 5. Storage Policies
DROP POLICY IF EXISTS "Public Access Policy" ON storage.objects;
CREATE POLICY "Public Access Policy"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'task-attachments' );

DROP POLICY IF EXISTS "Upload Policy" ON storage.objects;
CREATE POLICY "Upload Policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'task-attachments' );

-- 6. Permissions
GRANT ALL ON public.attachments TO service_role;
GRANT ALL ON public.attachments TO authenticated;

-- 7. Reset Schema Cache
-- Note: After running this, PLEASE RESTART SUPABASE
-- or run 'NOTIFY pgrst, ''reload schema'';' if possible.
