# Doloop iOS Fix Instructions

## ✅ COMPLETED FIXES

1. ✅ Created `index.js` - App entry point
2. ✅ Created `babel.config.js` - Required for Reanimated
3. ✅ Fixed `package.json` main entry to point to `index.js`
4. ✅ Cleaned and reinstalled all dependencies

## ⚠️ CRITICAL REQUIREMENT: Install Full Xcode

**The app needs full Xcode, not just Command Line Tools.**

### Install Xcode:
1. Open **App Store**
2. Search for **"Xcode"**
3. Download and install (this takes ~30-45 minutes, 15GB+)
4. After installation, run:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -license accept
   sudo xcodebuild -runFirstLaunch
   ```

## 📋 STEPS TO RUN AFTER XCODE IS INSTALLED

### 1. Clear Everything and Rebuild
```bash
cd /Users/robertmyers/Code/doloop-v2

# Clean caches
rm -rf ios android .expo
watchman watch-del-all || true
rm -rf $TMPDIR/metro-* $TMPDIR/haste-*

# Rebuild native folders
npx expo prebuild --clean --platform ios
```

### 2. Install iOS Dependencies
```bash
cd ios
pod install --repo-update
cd ..
```

### 3. Run on iOS Simulator
```bash
# Start Metro bundler in one terminal
npx expo start --clear

# In another terminal, run on iOS
npx expo run:ios
```

**OR** use the single command:
```bash
npx expo run:ios
```

This will:
- Build the native app
- Launch iOS simulator
- Start Metro bundler
- Load your app

## 🐛 If Still Having Issues

### A. Metro/Cache Issues
```bash
# Nuclear option - clear everything
watchman watch-del-all
rm -rf node_modules ios android .expo
rm -rf $TMPDIR/metro-* $TMPDIR/haste-*
npm install
npx expo prebuild --clean
npx expo run:ios
```

### B. Supabase Config
If you see warnings about Supabase config, update `app.json`:
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "YOUR_ACTUAL_SUPABASE_URL",
      "supabaseAnonKey": "YOUR_ACTUAL_ANON_KEY"
    }
  }
}
```

### C. Simulator Not Found
```bash
# List available simulators
xcrun simctl list devices available

# Boot a specific simulator
open -a Simulator

# Then run
npx expo run:ios
```

## 📱 Expected Result

When working correctly, you should see:
```
✓ Build Succeeded
Launching on iPhone 16...
● Metro bundler running
✓ App loaded: "Good morning! 🌅"
```

## 🔧 Files Modified

- ✅ `/index.js` - Entry point
- ✅ `/babel.config.js` - Babel config with Reanimated plugin
- ✅ `/package.json` - Main entry point fixed
- ✅ `/App.tsx` - Already correct, no changes needed
- ✅ Dependencies installed fresh

## 📞 Still Stuck?

Common errors and fixes:

| Error | Fix |
|-------|-----|
| `SDK "iphoneos" cannot be located` | Install full Xcode (see above) |
| `Unable to resolve module` | Clear Metro cache: `npx expo start --clear` |
| `Command PhaseScriptExecution failed` | `cd ios && pod deintegrate && pod install` |
| Blank white screen | Check Metro logs for JS errors |
| Red screen crash | Check native logs in Xcode |

---

**Next Step: Install Xcode from App Store, then run the commands in section "STEPS TO RUN AFTER XCODE IS INSTALLED"**

