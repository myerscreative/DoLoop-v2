-- =====================================================
-- Consolidated Missing Tables Script
-- Run this in your Supabase SQL Editor to fix all 404 errors
-- Date: 2026-01-05
-- =====================================================

-- =====================================================
-- 1. ATTACHMENTS TABLE
-- =====================================================
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
CREATE INDEX IF NOT EXISTS idx_attachments_task ON public.attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON public.attachments(uploaded_by);

-- Drop OLD policies
DROP POLICY IF EXISTS "Users can manage task attachments" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments from their tasks" ON attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their tasks" ON attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments" ON attachments;
DROP POLICY IF EXISTS "attachments_select_policy" ON attachments;
DROP POLICY IF EXISTS "attachments_insert_policy" ON attachments;
DROP POLICY IF EXISTS "attachments_delete_policy" ON attachments;

-- Create robust policies for attachments
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

-- Permissions
GRANT ALL ON public.attachments TO service_role;
GRANT ALL ON public.attachments TO authenticated;

-- =====================================================
-- 2. STORAGE BUCKET FOR ATTACHMENTS
-- =====================================================
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
DROP POLICY IF EXISTS "Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Delete Policy" ON storage.objects;

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
USING ( bucket_id = 'task-attachments' );

-- =====================================================
-- 3. TEMPLATE_FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.template_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.loop_templates(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, template_id)
);

-- Enable RLS
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.template_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.template_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.template_favorites;

-- Create policies
CREATE POLICY "Users can view their own favorites" ON public.template_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.template_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.template_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_template_favorites_user ON public.template_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_template_favorites_template ON public.template_favorites(template_id);

-- Permissions
GRANT ALL ON public.template_favorites TO service_role;
GRANT ALL ON public.template_favorites TO authenticated;

-- =====================================================
-- DONE! All missing tables created.
-- =====================================================
