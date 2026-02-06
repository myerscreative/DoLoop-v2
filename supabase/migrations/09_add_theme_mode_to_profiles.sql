-- Add theme_mode column to user_profiles table
-- This allows users to manually switch between light and dark mode

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark'));

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.theme_mode IS 'User preference for light or dark mode theme';
