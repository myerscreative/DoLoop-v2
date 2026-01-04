-- Migration: Add Template Favorites Table
-- Date: 2026-01-05

CREATE TABLE IF NOT EXISTS public.template_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.loop_templates(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, template_id)
);

-- Enable RLS
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.template_favorites;
CREATE POLICY "Users can view their own favorites" ON public.template_favorites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.template_favorites;
CREATE POLICY "Users can insert their own favorites" ON public.template_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.template_favorites;
CREATE POLICY "Users can delete their own favorites" ON public.template_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_template_favorites_user ON public.template_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_template_favorites_template ON public.template_favorites(template_id);

-- Permissions
GRANT ALL ON public.template_favorites TO service_role;
GRANT ALL ON public.template_favorites TO authenticated;
