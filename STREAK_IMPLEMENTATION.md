# Streak Counter Implementation 🔥

## Overview
Implemented a **global streak counter** that tracks consecutive days where ALL daily loops are completed. The streak appears in the HomeScreen header next to the date.

---

## Database Changes

### New Table: `user_streaks`
```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- User-level tracking (not per-loop)
- Tracks current streak and longest streak
- RLS enabled for user privacy

---

## Implementation Details

### 1. Migration File
**Location:** `supabase/migrations/20251106_add_user_streaks.sql`

- Creates `user_streaks` table with proper constraints
- Sets up RLS policies for user data protection
- Initializes streaks for existing users

### 2. Streak Logic (LoopDetailScreen.tsx)
**Trigger:** When user completes all tasks in a daily loop and presses "Reloop"

**Flow:**
1. Check if loop is daily and 100% complete
2. Query all daily loops for the user
3. Verify ALL daily loops are complete
4. Calculate streak:
   - If completed yesterday → increment streak
   - If missed a day → reset to 1
   - If already counted today → maintain current
5. Update `user_streaks` table

**Code Location:** `src/screens/LoopDetailScreen.tsx` → `resetLoop()` function (lines 199-272)

### 3. Display (HomeScreen.tsx)
**Location:** Top bar, right of date

**Features:**
- 🔥 emoji with streak count
- Yellow badge styling (#FFE066)
- Only shows when streak > 0
- Updates on screen refresh/navigation

**Code Location:** `src/screens/HomeScreen.tsx` → Header section (lines 207-224)

---

## Migration Application

### Apply to Supabase:

1. Open Supabase SQL Editor
2. Run the migration:

```sql
-- Copy from: supabase/migrations/20251106_add_user_streaks.sql

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INT DEFAULT 0 NOT NULL,
  longest_streak INT DEFAULT 0 NOT NULL,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" 
  ON user_streaks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" 
  ON user_streaks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own streak" 
  ON user_streaks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
SELECT DISTINCT id, 0, 0, NULL, NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

3. Verify table creation: `SELECT * FROM user_streaks;`

---

## Testing Checklist

### Test Scenario 1: First Completion
- [ ] Create a daily loop with tasks
- [ ] Complete all tasks
- [ ] Press "Reloop"
- [ ] Check HomeScreen header shows 🔥 1

### Test Scenario 2: Consecutive Days
- [ ] Complete all daily loops today
- [ ] Manually update `last_completed_date` to yesterday
- [ ] Complete and reloop again
- [ ] Verify streak increments to 🔥 2

### Test Scenario 3: Missed Day
- [ ] Set `last_completed_date` to 3 days ago
- [ ] Complete all daily loops
- [ ] Press "Reloop"
- [ ] Verify streak resets to 🔥 1

### Test Scenario 4: Multiple Daily Loops
- [ ] Create 2+ daily loops
- [ ] Complete only one loop
- [ ] Press "Reloop"
- [ ] Verify streak does NOT increment
- [ ] Complete remaining loops
- [ ] Verify streak NOW increments

---

## Files Modified

1. **supabase/migrations/20251106_add_user_streaks.sql** (NEW)
   - User streaks table definition

2. **supabase/migrations/00_apply_all_migrations.sql**
   - Updated to include global streak schema

3. **src/screens/LoopDetailScreen.tsx**
   - Added streak calculation logic in `resetLoop()`
   - Removed old per-loop streak display

4. **src/screens/HomeScreen.tsx**
   - Updated to fetch global user streak
   - Enhanced header display with streak badge

---

## Expected UI

### HomeScreen Header
```
Wednesday, November 6     🔥 3
Good morning! 🌅
```

### No Streak
```
Wednesday, November 6
Good morning! 🌅
```

---

## Future Enhancements

- [ ] Add streak history chart
- [ ] Show longest streak in profile
- [ ] Push notifications for streak maintenance
- [ ] Weekly/monthly streak badges
- [ ] Share streak achievements

---

## Notes

- Streak only counts **daily loops** (not weekly or manual)
- Requires **ALL** daily loops to be complete
- Resets if a day is missed
- Updates in real-time on reloop action
- Protected by RLS (users only see their own streak)

---

## Commit Message
```
feat: add global streak counter with daily loop completion

- Add user_streaks table for tracking consecutive completion days
- Implement streak logic on daily loop reloop
- Display 🔥 streak badge in HomeScreen header
- Update master migration file
- Remove old per-loop streak tracking

Closes: Streak Counter Feature
```

