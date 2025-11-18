-- Add simple assignee field to tasks table
-- Allows storing a name, email address, or phone number for the person responsible

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignee TEXT;

-- Optional: basic index for filtering by assignee later
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);


