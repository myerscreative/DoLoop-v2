-- Fix invitation system RLS and functions
-- Updates policies to work correctly with auth.users access

-- 1. Create helper function to get current user email (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Drop and recreate RLS policies using the helper function
DROP POLICY IF EXISTS "Owners can manage invitations" ON public.loop_invitations;
DROP POLICY IF EXISTS "Invitees can view their invitations" ON public.loop_invitations;
DROP POLICY IF EXISTS "Invitees can respond to invitations" ON public.loop_invitations;

-- Policy: Loop owners can manage invitations
CREATE POLICY "Owners can manage invitations" ON public.loop_invitations
    FOR ALL USING (
        loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid())
    );

-- Policy: Invitees can view invitations sent to their email
CREATE POLICY "Invitees can view their invitations" ON public.loop_invitations
    FOR SELECT USING (
        invitee_email = public.current_user_email()
    );

-- Policy: Invitees can update their own invitations (accept/decline)
CREATE POLICY "Invitees can respond to invitations" ON public.loop_invitations
    FOR UPDATE USING (
        invitee_email = public.current_user_email()
    );

-- 3. Update accept_invitation to use the helper
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    inv RECORD;
    user_email TEXT;
BEGIN
    -- Get current user's email using helper
    user_email := public.current_user_email();
    
    -- Get invitation
    SELECT * INTO inv FROM public.loop_invitations 
    WHERE id = invitation_id 
    AND invitee_email = user_email 
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if not expired
    IF inv.expires_at < now() THEN
        UPDATE public.loop_invitations SET status = 'expired' WHERE id = invitation_id;
        RETURN FALSE;
    END IF;
    
    -- Create loop membership
    INSERT INTO public.loop_members (loop_id, user_id, role)
    VALUES (inv.loop_id, auth.uid(), inv.role)
    ON CONFLICT (loop_id, user_id) DO NOTHING;
    
    -- Update invitation status
    UPDATE public.loop_invitations 
    SET status = 'accepted', accepted_at = now() 
    WHERE id = invitation_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update decline_invitation to use the helper
CREATE OR REPLACE FUNCTION public.decline_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    user_email := public.current_user_email();
    
    UPDATE public.loop_invitations 
    SET status = 'declined' 
    WHERE id = invitation_id 
    AND invitee_email = user_email 
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
