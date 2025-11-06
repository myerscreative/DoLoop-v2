# Debugging 500 Error from Supabase

## Current Error
```
Failed to load resource: the server responded with a status of 500
/rest/v1/loops?select=*&owner_id=eq.da6ff6aa-24f6-4012-b656-33d5fda358d3
Error loading home data
```

## Likely Causes

### 1. Column Name Mismatch
The migration might have created `owner` instead of `owner_id`.

### 2. RLS Policy Error
Row Level Security policies might be failing.

### 3. Foreign Key Constraint
The `owner_id` reference to `auth.users(id)` might be broken.

## How to Debug in Supabase Dashboard

### Step 1: Check Logs
1. Go to: https://supabase.com/dashboard
2. Navigate to: **Logs** → **Postgres Logs**
3. Look for recent errors around the time of the 500 error
4. The error message will tell you exactly what's wrong

### Step 2: Check Table Structure
1. Go to: **Table Editor**
2. Select: **loops** table
3. Verify these columns exist:
   - `id` (uuid)
   - `owner_id` (uuid) ← **Check this name!**
   - `name` (text)
   - `color` (text)
   - `reset_rule` (text)
   - `next_reset_at` (timestamptz)
   - `loop_type` (text)
   - `is_favorite` (boolean)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### Step 3: Test Query Directly
1. Go to: **SQL Editor**
2. Run this query:
```sql
-- Test if table exists and has data
SELECT * FROM loops LIMIT 5;

-- Check column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'loops';

-- Test RLS (this should work if you're logged in)
SELECT * FROM loops 
WHERE owner_id = auth.uid();
```

### Step 4: Check RLS Policies
1. Go to: **Authentication** → **Policies**
2. Find: **loops** table
3. Verify these policies exist:
   - `Users can view their own loops`
   - `Users can create loops`
   - `Users can update their own loops`
   - `Users can delete their own loops`

## Quick Fixes

### Fix 1: If Column is Named `owner` Instead of `owner_id`

Run this in SQL Editor:
```sql
-- Rename column
ALTER TABLE loops 
RENAME COLUMN owner TO owner_id;
```

### Fix 2: If RLS Policies Are Missing

Run this in SQL Editor:
```sql
-- Enable RLS
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;

-- Add basic policy
DROP POLICY IF EXISTS "Users can manage their own loops" ON loops;
CREATE POLICY "Users can manage their own loops" ON loops
  FOR ALL USING (owner_id = auth.uid());
```

### Fix 3: If Foreign Key is Broken

Check if the issue is with the foreign key:
```sql
-- Check foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f' AND conrelid::regclass::text = 'loops';
```

## Most Likely Issue

Based on the error, I suspect the column might be named `owner` in the database but the code is querying `owner_id`.

**To verify**: Go to Table Editor → loops → check if column is `owner` or `owner_id`

**If it's `owner`**: Run Fix 1 above to rename it.

## After Fixing

1. Refresh the app: http://localhost:8081
2. Check browser console for new errors
3. Should load successfully!

