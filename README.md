# 🔄 DoLoop

**Momentum Through Completion** - A loop-based productivity app that visualizes progress through circular indicators and builds momentum through consistency.

## 🎯 Core Concept

DoLoop helps users complete recurring tasks (loops) and build momentum over time. Unlike other productivity apps, DoLoop focuses on:

- **Circular Progress** - Loops that close create satisfaction
- **Momentum Visualization** - See your consistency build over time
- **Flow State Awareness** - Know when you're in rhythm
- **Clean Design** - No gamification gimmicks, just pure productivity

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3001
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Note:** Supabase integration coming in Phase 3. For now, the app uses local state.

## 📜 Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🛠 Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Supabase** - Backend & database (coming soon)
- **Vercel** - Deployment platform

## 📁 Project Structure

```
doloop-v2/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── loops/       # Loop-specific components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utilities and helpers
│   ├── types/           # TypeScript types
│   └── store/           # State management (Zustand)
├── public/              # Static assets
└── .cursorrules         # Cursor AI guidelines
```

## 🎨 Design System

### Colors
- **Brand Purple:** `#667eea` → `#764ba2` (gradient)
- **Daily Loops:** `#FFB800` (Orange/Gold)
- **Work Loops:** `#00BCD4` (Cyan)
- **Personal Loops:** `#F44336` (Red)
- **Complete:** `#4CAF50` (Green)

### Components
- **CircularProgress** - SVG-based progress indicator
- **LoopCard** - Individual loop display
- **MomentumVisualization** - 7-day consistency tracker
- **FlowStateIndicator** - Concentric rings showing activity

## 🔖 Loop Types

- **Daily** - Tasks that reset every day (morning routine, exercise, meditation)
- **Work** - Professional tasks and projects (standup, code review, planning)
- **Personal** - Life goals and personal development (reading, learning, hobbies)

## 📋 Development Phases

### ✅ Phase 1: Core UI (Current)
- [x] Project setup
- [x] CircularProgress component
- [ ] LoopCard component
- [ ] Header with gradient
- [ ] Home page layout

### 🔄 Phase 2: Momentum Features
- [ ] Momentum visualization
- [ ] Flow state indicator
- [ ] Loop completion tracking
- [ ] Insights page

### 🎯 Phase 3: Backend Integration
- [ ] Supabase setup
- [ ] Authentication
- [ ] CRUD operations
- [ ] Real-time updates

### 🚢 Phase 4: Launch
- [ ] Polish & animations
- [ ] Mobile optimization
- [ ] User testing
- [ ] Deployment

## 🧩 Key Features

### Circular Progress Loops
The signature feature - SVG circles that fill as tasks complete. Uses Framer Motion for smooth animations and gradient strokes for visual appeal.

### Momentum Tracking
7-day visualization showing consistency. Recent activity creates visual weight without punishing missed days.

### Flow State
Concentric rings that pulse when you're actively completing loops. Ambient awareness of productivity state.

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode
- Functional components only
- Tailwind CSS for all styling
- Named exports preferred
- Clear component documentation

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`

### Git Commits

```
feat: add new feature
fix: bug fix
refactor: code improvement
docs: documentation
style: formatting
```

## 💭 Development Notes

This is a solo project built with Cursor AI assistance. See `.cursorrules` for AI assistant guidelines and coding preferences.

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Supabase Docs](https://supabase.com/docs)

## 🎯 Goals

**Week 1-2:** Core UI with circular progress  
**Week 3:** Momentum features  
**Week 4:** Backend & launch prep

## 🚫 What DoLoop Is NOT

- ❌ Not a gamification app (no XP, levels, badges)
- ❌ Not a streak tracker (no flames, no pressure)
- ❌ Not a tree-growing app (that's Forest)
- ❌ Not an RPG (that's Habitica)

DoLoop is pure, focused productivity with beautiful visualization.

## 📝 License

Private project - All rights reserved

## 👤 Author

Robert Myers (@myerscreative)

---

**Built with momentum, visualized with loops.** 🔄
