# Implementation Plan: Collaboration Features (Phase 3)

## Objective

Implement multi-user collaboration for "DoLoop" loops, including member management, task assignment, and real-time progress synchronization ("Shared Momentum").

## Design Guidelines

- **Primary Color:** Gold (`#FFB800`)
- **Forbidden Color:** Purple
- **Progress Ring:** 90px diameter, 8px stroke.

## Database Schema Changes (Supabase)

### 1. New Table: `loop_members`

Links users to loops with specific roles.

- `id`: UUID (PK)
- `loop_id`: UUID (FK -> loops.id)
- `user_id`: UUID (FK -> auth.users.id)
- `role`: TEXT ('owner', 'editor', 'viewer') - Default 'editor'
- `joined_at`: TIMESTAMPTZ (Default NOW())

### 2. Update Table: `tasks`

- Add `assigned_to`: UUID (FK -> auth.users.id, nullable)

### 3. Row Level Security (RLS)

- **loops:** Update policies to allow `SELECT`, `UPDATE` if user is in `loop_members`.
- **tasks:** Update policies to allow operations if user is in `loop_members` of the parent loop.
- **loop_members:** Allow users to view members of loops they belong to.

## Frontend Implementation

### 1. Types (`src/types/loop.ts`)

- Add `LoopMember` interface.
- Update `Task` interface with `assigned_to`.

### 2. Components

- **`ProgressRing.tsx`**: Enforce 90px size and 8px stroke. Color `#FFB800`.
- **`LoopMembersList`** (New): Horizontal list of avatars showing who is on the loop.
- **`EnhancedTaskCard`**: Add UI to view/set `assigned_to`.

### 3. Realtime Logic ("Shared Momentum")

- **Hook:** `useSharedMomentum(loopId)`
- Subscribes to `tasks` table changes filtering by `loop_id`.
- Updates the local progress state instantly when any member completes a task.

## Verification

- **Artifact:** `SUPABASE_COLLAB_MIGRATION.sql`
- **Simulation:** A script `simulate_collab.ts` will connect to Supabase, join a loop as a second user, and mark tasks as complete to verify the realtime update in the UI.
