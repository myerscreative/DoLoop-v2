-- =====================================================
-- Update Loop Recurrence Patterns
-- Date: 2026-01-02
-- =====================================================

-- Add 'weekdays' and 'custom' to reset_rule constraint
ALTER TABLE loops DROP CONSTRAINT IF EXISTS check_reset_rule;
ALTER TABLE loops ADD CONSTRAINT check_reset_rule 
  CHECK (reset_rule IN ('manual', 'daily', 'weekdays', 'weekly', 'custom'));

-- Add column for custom day selection (0=Sunday, 1=Monday, ..., 6=Saturday)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loops' AND column_name = 'custom_days') THEN
    ALTER TABLE loops ADD COLUMN custom_days INTEGER[];
  END IF;
END $$;

-- Update comment to reflect recurrence patterns
COMMENT ON COLUMN loops.reset_rule IS 
  'Loop recurrence pattern:
   - manual: One-time use, reset manually (e.g., camping checklist)
   - daily: Resets every morning at 4am
   - weekdays: Resets Monday-Friday at 4am
   - weekly: Resets every Monday at 4am  
   - custom: Resets on specific days defined in custom_days array';

COMMENT ON COLUMN loops.custom_days IS
  'Array of day numbers when reset_rule is custom. 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';

SELECT 'Migration completed: added weekdays and custom recurrence patterns' AS status;
