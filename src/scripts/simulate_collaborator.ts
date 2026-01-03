
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Ideally service role, but for updating a task, anon might work if RLS allows or if we login

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOOP_ID = 'c660cf02-b0e4-4745-8aa0-31cf11bfffa2'; // The active loop from browser state

async function simulate() {
  console.log(`[Simulation] Connecting to Supabase for Loop: ${LOOP_ID}`);

  // 1. Fetch tasks to find one to toggle
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('loop_id', LOOP_ID)
    .limit(1);

  if (error || !tasks || tasks.length === 0) {
    console.error('[Simulation] Failed to find tasks or error:', error);
    process.exit(1);
  }

  const task = tasks[0];
  console.log(`[Simulation] Found task: "${task.description}" (Currently: ${task.completed ? 'Done' : 'Pending'})`);

  // 2. Wait a moment to let the recording start
  console.log('[Simulation] Waiting 3 seconds before action...');
  await new Promise(r => setTimeout(r, 3000));

  // 3. Toggle the task
  const newStatus = !task.completed;
  console.log(`[Simulation] Toggling task to: ${newStatus ? 'Done' : 'Pending'}...`);

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ completed: newStatus })
    .eq('id', task.id);

  if (updateError) {
    console.error('[Simulation] Update failed:', updateError);
  } else {
    console.log('[Simulation] Task updated successfully! Check the browser for Progress Ring animation.');
  }
}

simulate();
