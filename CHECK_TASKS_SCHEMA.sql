-- =====================================================
-- Check Current Tasks Table Schema
-- Run this in Supabase SQL Editor to see what you have
-- =====================================================

-- 1. Check what columns exist in tasks table
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 2. If you see 'status' instead of 'completed', run this:
-- (Uncomment and run if needed)

/*
-- Add the completed column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Copy status to completed if status column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'status'
    ) THEN
        UPDATE tasks SET completed = (status = 'done');
        ALTER TABLE tasks DROP COLUMN status;
    END IF;
END $$;
*/

-- 3. Add other missing columns
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 4. Verify the final structure
-- SELECT * FROM tasks LIMIT 1;

