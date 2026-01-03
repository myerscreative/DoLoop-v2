-- Phase 3c: Add collaboration columns to existing user_profiles
-- Adds display_name and avatar_url for collaborator display

-- 1. Add display_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN display_name TEXT;
    END IF;
END $$;

-- 2. Add avatar_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 3. Update display_name from email for existing profiles
UPDATE public.user_profiles up
SET display_name = split_part(au.email, '@', 1)
FROM auth.users au
WHERE up.id = au.id
AND up.display_name IS NULL;

-- 4. Add policy for anyone to view profiles (needed for collaborator names)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.user_profiles;
CREATE POLICY "Anyone can view profiles" ON public.user_profiles
    FOR SELECT USING (true);

-- 5. Function to get or create profile (uses 'id' column, not 'user_id')
CREATE OR REPLACE FUNCTION public.get_or_create_profile()
RETURNS public.user_profiles AS $$
DECLARE
    profile public.user_profiles;
    user_email TEXT;
BEGIN
    -- Try to get existing profile
    SELECT * INTO profile FROM public.user_profiles WHERE id = auth.uid();
    
    IF FOUND THEN
        RETURN profile;
    END IF;
    
    -- Get email for default display name
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    -- Create new profile
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (auth.uid(), split_part(user_email, '@', 1))
    RETURNING * INTO profile;
    
    RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to get loop member profiles (using 'id' column from user_profiles)
CREATE OR REPLACE FUNCTION public.get_loop_member_profiles(p_loop_id UUID)
RETURNS TABLE (
    out_user_id UUID,
    out_display_name TEXT,
    out_avatar_url TEXT,
    out_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lm.user_id AS out_user_id,
        COALESCE(up.display_name, split_part(au.email, '@', 1))::TEXT AS out_display_name,
        up.avatar_url::TEXT AS out_avatar_url,
        lm.role::TEXT AS out_role
    FROM public.loop_members lm
    LEFT JOIN public.user_profiles up ON up.id = lm.user_id
    LEFT JOIN auth.users au ON au.id = lm.user_id
    WHERE lm.loop_id = p_loop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
