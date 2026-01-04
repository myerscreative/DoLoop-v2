-- Final Fix for Attachment Persistence
-- This migration addresses the NOT NULL constraint on file_size 
-- and ensures collaborators can also manage attachments.

-- 1. Ensure attachments table is correctly configured
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

-- Fix potential NOT NULL constraint from older migrations
ALTER TABLE public.attachments ALTER COLUMN file_size DROP NOT NULL;

-- Enable RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Add index
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON public.attachments(uploaded_by);

-- 2. Drop OLD policies (from various migrations)
DROP POLICY IF EXISTS "Users can manage task attachments" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments from their tasks" ON attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their tasks" ON attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments" ON attachments;

-- 3. Create NEW robust policies for attachments table
-- Allow view/select for owner and members
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

-- Allow insert for owner and members
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

-- Allow delete for owner or the person who uploaded it
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

-- 4. Storage Bucket and Policies
-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Policy" ON storage.objects;
DROP POLICY IF EXISTS "Upload Policy" ON storage.objects;

-- Create Storage Policies
CREATE POLICY "Public Access Policy"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'task-attachments' );

CREATE POLICY "Upload Policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'task-attachments' );

CREATE POLICY "Update Policy"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'task-attachments' )
WITH CHECK ( bucket_id = 'task-attachments' );

CREATE POLICY "Delete Policy"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'task-attachments' AND (auth.uid() = owner OR auth.uid() IN (
    -- Allow loop owner to delete files in their loops even if they didn't upload them
    -- This is a bit complex for storage policies but good if supported.
    -- For now, stick to simplified owner check to avoid potential errors.
    auth.uid() = owner 
)));

-- Grant permissions explicitly
GRANT ALL ON public.attachments TO service_role;
GRANT ALL ON public.attachments TO authenticated;
