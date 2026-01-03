-- Migration: Add reset_time and reset_day_of_week columns to loops table
-- This allows users to customize when their loops reset

-- Add reset_time column (defaults to 4am)
ALTER TABLE loops
ADD COLUMN IF NOT EXISTS reset_time TIME DEFAULT '04:00:00';

-- Add reset_day_of_week column (defaults to 1 = Monday)
ALTER TABLE loops
ADD COLUMN IF NOT EXISTS reset_day_of_week INTEGER DEFAULT 1;

-- Add comments for documentation
COMMENT ON COLUMN loops.reset_time IS 'Time of day when loop resets (24-hour format, e.g., 04:00:00 for 4am)';
COMMENT ON COLUMN loops.reset_day_of_week IS 'Day of week for weekly loops (0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday)';

-- Add constraint to ensure reset_day_of_week is between 0-6
ALTER TABLE loops
ADD CONSTRAINT loops_reset_day_of_week_check
CHECK (reset_day_of_week IS NULL OR (reset_day_of_week >= 0 AND reset_day_of_week <= 6));
