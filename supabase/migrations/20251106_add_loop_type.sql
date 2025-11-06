-- Add loop_type column to loops table
ALTER TABLE loops ADD COLUMN IF NOT EXISTS loop_type TEXT DEFAULT 'personal';

-- Add check constraint for valid loop types
ALTER TABLE loops ADD CONSTRAINT check_loop_type CHECK (loop_type IN ('personal', 'work', 'daily', 'shared'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_loops_loop_type ON loops(loop_type);

