-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create template_reviews table
CREATE TABLE IF NOT EXISTS public.template_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.loop_templates(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(template_id, user_id)
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Tags policies
DROP POLICY IF EXISTS "Users can view their own tags" ON public.tags;
CREATE POLICY "Users can view their own tags" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tags" ON public.tags;
CREATE POLICY "Users can insert their own tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tags" ON public.tags;
CREATE POLICY "Users can update their own tags" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tags" ON public.tags;
CREATE POLICY "Users can delete their own tags" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);

-- Template reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.template_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.template_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.template_reviews;
CREATE POLICY "Users can insert their own reviews" ON public.template_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.template_reviews;
CREATE POLICY "Users can update their own reviews" ON public.template_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- User streaks policies
DROP POLICY IF EXISTS "Users can view their own streak" ON public.user_streaks;
CREATE POLICY "Users can view their own streak" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own streak" ON public.user_streaks;
CREATE POLICY "Users can update their own streak" ON public.user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own streak" ON public.user_streaks;
CREATE POLICY "Users can insert their own streak" ON public.user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions (optional but good for local dev if roles are strict)
GRANT ALL ON public.tags TO service_role;
GRANT ALL ON public.template_reviews TO service_role;
GRANT ALL ON public.user_streaks TO service_role;
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.template_reviews TO authenticated;
GRANT ALL ON public.user_streaks TO authenticated;
