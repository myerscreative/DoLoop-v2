-- Add next_reset_at column to loops table for scheduled resets
ALTER TABLE loops ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMP WITH TIME ZONE;

-- Set default values for existing loops based on reset_rule
UPDATE loops 
SET next_reset_at = CASE 
  WHEN reset_rule = 'daily' THEN NOW() + INTERVAL '1 day'
  WHEN reset_rule = 'weekly' THEN NOW() + INTERVAL '7 days'
  ELSE NULL
END
WHERE next_reset_at IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_loops_next_reset_at ON loops(next_reset_at);

