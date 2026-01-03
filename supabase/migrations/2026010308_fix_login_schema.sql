-- Fix Login and Database Errors
-- 1. Add is_admin column to user_profiles
-- 2. Fix RLS recursion on loop_members

-- 1. Add is_admin to user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Fix RLS recursion
-- The recursion likely happens because "Members can view fellow loop members" checks loop access, 
-- and loop access checks membership.
-- We will simplify the membership policy to only check direct membership or ownership.

DROP POLICY IF EXISTS "Members can view fellow loop members" ON public.loop_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.loop_members;

-- Allow users to view their own membership rows
CREATE POLICY "Users can view their own membership" ON public.loop_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Allow users to view members of loops they own
CREATE POLICY "Owners can view loop members" ON public.loop_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loops
      WHERE id = loop_members.loop_id
      AND owner_id = auth.uid()
    )
  );

-- Allow users to view members of loops they are a member of (without recursion)
-- We use a security definer function or direct check to break recursion if needed,
-- but for now, let's just allow viewing if you are in the loop_members table for that loop.
-- To avoid recursion, we must NOT query loop_members inside the loop_members policy in a way that triggers the policy again.
-- But checking "am I a member of this loop" requires querying loop_members.
-- The standard way to fix this is to use `auth.uid() = user_id` which we did above.
-- To see *other* members, we need to check if we share a loop.
-- Let's use a simplified approach:
-- You can see a loop_member row if:
-- 1. It's you (covered above)
-- 2. It's for a loop you own (covered above)
-- 3. It's for a loop where you are ALSO a member.
-- This third one is the recursive one.
-- We can solve it by using a different table or a security definer function that bypasses RLS.

-- We use the existing parameter name "_loop_id" to avoid "cannot change name of input parameter" error
-- This allows us to use CREATE OR REPLACE without dropping the function (which would break dependent policies)
CREATE OR REPLACE FUNCTION public.is_loop_member(_loop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.loop_members
    WHERE loop_id = _loop_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Members can view fellow loop members" ON public.loop_members
  FOR SELECT USING (
    public.is_loop_member(loop_id)
  );
