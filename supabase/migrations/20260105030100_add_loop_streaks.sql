-- Create loop_streaks table for tracking per-loop progress (especially for practice loops)
CREATE TABLE IF NOT EXISTS public.loop_streaks (
    loop_id UUID PRIMARY KEY REFERENCES public.loops(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_completed_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS
ALTER TABLE public.loop_streaks ENABLE ROW LEVEL SECURITY;

-- Allow users to view streaks for loops they have access to
DROP POLICY IF EXISTS "Users can view streaks for loops they can access" ON public.loop_streaks;
CREATE POLICY "Users can view streaks for loops they can access"
ON public.loop_streaks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.loop_members
        WHERE loop_id = public.loop_streaks.loop_id
        AND user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.loops
        WHERE id = public.loop_streaks.loop_id
        AND owner_id = auth.uid()
    )
);

-- Allow users to upsert streaks for loops they own
DROP POLICY IF EXISTS "Users can upsert streaks for loops they own" ON public.loop_streaks;
CREATE POLICY "Users can upsert streaks for loops they own"
ON public.loop_streaks FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.loops
        WHERE id = public.loop_streaks.loop_id
        AND owner_id = auth.uid()
    )
);

GRANT ALL ON public.loop_streaks TO postgres, service_role, authenticated;
