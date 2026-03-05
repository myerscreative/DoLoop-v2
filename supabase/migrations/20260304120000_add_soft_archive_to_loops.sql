-- Add soft-archive support for loops (non-destructive archive)
ALTER TABLE loops
ADD COLUMN IF NOT EXISTS status TEXT
  CHECK (status IN ('active', 'paused', 'archived'))
  DEFAULT 'active';

ALTER TABLE loops
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Backfill existing rows for consistent filtering.
UPDATE loops
SET status = 'active'
WHERE status IS NULL;
