-- =====================================================
-- Add notes field to tasks table
-- =====================================================

-- Add notes column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for searching notes (optional but useful)
CREATE INDEX IF NOT EXISTS idx_tasks_notes ON tasks(notes) WHERE notes IS NOT NULL;

-- =====================================================
-- Verification
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks';

