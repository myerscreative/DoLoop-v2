-- Migration: Normalize shorthand categories to full names
-- Description: Ensures all templates use the full category names used in the UI filters
-- Date: 2026-01-03

-- Normalize shorthand categories to full names
UPDATE loop_templates SET category = 'Productivity & Work' WHERE category = 'work';
UPDATE loop_templates SET category = 'Personal Development' WHERE category = 'personal' OR category = 'Growth' OR category = 'lifestyle';
UPDATE loop_templates SET category = 'Relationships & Social' WHERE category = 'social';
UPDATE loop_templates SET category = 'Finance & Money' WHERE category = 'money';
UPDATE loop_templates SET category = 'Fitness & Sports' WHERE category = 'fitness';
UPDATE loop_templates SET category = 'Health & Wellness' WHERE category = 'health';
UPDATE loop_templates SET category = 'Learning & Education' WHERE category = 'learning';
UPDATE loop_templates SET category = 'Mindfulness & Spirituality' WHERE category = 'spirituality';
UPDATE loop_templates SET category = 'Home & Organization' WHERE category = 'home';
UPDATE loop_templates SET category = 'Career & Entrepreneurship' WHERE category = 'career';
UPDATE loop_templates SET category = 'Community & Campaigns' WHERE category = 'community';
UPDATE loop_templates SET category = 'Recovery & Rehab' WHERE category = 'recovery';

-- Also ensure 'goals' is mapped to something logical if used, or keep as is if it's a specific type.
-- Checking previous stats: 'daily' (8), 'weekly' (3), 'personal' (5 - now mapped to Personal Development)
-- 'daily' and 'weekly' are standard types in the UI filters too.
