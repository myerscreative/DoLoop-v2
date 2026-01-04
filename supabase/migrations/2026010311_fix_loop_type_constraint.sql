-- =====================================================
-- Fix Loop Type Constraint
-- =====================================================

-- The frontend can send 'manual', 'weekly', 'weekdays', 'custom', 'goals', 'daily' as loop_type.
-- The existing constraint only allows 'personal', 'work', 'daily', 'shared'.
-- We need to expand the constraint to allow all valid types.

ALTER TABLE loops DROP CONSTRAINT IF EXISTS loops_loop_type_check;

ALTER TABLE loops ADD CONSTRAINT loops_loop_type_check 
CHECK (loop_type IN (
  'personal', 
  'work', 
  'daily', 
  'shared', 
  'manual', 
  'weekly', 
  'weekdays', 
  'custom', 
  'goals'
));
