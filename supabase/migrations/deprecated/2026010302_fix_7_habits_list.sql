-- Migration: Fix 7 Habits List (V2)
-- Description: Split the combined 6th & 7th habits into distinct tasks and add detailed hints
-- Date: 2026-01-03

DO $$
DECLARE
  template_id_var UUID := '10000000-0000-0000-0000-000000000007';
BEGIN
  -- 1. Update the template metadata to confirm migration ran
  UPDATE loop_templates 
  SET 
    title = '7 Habits: Weekly Reflection',
    description = 'Master Stephen Covey''s principles. This loop guides you through all 7 Habits for a complete weekly masterclass in effectiveness.'
  WHERE id = template_id_var;

  -- 2. Delete existing tasks for this template
  DELETE FROM template_tasks WHERE template_id = template_id_var;

  -- 3. Insert the correct 7 habits with detailed hints
  INSERT INTO template_tasks (template_id, description, is_recurring, display_order, hint)
  VALUES
    (template_id_var, 'Habit 1: Be Proactive', true, 1, 'Focus on your Circle of Influence. Take responsibility for your life and choices rather than being controlled by circumstances. Practice the "pause" between stimulus and response.'),
    (template_id_var, 'Habit 2: Begin with the End in Mind', true, 2, 'Clearly define your vision and values. Create a personal mission statement. Everything you do should align with your ultimate long-term goals.'),
    (template_id_var, 'Habit 3: Put First Things First', true, 3, 'Prioritize your activities based on importance rather than urgency. Spend more time in "Quadrant II" (Important, Not Urgent) tasks to prevent crises.'),
    (template_id_var, 'Habit 4: Think Win-Win', true, 4, 'Seek mutually beneficial solutions in all interactions. Operate from an "Abundance Mentality" - believing there is plenty for everyone, which fosters collaboration.'),
    (template_id_var, 'Habit 5: Seek First to Understand, Then to Be Understood', true, 5, 'Practice empathetic listening. Truly listen to understand the other person''s perspective before trying to explain your own. This builds deep trust and solve conflicts.'),
    (template_id_var, 'Habit 6: Synergize', true, 6, 'Value differences and work collaboratively to achieve results that individuals couldn''t reach alone. Real synergy happens when 1 + 1 equals 3 or more.'),
    (template_id_var, 'Habit 7: Sharpen the Saw', true, 7, 'Dedicate time to consistent self-renewal in four key areas: Physical (exercise/nutrition), Mental (reading/writing), Social/Emotional (connection), and Spiritual (meditation/values).');

  RAISE NOTICE 'Successfully updated 7 Habits template tasks';
END $$;
