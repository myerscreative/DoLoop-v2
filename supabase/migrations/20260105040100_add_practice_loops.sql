-- =====================================================
-- Add Practice Loops Feature
-- Distinguishes between Execution Loops (checklists)
-- and Practice Loops (daily habits with streak tracking)
-- =====================================================

-- 1. Add function_type column to loops table
ALTER TABLE loops ADD COLUMN IF NOT EXISTS function_type TEXT DEFAULT 'execution'
  CHECK (function_type IN ('execution', 'practice'));

-- NOTE: loop_streaks table is created in 20260105030100_add_loop_streaks.sql

-- =====================================================
-- Migration Complete!
-- =====================================================
