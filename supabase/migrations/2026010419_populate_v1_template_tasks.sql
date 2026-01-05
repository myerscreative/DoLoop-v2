-- Migration: Populate missing tasks for Loop Library templates (Robust Title-based approach)
-- Description: Adds tasks for V1 templates by looking them up by title to avoid UUID collisions.
-- Date: 2026-01-04

-- Helper function to insert tasks by template title
DO $$
DECLARE
    t_id UUID;
BEGIN
    -- 1. Goggins “Stay Hard” Daily Reset
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Goggins “Stay Hard” Daily Reset' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Accountability check: MIRROR WORK', true, 1),
        (t_id, 'One physical challenge you don''t want to do', true, 2),
        (t_id, 'Mental hardening: 10 min of intense focus', true, 3),
        (t_id, 'Review goals with UNCOMMON intensity', true, 4),
        (t_id, 'Stay Hard: Re-commit to your difficult path', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 2. 40‑Day Mental Toughness Challenge (Goggins)
    SELECT id INTO t_id FROM loop_templates WHERE title = '40‑Day Mental Toughness Challenge' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Face the Accountability Mirror: Hard truths first', true, 1),
        (t_id, 'Morning workout: Push past your perceived limit', true, 2),
        (t_id, 'Do one thing that sucks today', true, 3),
        (t_id, 'Study or work with zero distractions', true, 4),
        (t_id, 'Reach into the Cookie Jar: Recall a past victory', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. Power Hours Mastery (Tony Robbins)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Power Hours Mastery' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Define your Result, Purpose, and Massive Action Plan', true, 1),
        (t_id, 'Prime your state: 10 min of breathing & focus', true, 2),
        (t_id, 'Execute 50-minute focused work block', true, 3),
        (t_id, 'Active recovery break - hydrate and move', true, 4),
        (t_id, 'Repeat work block for total 2-hour mastery', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. High‑Performance Habits Sprint (Brendon Burchard)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'High‑Performance Habits Sprint' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Seek Clarity: Envision the highest version of yourself', true, 1),
        (t_id, 'Generate Energy: High-intensity health habits', true, 2),
        (t_id, 'Raise Necessity: Connect your work to who needs you', true, 3),
        (t_id, 'Increase Productivity: Focused work on MLI (Main Lever)', true, 4),
        (t_id, 'Develop Influence: Support and challenge others', true, 5),
        (t_id, 'Demonstrate Courage: Share your truth and take risks', true, 6)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. Deep Work Session (expanded) (Cal Newport)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Deep Work Session (expanded)' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Define clear, high-stakes goal for the session', true, 1),
        (t_id, 'Environment prep: Clear desk & disable notifications', true, 2),
        (t_id, '90-minute focused execution on the primary goal', true, 3),
        (t_id, 'Log progress and note any "shallow work" impulses', true, 4),
        (t_id, 'Complete shutdown ritual: Clear mind for recovery', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. 5‑AM Club Sunrise Routine (Robin Sharma)
    SELECT id INTO t_id FROM loop_templates WHERE title = '5‑AM Club Sunrise Routine' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, '05:00-05:20: Move - High-intensity exercise', true, 1),
        (t_id, '05:20-05:40: Reflect - Meditation & Journaling', true, 2),
        (t_id, '05:40-06:00: Grow - Personal development reading', true, 3),
        (t_id, 'Map out your Top 3 "Win the Day" priorities', true, 4),
        (t_id, 'Hydrate and fuel with a nutrient-dense breakfast', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 7. Robbins Goal‑Setting Blueprint (Tony Robbins)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Robbins Goal‑Setting Blueprint' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Clarify: What do you truly want this week?', true, 1),
        (t_id, 'Purpose: Why is this goal non-negotiable?', true, 2),
        (t_id, 'Massive Action: List the top 3 high-impact moves', true, 3),
        (t_id, 'Schedule: Time-block your massive action steps', true, 4),
        (t_id, 'Visualization: See yourself hitting the target', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 8. Burchard Energy Boost (Brendon Burchard)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Burchard Energy Boost' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Transition ritual: 2 min of breathing between tasks', true, 1),
        (t_id, 'Strategic movement: 10 min of walk or stretch', true, 2),
        (t_id, 'Hydration milestone: Log water intake', true, 3),
        (t_id, 'Nutrition check: High-quality whole foods only', true, 4),
        (t_id, 'Evening energy audit: Plan for 7-8h sleep', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 9. Digital Minimalism Clean‑Up (Cal Newport)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Digital Minimalism Clean‑Up' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Audit: Identify one platform to remove this week', true, 1),
        (t_id, 'Clear notifications for all non-essential apps', true, 2),
        (t_id, 'Schedule high-quality leisure (read, hike, craft)', true, 3),
        (t_id, 'Designate "Phone-Free" zones in your home', true, 4),
        (t_id, 'Review your tech rules and re-commit', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 10. 5‑AM Club Evening Wind‑Down (Robin Sharma)
    SELECT id INTO t_id FROM loop_templates WHERE title = '5‑AM Club Evening Wind‑Down' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, '19:00-20:00: Last meal of the day - light and digital-free', true, 1),
        (t_id, '20:00-21:00: Decompression - Read, family time, or bath', true, 2),
        (t_id, '21:00-22:00: Prep for sleep - Cool, dark room & gratitude', true, 3),
        (t_id, 'No screens for 60 minutes before bed', true, 4),
        (t_id, 'Sleep 7.5 to 8 hours to ensure a peak 5 AM start', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 11. Goggins “Ultra‑Endurance” Weekly Plan (David Goggins)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Goggins “Ultra‑Endurance” Weekly Plan' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Endurance: Long run or ride (2+ hours)', true, 1),
        (t_id, 'Strength: Core and functional movement focusing on stability', true, 2),
        (t_id, 'Mental: Meditation in uncomfortable environments', true, 3),
        (t_id, 'Log mileage and mental State in a training journal', true, 4),
        (t_id, 'Rest/Recovery: Active stretching & mobility work', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 12. Robbins “Peak State” Daily Ritual (Tony Robbins)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Robbins “Peak State” Daily Ritual' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Physiology shift: 30 seconds of peak physical intensity', true, 1),
        (t_id, 'Focus anchor: 3 things you are genuinely grateful for', true, 2),
        (t_id, 'Future vision: Seeing a goal as already achieved', true, 3),
        (t_id, 'Incantations: Speak your power statements with intensity', true, 4),
        (t_id, 'Commit: Dedicate today to serving your primary outcome', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 13. Burchard “Clarity & Focus” Sprint (Brendon Burchard)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Burchard “Clarity & Focus” Sprint' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Self-Query: What is essential for my growth right now?', true, 1),
        (t_id, 'Audit: Identify and eliminate one distraction platform', true, 2),
        (t_id, 'Block: 3 hours of Deep Work on one major project', true, 3),
        (t_id, 'Review: Did I show up as my best self today?', true, 4),
        (t_id, 'Plan: Set the "Big 3" for tomorrow''s sprint', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 14. Newport “Deep Work” Weekly Planner (Cal Newport)
    SELECT id INTO t_id FROM loop_templates WHERE title = 'Newport “Deep Work” Weekly Planner' LIMIT 1;
    IF t_id IS NOT NULL THEN
        INSERT INTO template_tasks (template_id, description, is_recurring, display_order) VALUES
        (t_id, 'Review: Audit the last week''s Deep Work hours', true, 1),
        (t_id, 'Schedule: Block out 15 hours of deep work for next week', true, 2),
        (t_id, 'Shallow Work Audit: Consolidate emails & meetings', true, 3),
        (t_id, 'Recovery: Plan a day of complete digital disconnection', true, 4),
        (t_id, 'Commit to the Deep Work philosophy for the week ahead', true, 5)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
