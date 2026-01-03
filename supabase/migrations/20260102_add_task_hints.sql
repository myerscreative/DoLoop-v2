-- Migration: Add hint column to template_tasks
-- Description: Adds explanatory hints for each template task step
-- Date: 2026-01-02

-- Add hint column to template_tasks
ALTER TABLE template_tasks 
ADD COLUMN IF NOT EXISTS hint TEXT;

-- Add sample hints to Hormozi Value Equation template
UPDATE template_tasks SET hint = 'The ideal end-state your customer desires. Make it emotional and specific - not "save money" but "retire 10 years early to travel with your grandkids." The more vivid, the more valuable.' WHERE template_id = '10000000-0000-0000-0000-000000000010' AND display_order = 1;

UPDATE template_tasks SET hint = 'Build confidence through proof. Use testimonials, case studies, before/after results, certifications, or guarantees. The more certain they are it will work, the more they''ll pay.' WHERE template_id = '10000000-0000-0000-0000-000000000010' AND display_order = 2;

UPDATE template_tasks SET hint = 'Speed equals value. Can you give them a quick win in 24 hours? First results in a week? The faster the transformation, the more premium you can charge.' WHERE template_id = '10000000-0000-0000-0000-000000000010' AND display_order = 3;

UPDATE template_tasks SET hint = 'Remove friction. Done-for-you beats do-it-yourself. Checklists beat confusion. What work can you take off their plate? The less they have to think or do, the more valuable.' WHERE template_id = '10000000-0000-0000-0000-000000000010' AND display_order = 4;

UPDATE template_tasks SET hint = 'Stack the deck with extras: templates, checklists, bonus modules, community access, coaching calls. Each addition increases perceived value without proportionally increasing cost.' WHERE template_id = '10000000-0000-0000-0000-000000000010' AND display_order = 5;

UPDATE template_tasks SET hint = 'Hormozi''s ultimate test: "Would they feel stupid saying no?" If not, the offer needs work. Keep iterating until the value is so obvious that rejection feels irrational.' WHERE template_id = '10000000-0000-0000-0000-000000000010' AND display_order = 6;

-- Add hints to Tony Robbins Priming template
UPDATE template_tasks SET hint = '30 sharp, fast breaths through the nose - inhale forcefully, exhale naturally. This floods your brain with oxygen, activates your nervous system, and shifts your physiology into a peak state.' WHERE template_id = '10000000-0000-0000-0000-000000000012' AND display_order = 1;

UPDATE template_tasks SET hint = 'Don''t just think of what you''re grateful for - FEEL it intensely. Close your eyes, relive the moment, notice the physical sensations. Gratitude eliminates fear and releases dopamine.' WHERE template_id = '10000000-0000-0000-0000-000000000012' AND display_order = 2;

UPDATE template_tasks SET hint = 'Imagine a warm, healing light entering the top of your head, flowing through every cell, healing and energizing your entire body. Let it radiate outward to those you love.' WHERE template_id = '10000000-0000-0000-0000-000000000012' AND display_order = 3;

UPDATE template_tasks SET hint = 'Picture three people you care about. Send them love, strength, and blessings. This shifts your focus from self to others and creates a state of generosity and abundance.' WHERE template_id = '10000000-0000-0000-0000-000000000012' AND display_order = 4;

UPDATE template_tasks SET hint = 'See your goals as already complete. Feel the emotions of achievement - the pride, joy, and excitement. Mental rehearsal programs your brain to recognize and create opportunities.' WHERE template_id = '10000000-0000-0000-0000-000000000012' AND display_order = 5;

UPDATE template_tasks SET hint = 'Incantations are affirmations with INTENSITY. Say them while moving your body powerfully. "I AM unstoppable!" with full conviction and physical engagement creates lasting change.' WHERE template_id = '10000000-0000-0000-0000-000000000012' AND display_order = 6;

-- Add hints to Jocko 4:30 AM Discipline template
UPDATE template_tasks SET hint = 'The moment the alarm sounds, your feet hit the floor. No snooze button, no negotiation with yourself. This is the first test of discipline every day - pass it.' WHERE template_id = '10000000-0000-0000-0000-000000000015' AND display_order = 1;

UPDATE template_tasks SET hint = 'Physical training isn''t optional - it''s the foundation. Push, pull, lift, or squat. Get your heart rate up. A strong body creates a resilient mind capable of handling anything.' WHERE template_id = '10000000-0000-0000-0000-000000000015' AND display_order = 2;

UPDATE template_tasks SET hint = 'No excuses, no blame. Everything in your world is your responsibility - your wins, your losses, your team''s performance. When you own it all, you can fix it all.' WHERE template_id = '10000000-0000-0000-0000-000000000015' AND display_order = 3;

UPDATE template_tasks SET hint = 'When everything seems important, nothing gets done. Identify the ONE thing that matters most right now. Focus all energy there until it''s complete, then move to the next priority.' WHERE template_id = '10000000-0000-0000-0000-000000000015' AND display_order = 4;

UPDATE template_tasks SET hint = 'Don''t wait for perfect conditions. Take action now with what you have. Attack problems head-on. A bias toward action beats overthinking every time.' WHERE template_id = '10000000-0000-0000-0000-000000000015' AND display_order = 5;

UPDATE template_tasks SET hint = 'Before sleep, lay out tomorrow''s workout clothes and write your task list. Remove all friction from your morning so you execute automatically without decisions.' WHERE template_id = '10000000-0000-0000-0000-000000000015' AND display_order = 6;

-- Add hints to Goggins Mental Toughness template
UPDATE template_tasks SET hint = 'Stand in front of the mirror and tell yourself the brutal truth. What are you avoiding? What excuses are you making? Write it down and commit to fixing it.' WHERE template_id = '10000000-0000-0000-0000-000000000017' AND display_order = 1;

UPDATE template_tasks SET hint = 'Your Cookie Jar is a mental collection of all your past victories and hardships you''ve overcome. When times get tough, reach in and remind yourself what you''re capable of.' WHERE template_id = '10000000-0000-0000-0000-000000000017' AND display_order = 2;

UPDATE template_tasks SET hint = 'When your mind says you''re finished, you''re only at 40% of your actual capacity. There''s always more in the tank. Push through the mental barrier to find your true limits.' WHERE template_id = '10000000-0000-0000-0000-000000000017' AND display_order = 3;

UPDATE template_tasks SET hint = 'Seek discomfort deliberately. Cold showers, hard workouts, difficult conversations. Each small suffering builds mental calluses that protect you when real hardship arrives.' WHERE template_id = '10000000-0000-0000-0000-000000000017' AND display_order = 4;

UPDATE template_tasks SET hint = 'Don''t just work hard - work harder than everyone in the room. Let your effort and results speak so loudly that doubters can''t ignore you. Make them believers.' WHERE template_id = '10000000-0000-0000-0000-000000000017' AND display_order = 5;

UPDATE template_tasks SET hint = 'Ask yourself: What would the strongest, most disciplined version of me do right now? That person exists inside you. Become them through daily action.' WHERE template_id = '10000000-0000-0000-0000-000000000017' AND display_order = 6;
