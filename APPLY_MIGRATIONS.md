# 🔄 Apply Database Migrations

The app requires database schema updates to function correctly on web. Follow these steps:

## ⚠️ Required Migrations

The following database tables/columns are missing:
1. `is_one_time` column in `tasks` table
2. `user_streaks` table
3. `archived_tasks` table  
4. `loop_type` column in `loops` table
5. `next_reset_at` column in `loops` table (for scheduled resets)

## 🚀 How to Apply

### Option 1: Run Consolidated Migration (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/00_apply_all_migrations.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

### Option 2: Install Supabase CLI & Run Migrations

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## ✅ Verify Migrations

After running the migrations, refresh your web app and:

1. Create a new loop
2. Add tasks (both recurring and one-time)
3. Check tasks to see the progress ring fill
4. Click "Reloop" button to reset tasks

## 🐛 Troubleshooting

If you see errors like:
- ❌ `Could not find the 'is_one_time' column` → Run migrations
- ❌ `Could not find the 'next_reset_at' column` → Run migrations
- ❌ `404 on user_streaks` → Run migrations
- ❌ `Table 'archived_tasks' does not exist` → Run migrations

## 📝 What Each Migration Does

- **loop_type** - Categorizes loops (personal, work, daily, shared)
- **next_reset_at** - Stores when a loop should automatically reset (for daily/weekly loops)
- **is_one_time** - Distinguishes one-time tasks from recurring tasks
- **archived_tasks** - Stores completed one-time tasks
- **user_streaks** - Tracks daily completion streaks per loop
- **RLS Policies** - Row-level security for data protection
- **Functions** - Helper functions for streak calculation

---

**After applying migrations, test the progress ring and reloop functionality on web!** 🎉

