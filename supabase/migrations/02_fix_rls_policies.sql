-- =====================================================
-- Fix RLS Policies - Remove Infinite Recursion
-- =====================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own loops" ON loops;
DROP POLICY IF EXISTS "Users can create their own loops" ON loops;
DROP POLICY IF EXISTS "Users can update their own loops" ON loops;
DROP POLICY IF EXISTS "Users can delete their own loops" ON loops;

-- Create simpler policies without recursion
CREATE POLICY "Users can view their own loops" ON loops
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own loops" ON loops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own loops" ON loops
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own loops" ON loops
  FOR DELETE USING (owner_id = auth.uid());

-- Add policy to view shared loops (members can see loops they're part of)
CREATE POLICY "Users can view shared loops" ON loops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loop_members 
      WHERE loop_members.loop_id = loops.id 
      AND loop_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- Migration Complete!
-- =====================================================

