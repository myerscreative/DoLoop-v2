-- Phase 3b: Invitation System
-- Allows loop owners to invite other users to collaborate

-- 1. Create loop_invitations table
CREATE TABLE IF NOT EXISTS public.loop_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loop_id UUID NOT NULL REFERENCES public.loops(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    invitee_email TEXT NOT NULL,
    role TEXT DEFAULT 'sous-chef' CHECK (role IN ('sous-chef', 'viewer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(loop_id, invitee_email)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_loop_id ON public.loop_invitations(loop_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON public.loop_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.loop_invitations(status);

-- 3. Enable Real-time
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE loop_invitations;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 4. RLS
ALTER TABLE public.loop_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Loop owners can view/create/delete invitations for their loops
DROP POLICY IF EXISTS "Owners can manage invitations" ON public.loop_invitations;
CREATE POLICY "Owners can manage invitations" ON public.loop_invitations
    FOR ALL USING (
        loop_id IN (SELECT id FROM public.loops WHERE owner_id = auth.uid())
    );

-- Policy: Invitees can view invitations sent to their email
DROP POLICY IF EXISTS "Invitees can view their invitations" ON public.loop_invitations;
CREATE POLICY "Invitees can view their invitations" ON public.loop_invitations
    FOR SELECT USING (
        invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Invitees can update their own invitations (accept/decline)
DROP POLICY IF EXISTS "Invitees can respond to invitations" ON public.loop_invitations;
CREATE POLICY "Invitees can respond to invitations" ON public.loop_invitations
    FOR UPDATE USING (
        invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- 5. Function to accept an invitation (creates loop_member and updates status)
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    inv RECORD;
    user_email TEXT;
BEGIN
    -- Get current user's email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
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

-- 6. Function to decline an invitation
CREATE OR REPLACE FUNCTION public.decline_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    UPDATE public.loop_invitations 
    SET status = 'declined' 
    WHERE id = invitation_id 
    AND invitee_email = user_email 
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
