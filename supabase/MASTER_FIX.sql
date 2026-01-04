-- ==========================================
-- MASTER FIX SCRIPT FOR DOLOOP V2
-- This script fixes the following:
-- 1. Template Library (Favorites & Usage)
-- 2. Attachments (Table & Storage)
-- ==========================================

-- 1. TEMPLATE LIBRARY FIXES
-- Create template_favorites table
CREATE TABLE IF NOT EXISTS public.template_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.loop_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- Create user_template_usage table
CREATE TABLE IF NOT EXISTS public.user_template_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.loop_templates(id) ON DELETE CASCADE,
    loop_id UUID NOT NULL REFERENCES public.loops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id, loop_id)
);

-- Enable RLS for Library Tables
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_template_usage ENABLE ROW LEVEL SECURITY;

-- Polices for template_favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.template_favorites;
CREATE POLICY "Users can view their own favorites" ON public.template_favorites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own favorites" ON public.template_favorites;
CREATE POLICY "Users can add their own favorites" ON public.template_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own favorites" ON public.template_favorites;
CREATE POLICY "Users can remove their own favorites" ON public.template_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_template_usage
DROP POLICY IF EXISTS "Users can view their own template usage" ON public.user_template_usage;
CREATE POLICY "Users can view their own template usage" ON public.user_template_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record template usage" ON public.user_template_usage;
CREATE POLICY "Users can record template usage" ON public.user_template_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 2. ATTACHMENTS FIXES
-- Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Polices for attachments (simplified to use loop ownership indirectly)
DROP POLICY IF EXISTS "Users can view attachments for their tasks" ON public.attachments;
CREATE POLICY "Users can view attachments for their tasks" ON public.attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN loops l ON t.loop_id = l.id
            JOIN loop_members lm ON l.id = lm.loop_id
            WHERE t.id = attachments.task_id
            AND lm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can add attachments to their tasks" ON public.attachments;
CREATE POLICY "Users can add attachments to their tasks" ON public.attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN loops l ON t.loop_id = l.id
            JOIN loop_members lm ON l.id = lm.loop_id
            WHERE t.id = task_id
            AND lm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their task attachments" ON public.attachments;
CREATE POLICY "Users can delete their task attachments" ON public.attachments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN loops l ON t.loop_id = l.id
            JOIN loop_members lm ON l.id = lm.loop_id
            WHERE t.id = attachments.task_id
            AND lm.user_id = auth.uid()
        )
    );

-- 3. STORAGE SETUP
-- Note: Making sure the bucket exists (requires Supabase Storage enabled)
-- This part is usually done through the Supabase Dashboard, but here is a helper:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true) ON CONFLICT (id) DO NOTHING;

-- Grant access to storage for authenticated users
-- DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
-- CREATE POLICY "Authenticated users can upload attachments" ON storage.objects 
--   FOR INSERT TO authenticated WITH CHECK (bucket_id = 'task-attachments');

-- DROP POLICY IF EXISTS "Public can view attachments" ON storage.objects;
-- CREATE POLICY "Public can view attachments" ON storage.objects 
--   FOR SELECT TO authenticated USING (bucket_id = 'task-attachments');
