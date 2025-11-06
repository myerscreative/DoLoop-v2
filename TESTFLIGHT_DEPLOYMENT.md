# TestFlight Deployment Guide 🚀

Complete guide to deploy Doloop to TestFlight for beta testing.

---

## Prerequisites

- [ ] Apple Developer Account ($99/year)
- [ ] Expo account (free)
- [ ] App Store Connect access
- [ ] Valid bundle identifier: `com.myerscreative.doloop`

---

## Step 1: Install EAS CLI

```bash
# Install globally
npm install -g eas-cli

# Login to Expo
eas login
# Enter your Expo credentials

# Initialize EAS (if first time)
eas build:configure
```

---

## Step 2: Get EAS Project ID

```bash
# Create/link EAS project
eas init

# This will:
# 1. Create a new EAS project
# 2. Generate a projectId
# 3. Update app.json automatically

# Or check existing project
eas project:info
```

**Update `app.json` with the projectId:**

```json
"extra": {
  "eas": {
    "projectId": "abc123def456"  // Replace with your actual ID
  }
}
```

---

## Step 3: Apple Developer Setup

### 3.1 App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **Apps** → **+** (Add App)
3. Fill in:
   - **Platform:** iOS
   - **Name:** Doloop
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.myerscreative.doloop` (must match app.json)
   - **SKU:** `doloop-2025` (unique identifier)
   - **User Access:** Full Access

### 3.2 Get Required IDs

```bash
# Apple Team ID
# Found at: https://developer.apple.com/account
# Under: Membership → Team ID

# App Store Connect App ID
# Found at: App Store Connect → App → App Information → Apple ID
```

**Update `eas.json` submit section:**

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "robert@myerscreative.com",
      "ascAppId": "6123456789",        // Your App Store Connect App ID
      "appleTeamId": "ABCD123XYZ"      // Your Apple Team ID
    }
  }
}
```

---

## Step 4: Build for iOS

```bash
# Production build (uploads to App Store Connect)
eas build --platform ios --profile production

# This will:
# ✓ Bundle your app
# ✓ Generate credentials (or use existing)
# ✓ Build on Expo servers
# ✓ Upload IPA to App Store Connect
# ⏱️ Takes ~15-20 minutes
```

**Expected Output:**

```
✔ Select platform: iOS
✔ Build profile: production
✔ Using credentials from Expo servers
✔ Building...

Build details: https://expo.dev/accounts/[your-account]/projects/doloop/builds/[build-id]

Build finished:
https://expo.dev/artifacts/eas/[artifact-id].ipa

The build was automatically submitted to App Store Connect
```

---

## Step 5: TestFlight Configuration

### 5.1 Wait for Processing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to: **App → TestFlight**
3. Wait for build to appear (usually 5-10 minutes)
4. Status will change from "Processing" → "Ready to Submit" → "Testing"

### 5.2 Add Build Information

Before you can test, you need to provide:

1. **What to Test:** (Beta App Description)
```
Doloop v1.0.0 - Initial Beta Release

New Features:
• Reusable loop checklists
• Progress ring animations
• Daily/weekly auto-reset
• Streak counter 🔥
• Dark mode support
• Offline-first sync

Please test:
- Creating and completing loops
- Reloop functionality
- Streak tracking
- UI responsiveness
```

2. **Export Compliance:** 
   - Select "No" (unless using custom encryption)

### 5.3 Add Internal Testers

**Internal Testing Group** (instant, no review):

1. TestFlight → Internal Testing
2. Click **+** next to Testers
3. Add emails:
   - robert@myerscreative.com
   - [Add more internal testers]
4. Click **Add**
5. Testers receive email instantly

**External Testing Group** (requires review, 48h):

1. TestFlight → External Testing
2. Create Group: "Beta Testers"
3. Add testers:
   - Friends
   - Family
   - Early adopters (up to 10,000)
4. Submit for Beta App Review
5. Approval usually within 24-48 hours

---

## Step 6: Install on Device

### For Testers:

1. **Install TestFlight** from App Store
2. **Check email** for invitation
3. **Tap "View in TestFlight"** link
4. **Accept** → **Install**

### Test Checklist:

- [ ] App launches successfully
- [ ] Login/signup works
- [ ] Create a loop
- [ ] Add tasks
- [ ] Complete tasks (progress ring updates)
- [ ] Press "Reloop" button
- [ ] Verify streak counter in header
- [ ] Test dark mode
- [ ] Check offline behavior
- [ ] Test notifications (if enabled)

---

## Step 7: Monitor & Update

### View Crash Reports

```
App Store Connect → TestFlight → Build → Crashes
```

### Push New Build

```bash
# Increment version in app.json
"version": "1.0.1",
"ios": {
  "buildNumber": "2"  // EAS auto-increments if autoIncrement: true
}

# Build and submit
eas build --platform ios --profile production --auto-submit
```

### Update Build Notes

After each build:
1. Go to TestFlight → Build
2. Click **Provide Test Details**
3. Update "What to Test" with changes

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
eas build:list
eas build:view [build-id]

# Common fixes:
npm install  # Ensure all dependencies installed
npx expo-doctor  # Check for issues
rm -rf node_modules && npm install  # Clean install
```

### Credentials Issues

```bash
# Clear and regenerate
eas credentials

# Select:
# iOS → Production → Delete credentials → Rebuild
```

### Build Not Appearing in App Store Connect

- Wait 10-15 minutes for processing
- Check email for rejection notices
- Verify bundle ID matches exactly
- Ensure app exists in App Store Connect

### TestFlight Invite Not Received

- Check spam folder
- Verify email in App Store Connect → Users and Access
- Resend invitation from TestFlight

---

## Quick Reference

### Build Commands

```bash
# Production build
eas build --platform ios --profile production

# Build + Auto-submit
eas build --platform ios --profile production --auto-submit

# Check build status
eas build:list

# View specific build
eas build:view [build-id]

# Download IPA
eas build:download [build-id]
```

### Submit Commands

```bash
# Submit to App Store Connect (if not auto-submitted)
eas submit --platform ios --profile production

# Submit specific build
eas submit --platform ios --id [build-id]
```

### Project Commands

```bash
# View project info
eas project:info

# Link to existing project
eas project:init

# View credentials
eas credentials
```

---

## Timeline

| Step | Duration |
|------|----------|
| EAS Build | 15-20 min |
| App Store Processing | 5-10 min |
| Internal Testing | Instant |
| External Testing Review | 24-48 hours |
| **Total (Internal)** | **~30 minutes** |
| **Total (External)** | **1-2 days** |

---

## Post-Launch

### Collect Feedback

Create feedback form:
```
Google Forms / Typeform:
- What features did you like?
- What was confusing?
- Any bugs encountered?
- Feature requests?
```

### Monitor Metrics

App Store Connect Analytics:
- Installations
- Sessions
- Crashes
- Retention
- Device types

### Iterate

Based on feedback:
1. Fix critical bugs
2. Improve UX pain points
3. Add requested features
4. Push update to TestFlight
5. Repeat until ready for production

---

## Next: Production Release

Once beta testing is complete:

1. **App Store Connect** → App → **Prepare for Submission**
2. Fill in:
   - Screenshots (required: 6.7", 6.5", 5.5")
   - Description
   - Keywords
   - Privacy Policy URL
   - Support URL
   - Category: Productivity
   - Age Rating: 4+
3. Submit for review (1-3 days)
4. 🎉 Live on App Store!

---

## Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [TestFlight Guide](https://developer.apple.com/testflight/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## Support

Issues? Check:
- [Expo Forums](https://forums.expo.dev/)
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

**You got this! 🚀**


