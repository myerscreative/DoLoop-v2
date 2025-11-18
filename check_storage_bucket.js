// Simple script to check if the task-attachments storage bucket exists
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://faaidvdogakvrdwloxjf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWlkdmRvZ2FrdnJkd2xveGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDgwMjAsImV4cCI6MjA3NDgyNDAyMH0.TK1IAFq5QV7i3CLHWkDI9rARk9OMKabRDGfKYlgfc8Y";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndCreateBucket() {
  try {
    console.log('Checking if task-attachments bucket exists...');

    // List buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'task-attachments');
    console.log('Bucket exists:', bucketExists);

    if (!bucketExists) {
      console.log('Creating task-attachments bucket...');

      const { data, error } = await supabase.storage.createBucket('task-attachments', {
        public: false,
        allowedMimeTypes: ['*/*'],
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Bucket created successfully:', data);
      }
    } else {
      console.log('Bucket already exists');
    }

    // Check bucket details
    console.log('Getting bucket details...');
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('task-attachments');

    if (bucketError) {
      console.error('Error getting bucket details:', bucketError);
    } else {
      console.log('Bucket details:', bucket);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndCreateBucket();
