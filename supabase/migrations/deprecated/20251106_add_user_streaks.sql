-- Add user_streaks table for tracking consecutive days of completion
-- Global streak: tracks consecutive days where ALL daily loops were completed

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INT DEFAULT 0 NOT NULL,
  longest_streak INT DEFAULT 0 NOT NULL,
  last_completed_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own streak
CREATE POLICY "Users can view own streak" 
  ON user_streaks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" 
  ON user_streaks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own streak" 
  ON user_streaks FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Initialize streaks for existing users
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
SELECT DISTINCT id, 0, 0, NULL, NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

