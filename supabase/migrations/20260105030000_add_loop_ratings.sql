-- =====================================================
-- Add Star Rating System for Loops
-- Enables users to rate "Success Recipes" (1-5 stars)
-- =====================================================

-- 1. Add rating columns to loops table
ALTER TABLE loops ADD COLUMN IF NOT EXISTS average_rating FLOAT DEFAULT 0;
ALTER TABLE loops ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- 2. Create ratings table for individual user ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, loop_id)  -- One rating per user per loop
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_loop_id ON ratings(loop_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_loops_average_rating ON loops(average_rating);

-- 4. Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for ratings table
-- Everyone can view ratings (needed for aggregate display)
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
CREATE POLICY "Anyone can view ratings" ON ratings
  FOR SELECT USING (true);

-- Users can only insert their own ratings
DROP POLICY IF EXISTS "Users can insert own ratings" ON ratings;
CREATE POLICY "Users can insert own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
CREATE POLICY "Users can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ratings
DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;
CREATE POLICY "Users can delete own ratings" ON ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create function to recalculate loop average rating
CREATE OR REPLACE FUNCTION recalculate_loop_rating(target_loop_id UUID)
RETURNS void AS $$
DECLARE
  new_average FLOAT;
  new_total INTEGER;
BEGIN
  SELECT COALESCE(AVG(score::FLOAT), 0), COUNT(*)
  INTO new_average, new_total
  FROM ratings
  WHERE loop_id = target_loop_id;
  
  UPDATE loops
  SET average_rating = new_average,
      total_ratings = new_total,
      updated_at = NOW()
  WHERE id = target_loop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to auto-update loop ratings on rating changes
CREATE OR REPLACE FUNCTION trigger_recalculate_loop_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_loop_rating(OLD.loop_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_loop_rating(NEW.loop_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_loop_rating();

-- =====================================================
-- Migration Complete - Star Rating System Ready
-- =====================================================
