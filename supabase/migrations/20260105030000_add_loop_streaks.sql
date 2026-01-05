-- Create loop_streaks table for tracking per-loop progress (especially for practice loops)
DROP TABLE IF EXISTS public.loop_streaks;
CREATE TABLE public.loop_streaks (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    loop_id UUID NOT NULL REFERENCES public.loops(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(loop_id)
);

-- Add RLS
ALTER TABLE public.loop_streaks ENABLE ROW LEVEL SECURITY;

-- Allow users to view streaks for loops they have access to
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
