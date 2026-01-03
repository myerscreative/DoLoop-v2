-- Migration: Add AI-generated tracking to tasks
-- Description: Adds a field to track whether task notes were AI-generated
-- Date: 2026-01-03

-- Add ai_generated_at timestamp to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ;

-- Add comment to explain the field
COMMENT ON COLUMN tasks.ai_generated_at IS 'Timestamp when AI generated the notes for this task. NULL means notes are manual or not AI-generated.';
