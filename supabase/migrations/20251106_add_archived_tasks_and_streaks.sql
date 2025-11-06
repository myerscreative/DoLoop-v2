-- Add archived_tasks table
CREATE TABLE IF NOT EXISTS archived_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_task_id UUID NOT NULL,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, loop_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_archived_tasks_loop_id ON archived_tasks(loop_id);
CREATE INDEX IF NOT EXISTS idx_archived_tasks_completed_at ON archived_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_loop_id ON user_streaks(loop_id);

-- Enable RLS
ALTER TABLE archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for archived_tasks
CREATE POLICY "Users can view archived tasks from their loops" ON archived_tasks
  FOR SELECT USING (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert archived tasks for their loops" ON archived_tasks
  FOR INSERT WITH CHECK (
    loop_id IN (
      SELECT id FROM loops WHERE owner_id = auth.uid()
      UNION
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks" ON user_streaks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own streaks" ON user_streaks
  FOR ALL USING (user_id = auth.uid());

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID, p_loop_id UUID)
RETURNS VOID AS $$
DECLARE
  v_completed_today BOOLEAN;
  v_yesterday_completed BOOLEAN;
  v_current_streak INTEGER;
BEGIN
  -- Check if user completed the loop today
  SELECT EXISTS(
    SELECT 1 FROM tasks
    WHERE loop_id = p_loop_id
    AND status = 'done'
    AND is_recurring = true
    AND DATE(updated_at) = CURRENT_DATE
  ) INTO v_completed_today;

  -- Check if user completed the loop yesterday
  SELECT EXISTS(
    SELECT 1 FROM tasks
    WHERE loop_id = p_loop_id
    AND status = 'done'
    AND is_recurring = true
    AND DATE(updated_at) = CURRENT_DATE - INTERVAL '1 day'
  ) INTO v_yesterday_completed;

  -- Get current streak
  SELECT current_streak INTO v_current_streak
  FROM user_streaks
  WHERE user_id = p_user_id AND loop_id = p_loop_id;

  IF v_current_streak IS NULL THEN
    v_current_streak := 0;
  END IF;

  -- Update streak logic
  IF v_completed_today THEN
    IF v_yesterday_completed OR v_current_streak = 0 THEN
      v_current_streak := v_current_streak + 1;
    ELSE
      v_current_streak := 1;
    END IF;
  ELSE
    v_current_streak := 0;
  END IF;

  -- Insert or update streak
  INSERT INTO user_streaks (user_id, loop_id, current_streak, updated_at)
  VALUES (p_user_id, p_loop_id, v_current_streak, NOW())
  ON CONFLICT (user_id, loop_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
