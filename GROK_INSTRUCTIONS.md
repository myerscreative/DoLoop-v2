# Grok Project Instructions: DoLoop-v2

## 🐝 Core Concept: Momentum Through Completion

DoLoop is a circular-progress-based productivity app focused on building momentum through recurring tasks ("loops").

- **Key Metaphor**: Loops are recurring task lists that visually "fill" as items are completed.
- **Design Philosophy**: Focus on consistency (momentum) over perfection (streaks). Pure productivity, no gamification (XP/levels).
- **Brand**: Professional Bee theme. Primary Gold (#fbbf24) to Orange (#f59e0b) gradients.
- **CRITICAL**: Strictly NO Purple. Use Dark Bronze/Amber for high-contrast elements.

## 🛠 Tech Stack

- **Frontend**: React Native (Expo) + TypeScript + Next.js (Hybrid Web).
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Styling**: React Native StyleSheet with theme support.
- **Animations**: Reanimated / SVG-based progress rings.
- **Navigation**: React Navigation (Stack + Tab).

## 📁 Project Structure

- `src/components/`: UI components. `native/` for mobile-specific overrides.
- `src/screens/`: Main app screens (HomeScreen, LoopDetail, Onboarding).
- `src/lib/` & `src/services/`: Supabase logic, storage helpers, loop utils.
- `src/types/`: Shared TypeScript interfaces.
- `src/constants/`: Brand colors, spacing, and typography.
- `supabase/`: Database migrations and RLS policies.

## 💾 Core Data Models (PostgreSQL / TypeScript)

### Profiles

Tracks user state and onboarding preferences.
`id (UUID), full_name, user_type, use_cases, onboarding_completed`

### Loops

The core unit of organization.
`id (UUID), user_id, name, color, icon, category, reset_rule (daily/weekly/manual)`

### Tasks

Items within a loop.
`id (UUID), loop_id, title, order_index, completed (boolean status for current reset cycle)`

### Completions

History tables for analytics and streaks.
`loop_completions` & `task_completions` (maps IDs to timestamps).

## 🚀 Key Workflows

### 1. Onboarding

Multi-step flow capturing user type (Parent, Worker, Student) and use cases (Daily, Specialized, Shared). Maps to `profiles`.

### 2. Loop Execution

- Users see "Today's Loops" on the Home Screen.
- Tapping a loop opens a completion modal.
- Checking off tasks triggers SVG progress ring animations.
- 100% completion triggers a success celebration.

### 3. Reset Logic

Loops reset based on their `reset_rule`. Daily loops reset at midnight local time.

## 🔖 Development Principles

- **Aesthetics First**: Premium feel, smooth transitions, high-quality gradients.
- **Code Style**: Functional components, custom hooks for logic, TypeScript strict mode.
- **Performance**: Optimized lists (FlatList), small focused components (<200 lines).
- **Stability**: Robust Supabase RLS policies; secure token handling.

## ⚡ Quick Navigation

- **Home**: `src/screens/home/HomeScreen.tsx`
- **Loop UI**: `src/components/native/LoopCard.tsx`
- **Database**: `supabase/migrations/`
- **Themes**: `src/theme/colors.ts`
