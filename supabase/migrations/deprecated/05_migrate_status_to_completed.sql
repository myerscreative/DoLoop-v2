-- =====================================================
-- Migrate tasks.status (text) to tasks.completed (boolean)
-- =====================================================

-- 1. Add the completed column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- 2. Migrate existing data from status to completed
-- If status = 'done', then completed = true
-- Otherwise, completed = false
UPDATE tasks 
SET completed = (status = 'done')
WHERE completed IS NULL OR completed = false;

-- 3. Update any NULL values
UPDATE tasks 
SET completed = false 
WHERE completed IS NULL;

-- 4. Make completed NOT NULL now that all values are set
ALTER TABLE tasks ALTER COLUMN completed SET NOT NULL;

-- 5. Optional: Keep status column for now (don't drop it yet)
-- We'll keep both columns temporarily for safety
-- If you want to drop status column later, run:
-- ALTER TABLE tasks DROP COLUMN status;

-- 6. Add index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_is_one_time ON tasks(is_one_time);

-- =====================================================
-- Verification: Check the migration worked
-- =====================================================
-- Run this to verify:
-- SELECT id, description, status, completed, is_one_time 
-- FROM tasks 
-- LIMIT 10;

-- =====================================================
-- Done! Now tasks has both status and completed columns
-- The code will use 'completed' going forward
-- =====================================================

