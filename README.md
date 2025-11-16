# 🐝 DoLoop

**Momentum Through Completion** - A loop-based productivity app for iOS that helps you build momentum through recurring task completion.

## 🎯 Core Concept

DoLoop helps users complete recurring tasks (loops) and build momentum over time. Unlike other productivity apps, DoLoop focuses on:

- **Circular Progress** - Visual loop completion creates satisfaction
- **Momentum Visualization** - See your consistency build over time
- **Bee Theme** - Friendly, energetic brand (gold/yellow)
- **Clean Design** - Professional yet playful, no clutter

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on web (for testing)
npx expo start --web
```

## 🔐 Environment Setup

Supabase credentials are configured in `app.json` under the `extra` section:

```json
{
  "extra": {
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseAnonKey": "your-anon-key"
  }
}
```

## 📜 Available Scripts

- `npm start` - Start Expo development server
- `npx expo run:ios` - Run on iOS simulator
- `npx expo run:android` - Run on Android emulator
- `npx expo prebuild` - Generate native iOS/Android projects
- `eas build --platform ios` - Build for TestFlight/App Store

## 🛠 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and build service
- **TypeScript** - Type safety throughout
- **Supabase** - Backend, database, and authentication
- **React Navigation** - Navigation framework
- **EAS Build** - Cloud build service for iOS/Android

## 📁 Project Structure

```
doloop-v2/
├── src/
│   ├── components/       # React components
│   │   ├── native/      # Native platform components (logos, icons)
│   │   ├── Header.tsx
│   │   ├── LoopSelectionModal.tsx
│   │   └── OnboardingCard.tsx
│   ├── screens/         # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── LoopDetailScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/             # Utilities and helpers
│   │   ├── supabase.ts
│   │   ├── loopStorage.ts
│   │   └── loopUtils.ts
│   ├── types/           # TypeScript types
│   │   ├── loop.ts
│   │   └── onboarding.ts
│   └── constants/       # App constants
│       └── Colors.ts
├── assets/              # App icon, splash screen
├── public/              # SVG assets (web)
├── ios/                 # Native iOS project
├── supabase/            # Database migrations
└── App.tsx              # Root component
```

## 🎨 Design System

### Colors
- **Primary Gold:** `#FFB800` (Bee theme - vibrant gold)
- **Success Green:** `#00E5A2` (Completion celebrations)
- **Error Red:** `#EF4444` (Errors and warnings)
- **Text:** `#1A1A1A` (Light mode) / `#FFFFFF` (Dark mode)

See [COLOR_HARMONIZATION.md](./COLOR_HARMONIZATION.md) for complete color guide.

### Components
- **BeeIcon** - Animated bee mascot component
- **DoLoopLogo** - Full logo with bee + text
- **CircularProgress** - Loop completion progress rings
- **LoopCard** - Individual loop display cards
- **FAB** - Floating action button for adding tasks/loops

## 🔖 Loop Categories

- **🐝 Playful** - Fun & lighthearted loops
- **🎯 Focus** - Minimal distraction work loops
- **👨‍👩‍👧 Family** - Shared & collaborative loops
- **💼 Pro** - Business focused loops
- **🧘‍♀️ Wellness** - Health & mindfulness loops

## 📋 Current Status

### ✅ MVP Complete (Phase 1)
- [x] React Native + Expo setup
- [x] Supabase authentication (Apple Sign In, Google Sign In)
- [x] Complete onboarding flow (4 screens)
- [x] Loop creation and management
- [x] Task completion with progress tracking
- [x] Circular progress indicators
- [x] Home screen with loop cards
- [x] Loop detail screen
- [x] Streak tracking
- [x] Dark mode support

### 🚀 Ready for TestFlight
- [x] iOS build configuration
- [x] Authentication working
- [x] Database schema and RLS policies
- [x] All core features implemented
- [ ] App icon and splash screen (in progress)
- [ ] Final testing on device

### 🔮 Phase 2 (Post-Launch)
- [ ] Shared loops (collaboration)
- [ ] Loop templates marketplace
- [ ] Advanced statistics and insights
- [ ] Achievements and celebrations
- [ ] Social features
- [ ] Apple Watch companion app

## 🧩 Key Features

### Circular Progress Loops
Beautiful SVG-based progress rings that fill as you complete tasks. Smooth animations create satisfaction when completing loops.

### Momentum Through Completion
Streak tracking shows your consistency without punishment. The goal is building momentum, not maintaining perfect streaks.

### Smart Loop Reset
Loops automatically reset based on schedule (daily, weekly, custom). Wake up to fresh loops ready to complete.

## 📚 Documentation

### Getting Started
- **[BRAND_SETUP_COMPLETE.md](./BRAND_SETUP_COMPLETE.md)** - Asset setup and next steps
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Comprehensive development guidelines

### Brand & Assets
- **[BRAND_ASSETS_STATUS.md](./BRAND_ASSETS_STATUS.md)** - Asset checklist and status
- **[ASSET_GENERATION_GUIDE.md](./ASSET_GENERATION_GUIDE.md)** - How to create app icons and assets
- **[ASSET_USAGE_MAP.md](./ASSET_USAGE_MAP.md)** - Where assets appear in the app
- **[COLOR_HARMONIZATION.md](./COLOR_HARMONIZATION.md)** - Brand color guide

### Deployment
- **[TESTFLIGHT_DEPLOYMENT.md](./TESTFLIGHT_DEPLOYMENT.md)** - Complete TestFlight guide
- **[SHIP_TO_TESTFLIGHT.md](./SHIP_TO_TESTFLIGHT.md)** - Pre-launch checklist

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks (no class components)
- React Native StyleSheet for styling
- Named exports preferred
- Keep components under 200 lines

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`
- Types: `camelCase.ts`

### Git Commits
```
feat: add new feature
fix: bug fix
refactor: code improvement
docs: documentation
style: formatting
```

## 💭 Development Notes

Built with Cursor AI assistance. The app emphasizes:
- **Momentum over perfection** - Progress matters more than streaks
- **Visual satisfaction** - Completing loops feels rewarding
- **Clean UX** - No clutter, no gamification gimmicks
- **Friendly branding** - Bee theme is professional yet playful

## 📚 Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

## 🚫 What DoLoop Is NOT

- ❌ Not a gamification app (no XP, levels, badges)
- ❌ Not a punishment system (no streak flames)
- ❌ Not a tree-growing app (that's Forest)
- ❌ Not an RPG (that's Habitica)

DoLoop is pure, focused productivity with beautiful visualization and friendly encouragement.

## 📝 License

Private project - All rights reserved

## 👤 Author

Robert Myers (@myerscreative)

---

**Built with momentum, visualized with loops.** 🔄
