-- Add priority column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'none';

-- Add check constraint for valid priority values
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('none', 'low', 'medium', 'high', 'urgent'));
