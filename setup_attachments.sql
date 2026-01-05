-- =====================================================
-- Setup Attachments Feature for DoLoop
-- Run this in Supabase SQL Editor or via psql
-- =====================================================

-- ===== ATTACHMENTS TABLE =====
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- ===== RLS POLICIES =====
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view attachments from their tasks" ON attachments;
CREATE POLICY "Users can view attachments from their tasks" ON attachments
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN loops l ON t.loop_id = l.id
      WHERE l.owner_id = auth.uid()
        OR l.id IN (SELECT loop_id FROM loop_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can upload attachments to their tasks" ON attachments;
CREATE POLICY "Users can upload attachments to their tasks" ON attachments
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN loops l ON t.loop_id = l.id
      WHERE l.owner_id = auth.uid()
        OR l.id IN (SELECT loop_id FROM loop_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own attachments" ON attachments;
CREATE POLICY "Users can delete their own attachments" ON attachments
  FOR DELETE USING (auth.uid() = uploaded_by);

-- ===== STORAGE BUCKET =====
-- Note: This needs to be run with service_role permissions
-- or created via the Supabase Dashboard

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('task-attachments', 'task-attachments', false, 10485760, ARRAY['image/*', 'application/pdf', 'text/*', 'application/*'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Users can upload their own attachments" ON storage.objects;
CREATE POLICY "Users can upload their own attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view their own attachments" ON storage.objects;
CREATE POLICY "Users can view their own attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;
CREATE POLICY "Users can delete their own attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verify setup
SELECT 'Attachments table created' AS status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attachments');
SELECT 'Storage bucket created' AS status WHERE EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'task-attachments');
