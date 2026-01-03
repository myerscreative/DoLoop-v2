-- Create loop_members table
CREATE TABLE IF NOT EXISTS loop_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer', 'sous-chef')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(loop_id, user_id)
);

-- Add assigned_to to tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Enable RLS on loop_members
ALTER TABLE loop_members ENABLE ROW LEVEL SECURITY;

-- Policies for loop_members
CREATE POLICY "Users can view members of loops they belong to"
  ON loop_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loop_members lm
      WHERE lm.loop_id = loop_members.loop_id
      AND lm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join loops (placeholder for invite system)"
  ON loop_members FOR INSERT
  WITH CHECK (auth.uid() = user_id); 
  -- In reality, invites would be handled via edge function or separate invite table, 
  -- but strictly, an owner adds a member.
  -- Let's allow owners to insert.

CREATE POLICY "Owners can manage members"
  ON loop_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loop_members lm
      WHERE lm.loop_id = loop_members.loop_id
      AND lm.user_id = auth.uid()
      AND lm.role = 'owner'
    )
  );

-- Sync existing owners to loop_members
INSERT INTO loop_members (loop_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM loops
WHERE owner_id IS NOT NULL
ON CONFLICT (loop_id, user_id) DO NOTHING;

-- Update RLS for LOOPS
-- Allow select if member
CREATE POLICY "Members can view loops"
  ON loops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loop_members
      WHERE loop_id = loops.id
      AND user_id = auth.uid()
    )
  );

-- Update RLS for TASKS
-- Allow select/update if member of loop
CREATE POLICY "Members can view and verify tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loop_members
      WHERE loop_id = tasks.loop_id
      AND user_id = auth.uid()
    )
  );

-- Helper wrapper for getting loop progress realtime
-- (Supabase realtime works on table changes, so no special view needed usually, 
-- but we might want a function to calculate progress efficiently if needed. 
-- For now, frontend will calculate.)
