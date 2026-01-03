-- Add is_one_time column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT FALSE;

-- Update existing tasks - by default they should be recurring (is_one_time = false)
UPDATE tasks SET is_one_time = FALSE WHERE is_one_time IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE tasks ALTER COLUMN is_one_time SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_is_one_time ON tasks(is_one_time);

