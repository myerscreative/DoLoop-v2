# Loop Library Feature

## Overview

The Loop Library is a new feature that allows DoLoop users to browse and add pre-made loops inspired by teachings from renowned trainers, coaches, and business leaders. This feature enables users to quickly get started with proven productivity systems and habit frameworks from experts they trust.

## Key Features

### 1. Template Library Browsing
- Browse all available loop templates in a beautiful, organized interface
- Search templates by name, creator, book title, or description
- Filter by category (Personal, Work, Daily, Shared)
- View featured templates highlighted by the DoLoop team
- See popularity metrics showing how many users have added each template

### 2. Detailed Template Pages
Each template has a detailed page that includes:
- **Template Information**: Title, description, and color
- **Creator Bio**: Full profile of the teacher/coach/business leader who inspired the loop
- **Source Material**: The book, course, or training that inspired the template
- **Affiliate Link**: Direct link to purchase the source material (supports creator monetization)
- **Task Preview**: Full list of all tasks included in the loop
- **Usage Statistics**: See how popular each template is

### 3. One-Click Add to My Loops
- Users can instantly copy any template to their personal loop collection
- All tasks are automatically duplicated
- Loop settings (color, reset rule) are pre-configured based on the template
- Usage is tracked and popularity scores are updated automatically

### 4. Monetization Support
- Each template can include an affiliate link
- When users view templates, they can click "Learn More" to purchase the source material
- Supports creator partnerships and revenue sharing opportunities

## User Flow

1. **Discovery**
   - User sees "Loop Library" button on the home screen
   - Taps to browse available templates

2. **Browse**
   - User can search or filter templates
   - Views template cards showing key information
   - Sees featured templates at the top

3. **Explore Details**
   - User taps a template to view full details
   - Reads creator bio and template description
   - Reviews all tasks included in the template

4. **Add to Loops**
   - User taps "Add to My Loops" button
   - Template is copied to their personal collection
   - User is redirected to the new loop or back to browse more

5. **Learn More (Optional)**
   - User can tap "Learn More" to visit affiliate link
   - Purchases source material to dive deeper into the methodology

## Sample Templates

The feature launches with three high-quality templates:

### 1. Atomic Habits Daily Reset
- **Creator**: James Clear
- **Source**: Atomic Habits
- **Category**: Daily
- **Tasks**: 6 recurring tasks focused on implementing the Four Laws of Behavior Change

### 2. GTD Weekly Review
- **Creator**: David Allen
- **Source**: Getting Things Done
- **Category**: Work
- **Tasks**: 6 recurring tasks for the complete GTD weekly review process

### 3. Morning Routine Optimization
- **Creator**: Tim Ferriss
- **Source**: The 4-Hour Workweek
- **Category**: Personal
- **Tasks**: 6 tasks for a high-performance morning routine

## Technical Implementation

### Database Schema

#### `template_creators`
Stores information about the teachers/coaches/business leaders:
- `id`: UUID (primary key)
- `name`: Creator's name
- `bio`: Full biography
- `title`: Professional title (e.g., "Author & Speaker")
- `photo_url`: Profile photo URL
- `website_url`: Creator's website
- `created_at`, `updated_at`: Timestamps

#### `loop_templates`
Stores the loop templates:
- `id`: UUID (primary key)
- `creator_id`: Foreign key to template_creators
- `title`: Template name
- `description`: Full description
- `book_course_title`: Source material title
- `affiliate_link`: Affiliate URL for purchases
- `color`: Hex color for the loop
- `category`: Loop category (personal, work, daily, shared)
- `is_featured`: Boolean flag for featured templates
- `popularity_score`: Integer tracking usage count
- `created_at`, `updated_at`: Timestamps

#### `template_tasks`
Tasks within each template:
- `id`: UUID (primary key)
- `template_id`: Foreign key to loop_templates
- `description`: Task description
- `is_recurring`: Boolean flag
- `is_one_time`: Boolean flag
- `display_order`: Integer for task ordering
- `created_at`: Timestamp

#### `user_template_usage`
Tracks which users have added which templates:
- `id`: UUID (primary key)
- `user_id`: Foreign key to auth.users
- `template_id`: Foreign key to loop_templates
- `loop_id`: Foreign key to loops (the created loop)
- `added_at`: Timestamp

### Security (RLS Policies)

- **Templates and Creators**: Public read access (anyone can browse)
- **Template Usage**: Users can only view/modify their own usage records
- **Popularity Tracking**: Automatic trigger increments score when template is added

### UI Components

1. **TemplateLibraryScreen** (`src/screens/TemplateLibraryScreen.tsx`)
   - Main browsing interface
   - Search and filter functionality
   - Template cards with key information
   - Loading and empty states

2. **TemplateDetailScreen** (`src/screens/TemplateDetailScreen.tsx`)
   - Detailed template view
   - Creator bio section
   - Task preview
   - Add to My Loops functionality
   - Affiliate link integration

3. **HomeScreen Update** (`src/screens/HomeScreen.tsx`)
   - New "Discover Loops" section
   - Prominent call-to-action button for Loop Library

### Type Definitions

New TypeScript interfaces in `src/types/loop.ts`:
- `TemplateCreator`
- `LoopTemplate`
- `TemplateTask`
- `UserTemplateUsage`
- `LoopTemplateWithDetails`

## Database Migration

To enable this feature in your Supabase instance, run the migration:

```sql
-- Option 1: Run the complete migration file
-- Execute: supabase/migrations/00_apply_all_migrations.sql

-- Option 2: Run just the loop library migration
-- Execute: supabase/migrations/20251115_add_loop_library.sql
```

The migration includes:
- Table creation with proper constraints
- Indexes for performance
- RLS policies for security
- Trigger for popularity tracking
- Sample data for testing

## Future Enhancements

Potential improvements for future iterations:

1. **Admin Panel**
   - Web interface to add new templates
   - Manage creators and templates
   - Review and approve community submissions

2. **Community Templates**
   - Allow users to submit their own templates
   - Voting system for community templates
   - Template collections and bundles

3. **Personalization**
   - Recommend templates based on user behavior
   - Favorite templates for quick access
   - Template reviews and ratings

4. **Enhanced Monetization**
   - Multiple affiliate programs
   - Premium template marketplace
   - Subscription for exclusive templates

5. **Social Features**
   - Share templates with friends
   - See which templates are trending
   - Follow favorite creators

## Access the Feature

Users can access the Loop Library by:
1. Opening the DoLoop app
2. On the Home screen, scroll down to "Discover Loops"
3. Tap the "Loop Library" button
4. Browse, search, and add templates to your collection!

## Developer Notes

### Adding New Templates

To add new templates programmatically:

```typescript
// 1. Insert creator
const { data: creator } = await supabase
  .from('template_creators')
  .insert([{ name: 'Creator Name', bio: '...', title: '...' }])
  .select()
  .single();

// 2. Insert template
const { data: template } = await supabase
  .from('loop_templates')
  .insert([{
    creator_id: creator.id,
    title: 'Template Title',
    description: '...',
    book_course_title: 'Book Title',
    affiliate_link: 'https://...',
    category: 'daily',
    is_featured: true
  }])
  .select()
  .single();

// 3. Insert tasks
await supabase
  .from('template_tasks')
  .insert([
    { template_id: template.id, description: 'Task 1', display_order: 1 },
    { template_id: template.id, description: 'Task 2', display_order: 2 }
  ]);
```

### Testing

Key test scenarios:
1. Browse templates without crashing
2. Search and filter work correctly
3. Template detail page loads with all information
4. Add to My Loops creates a proper loop with all tasks
5. Affiliate links open correctly
6. Popularity scores increment when templates are added
7. Empty states display when no templates match filters

## Support

For questions or issues with the Loop Library feature, please contact the DoLoop development team or open an issue on the GitHub repository.

---

**Version**: 1.0.0
**Release Date**: November 15, 2025
**Status**: ✅ Implemented and Ready for Testing
