# 🚀 Doloop Quick Start

## ⚠️ CRITICAL: Install Xcode First

**You have Command Line Tools but need full Xcode.**

### 1. Install Xcode (One Time Setup)
```bash
# Open App Store → Search "Xcode" → Install (takes 30-45 min)
# After installation:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch
```

### 2. Run the App
```bash
# Option A: Single command (recommended)
npx expo run:ios

# Option B: Two terminals
# Terminal 1:
npx expo start --clear

# Terminal 2:
npx expo run:ios --device
```

### 3. If Issues Occur
```bash
# Run diagnostics
./diagnose.sh

# Nuclear reset
rm -rf ios android .expo node_modules
npm install
npx expo prebuild --clean
npx expo run:ios
```

## ✅ What's Already Fixed

- ✅ `index.js` created (app entry point)
- ✅ `babel.config.js` created (Reanimated support)
- ✅ `package.json` main entry fixed
- ✅ All dependencies installed
- ✅ `.gitignore` updated for React Native

## 🧪 Testing Strategy

### Phase 1: Verify Basic Boot
Use `App.minimal.tsx` to test basic functionality:
```bash
# Backup current App
mv App.tsx App.full.tsx

# Use minimal version
mv App.minimal.tsx App.tsx

# Run
npx expo run:ios
```

**Expected:** See "Doloop Works! ✅" with tap counter

### Phase 2: Test Full App
Once minimal works, restore full app:
```bash
mv App.tsx App.minimal.tsx
mv App.full.tsx App.tsx
npx expo run:ios
```

## 📁 File Structure

```
doloop-v2/
├── index.js              ← Entry point (NEW)
├── App.tsx               ← Main app
├── App.minimal.tsx       ← Test version (NEW)
├── babel.config.js       ← Babel config (NEW)
├── app.json              ← Expo config
├── diagnose.sh           ← Diagnostic tool (NEW)
├── package.json          ← Dependencies
└── src/
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── LoginScreen.tsx
    │   └── LoopDetailScreen.tsx
    ├── contexts/
    │   ├── AuthContext.tsx
    │   └── ThemeContext.tsx
    └── lib/
        └── supabase.ts
```

## 🔧 Common Issues

| Error | Solution |
|-------|----------|
| `SDK "iphoneos" cannot be located` | Install full Xcode |
| `Unable to resolve module` | `npx expo start --clear` |
| `Command PhaseScriptExecution failed` | `cd ios && pod install` |
| Blank screen | Check Metro logs for errors |
| App crashes on launch | Use `App.minimal.tsx` to isolate |

## 📞 Still Stuck?

1. Run `./diagnose.sh` to check environment
2. Check `FIX_INSTRUCTIONS.md` for detailed steps
3. Look at Metro bundler logs for JS errors
4. Check Xcode logs for native errors

---

**Next: Install Xcode, then run `npx expo run:ios`**

