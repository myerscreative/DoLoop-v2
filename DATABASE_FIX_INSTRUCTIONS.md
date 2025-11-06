# Database Schema Fix - Instructions ✅

## Problem Summary

The **Add Task button wasn't working** because of a database schema mismatch:

**Code Expected:**
- `completed` (boolean)
- `is_one_time` (boolean)

**Database Had:**
- Unknown or mismatched columns

## What Was Fixed

### 1. Code Changes ✅

Updated all code to match the actual database schema from `00_initial_schema.sql`:

**Task Interface** (`src/types/loop.ts`):
```typescript
// BEFORE (wrong)
export interface Task {
  status: 'pending' | 'done';
  is_recurring: boolean;
  assigned_user_id?: string;
}

// AFTER (correct)
export interface Task {
  completed: boolean;
  completed_at?: string;
  is_one_time: boolean;
  order_index?: number;
}
```

**LoopDetailScreen Functions**:
- ✅ `handleAddTask`: Insert with `completed: false, is_one_time`
- ✅ `toggleTask`: Update `completed` boolean
- ✅ `loadLoopData`: Filter by `!task.is_one_time` instead of `is_recurring`
- ✅ `resetLoop`: Set `completed: false` for recurring tasks
- ✅ All UI: Use `task.completed` instead of `task.status === 'done'`

### 2. SQL Migration Fix ✅

Fixed type casting error in `00_initial_schema.sql`:

```sql
-- BEFORE (error)
SELECT DISTINCT id, 0, 0, NULL, NOW()

-- AFTER (fixed)
SELECT DISTINCT id, 0, 0, NULL::timestamp with time zone, NOW()
```

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: doloop-v2
3. **Navigate to**: SQL Editor (left sidebar)
4. **Copy the entire contents** of:
   ```
   /Users/robertmyers/Code/doloop-v2/supabase/migrations/00_initial_schema.sql
   ```
5. **Paste into SQL Editor**
6. **Click**: Run (or Cmd/Ctrl + Enter)
7. **Wait** for success message

### Option 2: Supabase CLI

```bash
cd /Users/robertmyers/Code/doloop-v2

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Expected Database Schema

After running the migration, your `tasks` table should have:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  loop_id UUID REFERENCES loops(id),
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,        -- ✅ New
  completed_at TIMESTAMP WITH TIME ZONE,  -- ✅ New
  is_one_time BOOLEAN DEFAULT false,      -- ✅ New
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing After Migration

1. **Refresh the app**: http://localhost:8081
2. **Navigate to a loop**: Click Personal folder
3. **Click + button**: Opens "Add New Task" modal
4. **Enter task name**: e.g., "Call dentist"
5. **Click "Add Task"**: Should work! ✅
6. **Verify**: Task appears in the list

## Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- Check tasks table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks';

-- Should show: completed (boolean), is_one_time (boolean)

-- Test insert
INSERT INTO tasks (loop_id, description, completed, is_one_time)
VALUES (
  (SELECT id FROM loops LIMIT 1),
  'Test task',
  false,
  false
);

-- Should succeed!
```

## Troubleshooting

### Error: "column 'completed' does not exist"
**Solution**: Run the migration SQL in Supabase dashboard

### Error: "schema cache" errors
**Solution**: Restart Supabase (Settings → Database → Restart)

### Error: "permission denied"
**Solution**: Ensure RLS policies are correct (they're in the migration)

## Files Changed

| File | Changes |
|------|---------|
| `src/types/loop.ts` | Updated Task interface |
| `src/screens/LoopDetailScreen.tsx` | Fixed all queries and UI |
| `supabase/migrations/00_initial_schema.sql` | Fixed type casting |

## Commit

```bash
git commit: "fix: correct database schema to match actual Supabase structure"
```

## Summary

- ✅ **Code fixed**: All functions now use correct column names
- ✅ **Types fixed**: Task interface matches database
- ✅ **SQL fixed**: Type casting error resolved
- ⏳ **Database**: Needs migration applied
- ⏳ **Testing**: After migration, Add Task will work

## Next Steps

1. Apply the database migration (Option 1 or 2 above)
2. Refresh the app
3. Test adding a task
4. 🎉 Celebrate when it works!

---

**Status**: Code ✅ Complete | Database ⏳ Awaiting Migration

