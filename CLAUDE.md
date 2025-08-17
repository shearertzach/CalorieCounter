# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev --turbopack` - Start development server with Turbopack for faster builds
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run linting

## Architecture Overview

This is a Next.js 15 calorie counter application using the app directory structure with TypeScript, Tailwind CSS 4, and Supabase for authentication and data storage.

### Core Data Architecture

The application follows a structured approach to food and meal tracking:

1. **Food Catalog System** (`food_catalog` table)
   - Users build a personal library of reusable food items
   - Each food has detailed nutritional information (calories, macros, micronutrients)
   - Foods can be used in multiple meals or logged individually

2. **Meal System** (`meals` + `meal_foods` tables)
   - Users create meals by combining foods from their catalog
   - Meals have quantities for each food and computed nutritional totals
   - Junction table pattern with `meal_foods` linking meals to catalog items

3. **Daily Logging** (`daily_food_logs` table)
   - Unified tracking of both individual foods and complete meals
   - Two log types: 'individual' (single food) or 'meal' (complete meal)
   - Prevents double-counting by design - foods are logged either individually OR as part of a meal

### Database Schema

Key tables with Row Level Security enabled:
- `food_catalog` - Personal food library per user
- `meals` - Meal definitions with metadata
- `meal_foods` - Junction table linking meals to catalog items with quantities
- `daily_food_logs` - Daily consumption tracking (individual foods or meals)

### Key Hooks

- `useFoodCatalog()` - Manages food catalog and daily logs
- `useMealTracker()` - Handles meal creation, editing, and management
- `useCalendar()` - Calendar view functionality
- `useUserSettings()` - User preferences and settings
- `useCatalog()` - Enhanced catalog operations

### Component Organization

Components are organized by purpose in subdirectories:
- `layout/` - Layout components (headers, sidebars, auth guards)
- `features/` - Main feature components (food grids, meal lists)
- `data/` - Data display components (logs, stats)
- `ui/` - Reusable UI components (buttons, cards, spinners)
- `modals/` - Modal dialog components
- `forms/` - Form components for input

All components are exported through `app/components/index.ts`.

### Authentication & Data Access

- Supabase Auth with Google OAuth integration
- All data operations use Row Level Security (RLS)
- User context provided through `SupabaseProvider`
- Client-side Supabase client created via `createClient()` from `lib/supabase.ts`

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```