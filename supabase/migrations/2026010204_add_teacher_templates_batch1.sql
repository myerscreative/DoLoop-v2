-- Migration: Add Loop Templates from Top Productivity Teachers (Batch 1)
-- Description: 15 new loop templates from world-renowned productivity experts
-- Date: 2026-01-02
-- NOTE: Replace 'YOUR_AMAZON_TAG-20' with your actual Amazon Associates tag

-- ============================================================================
-- PART 1: NEW TEMPLATE CREATORS
-- ============================================================================

INSERT INTO template_creators (id, name, bio, title, photo_url, website_url) VALUES
  (
    '50000000-0000-0000-0000-000000000010',
    'Alex Hormozi',
    'Alex Hormozi is an entrepreneur who has built and scaled multiple companies to $100M+. His books "$100M Offers" and "$100M Leads" have become essential reading for business owners. He provides free courses at Acquisition.com.',
    'Entrepreneur & Author',
    NULL,
    'https://acquisition.com'
  ),
  (
    '50000000-0000-0000-0000-000000000011',
    'Tony Robbins',
    'Tony Robbins is a world-renowned life and business strategist who has coached millions through his events, books, and programs. Known for his high-energy seminars and transformational methods like the "Hour of Power" morning routine.',
    'Peak Performance Coach',
    NULL,
    'https://tonyrobbins.com'
  ),
  (
    '50000000-0000-0000-0000-000000000012',
    'Brendon Burchard',
    'Brendon Burchard is a high performance coach and author of "High Performance Habits." He created the GrowthDay platform and has trained millions on personal development and achieving sustained success.',
    'High Performance Coach',
    NULL,
    'https://brendon.com'
  ),
  (
    '50000000-0000-0000-0000-000000000013',
    'Jocko Willink',
    'Jocko Willink is a retired Navy SEAL officer and author of "Extreme Ownership." Known for his 4:30 AM wake-up discipline, he teaches leadership principles through Echelon Front and his popular podcast.',
    'Leadership Coach & Author',
    NULL,
    'https://jocko.com'
  ),
  (
    '50000000-0000-0000-0000-000000000014',
    'David Goggins',
    'David Goggins is a retired Navy SEAL, ultramarathon runner, and author of "Can''t Hurt Me." Known for his uncommon mental toughness and the "40% Rule" - the idea that when you think you''re done, you''re only 40% done.',
    'Endurance Athlete & Motivator',
    NULL,
    'https://davidgoggins.com'
  ),
  (
    '50000000-0000-0000-0000-000000000015',
    'Grant Cardone',
    'Grant Cardone is a sales trainer, real estate investor, and author of "The 10X Rule." He teaches that massive action is required for massive success and founded Cardone Capital.',
    'Sales Trainer & Investor',
    NULL,
    'https://grantcardone.com'
  ),
  (
    '50000000-0000-0000-0000-000000000016',
    'Mel Robbins',
    'Mel Robbins is a motivational speaker and author of "The 5 Second Rule." Her simple but powerful technique - counting 5-4-3-2-1 and taking action - has helped millions overcome procrastination.',
    'Motivational Speaker',
    NULL,
    'https://melrobbins.com'
  ),
  (
    '50000000-0000-0000-0000-000000000017',
    'Ryan Holiday',
    'Ryan Holiday is a modern stoic philosopher and author of "The Obstacle is the Way" and "Ego is the Enemy." He founded Daily Stoic and brings ancient philosophy to modern challenges.',
    'Author & Stoic Philosopher',
    NULL,
    'https://ryanholiday.net'
  ),
  (
    '50000000-0000-0000-0000-000000000018',
    'Mark Manson',
    'Mark Manson is the author of "The Subtle Art of Not Giving a F*ck" which sold over 10 million copies. His counterintuitive approach to self-help focuses on accepting limitations and choosing what matters.',
    'Author & Blogger',
    NULL,
    'https://markmanson.net'
  ),
  (
    '50000000-0000-0000-0000-000000000019',
    'Greg McKeown',
    'Greg McKeown is the author of "Essentialism" and "Effortless." He teaches the disciplined pursuit of less - doing fewer things better to maximize impact and meaning.',
    'Author & Speaker',
    NULL,
    'https://gregmckeown.com'
  ),
  (
    '50000000-0000-0000-0000-000000000020',
    'Simon Sinek',
    'Simon Sinek is the author of "Start with Why" and his TED talk has over 60 million views. He teaches that great leaders inspire action by starting with purpose before strategy.',
    'Author & Optimist',
    NULL,
    'https://simonsinek.com'
  ),
  (
    '50000000-0000-0000-0000-000000000021',
    'Brené Brown',
    'Brené Brown is a research professor studying courage, vulnerability, and shame. Author of "Dare to Lead," she teaches that vulnerability is the birthplace of innovation and creativity.',
    'Research Professor & Author',
    NULL,
    'https://brenebrown.com'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 2: NEW LOOP TEMPLATES
-- ============================================================================

INSERT INTO loop_templates (id, creator_id, title, description, book_course_title, affiliate_link, color, category, is_featured, popularity_score) VALUES
  -- Alex Hormozi - $100M Offers Value Equation
  (
    '60000000-0000-0000-0000-000000000010',
    '50000000-0000-0000-0000-000000000010',
    'Hormozi Value Equation Optimizer',
    'Apply Alex Hormozi''s Value Equation to maximize your offer''s perceived value. The formula: Value = (Dream Outcome × Likelihood of Achievement) / (Time Delay × Effort). Use this daily to refine your products and services.',
    '$100M Offers',
    'https://www.amazon.com/dp/1737475731?tag=YOUR_AMAZON_TAG-20',
    '#FF6B35',
    'work',
    true,
    0
  ),
  -- Alex Hormozi - Daily Business Focus
  (
    '60000000-0000-0000-0000-000000000011',
    '50000000-0000-0000-0000-000000000010',
    'Hormozi Morning Power Block',
    'Alex Hormozi''s "anti-routine" focuses on eliminating decisions and maximizing leverage. Wake early, work on high-leverage tasks immediately, and batch similar activities for maximum output.',
    '$100M Leads',
    'https://www.amazon.com/dp/1737475774?tag=YOUR_AMAZON_TAG-20',
    '#FF6B35',
    'daily',
    false,
    0
  ),
  -- Tony Robbins - Priming
  (
    '60000000-0000-0000-0000-000000000012',
    '50000000-0000-0000-0000-000000000011',
    'Tony Robbins Priming Ritual',
    'Tony Robbins'' 10-minute "Priming" routine shifts your physiology, focus, and mindset. Combine powerful breathwork, gratitude visualization, and success meditation to start every day in peak state.',
    'Awaken the Giant Within',
    'https://www.amazon.com/dp/0671791540?tag=YOUR_AMAZON_TAG-20',
    '#E63946',
    'daily',
    true,
    0
  ),
  -- Tony Robbins - RPM Planning
  (
    '60000000-0000-0000-0000-000000000013',
    '50000000-0000-0000-0000-000000000011',
    'RPM Results Planning Method',
    'Tony Robbins'' Rapid Planning Method focuses on Results, Purpose, and Massive Action Plan. Stop managing tasks - start achieving outcomes by clarifying what you want, why you want it, and how you''ll get it.',
    'Unlimited Power',
    'https://www.amazon.com/dp/0684845776?tag=YOUR_AMAZON_TAG-20',
    '#E63946',
    'work',
    false,
    0
  ),
  -- Brendon Burchard - HP6
  (
    '60000000-0000-0000-0000-000000000014',
    '50000000-0000-0000-0000-000000000012',
    'High Performance Habits Daily',
    'Brendon Burchard''s HP6 framework identifies six habits that drive sustained success: Seek Clarity, Generate Energy, Raise Necessity, Increase Productivity, Develop Influence, and Demonstrate Courage.',
    'High Performance Habits',
    'https://www.amazon.com/dp/1401952852?tag=YOUR_AMAZON_TAG-20',
    '#6A4C93',
    'daily',
    true,
    0
  ),
  -- Jocko Willink - Extreme Ownership
  (
    '60000000-0000-0000-0000-000000000015',
    '50000000-0000-0000-0000-000000000013',
    'Jocko 4:30 AM Discipline',
    'Jocko Willink''s discipline routine: Wake at 4:30 AM, workout immediately, and own every aspect of your day. "Discipline equals freedom" - the first battle you win each day is getting out of bed.',
    'Extreme Ownership',
    'https://www.amazon.com/dp/1250183863?tag=YOUR_AMAZON_TAG-20',
    '#1B4332',
    'daily',
    true,
    0
  ),
  -- Jocko - Leadership Laws
  (
    '60000000-0000-0000-0000-000000000016',
    '50000000-0000-0000-0000-000000000013',
    'Extreme Ownership Leadership',
    'Apply Jocko''s Extreme Ownership principles: Take full responsibility for outcomes, check your ego, prioritize and execute, and decentralize command. Leaders own everything in their world.',
    'Dichotomy of Leadership',
    'https://www.amazon.com/dp/1250195772?tag=YOUR_AMAZON_TAG-20',
    '#1B4332',
    'work',
    false,
    0
  ),
  -- David Goggins - 40% Rule
  (
    '60000000-0000-0000-0000-000000000017',
    '50000000-0000-0000-0000-000000000014',
    'Goggins Mental Toughness',
    'David Goggins'' approach to mental toughness: When you think you''re done, you''re only 40% done. Use the "Cookie Jar" of past victories, embrace the "Accountability Mirror," and callous your mind daily.',
    'Can''t Hurt Me',
    'https://www.amazon.com/dp/1544512287?tag=YOUR_AMAZON_TAG-20',
    '#212529',
    'personal',
    true,
    0
  ),
  -- Grant Cardone - 10X
  (
    '60000000-0000-0000-0000-000000000018',
    '50000000-0000-0000-0000-000000000015',
    '10X Massive Action Daily',
    'Grant Cardone''s 10X Rule: Set goals 10 times bigger than you think necessary, then take 10 times the action. Average is a failing formula. Dominate your sector by operating at 10X levels.',
    'The 10X Rule',
    'https://www.amazon.com/dp/0470627603?tag=YOUR_AMAZON_TAG-20',
    '#FFB800',
    'work',
    false,
    0
  ),
  -- Mel Robbins - 5 Second Rule
  (
    '60000000-0000-0000-0000-000000000019',
    '50000000-0000-0000-0000-000000000016',
    '5 Second Rule Activation',
    'Mel Robbins'' simple but powerful technique: When you have an impulse to act on a goal, count 5-4-3-2-1 and physically move before your brain kills the idea. Beat procrastination with action.',
    'The 5 Second Rule',
    'https://www.amazon.com/dp/1682612384?tag=YOUR_AMAZON_TAG-20',
    '#E76F51',
    'daily',
    false,
    0
  ),
  -- Ryan Holiday - Daily Stoic
  (
    '60000000-0000-0000-0000-000000000020',
    '50000000-0000-0000-0000-000000000017',
    'Daily Stoic Practice',
    'Ryan Holiday''s modern stoic routine: Morning reflection on what you control, obstacle reframing throughout the day, and evening review. See obstacles as opportunities and focus only on what''s within your power.',
    'The Obstacle is the Way',
    'https://www.amazon.com/dp/1591846358?tag=YOUR_AMAZON_TAG-20',
    '#457B9D',
    'daily',
    false,
    0
  ),
  -- Mark Manson - Values
  (
    '60000000-0000-0000-0000-000000000021',
    '50000000-0000-0000-0000-000000000018',
    'Manson Values Audit',
    'Mark Manson''s counterintuitive approach: Stop trying to feel good all the time. Choose better values, accept limitations, and focus energy only on what genuinely matters. Say "no" more often.',
    'The Subtle Art of Not Giving a F*ck',
    'https://www.amazon.com/dp/0062457713?tag=YOUR_AMAZON_TAG-20',
    '#495057',
    'weekly',
    false,
    0
  ),
  -- Greg McKeown - Essentialism
  (
    '60000000-0000-0000-0000-000000000022',
    '50000000-0000-0000-0000-000000000019',
    'Essentialism Daily Focus',
    'Greg McKeown''s Essentialism: Do less, but better. Eliminate the non-essential ruthlessly. Ask "What is the ONE thing that is truly essential right now?" and protect time for deep work on what matters.',
    'Essentialism',
    'https://www.amazon.com/dp/0804137382?tag=YOUR_AMAZON_TAG-20',
    '#2A9D8F',
    'daily',
    false,
    0
  ),
  -- Simon Sinek - Start With Why
  (
    '60000000-0000-0000-0000-000000000023',
    '50000000-0000-0000-0000-000000000020',
    'Start With Why Leadership',
    'Simon Sinek''s Golden Circle: Great leaders start with WHY, then HOW, then WHAT. Clarify your purpose daily, inspire your team with meaning, and make decisions that align with your core beliefs.',
    'Start With Why',
    'https://www.amazon.com/dp/1591846447?tag=YOUR_AMAZON_TAG-20',
    '#3D5A80',
    'work',
    false,
    0
  ),
  -- Brené Brown - Dare to Lead
  (
    '60000000-0000-0000-0000-000000000024',
    '50000000-0000-0000-0000-000000000021',
    'Dare to Lead Courage Practice',
    'Brené Brown''s courage-building framework: Rumble with vulnerability, live into your values, brave trust, and learn to rise. Great leadership requires allowing yourself to be seen and taking risks.',
    'Dare to Lead',
    'https://www.amazon.com/dp/0399592520?tag=YOUR_AMAZON_TAG-20',
    '#9B2335',
    'work',
    false,
    0
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 3: TEMPLATE TASKS
-- ============================================================================

-- DELETE existing batch1 tasks to prevent duplicates
DELETE FROM template_tasks WHERE template_id::text LIKE '60000000-%';

-- Hormozi Value Equation Optimizer
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000010', 'Define the DREAM OUTCOME: What result does your customer truly want?', true, false, 1),
  ('60000000-0000-0000-0000-000000000010', 'Increase LIKELIHOOD: Add proof, testimonials, or guarantees', true, false, 2),
  ('60000000-0000-0000-0000-000000000010', 'Reduce TIME DELAY: How can you deliver faster results?', true, false, 3),
  ('60000000-0000-0000-0000-000000000010', 'Decrease EFFORT: What can you do for them vs. ask of them?', true, false, 4),
  ('60000000-0000-0000-0000-000000000010', 'Add one value-enhancing bonus or feature to your offer', true, false, 5),
  ('60000000-0000-0000-0000-000000000010', 'Review: Would someone feel stupid saying no to this offer?', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Hormozi Morning Power Block
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000011', 'Wake early (4-5 AM) and start immediately - no snooze', true, false, 1),
  ('60000000-0000-0000-0000-000000000011', '1-2 hours of focused strategic work before distractions', true, false, 2),
  ('60000000-0000-0000-0000-000000000011', 'Identify today''s highest-leverage activity', true, false, 3),
  ('60000000-0000-0000-0000-000000000011', 'Batch similar tasks together (calls, emails, content)', true, false, 4),
  ('60000000-0000-0000-0000-000000000011', 'Plan tomorrow''s priorities tonight (before bed)', true, false, 5),
  ('60000000-0000-0000-0000-000000000011', 'End work at a designated time - protect recovery', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Tony Robbins Priming Ritual
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000012', 'Breathwork: 3 sets of 30 "Breath of Fire" breaths', true, false, 1),
  ('60000000-0000-0000-0000-000000000012', 'Gratitude: Feel deeply grateful for 3 specific things', true, false, 2),
  ('60000000-0000-0000-0000-000000000012', 'Healing: Visualize light flowing through your body', true, false, 3),
  ('60000000-0000-0000-0000-000000000012', 'Connection: Send love and blessings to 3 people', true, false, 4),
  ('60000000-0000-0000-0000-000000000012', 'Success: Visualize 3 goals as already achieved', true, false, 5),
  ('60000000-0000-0000-0000-000000000012', 'Affirm: Speak your incantations with full body engagement', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- RPM Results Planning Method
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000013', 'RESULT: What specific outcome do I want to achieve today?', true, false, 1),
  ('60000000-0000-0000-0000-000000000013', 'PURPOSE: Why is this result important to me emotionally?', true, false, 2),
  ('60000000-0000-0000-0000-000000000013', 'MASSIVE ACTION: List all possible actions to achieve it', true, false, 3),
  ('60000000-0000-0000-0000-000000000013', 'Prioritize: Which actions will give the biggest return?', true, false, 4),
  ('60000000-0000-0000-0000-000000000013', 'Schedule: Block time for your priority actions', true, false, 5),
  ('60000000-0000-0000-0000-000000000013', 'Execute: Take action immediately on your first priority', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- High Performance Habits Daily
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000014', 'CLARITY: Define who you want to be today and set 3 intentions', true, false, 1),
  ('60000000-0000-0000-0000-000000000014', 'ENERGY: Complete workout, sleep 7+ hours, eat well', true, false, 2),
  ('60000000-0000-0000-0000-000000000014', 'NECESSITY: Connect today''s work to your deeper purpose', true, false, 3),
  ('60000000-0000-0000-0000-000000000014', 'PRODUCTIVITY: 2+ hours of deep work on your most important project', true, false, 4),
  ('60000000-0000-0000-0000-000000000014', 'INFLUENCE: Serve someone today - teach, mentor, or support', true, false, 5),
  ('60000000-0000-0000-0000-000000000014', 'COURAGE: Do one thing that scares you or challenges you', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Jocko 4:30 AM Discipline
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000015', 'Wake at 4:30 AM - alarm goes off, you get up. No negotiation.', true, false, 1),
  ('60000000-0000-0000-0000-000000000015', 'Workout immediately - push, pull, lift, or squat', true, false, 2),
  ('60000000-0000-0000-0000-000000000015', 'Take full ownership of everything in your life today', true, false, 3),
  ('60000000-0000-0000-0000-000000000015', 'Prioritize and Execute: Identify the single most important task', true, false, 4),
  ('60000000-0000-0000-0000-000000000015', 'Default: Aggressive. Be proactive, not reactive.', true, false, 5),
  ('60000000-0000-0000-0000-000000000015', 'Prepare tomorrow: Lay out workout clothes and task list', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Extreme Ownership Leadership
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000016', 'Own it: Take full responsibility for outcomes, no excuses', true, false, 1),
  ('60000000-0000-0000-0000-000000000016', 'Check ego: Am I prioritizing mission over my ego?', true, false, 2),
  ('60000000-0000-0000-0000-000000000016', 'Simplify: Is the plan simple enough for everyone to execute?', true, false, 3),
  ('60000000-0000-0000-0000-000000000016', 'Prioritize and Execute: What is the #1 priority right now?', true, false, 4),
  ('60000000-0000-0000-0000-000000000016', 'Decentralize: Empower your team to make decisions', true, false, 5),
  ('60000000-0000-0000-0000-000000000016', 'Lead up and down: Communicate clearly in all directions', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Goggins Mental Toughness
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000017', 'Accountability Mirror: Face hard truths about yourself', true, false, 1),
  ('60000000-0000-0000-0000-000000000017', 'Cookie Jar: Recall past victories to fuel current challenges', true, false, 2),
  ('60000000-0000-0000-0000-000000000017', '40% Rule: When you want to quit, you''re only 40% done', true, false, 3),
  ('60000000-0000-0000-0000-000000000017', 'Callous Your Mind: Do something hard that you don''t want to do', true, false, 4),
  ('60000000-0000-0000-0000-000000000017', 'Take Souls: Outwork everyone around you today', true, false, 5),
  ('60000000-0000-0000-0000-000000000017', 'Uncommon: What would the uncommon version of you do?', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- 10X Massive Action Daily
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000018', 'Set 10X Goals: Are your goals 10x bigger than "realistic"?', true, false, 1),
  ('60000000-0000-0000-0000-000000000018', 'Take 10X Action: 10x the calls, emails, and outreach', true, false, 2),
  ('60000000-0000-0000-0000-000000000018', 'Never retreat: Increase activity when things get hard', true, false, 3),
  ('60000000-0000-0000-0000-000000000018', 'Fear as indicator: What are you avoiding? Do that.', true, false, 4),
  ('60000000-0000-0000-0000-000000000018', 'Dominate: How can you be #1 in your space today?', true, false, 5),
  ('60000000-0000-0000-0000-000000000018', 'Never be satisfied: What''s the next level?', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- 5 Second Rule Activation
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000019', 'When alarm goes off: 5-4-3-2-1 and get up immediately', true, false, 1),
  ('60000000-0000-0000-0000-000000000019', 'Before procrastinating: 5-4-3-2-1 and start the task', true, false, 2),
  ('60000000-0000-0000-0000-000000000019', 'Before an uncomfortable conversation: 5-4-3-2-1 and speak', true, false, 3),
  ('60000000-0000-0000-0000-000000000019', 'When you have an idea: 5-4-3-2-1 and write it down', true, false, 4),
  ('60000000-0000-0000-0000-000000000019', 'When you want to escape: 5-4-3-2-1 and stay present', true, false, 5),
  ('60000000-0000-0000-0000-000000000019', 'Before bed: 5-4-3-2-1 and put the phone away', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Daily Stoic Practice
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000020', 'Morning: Read one Daily Stoic meditation', true, false, 1),
  ('60000000-0000-0000-0000-000000000020', 'Journal: What is within my control today?', true, false, 2),
  ('60000000-0000-0000-0000-000000000020', 'Perspective: How would Marcus Aurelius handle my challenges?', true, false, 3),
  ('60000000-0000-0000-0000-000000000020', 'Obstacle is the Way: Turn one setback into an opportunity', true, false, 4),
  ('60000000-0000-0000-0000-000000000020', 'Memento Mori: Remember life is short - focus on what matters', true, false, 5),
  ('60000000-0000-0000-0000-000000000020', 'Evening Review: Did I live according to my principles today?', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Manson Values Audit
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000021', 'Identify: What am I giving too many f*cks about?', true, false, 1),
  ('60000000-0000-0000-0000-000000000021', 'Values check: Am I pursuing good values or superficial ones?', true, false, 2),
  ('60000000-0000-0000-0000-000000000021', 'Accept: What limitation must I accept and work with?', true, false, 3),
  ('60000000-0000-0000-0000-000000000021', 'Say no: Decline one request that doesn''t align with values', true, false, 4),
  ('60000000-0000-0000-0000-000000000021', 'Take responsibility: Where am I blaming external factors?', true, false, 5),
  ('60000000-0000-0000-0000-000000000021', 'Choose better problems: What worthy struggle am I embracing?', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Essentialism Daily Focus
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000022', 'Identify: What is the ONE most essential thing today?', true, false, 1),
  ('60000000-0000-0000-0000-000000000022', 'Eliminate: Remove or delegate one non-essential task', true, false, 2),
  ('60000000-0000-0000-0000-000000000022', 'Protect: Block 2 hours for deep, uninterrupted work', true, false, 3),
  ('60000000-0000-0000-0000-000000000022', 'Trade-off: Say "no" to something good for something great', true, false, 4),
  ('60000000-0000-0000-0000-000000000022', 'Buffer: Add margin/buffer time between commitments', true, false, 5),
  ('60000000-0000-0000-0000-000000000022', 'Review: Did I do less but better today?', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Start With Why Leadership
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000023', 'Clarify WHY: Reconnect with your purpose and beliefs', true, false, 1),
  ('60000000-0000-0000-0000-000000000023', 'Communicate WHY: Share your purpose with your team', true, false, 2),
  ('60000000-0000-0000-0000-000000000023', 'Align HOW: Are your processes consistent with your WHY?', true, false, 3),
  ('60000000-0000-0000-0000-000000000023', 'Inspire action: Help someone find motivation through purpose', true, false, 4),
  ('60000000-0000-0000-0000-000000000023', 'Find your tribe: Connect with those who believe what you believe', true, false, 5),
  ('60000000-0000-0000-0000-000000000023', 'Stay authentic: Make one decision based purely on values', true, false, 6) ON CONFLICT (id) DO NOTHING;

-- Dare to Lead Courage Practice
INSERT INTO template_tasks (template_id, description, is_recurring, is_one_time, display_order) VALUES
  ('60000000-0000-0000-0000-000000000024', 'Rumble with vulnerability: Have one difficult conversation', true, false, 1),
  ('60000000-0000-0000-0000-000000000024', 'Live into values: Name your top 2 values and honor them', true, false, 2),
  ('60000000-0000-0000-0000-000000000024', 'BRAVING trust: Build trust through Boundaries, Reliability, Accountability', true, false, 3),
  ('60000000-0000-0000-0000-000000000024', 'Learn to rise: When you fail, acknowledge it and get back up', true, false, 4),
  ('60000000-0000-0000-0000-000000000024', 'Clear is kind: Give clear, direct feedback to someone', true, false, 5),
  ('60000000-0000-0000-0000-000000000024', 'Dare greatly: Do one thing that requires courage', true, false, 6) ON CONFLICT (id) DO NOTHING;
