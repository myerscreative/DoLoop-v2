-- =====================================================
-- TEMPLATE LIBRARY REPAIR SCRIPT
-- =====================================================
-- Run this in the Supabase SQL Editor (127.0.0.1:54323)
-- to fix the 404 errors and missing favorites/usage tables.

-- 1. Create template_favorites table
CREATE TABLE IF NOT EXISTS public.template_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.loop_templates(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, template_id)
);

-- 2. Create user_template_usage table (if missing)
CREATE TABLE IF NOT EXISTS public.user_template_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.loop_templates(id) ON DELETE CASCADE NOT NULL,
    loop_id UUID REFERENCES public.loops(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, template_id, loop_id)
);

-- 3. Enable RLS
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_template_usage ENABLE ROW LEVEL SECURITY;

-- 4. Favorites Policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.template_favorites;
CREATE POLICY "Users can view their own favorites" ON public.template_favorites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.template_favorites;
CREATE POLICY "Users can insert their own favorites" ON public.template_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.template_favorites;
CREATE POLICY "Users can delete their own favorites" ON public.template_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Usage Policies
DROP POLICY IF EXISTS "Users can view their own template usage" ON public.user_template_usage;
CREATE POLICY "Users can view their own template usage" ON public.user_template_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own template usage" ON public.user_template_usage;
CREATE POLICY "Users can insert their own template usage" ON public.user_template_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant Permissions
GRANT ALL ON public.template_favorites TO service_role;
GRANT ALL ON public.template_favorites TO authenticated;
GRANT ALL ON public.user_template_usage TO service_role;
GRANT ALL ON public.user_template_usage TO authenticated;

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_favorites_user ON public.template_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_usage_user ON public.user_template_usage(user_id);
