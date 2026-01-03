-- Terminology Update: Replace 'sous-chef' with 'collaborator'
-- Migration: 20260103_update_role_terminology.sql

-- Update existing roles
UPDATE public.loop_members SET role = 'collaborator' WHERE role = 'sous-chef';
UPDATE public.loop_members SET role = 'collaborator' WHERE role = 'editor';

-- Note: 'owner' concept is on loops.owner_id, not in loop_members.role
-- We now use: creator (loops.owner_id), collaborator, assigned, viewer
