-- Migration: Add Loop Library Data (v1)
-- Description: Insert first batch of loop templates and creators
-- Date: 2026-01-03

-- Insert sample creators
INSERT INTO template_creators (id, name, bio, title, photo_url) VALUES
  (
    '00000000-0000-0000-0000-000000000004',
    'David Goggins',
    'David Goggins is an ultra‑endurance athlete, retired Navy SEAL, and author of "Can’t Hurt Me". He teaches mental toughness through extreme challenges.',
    'Endurance Athlete & Author',
    'https://example.com/photos/david-goggins.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Tony Robbins',
    'Tony Robbins is a world‑renowned motivational speaker and author who helps people unleash personal power and achieve massive results.',
    'Motivational Speaker',
    'https://example.com/photos/tony-robbins.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Brendon Burchard',
    'Brendon Burchard is a high‑performance coach and author of "High Performance Habits", teaching strategies for sustained success.',
    'High‑Performance Coach',
    'https://example.com/photos/brendon-burchard.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'Cal Newport',
    'Cal Newport is a computer science professor and author of "Deep Work" and "Digital Minimalism", focusing on focused productivity.',
    'Author & Professor',
    'https://example.com/photos/cal-newport.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Robin Sharma',
    'Robin Sharma is a leadership expert and author of "The 5‑AM Club", teaching early‑morning routines for peak performance.',
    'Leadership Expert',
    'https://example.com/photos/robin-sharma.jpg'
  );
INSERT INTO template_creators (id, name, bio, title, photo_url) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'James Clear',
    'James Clear is a writer and speaker focused on habits, decision making, and continuous improvement. His work has appeared in the New York Times, Time, and Entrepreneur. His book "Atomic Habits" has sold millions of copies worldwide.',
    'Author & Speaker',
    'https://jamesclear.com/wp-content/uploads/2020/01/james-clear-2019-square.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'David Allen',
    'David Allen is a productivity consultant and author of the bestselling book "Getting Things Done" (GTD). He has coached over a million professionals on personal productivity and organizational effectiveness.',
    'Productivity Consultant',
    'https://gettingthingsdone.com/wp-content/uploads/2020/07/David-Allen-headshot.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Tim Ferriss',
    'Tim Ferriss is an entrepreneur, author, and podcaster. He has written several #1 New York Times bestsellers including "The 4-Hour Workweek" and hosts one of the world''s most popular podcasts, The Tim Ferriss Show.',
    'Entrepreneur & Author',
    'https://tim.blog/wp-content/uploads/2020/01/tim-ferriss-high-res.jpg'
  );

-- Insert sample loop templates
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '40‑Day Mental Toughness Challenge',
    '40‑day progressive habit loop based on Goggins’ mental‑hardening principles.',
    'Can’t Hurt Me',
    'https://www.amazon.com/dp/1524762589?tag=YOUR_AMAZON_TAG-20',
    '#D32F2F',
    'personal',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'Power Hours Mastery',
    '2‑hour focused work blocks with Tony Robbins’ peak‑state techniques.',
    'Awaken the Giant Within',
    'https://www.amazon.com/dp/1501124021?tag=YOUR_AMAZON_TAG-20',
    '#FF9800',
    'work',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000006',
    'High‑Performance Habits Sprint',
    '6‑day sprint implementing Brendon Burchard’s core habits.',
    'High Performance Habits',
    'https://www.amazon.com/dp/1941631105?tag=YOUR_AMAZON_TAG-20',
    '#2196F3',
    'personal',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000007',
    'Deep Work Session (expanded)',
    '90‑minute deep‑focus session with pre‑ and post‑reflection.',
    'Deep Work',
    'https://www.amazon.com/dp/1455586692?tag=YOUR_AMAZON_TAG-20',
    '#4CAF50',
    'work',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000008',
    '5‑AM Club Sunrise Routine',
    '5‑AM ritual based on Robin Sharma’s 20/20/20 formula.',
    'The 5‑AM Club',
    'https://www.amazon.com/dp/1443456624?tag=YOUR_AMAZON_TAG-20',
    '#FFC041',
    'daily',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000004',
    'Goggins “Stay Hard” Daily Reset',
    'Quick mental‑toughness check‑in each morning.',
    'Can’t Hurt Me',
    'https://www.amazon.com/dp/1524762589?tag=YOUR_AMAZON_TAG-20',
    '#C62828',
    'daily',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000005',
    'Robbins Goal‑Setting Blueprint',
    'Structured weekly goal‑setting using Robbins’ strategies.',
    'Awaken the Giant Within',
    'https://www.amazon.com/dp/1501124021?tag=YOUR_AMAZON_TAG-20',
    '#FF5722',
    'weekly',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000006',
    'Burchard Energy Boost',
    'Daily energy‑management habits (sleep, nutrition, movement).',
    'High Performance Habits',
    'https://www.amazon.com/dp/1941631105?tag=YOUR_AMAZON_TAG-20',
    '#03A9F4',
    'daily',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000007',
    'Digital Minimalism Clean‑Up',
    'Weekly digital declutter based on Newport’s principles.',
    'Digital Minimalism',
    'https://www.amazon.com/dp/0525536515?tag=YOUR_AMAZON_TAG-20',
    '#009688',
    'weekly',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000008',
    '5‑AM Club Evening Wind‑Down',
    'Pre‑sleep routine to support early‑morning performance.',
    'The 5‑AM Club',
    'https://www.amazon.com/dp/1443456624?tag=YOUR_AMAZON_TAG-20',
    '#795548',
    'personal',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000004',
    'Goggins “Ultra‑Endurance” Weekly Plan',
    'Weekly training plan with progressive mileage and mental‑toughness drills.',
    'Can’t Hurt Me',
    'https://www.amazon.com/dp/1524762589?tag=YOUR_AMAZON_TAG-20',
    '#E53935',
    'work',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000005',
    'Robbins “Peak State” Daily Ritual',
    '5‑minute visualization & affirmation routine.',
    'Awaken the Giant Within',
    'https://www.amazon.com/dp/1501124021?tag=YOUR_AMAZON_TAG-20',
    '#FF9800',
    'daily',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000006',
    'Burchard “Clarity & Focus” Sprint',
    '3‑day sprint to define top priorities and eliminate distractions.',
    'High Performance Habits',
    'https://www.amazon.com/dp/1941631105?tag=YOUR_AMAZON_TAG-20',
    '#1976D2',
    'personal',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000007',
    'Newport “Deep Work” Weekly Planner',
    'Schedule deep‑work blocks, shallow work, and recovery.',
    'Deep Work',
    'https://www.amazon.com/dp/1455586692?tag=YOUR_AMAZON_TAG-20',
    '#00796B',
    'work',
    false
  );
-- NOTE: Replace 'YOUR_AMAZON_TAG-20' with your actual Amazon Associates tag
-- Example: If your tag is 'doloop-20', change all URLs to use ?tag=doloop-20
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Atomic Habits Daily Reset',
    'Build better habits with James Clear''s proven framework. This loop helps you implement the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying.',
    'Atomic Habits',
    'https://www.amazon.com/dp/0735211299?tag=YOUR_AMAZON_TAG-20',
    '#4CAF50',
    'daily',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'GTD Weekly Review',
    'Master your productivity with David Allen''s Getting Things Done methodology. This weekly review loop ensures you stay on top of all your commitments and maintain a clear mind.',
    'Getting Things Done',
    'https://www.amazon.com/dp/0143126563?tag=YOUR_AMAZON_TAG-20',
    '#0CB6CC',
    'work',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Morning Routine Optimization',
    'Start your day like a high performer using principles from Tim Ferriss. This morning routine combines journaling, exercise, and strategic planning to set you up for success.',
    'The 4-Hour Workweek',
    'https://www.amazon.com/dp/0307465357?tag=YOUR_AMAZON_TAG-20',
    '#FEC041',
    'personal',
    true
  );

-- Insert sample tasks for templates
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  -- Atomic Habits Daily Reset
  ('10000000-0000-0000-0000-000000000001', 'Review your habit scorecard', true, 1),
  ('10000000-0000-0000-0000-000000000001', 'Complete your identity-based goal', true, 2),
  ('10000000-0000-0000-0000-000000000001', 'Stack a new habit onto an existing one', true, 3),
  ('10000000-0000-0000-0000-000000000001', 'Track your daily habits in your journal', true, 4),
  ('10000000-0000-0000-0000-000000000001', 'Remove one friction point from a good habit', true, 5),
  ('10000000-0000-0000-0000-000000000001', 'Add one friction point to a bad habit', true, 6),

  -- GTD Weekly Review
  ('10000000-0000-0000-0000-000000000002', 'Clear all inboxes (email, physical, notes)', true, 1),
  ('10000000-0000-0000-0000-000000000002', 'Review and update your project list', true, 2),
  ('10000000-0000-0000-0000-000000000002', 'Review next actions for each context', true, 3),
  ('10000000-0000-0000-0000-000000000002', 'Review waiting-for list', true, 4),
  ('10000000-0000-0000-0000-000000000002', 'Review someday/maybe list', true, 5),
  ('10000000-0000-0000-0000-000000000002', 'Review calendar for next 2 weeks', true, 6),

  -- Morning Routine Optimization
  ('10000000-0000-0000-0000-000000000003', 'Make your bed (1 min)', true, 1),
  ('10000000-0000-0000-0000-000000000003', '5-minute meditation or breathing exercise', true, 2),
  ('10000000-0000-0000-0000-000000000003', 'Morning pages - 3 pages of journaling', true, 3),
  ('10000000-0000-0000-0000-000000000003', '10-minute workout or stretching', true, 4),
  ('10000000-0000-0000-0000-000000000003', 'Healthy breakfast and hydration', true, 5),
  ('10000000-0000-0000-0000-000000000003', 'Review top 3 priorities for the day', true, 6);
