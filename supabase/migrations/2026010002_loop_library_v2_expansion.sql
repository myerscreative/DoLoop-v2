-- Migration: Loop Library v2.2 Expansion (45 Templates)
-- Description: Adding 3 templates per category for 15 new categories.
-- Date: 2026-01-03

-- Insert additional domain-specific creators
INSERT INTO template_creators (id, name, bio, title, photo_url) VALUES
  (
    '00000000-0000-0000-0000-000000000009',
    'Wellness Coach',
    'Certified health and wellness expert focused on holistic living, nutrition, and recovery.',
    'Holistic Health Expert',
    'https://example.com/photos/wellness-coach.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'Productivity Expert',
    'Workflow specialist helping professionals optimize their time and focus.',
    'Workflow & Systems Guru',
    'https://example.com/photos/productivity-pro.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'Finance Advisor',
    'Financial planner dedicated to helping individuals build wealth and manage resources effectively.',
    'Financial Strategist',
    'https://example.com/photos/finance-expert.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'Creative Mentor',
    'Artist and mentor encouraging daily creative practice and artistic growth.',
    'Artist & Mentor',
    'https://example.com/photos/creative-mentor.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'Community Leader',
    'Advocate for social change and community engagement.',
    'Advocacy Strategist',
    'https://example.com/photos/community-leader.jpg'
  );

-- CATEGORY 1: Personal Development
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Daily Mindset Journaling',
    'A short morning reflection based on "Morning Pages" to clear the mind and set intentions.',
    'The Artist''s Way',
    null,
    '#667eea',
    'Personal Development',
    true
  ),
  (
    '20000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'The Weekly Gratitude Practice',
    'Review the week and document 3-5 things you are genuinely grateful for.',
    'Gratitude Manifesto',
    null,
    '#f6ad55',
    'Personal Development',
    false
  ),
  (
    '20000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000010',
    'Habit Anchor Reset',
    'Mid-day ritual to re-center yourself on your core identity and habits.',
    'Atomic Habits Companion',
    null,
    '#4fd1c5',
    'Personal Development',
    false
  );

-- Tasks for Personal Development
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0001-000000000001', 'Set timer for 10 minutes', true, 1),
  ('20000000-0000-0000-0001-000000000001', 'Stream-of-consciousness writing', true, 2),
  ('20000000-0000-0000-0001-000000000001', 'List 3 top mindset goals for today', true, 3),
  ('20000000-0000-0000-0001-000000000002', 'Find a quiet space for reflection', true, 1),
  ('20000000-0000-0000-0001-000000000002', 'Write 3 specific gratitude items', true, 2),
  ('20000000-0000-0000-0001-000000000002', 'Describe one challenge that taught you something', true, 3),
  ('20000000-0000-0000-0001-000000000003', 'Pause for 5 deep breaths', true, 1),
  ('20000000-0000-0000-0001-000000000003', 'Affirm your identity (e.g., "I am a builder")', true, 2),
  ('20000000-0000-0000-0001-000000000003', 'Check habit tracker for today''s progress', true, 3);

-- CATEGORY 2: Health & Wellness
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000009',
    'Total Hydration Challenge',
    'Ensure you meet your daily water goals through consistent tracking.',
    'Hydration Essentials',
    null,
    '#4299e1',
    'Health & Wellness',
    true
  ),
  (
    '20000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0000-000000000009',
    'Sleep Hygiene Power-Down',
    'Prepare your mind and body for deep, restorative sleep.',
    'Why We Sleep Guide',
    null,
    '#4c51bf',
    'Health & Wellness',
    false
  ),
  (
    '20000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000009',
    'Blood Sugar Balancing Meals',
    'Focus on high-fiber, high-protein meal combinations for steady energy.',
    'The Glucode Goddess Method',
    null,
    '#ed64a6',
    'Health & Wellness',
    false
  );

-- Tasks for Health & Wellness
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0002-000000000001', 'Drink 16oz water immediately upon waking', true, 1),
  ('20000000-0000-0000-0002-000000000001', 'Set hydration reminders every 2 hours', true, 2),
  ('20000000-0000-0000-0002-000000000001', 'Log total ounces before bed', true, 3),
  ('20000000-0000-0000-0002-000000000002', 'No screens 60 minutes before bed', true, 1),
  ('20000000-0000-0000-0002-000000000002', 'Dim the lights in your environment', true, 2),
  ('20000000-0000-0000-0002-000000000002', 'Read for 15-20 minutes in bed', true, 3),
  ('20000000-0000-0000-0002-000000000003', 'Include a serving of leafy greens with lunch', true, 1),
  ('20000000-0000-0000-0002-000000000003', 'Eat a savory breakfast (not sweet)', true, 2),
  ('20000000-0000-0000-0002-000000000003', 'Take a 10-minute walk after your largest meal', true, 3);

-- CATEGORY 3: Productivity & Work
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0003-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Deep Work Block Manager',
    'Structure your 90-minute focus sessions to eliminate distractions and maximize cognitive output.',
    'Deep Work',
    null,
    '#38a169',
    'Productivity & Work',
    true
  ),
  (
    '20000000-0000-0000-0003-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'Inbox Zero Daily Cleanup',
    'A systematic approach to clearing your email inbox every day.',
    'Getting Things Done',
    null,
    '#319795',
    'Productivity & Work',
    false
  ),
  (
    '20000000-0000-0000-0003-000000000003',
    '00000000-0000-0000-0000-000000000010',
    'Pomodoro Sprint Session',
    'Repeating work and break cycles to maintain high energy and focus.',
    'The Pomodoro Technique',
    null,
    '#e53e3e',
    'Productivity & Work',
    false
  );

-- Tasks for Productivity & Work
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0003-000000000001', 'Define a clear goal for the block', true, 1),
  ('20000000-0000-0000-0003-000000000001', 'Disable all notifications', true, 2),
  ('20000000-0000-0000-0003-000000000001', 'Shutdown rituals: log progress and clear desk', true, 3),
  ('20000000-0000-0000-0003-000000000002', 'Archive all processed emails', true, 1),
  ('20000000-0000-0000-0003-000000000002', 'Reply to items taking <2 minutes', true, 2),
  ('20000000-0000-0000-0003-000000000002', 'Add follow-up items to Todo list', true, 3),
  ('20000000-0000-0000-0003-000000000003', 'Work for 25 minutes without distraction', true, 1),
  ('20000000-0000-0000-0003-000000000003', 'Rest for 5 minutes (away from screens)', true, 2),
  ('20000000-0000-0000-0003-000000000003', 'Complete 4 sprints then take a long break', true, 3);

-- CATEGORY 4: Fitness & Sports
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0004-000000000001',
    '00000000-0000-0000-0000-000000000009',
    'Morning Flexibility Flow',
    'A quick 10-minute daily stretching routine to improve range of motion.',
    'The Flexible Body',
    null,
    '#d53f8c',
    'Fitness & Sports',
    true
  ),
  (
    '20000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0000-000000000009',
    'HIIT Power Burst',
    'Short, high-intensity intervals to improve cardiovascular health.',
    'HIIT Revolution',
    null,
    '#dd6b20',
    'Fitness & Sports',
    false
  );

-- Tasks for Fitness & Sports
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0004-000000000001', 'Dynamic warm-up (2 min)', true, 1),
  ('20000000-0000-0000-0004-000000000001', 'Target hips and hamstrings', true, 2),
  ('20000000-0000-0000-0004-000000000001', 'Spinal rotations and shoulder stretches', true, 3),
  ('20000000-0000-0000-0004-000000000002', 'High intensity for 40 seconds', true, 1),
  ('20000000-0000-0000-0004-000000000002', 'Active recovery for 20 seconds', true, 2),
  ('20000000-0000-0000-0004-000000000002', 'Repeat 8 times', true, 3);

-- CATEGORY 5: Travel & Adventure
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0005-000000000001',
    '00000000-0000-0000-0000-000000000013',
    'Pre-Flight Checklist',
    'Essential steps before leaving for the airport to ensure a smooth journey.',
    'The Savvy Traveler',
    null,
    '#3182ce',
    'Travel & Adventure',
    false
  ),
  (
    '20000000-0000-0000-0005-000000000002',
    '00000000-0000-0000-0000-000000000013',
    'Digital Nomad Office Setup',
    'Quick ritual to ensure your remote workspace is optimized wherever you land.',
    'Remote Work Guide',
    null,
    '#2c7a7b',
    'Travel & Adventure',
    false
  );

-- Tasks for Travel & Adventure
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0005-000000000001', 'Double-check passport and boarding passes', true, 1),
  ('20000000-0000-0000-0005-000000000001', 'Confirm flight status and gate number', true, 2),
  ('20000000-0000-0000-0005-000000000001', 'Empty trash/refrigerator at home', true, 3),
  ('20000000-0000-0000-0005-000000000002', 'Verify Wi-Fi speed and backup connection', true, 1),
  ('20000000-0000-0000-0005-000000000002', 'Set up ergonomic accessories (stand, mouse)', true, 2),
  ('20000000-0000-0000-0005-000000000002', 'Test audio/video settings for meetings', true, 3);

-- CATEGORY 6: Finance & Money
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0006-000000000001',
    '00000000-0000-0000-0000-000000000011',
    'Expense Tracking Habit',
    'Daily logging and categorization of all financial transactions.',
    'The Simple Path to Wealth',
    null,
    '#38a169',
    'Finance & Money',
    true
  ),
  (
    '20000000-0000-0000-0006-000000000002',
    '00000000-0000-0000-0000-000000000011',
    'Monthly Budget Review',
    'Detailed analysis of spending vs objectives once a month.',
    'Rich Dad Poor Dad Wisdom',
    null,
    '#2f855a',
    'Finance & Money',
    false
  );

-- Tasks for Finance & Money
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0006-000000000001', 'Review bank apps for new transactions', true, 1),
  ('20000000-0000-0000-0006-000000000001', 'Enter daily spend into tracking sheet/app', true, 2),
  ('20000000-0000-0000-0006-000000000001', 'Categorize each item (Food, Rent, Misc)', true, 3),
  ('20000000-0000-0000-0006-000000000002', 'Summarize total income and expenses', true, 1),
  ('20000000-0000-0000-0006-000000000002', 'Compare actual spending with budget goals', true, 2),
  ('20000000-0000-0000-0006-000000000002', 'Adjust budget allocations for next month', true, 3);

-- CATEGORY 7: Creativity & Hobbies
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0007-000000000001',
    '00000000-0000-0000-0000-000000000012',
    'Daily Creative Sketch',
    'Spend 10-15 minutes every day creating a quick sketch or doodle to unlock creativity.',
    'Steal Like an Artist',
    null,
    '#ed64a6',
    'Creativity & Hobbies',
    true
  ),
  (
    '20000000-0000-0000-0007-000000000002',
    '00000000-0000-0000-0000-000000000012',
    '15-Min Instrument Practice',
    'Consistent daily practice on your instrument of choice to build muscle memory.',
    'The Talent Code',
    null,
    '#9f7aea',
    'Creativity & Hobbies',
    false
  );

-- Tasks for Creativity & Hobbies
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0007-000000000001', 'Gather your sketchbook and favorite pen', true, 1),
  ('20000000-0000-0000-0007-000000000001', 'Sketch a prompt or something in your view', true, 2),
  ('20000000-0000-0000-0007-000000000001', 'Reflect on one unexpected idea that surfaced', true, 3),
  ('20000000-0000-0000-0007-000000000002', 'Warm up with scales or basic exercises', true, 1),
  ('20000000-0000-0000-0007-000000000002', 'Practice a challenging section of a piece', true, 2),
  ('20000000-0000-0000-0007-000000000002', 'Play one song for pure enjoyment', true, 3);

-- CATEGORY 8: Learning & Education
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0008-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Language Immersion Hour',
    'Dedicated time for listening, speaking, and reading in a foreign language.',
    'Fluent Forever',
    null,
    '#48bb78',
    'Learning & Education',
    true
  ),
  (
    '20000000-0000-0000-0008-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'Skill Acquisition Sprint',
    'A focused 20-hour (spread over weeks) approach to learning a new skill.',
    'The First 20 Hours',
    null,
    '#38b2ac',
    'Learning & Education',
    false
  );

-- Tasks for Learning & Education
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0008-000000000001', 'Listen to a podcast/audio in target language', true, 1),
  ('20000000-0000-0000-0008-000000000001', 'Practice speaking aloud for 15 minutes', true, 2),
  ('20000000-0000-0000-0008-000000000001', 'Learn 5 new vocabulary words', true, 3),
  ('20000000-0000-0000-0008-000000000002', 'Deconstruct the skill into sub-skills', true, 1),
  ('20000000-0000-0000-0008-000000000002', 'Learn enough to self-correct', true, 2),
  ('20000000-0000-0000-0008-000000000002', 'Practice for 45 minutes without distraction', true, 3);

-- CATEGORY 9: Relationships & Social
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0009-000000000001',
    '00000000-0000-0000-0000-000000000013',
    'Family Connection Time',
    'A daily ritual for undistracted presence with family members.',
    'The Tech-Wise Family',
    null,
    '#f6ad55',
    'Relationships & Social',
    false
  ),
  (
    '20000000-0000-0000-0009-000000000002',
    '00000000-0000-0000-0000-000000000013',
    'Professional Networking Follow-up',
    'Systematic follow-up with new and old contacts to maintain your network.',
    'Never Eat Alone',
    null,
    '#4a5568',
    'Relationships & Social',
    false
  );

-- Tasks for Relationships & Social
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0009-000000000001', 'Put all phones in a central charging station', true, 1),
  ('20000000-0000-0000-0009-000000000001', 'Engage in a shared activity or conversation', true, 2),
  ('20000000-0000-0000-0009-000000000001', 'Set intentions for the weekend together', true, 3),
  ('20000000-0000-0000-0009-000000000002', 'List 3 people to reach out to today', true, 1),
  ('20000000-0000-0000-0009-000000000002', 'Send a thoughtful email or LinkedIn message', true, 2),
  ('20000000-0000-0000-0009-000000000002', 'Schedule a coffee chat or call', true, 3);

-- CATEGORY 10: Mindfulness & Spirituality
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0000-000000000009',
    '10-Min Silent Meditation',
    'A simple daily practice of returning to the breath and observing the mind.',
    'The Miracle of Mindfulness',
    null,
    '#cbd5e0',
    'Mindfulness & Spirituality',
    true
  ),
  (
    '20000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0000-000000000009',
    'Walk with Awareness',
    'A walking meditation practice to integrate mindfulness into daily movement.',
    'Peace Is Every Step',
    null,
    '#f6e05e',
    'Mindfulness & Spirituality',
    false
  );

-- Tasks for Mindfulness & Spirituality
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0010-000000000001', 'Find a upright, comfortable posture', true, 1),
  ('20000000-0000-0000-0010-000000000001', 'Focus on the sensation of breathing', true, 2),
  ('20000000-0000-0000-0010-000000000001', 'Gently bring mind back when it wanders', true, 3),
  ('20000000-0000-0000-0010-000000000002', 'Walk slow and rhythmic in a quiet area', true, 1),
  ('20000000-0000-0000-0010-000000000002', 'Coordinate breath with your steps', true, 2),
  ('20000000-0000-0000-0010-000000000002', 'Notice sights, sounds, and body sensations', true, 3);

-- CATEGORY 11: Home & Organization
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0011-000000000001',
    '00000000-0000-0000-0000-000000000013',
    'Daily Declutter Zone',
    'A 15-minute high-impact cleaning ritual for a specific area of your home.',
    'The Life-Changing Magic of Tidying Up',
    null,
    '#edf2f7',
    'Home & Organization',
    true
  ),
  (
    '20000000-0000-0000-0011-000000000002',
    '00000000-0000-0000-0000-000000000013',
    'Meal Prep Master Plan',
    'Weekly routine for batch cooking and meal organization.',
    'Budget Bytes Strategy',
    null,
    '#fc8181',
    'Home & Organization',
    false
  );

-- Tasks for Home & Organization
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0011-000000000001', 'Select ONE small zone (drawer, shelf, etc.)', true, 1),
  ('20000000-0000-0000-0011-000000000001', 'Remove everything and only return "joy" items', true, 2),
  ('20000000-0000-0000-0011-000000000001', 'Discard or donate unwanted items immediately', true, 3),
  ('20000000-0000-0000-0011-000000000002', 'Draft a meal plan for the next 7 days', true, 1),
  ('20000000-0000-0000-0011-000000000002', 'Grocery shop and prep core ingredients (grains, proteins)', true, 2),
  ('20000000-0000-0000-0011-000000000002', 'Portion out meals into containers', true, 3);

-- CATEGORY 12: Career & Entrepreneurship
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0012-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Side Hustle Launch Pad',
    'Daily high-impact tasks for launching and growing a new project.',
    'The $100 Startup',
    null,
    '#319795',
    'Career & Entrepreneurship',
    true
  ),
  (
    '20000000-0000-0000-0012-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'CEO Mindset Review',
    'Weekly strategic thinking session for business owners and leaders.',
    'The E-Myth Revisited',
    null,
    '#2c7a7b',
    'Career & Entrepreneurship',
    false
  );

-- Tasks for Career & Entrepreneurship
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0012-000000000001', 'Identify ONE revenue-generating task', true, 1),
  ('20000000-0000-0000-0012-000000000001', 'Spend 45 minutes on product/service development', true, 2),
  ('20000000-0000-0000-0012-000000000001', 'Outreach to one potential customer or partner', true, 3),
  ('20000000-0000-0000-0012-000000000002', 'Review key business metrics from last week', true, 1),
  ('20000000-0000-0000-0012-000000000002', 'Identify bottlenecks in your current processes', true, 2),
  ('20000000-0000-0000-0012-000000000002', 'Set 3 high-level priorities for next week', true, 3);

-- CATEGORY 13: Environmental & Sustainability
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0013-000000000001',
    '00000000-0000-0000-0000-000000000013',
    'Zero-Waste Weekly Audit',
    'A weekly check-in to analyze your waste output and find reduction opportunities.',
    'Zero Waste Home',
    null,
    '#38a169',
    'Environmental & Sustainability',
    false
  ),
  (
    '20000000-0000-0000-0013-000000000002',
    '00000000-0000-0000-0000-000000000013',
    'Plant-Based Meal Week',
    'Habit loop for planning and executing a week of plant-based eating.',
    'How Not to Die Cookbook',
    null,
    '#48bb78',
    'Environmental & Sustainability',
    false
  );

-- Tasks for Environmental & Sustainability
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0013-000000000001', 'Review contents of your trash and recycling', true, 1),
  ('20000000-0000-0000-0013-000000000001', 'Identify 2 items that could be replaced by reusables', true, 2),
  ('20000000-0000-0000-0013-000000000001', 'Clean and organize your composting bin', true, 3),
  ('20000000-0000-0000-0013-000000000002', 'Browse plant-based recipes for the week', true, 1),
  ('20000000-0000-0000-0013-000000000002', 'Prep a large batch of beans or grains', true, 2),
  ('20000000-0000-0000-0013-000000000002', 'Ensure you have adequate plant-based protein sources', true, 3);

-- CATEGORY 14: Community & Campaigns
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0014-000000000001',
    '00000000-0000-0000-0000-000000000013',
    'Volunteer Impact Tracker',
    'Log your community service hours and reflect on the impact created.',
    'Common Wealth',
    null,
    '#805ad5',
    'Community & Campaigns',
    false
  ),
  (
    '20000000-0000-0000-0014-000000000002',
    '00000000-0000-0000-0000-000000000013',
    'Advocacy Outreach Daily',
    'Small, consistent actions to support a cause or campaign.',
    'Rules for Radicals',
    null,
    '#b794f4',
    'Community & Campaigns',
    false
  );

-- Tasks for Community & Campaigns
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0014-000000000001', 'Schedule ONE volunteer session for this week', true, 1),
  ('20000000-0000-0000-0014-000000000001', 'Record hours served and primary activities', true, 2),
  ('20000000-0000-0000-0014-000000000001', 'Reflect on one person or situation you helped', true, 3),
  ('20000000-0000-0000-0014-000000000002', 'Contact a policy maker or local leader', true, 1),
  ('20000000-0000-0000-0014-000000000002', 'Share educational content about the cause', true, 2),
  ('20000000-0000-0000-0014-000000000002', 'Connect with one other advocate', true, 3);

-- CATEGORY 15: Recovery & Rehab
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  (
    '20000000-0000-0000-0015-000000000001',
    '00000000-0000-0000-0000-000000000009',
    'Post-Workout Recovery',
    'Active recovery and nutrition habits to support muscle growth and repair.',
    'Built from Broken',
    null,
    '#3182ce',
    'Recovery & Rehab',
    true
  ),
  (
    '20000000-0000-0000-0015-000000000002',
    '00000000-0000-0000-0000-000000000009',
    'Injury Prevention Mobility',
    'Targeted drills to improve joint health and prevent common injuries.',
    'Becoming a Supple Leopard',
    null,
    '#63b3ed',
    'Recovery & Rehab',
    false
  );

-- Tasks for Recovery & Rehab
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0015-000000000001', 'Consume high-quality protein within 30 min', true, 1),
  ('20000000-0000-0000-0015-000000000001', 'Foam roll or massage major muscle groups', true, 2),
  ('20000000-0000-0000-0015-000000000001', 'Perform 5 minutes of mindful breathing', true, 3),
  ('20000000-0000-0000-0015-000000000002', 'Perform 3 sets of ankle/wrist mobility', true, 1),
  ('20000000-0000-0000-0015-000000000002', 'Focus on glute activation exercises', true, 2),
  ('20000000-0000-0000-0015-000000000002', 'Check posture and joint alignment', true, 3);

-- CATEGORY 4: Fitness & Sports (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000009', 'Couch to 5K Sprint', 'Progressive running intervals to build endurance for beginners.', 'Couch to 5K Plan', null, '#f56565', 'Fitness & Sports', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0004-000000000003', 'Brisk 5-minute warm-up walk', true, 1),
  ('20000000-0000-0000-0004-000000000003', 'Alternating 60s run / 90s walk (20 min total)', true, 2),
  ('20000000-0000-0000-0004-000000000003', '5-minute cool-down walk', true, 3);

-- CATEGORY 5: Travel & Adventure (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000013', 'Flight Recovery Ritual', 'Post-flight habits to reduce jet lag and re-energize.', 'The Jet Lag Solution', null, '#63b3ed', 'Travel & Adventure', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0005-000000000003', 'Hydrate with at least 20oz water', true, 1),
  ('20000000-0000-0000-0005-000000000003', '15-minute natural sunlight exposure', true, 2),
  ('20000000-0000-0000-0005-000000000003', 'Light movement or stretching session', true, 3);

-- CATEGORY 6: Finance & Money (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0006-000000000003', '00000000-0000-0000-0000-000000000011', 'Savings Milestone Tracker', 'Check-in on your emergency fund and investment goals.', 'Finance for Humans', null, '#48bb78', 'Finance & Money', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0006-000000000003', 'Calculate current total savings across accounts', true, 1),
  ('20000000-0000-0000-0006-000000000003', 'Log monthly contribution to goal', true, 2),
  ('20000000-0000-0000-0006-000000000003', 'Visualize the next $1k milestone', true, 3);

-- CATEGORY 7: Creativity & Hobbies (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0007-000000000003', '00000000-0000-0000-0000-000000000012', 'Weekly Content Planning', 'Plan out your blog posts, videos, or social updates for the week.', 'Content Machine', null, '#f687b3', 'Creativity & Hobbies', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0007-000000000003', 'Brainstorm 5 new content ideas', true, 1),
  ('20000000-0000-0000-0007-000000000003', 'Draft outlines for 2 priority items', true, 2),
  ('20000000-0000-0000-0007-000000000003', 'Schedule posting dates/times', true, 3);

-- CATEGORY 8: Learning & Education (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0008-000000000003', '00000000-0000-0000-0000-000000000010', 'Reading Log & Summary', 'Track your reading progress and summarize key takeaways.', 'How to Read a Book', null, '#4a5568', 'Learning & Education', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0008-000000000003', 'Read for at least 20 minutes', true, 1),
  ('20000000-0000-0000-0008-000000000003', 'Write 2-3 sentences summarizing the main ides', true, 2),
  ('20000000-0000-0000-0008-000000000003', 'Highlight one actionable quote', true, 3);

-- CATEGORY 9: Relationships & Social (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0009-000000000003', '00000000-0000-0000-0000-000000000013', 'Date Night Intentions', 'Weekly planning for quality time with your partner.', 'The 5 Love Languages', null, '#fbb6ce', 'Relationships & Social', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0009-000000000003', 'Propose 2 activity options for date night', true, 1),
  ('20000000-0000-0000-0009-000000000003', 'Confirm reservations or logistics', true, 2),
  ('20000000-0000-0000-0009-000000000003', 'Set a goal for distraction-free connection', true, 3);

-- CATEGORY 10: Mindfulness & Spirituality (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0010-000000000003', '00000000-0000-0000-0000-000000000009', 'Evening Wind-Down Prayer', 'A short ritual for gratitude and spiritual reflection before bed.', 'The Daily Stoic', null, '#2d3748', 'Mindfulness & Spirituality', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0010-000000000003', 'Briefly reflect on the day''s highs and lows', true, 1),
  ('20000000-0000-0000-0010-000000000003', 'Practice 2 minutes of quiet prayer or silence', true, 2),
  ('20000000-0000-0000-0010-000000000003', 'Formulate an intention for tomorrow', true, 3);

-- CATEGORY 11: Home & Organization (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0011-000000000003', '00000000-0000-0000-0000-000000000013', 'Weekly Home Maintenance', 'Quick check of essential home systems and cleanliness.', 'Home Comforts', null, '#a0aec0', 'Home & Organization', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0011-000000000003', 'Check HVAC filters and water levels', true, 1),
  ('20000000-0000-0000-0011-000000000003', 'Clean one overlooked surface (e.g., handles, vents)', true, 2),
  ('20000000-0000-0000-0011-000000000003', 'Refill household essentials (soaps, paper)', true, 3);

-- CATEGORY 12: Career & Entrepreneurship (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0012-000000000003', '00000000-0000-0000-0000-000000000010', 'Sales Call Success Ritual', 'Preparation and follow-up habits for critical sales activities.', 'Influence', null, '#38b2ac', 'Career & Entrepreneurship', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0012-000000000003', 'Review lead notes 5 minutes before call', true, 1),
  ('20000000-0000-0000-0012-000000000003', 'Execute the call with focus and intent', true, 2),
  ('20000000-0000-0000-0012-000000000003', 'Send follow-up summary within 30 minutes', true, 3);

-- CATEGORY 13: Environmental & Sustainability (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0013-000000000003', '00000000-0000-0000-0000-000000000013', 'Circular Living Checklist', 'Practices for reducing and reusing daily consumption items.', 'The Circular Economy', null, '#68d391', 'Environmental & Sustainability', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0013-000000000003', 'Check for reuse opportunities before discarding', true, 1),
  ('20000000-0000-0000-0013-000000000003', 'Carry reusables (bottle, bag, utensils) today', true, 2),
  ('20000000-0000-0000-0013-000000000003', 'Research one local eco-friendly business', true, 3);

-- CATEGORY 14: Community & Campaigns (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0014-000000000003', '00000000-0000-0000-0000-000000000013', 'Fundraising Goal Sprints', 'Specific tasks for achieving a donation or campaign target.', 'Impact', null, '#9f7aea', 'Community & Campaigns', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0014-000000000003', 'Personal outreach to 2 past donors', true, 1),
  ('20000000-0000-0000-0014-000000000003', 'Post a compelling story of impact', true, 2),
  ('20000000-0000-0000-0014-000000000003', 'Update progress towards the goal', true, 3);

-- CATEGORY 15: Recovery & Rehab (Loop 3)
INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured) VALUES
  ('20000000-0000-0000-0015-000000000003', '00000000-0000-0000-0000-000000000009', 'Digital Detox Weekend', 'Structured break from screens to restore mental focus.', 'Digital Minimalism Rituals', null, '#718096', 'Recovery & Rehab', false);
INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
  ('20000000-0000-0000-0015-000000000003', 'Turn off all non-essential notifications', true, 1),
  ('20000000-0000-0000-0015-000000000003', 'Leave phone in another room for 4-hour blocks', true, 2),
  ('20000000-0000-0000-0015-000000000003', 'Journal your observations on mental clarity', true, 3);
