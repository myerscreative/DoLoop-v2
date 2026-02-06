-- Migration: Add parent_task_id to tasks table for nested task support
-- Replaces the separate subtasks table with self-referencing parent-child relationships
-- Nesting is capped at 1 level via a trigger constraint

-- Step 1: Add parent_task_id column (nullable, self-referencing FK)
ALTER TABLE tasks
  ADD COLUMN parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Step 2: Create index for efficient child lookups
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Step 3: Backfill order_index based on created_at order per loop
-- (order_index exists but was defaulting to 0 for all rows)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY loop_id
    ORDER BY created_at ASC
  ) - 1 AS new_order
  FROM tasks
  WHERE parent_task_id IS NULL
)
UPDATE tasks SET order_index = ranked.new_order
FROM ranked WHERE tasks.id = ranked.id;

-- Step 4: Migrate existing subtasks into tasks table as child tasks
INSERT INTO tasks (
  id, loop_id, description, completed, is_one_time, is_critical,
  order_index, priority, parent_task_id, created_at, updated_at
)
SELECT
  s.id,
  t.loop_id,
  s.description,
  s.completed,
  t.is_one_time,
  false,
  s.order_index,
  'none',
  s.task_id,
  COALESCE(s.created_at, NOW()),
  NOW()
FROM subtasks s
JOIN tasks t ON s.task_id = t.id
ON CONFLICT (id) DO NOTHING;

-- Step 5: Add trigger to enforce max 1 level of nesting
CREATE OR REPLACE FUNCTION check_nesting_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_task_id IS NOT NULL THEN
    -- Ensure the parent itself has no parent (max 1 level)
    IF EXISTS (
      SELECT 1 FROM tasks
      WHERE id = NEW.parent_task_id
      AND parent_task_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Cannot nest deeper than 1 level';
    END IF;

    -- Ensure this task has no children (can''t become a child if it has children)
    IF TG_OP = 'UPDATE' AND EXISTS (
      SELECT 1 FROM tasks
      WHERE parent_task_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Cannot nest a task that has children';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_nesting_depth
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_nesting_depth();
