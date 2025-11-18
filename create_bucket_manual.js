// Manual bucket creation script - requires service role key
// This script should be run by someone with admin access to the Supabase project

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://faaidvdogakvrdwloxjf.supabase.co";
// IMPORTANT: Replace this with your SERVICE ROLE key (not anon key)
// The service role key bypasses RLS policies
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "REPLACE_WITH_SERVICE_ROLE_KEY";

if (!supabaseServiceKey || supabaseServiceKey === "REPLACE_WITH_SERVICE_ROLE_KEY") {
  console.error('❌ SERVICE ROLE KEY REQUIRED');
  console.error('This script requires the Supabase service role key to bypass RLS policies.');
  console.error('Get it from: https://supabase.com/dashboard/project/faaidvdogakvrdwloxjf/settings/api');
  console.error('Look for "service_role" key (starts with eyJ...)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createBucket() {
  try {
    console.log('🔍 Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('📋 Existing buckets:', buckets.map(b => b.name));

    const bucketExists = buckets.some(bucket => bucket.name === 'task-attachments');
    console.log(bucketExists ? '✅ Bucket exists' : '❌ Bucket missing');

    if (!bucketExists) {
      console.log('🛠️ Creating task-attachments bucket...');

      const { data, error } = await supabase.storage.createBucket('task-attachments', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['*/*']
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Bucket created successfully!');
        console.log('Bucket details:', data);

        // Verify bucket was created
        const { data: verifyBucket, error: verifyError } = await supabase.storage.getBucket('task-attachments');
        if (verifyError) {
          console.error('❌ Verification failed:', verifyError);
        } else {
          console.log('✅ Bucket verification successful:', verifyBucket.name);
        }
      }
    } else {
      console.log('✅ Bucket already exists - no action needed');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createBucket();
