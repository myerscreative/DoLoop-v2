# Ship to TestFlight - Quick Start ⚡

**Goal:** Get Doloop beta live in 15 minutes.

---

## Prerequisites

✅ Apple Developer Account ($99/year)  
✅ Expo Account (free - [expo.dev](https://expo.dev))

---

## 5-Step Deployment

### 1️⃣ Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2️⃣ Initialize EAS Project

```bash
# In project root
eas init

# This generates your projectId
# Automatically updates app.json
```

**Verify `app.json` has projectId:**

```json
"extra": {
  "eas": {
    "projectId": "abc123def456"
  }
}
```

### 3️⃣ Configure Apple IDs

**Get your Apple Team ID:**
- Go to: https://developer.apple.com/account
- Click: **Membership** → Copy **Team ID**

**Create app in App Store Connect:**
- Go to: https://appstoreconnect.apple.com
- Click: **Apps** → **+** → **New App**
- Platform: **iOS**
- Name: **Doloop**
- Bundle ID: **com.myerscreative.doloop**
- SKU: **doloop-2025**
- Copy the **Apple ID** (numeric, e.g., 6123456789)

**Update `eas.json`:**

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "robert@myerscreative.com",
      "ascAppId": "6123456789",
      "appleTeamId": "ABCD123XYZ"
    }
  }
}
```

### 4️⃣ Build for iOS

```bash
eas build --platform ios --profile production
```

**What happens:**
- ✓ Bundles your app (~5 min)
- ✓ Generates/uses credentials
- ✓ Builds on Expo servers (~10-15 min)
- ✓ Uploads to App Store Connect (~2 min)

**Wait for build to complete:** Check status at build URL provided.

### 5️⃣ Configure TestFlight

**In App Store Connect:**

1. Go to: **App → TestFlight**
2. Wait for build to appear (5-10 min processing)
3. Click build → **Test Details** → Add info:

```
What to Test:
Doloop v1.0.0 - Initial Beta

Features:
• Reusable loop checklists
• Progress rings
• Daily/weekly auto-reset
• Streak counter 🔥
• Dark mode

Please test creating loops, completing tasks, and the Reloop button.
```

4. **Internal Testing:**
   - Add testers (instant access)
   - robert@myerscreative.com
   - [Add more emails]

5. **External Testing** (optional, 48h review):
   - Create group "Beta Testers"
   - Add up to 10,000 testers
   - Submit for review

---

## Install on Device

**Testers receive email:**
1. Install **TestFlight** from App Store
2. Tap **"View in TestFlight"** from email
3. **Accept** → **Install**

---

## Troubleshooting

### Build fails?

```bash
# Check logs
eas build:list
eas build:view [build-id]

# Common fixes
npm install
npx expo-doctor
```

### Can't find Apple Team ID?

```
https://developer.apple.com/account → Membership
```

### Build not in App Store Connect?

- Wait 10-15 minutes
- Check bundle ID matches: `com.myerscreative.doloop`
- Verify app exists in App Store Connect

---

## Update & Rebuild

```bash
# 1. Update version (optional)
# Edit app.json:
"version": "1.0.1"

# 2. Rebuild
eas build --platform ios --profile production

# 3. New build auto-appears in TestFlight
```

---

## Timeline

| Step | Time |
|------|------|
| EAS Setup | 2 min |
| Build | 15-20 min |
| Processing | 5-10 min |
| TestFlight Config | 3 min |
| **Total** | **~25-35 min** |

---

## Next Steps

✅ **Collect Feedback** from testers  
✅ **Fix Bugs** → rebuild  
✅ **Add Screenshots** for App Store  
✅ **Submit for Review** when ready

---

## Full Documentation

- 📖 **Detailed Guide:** `TESTFLIGHT_DEPLOYMENT.md`
- 📱 **App Store Metadata:** `APP_STORE_METADATA.md`
- 🔧 **EAS Config:** `eas.json`
- 📦 **App Config:** `app.json`

---

## Support

Need help?
- [Expo Docs](https://docs.expo.dev/build/introduction/)
- [EAS Support](https://expo.dev/support)
- [Discord](https://chat.expo.dev/)

---

**Let's ship it! 🚀**

```bash
# Ready? Run this:
eas build --platform ios --profile production
```

