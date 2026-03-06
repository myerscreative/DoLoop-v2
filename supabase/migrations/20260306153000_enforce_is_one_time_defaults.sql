-- Ensure Success Recipe flag exists and is safe for existing data.
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT FALSE;

-- Backfill legacy rows that may have NULL values.
UPDATE tasks
SET is_one_time = FALSE
WHERE is_one_time IS NULL;

-- Enforce recurring-by-default behavior at the schema level.
ALTER TABLE tasks
ALTER COLUMN is_one_time SET DEFAULT FALSE;

ALTER TABLE tasks
ALTER COLUMN is_one_time SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_is_one_time ON tasks(is_one_time);
