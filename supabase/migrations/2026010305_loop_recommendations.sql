-- AI Loop Recommendation Sessions
-- Created: 2026-01-03
-- Purpose: Track AI-powered loop recommendation sessions and adoption

-- Track AI recommendation sessions for analytics
CREATE TABLE IF NOT EXISTS loop_recommendation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  parsed_goal TEXT,
  recommendations JSONB NOT NULL,  -- Array of recommendations
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which recommendations were adopted
CREATE TABLE IF NOT EXISTS loop_recommendations_adopted (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES loop_recommendation_sessions(id) ON DELETE CASCADE,
  course TEXT NOT NULL,  -- starter, main, side, dessert
  template_id UUID REFERENCES loop_templates(id) ON DELETE SET NULL,
  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE,  -- The created loop
  adopted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_user 
  ON loop_recommendation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_created 
  ON loop_recommendation_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_adopted_session 
  ON loop_recommendations_adopted(session_id);

-- Enable RLS
ALTER TABLE loop_recommendation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loop_recommendations_adopted ENABLE ROW LEVEL SECURITY;

-- RLS policies for recommendation sessions
CREATE POLICY "Users can view own recommendation sessions" 
  ON loop_recommendation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendation sessions" 
  ON loop_recommendation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for adopted recommendations
CREATE POLICY "Users can view own adopted recommendations" 
  ON loop_recommendations_adopted
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loop_recommendation_sessions s 
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own adopted recommendations" 
  ON loop_recommendations_adopted
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM loop_recommendation_sessions s 
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
GRANT SELECT, INSERT ON loop_recommendation_sessions TO authenticated;
GRANT SELECT, INSERT ON loop_recommendations_adopted TO authenticated;
