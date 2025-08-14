# Calorie Counter - Modern Nutrition Dashboard

A beautiful, modern web application for tracking daily nutrition intake. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Personal Food Catalog**: Build a reusable library of foods with detailed nutrition information
- **Smart Meal Creation**: Combine multiple foods into meals with automatic nutritional calculations
- **No Double Counting**: Foods are logged either individually OR as part of a meal, never both
- **Daily Food Logging**: Track everything you eat in a single, unified log
- **Beautiful Dashboard**: Modern, responsive design that works on all devices
- **Google Authentication**: Secure login with Google OAuth via Supabase
- **Real-time Data**: Data is stored in Supabase PostgreSQL database
- **User-specific Data**: Each user can only access their own nutrition data
- **Modern UI**: Clean, intuitive interface with smooth animations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd calorie-counter
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Create a Supabase project and configure Google OAuth
   - Run the SQL schema in your Supabase dashboard

4. Create environment variables:
   Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
calorie-counter/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── FoodCatalog.tsx # Food catalog management
│   │   ├── MealForm.tsx   # Meal creation form
│   │   ├── DailyFoodLog.tsx # Daily food logging
│   │   └── ...            # Other components
│   ├── hooks/             # Custom React hooks
│   │   ├── useFoodCatalog.ts # Food catalog and daily log management
│   │   ├── useMealTracker.ts # Meal management
│   │   └── ...            # Other hooks
│   ├── types/             # TypeScript type definitions
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── lib/                   # Utility libraries
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
└── database-migration.sql # Migration for existing databases
```

## Database Schema

The application uses four main tables:

### `food_catalog` - Personal Food Library
- `id`: UUID primary key
- `user_id`: UUID foreign key to auth.users
- `name`: Food item name
- `calories`: Calorie count
- `carbs`, `protein`, `total_fat`: Macronutrients
- `fiber`, `sugar`, `sodium`, etc.: Micronutrients
- `created_at`: When the food was added to catalog

### `meals` - Meal Definitions
- `id`: UUID primary key
- `user_id`: UUID foreign key to auth.users
- `name`: Meal name (e.g., "Breakfast", "Lunch")
- `description`: Optional meal description
- `timestamp`: When the meal was created

### `meal_foods` - Junction Table
- `id`: UUID primary key
- `meal_id`: UUID foreign key to meals
- `food_catalog_id`: UUID foreign key to food_catalog
- `quantity`: Amount of the food in the meal

### `daily_food_logs` - Daily Food Tracking
- `id`: UUID primary key
- `user_id`: UUID foreign key to auth.users
- `type`: Either 'individual' or 'meal'
- `timestamp`: When the food was consumed
- `food_catalog_id`: For individual foods
- `meal_id`: For meals
- `quantity`: For individual foods
- `calories`, `carbs`, `protein`, `total_fat`: Computed totals

## How It Works

### 1. **Food Catalog**
- Add foods to your personal catalog with complete nutrition information
- Foods are reusable and can be added to multiple meals
- Quick-add buttons to log foods directly to today's log

### 2. **Meal Creation**
- Build meals using foods from your catalog
- Set quantities for each food
- View real-time nutritional totals
- Meals are saved and can be reused

### 3. **Daily Logging**
- **Individual Foods**: Add foods directly from your catalog to today's log
- **Meals**: Add complete meals to today's log
- **No Double Counting**: Each food is counted only once per day
- **Unified View**: See everything you've eaten in one place

### 4. **Smart Tracking**
- Automatic calculation of daily totals
- Progress tracking toward daily goals
- Historical data for insights

## User Experience

### **Tabbed Interface**
- **Food Catalog**: Manage your personal food library
- **Create Meals**: Build and save meals
- **Today's Log**: View everything you've eaten today

### **Quick Actions**
- Add foods to catalog
- Quick-add foods to today's log
- Create meals with multiple foods
- Delete items from catalog or daily log

## Security

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Google OAuth via Supabase
- **Environment Variables**: Sensitive data is stored in environment variables

## Database Migration

If you have an existing database, run the `database-migration.sql` file to add the new food catalog system:

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `database-migration.sql`
4. Run the migration

**Note**: This migration will create new tables. Your existing data will remain intact.

## Deployment

The application can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred platform
3. Set environment variables in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
