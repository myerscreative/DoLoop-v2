-- Set dev@dev.com as admin
-- Run this in your Supabase SQL Editor
-- This ONLY sets admin status - it does NOT create policies or tables

-- First, ensure user_profiles row exists (create if it doesn't)
INSERT INTO user_profiles (id)
SELECT id FROM auth.users WHERE email = 'dev@dev.com'
ON CONFLICT (id) DO NOTHING;

-- Then set admin status
UPDATE user_profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'dev@dev.com'
);

-- Verify the update
SELECT 
  u.email,
  up.is_admin,
  up.id,
  CASE 
    WHEN up.is_admin = true THEN '✅ Admin access granted'
    ELSE '❌ Not an admin'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'dev@dev.com';

