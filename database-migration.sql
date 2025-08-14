-- Database Migration: Add Food Catalog and Meal Support
-- Run this file to add the new food catalog system to your existing calorie counter database

-- Create the food_catalog table - reusable foods for users
CREATE TABLE IF NOT EXISTS food_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  carbs DECIMAL(6,2) NOT NULL,
  protein DECIMAL(6,2) NOT NULL,
  "totalFat" DECIMAL(6,2) NOT NULL,
  fiber DECIMAL(6,2),
  sugar DECIMAL(6,2),
  sodium INTEGER,
  cholesterol INTEGER,
  "saturatedFat" DECIMAL(6,2),
  "transFat" DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the meal_foods junction table (now references food_catalog)
CREATE TABLE IF NOT EXISTS meal_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  food_catalog_id UUID REFERENCES food_catalog(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(6,2) DEFAULT 1.0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(meal_id, food_catalog_id)
);

-- Create the daily_food_logs table - tracks what users eat each day
CREATE TABLE IF NOT EXISTS daily_food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'meal')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- For individual foods
  food_catalog_id UUID REFERENCES food_catalog(id) ON DELETE CASCADE,
  quantity DECIMAL(6,2),
  -- For meals
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  -- Computed nutrition (stored for performance)
  calories INTEGER NOT NULL,
  carbs DECIMAL(6,2) NOT NULL,
  protein DECIMAL(6,2) NOT NULL,
  "totalFat" DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_catalog_user_id ON food_catalog(user_id);
CREATE INDEX IF NOT EXISTS idx_food_catalog_name ON food_catalog(name);

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_timestamp ON meals(timestamp);
CREATE INDEX IF NOT EXISTS idx_meals_user_timestamp ON meals(user_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_food_catalog_id ON meal_foods(food_catalog_id);

CREATE INDEX IF NOT EXISTS idx_daily_food_logs_user_id ON daily_food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_food_logs_timestamp ON daily_food_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_food_logs_user_timestamp ON daily_food_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_food_logs_type ON daily_food_logs(type);

-- Enable Row Level Security (RLS)
ALTER TABLE food_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_food_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for food_catalog
CREATE POLICY "Users can view own food catalog" ON food_catalog
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food catalog items" ON food_catalog
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food catalog items" ON food_catalog
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food catalog items" ON food_catalog
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for meals
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for meal_foods
CREATE POLICY "Users can view own meal foods" ON meal_foods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meal foods" ON meal_foods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own meal foods" ON meal_foods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meal foods" ON meal_foods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid()
    )
  );

-- Create policies for daily_food_logs
CREATE POLICY "Users can view own daily food logs" ON daily_food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily food logs" ON daily_food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily food logs" ON daily_food_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily food logs" ON daily_food_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Migration complete!
-- Your database now supports:
-- 1. A personal food catalog for reusable foods
-- 2. Meal creation with multiple foods
-- 3. Daily food logging (individual foods or meals)
-- 4. No more double counting!

-- Migration to add name field to daily_food_logs table
-- Run this if you have an existing database without the name field

-- Add name column to daily_food_logs table
ALTER TABLE daily_food_logs ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing records to have a default name
UPDATE daily_food_logs 
SET name = CASE 
  WHEN type = 'individual' THEN (
    SELECT fc.name 
    FROM food_catalog fc 
    WHERE fc.id = daily_food_logs.food_catalog_id
  )
  WHEN type = 'meal' THEN (
    SELECT m.name 
    FROM meals m 
    WHERE m.id = daily_food_logs.meal_id
  )
  ELSE 'Unknown'
END
WHERE name IS NULL;

-- Make name column NOT NULL after updating existing records
ALTER TABLE daily_food_logs ALTER COLUMN name SET NOT NULL;
