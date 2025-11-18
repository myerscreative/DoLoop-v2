// Script to create the task-attachments storage bucket
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://faaidvdogakvrdwloxjf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWlkdmRvZ2FrdnJkd2xveGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDgwMjAsImV4cCI6MjA3NDgyNDAyMH0.TK1IAFq5QV7i3CLHWkDI9rARk9OMKabRDGfKYlgfc8Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
  try {
    console.log('Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Existing buckets:', buckets.map(b => b.name));

    const bucketExists = buckets.some(bucket => bucket.name === 'task-attachments');
    console.log('Bucket exists:', bucketExists);

    if (!bucketExists) {
      console.log('Creating task-attachments bucket...');

      // Try creating with different options
      const { data, error } = await supabase.storage.createBucket('task-attachments', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['*/*']
      });

      if (error) {
        console.error('Error creating bucket:', error);
        console.log('This is likely a permissions issue. Please create the bucket manually in the Supabase dashboard.');
        console.log('Go to: https://supabase.com/dashboard/project/faaidvdogakvrdwloxjf/storage');
        console.log('Create bucket: task-attachments (private, 10MB limit, allow all MIME types)');
      } else {
        console.log('Bucket created successfully:', data);
      }
    } else {
      console.log('Bucket already exists');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createBucket();
