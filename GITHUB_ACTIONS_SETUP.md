# Setup GitHub Actions for Automatic Deployment

This guide will help you set up automatic deployment of Supabase Edge Functions whenever you push code to GitHub.

## Step 1: Get Your Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a name like "GitHub Actions"
4. Copy the token (you'll only see it once!)

## Step 2: Get Your Supabase Project Reference

Your project reference is in your Supabase dashboard URL:
```
https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]
```

For example, if your URL is `https://supabase.com/dashboard/project/abcdefghijklmnop`, then your project ref is `abcdefghijklmnop`.

## Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/myerscreative/DoLoop-v2`
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"** and add these two secrets:

   **Secret 1:**
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: [paste the access token from Step 1]

   **Secret 2:**
   - Name: `SUPABASE_PROJECT_REF`
   - Value: [paste your project ref from Step 2]

## Step 4: Commit and Push the Workflow

The workflow file has already been created at `.github/workflows/deploy-supabase-functions.yml`

Just commit and push:

```bash
git add .github/workflows/deploy-supabase-functions.yml
git commit -m "Add GitHub Actions workflow for Supabase edge function deployment"
git push
```

## Step 5: Trigger the Deployment

### Option A: Automatic (when you push function changes)
The workflow will automatically run whenever you push changes to files in `supabase/functions/`

### Option B: Manual Trigger
1. Go to your repository on GitHub
2. Click the **"Actions"** tab
3. Click **"Deploy Supabase Edge Functions"** in the left sidebar
4. Click **"Run workflow"** button
5. Select the branch and click **"Run workflow"**

## Verify Deployment

After the workflow runs:
1. Go to the **Actions** tab in your GitHub repo
2. Click on the latest workflow run
3. Check that all three functions deployed successfully (green checkmarks)

## Done!

Your edge functions will now automatically deploy whenever you:
- Push changes to `supabase/functions/` on main/master branch
- Manually trigger the workflow from the Actions tab

---

## Troubleshooting

**Error: "Supabase project not found"**
- Double-check your `SUPABASE_PROJECT_REF` secret is correct

**Error: "Authentication failed"**
- Double-check your `SUPABASE_ACCESS_TOKEN` secret is correct
- Make sure the token hasn't expired

**Functions not updating**
- Make sure you're pushing to the `main` or `master` branch
- Check the Actions tab for error messages
