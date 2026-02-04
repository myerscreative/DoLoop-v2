-- Migration: Add Practice Loop Reflections
-- Date: 2026-01-05

-- NOTE: function_type column is added in 20260105040100_add_practice_loops.sql

-- 1. Create task_reflections table
-- Stores the daily "Chef's Tip" reflection for a specific task and date
CREATE TABLE IF NOT EXISTS task_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reflection_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one reflection per task per user per day
  UNIQUE(task_id, user_id, reflection_date)
);

-- 3. Create index for fast lookups by task and date
CREATE INDEX IF NOT EXISTS idx_task_reflections_task_date 
  ON task_reflections(task_id, reflection_date);

-- 4. Enable RLS
ALTER TABLE task_reflections ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS Policies
DROP POLICY IF EXISTS "Users can manage their own reflections" ON task_reflections;
CREATE POLICY "Users can manage their own reflections"
  ON task_reflections FOR ALL
  USING (user_id = auth.uid());
