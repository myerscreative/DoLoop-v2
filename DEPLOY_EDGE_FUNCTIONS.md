# Deploy Edge Functions to Supabase

## Prerequisites
- Supabase CLI installed on your local machine
- OpenAI API key set in Supabase secrets (✓ Already done!)

## Install Supabase CLI on Your Local Machine

### macOS
```bash
brew install supabase/tap/supabase
```

### Windows
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux
```bash
brew install supabase/tap/supabase
```

Or download from: https://github.com/supabase/cli/releases

## Login to Supabase

```bash
supabase login
```

This will open a browser window for you to authenticate.

## Link Your Project

```bash
cd /path/to/DoLoop-v2
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project ref in your Supabase dashboard URL:
`https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]`

## Deploy Edge Functions

Deploy all three AI functions:

```bash
# Deploy the template hints generator (main one you need)
supabase functions deploy generate_template_hints

# Deploy the AI loop generator (optional but recommended)
supabase functions deploy generate_ai_loop

# Deploy the loop recommendations (optional but recommended)
supabase functions deploy recommend_loops
```

## Verify Deployment

After deployment, you can test the function:

```bash
supabase functions invoke generate_template_hints --body '{"template_id":"test-id"}'
```

## Done!

Once deployed, your app will automatically call these functions when:
- Viewing templates in the Loop Library (hints will auto-generate)
- Creating AI-powered loops
- Getting loop recommendations from the Loop Sommelier

---

## Troubleshooting

If you get permission errors, make sure:
1. You're logged in: `supabase login`
2. Your project is linked: `supabase link`
3. Your OpenAI API key is set in secrets (already done ✓)
