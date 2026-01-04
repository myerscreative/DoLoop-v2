-- 1. Ensure attachments table exists and is correctly configured
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure file_size is nullable (fixing potential issues from previous migrations)
ALTER TABLE public.attachments ALTER COLUMN file_size DROP NOT NULL;

-- 2. Enable RLS on attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- 3. Attachments Table Policies
DROP POLICY IF EXISTS "Users can view attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can view attachments from their tasks" ON public.attachments;
CREATE POLICY "Users can view attachments" ON public.attachments
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

DROP POLICY IF EXISTS "Users can insert attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their tasks" ON public.attachments;
CREATE POLICY "Users can insert attachments" ON public.attachments
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

DROP POLICY IF EXISTS "Users can delete attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON public.attachments;
CREATE POLICY "Users can delete attachments" ON public.attachments
    FOR DELETE TO authenticated
    USING (
        auth.uid() = uploaded_by OR
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.loops l ON t.loop_id = l.id
            WHERE l.owner_id = auth.uid()
        )
    );

-- 4. Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Storage Policies for task-attachments bucket
-- (Note: names must be unique across all policies in the schema)

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'task-attachments' );

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'task-attachments'
);

DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'task-attachments' );

DROP POLICY IF EXISTS "Users can delete own objects" ON storage.objects;
CREATE POLICY "Users can delete own objects"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'task-attachments' AND
    auth.uid() = owner
);

-- 6. Grant permissions
GRANT ALL ON public.attachments TO service_role;
GRANT ALL ON public.attachments TO authenticated;
