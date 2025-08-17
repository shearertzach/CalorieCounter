-- User Settings Database Migration
-- This script adds the necessary tables for user profiles, nutrition goals, and app preferences

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    height INTEGER CHECK (height >= 100 AND height <= 250), -- cm
    weight DECIMAL(5,2) CHECK (weight >= 30 AND weight <= 300), -- kg
    age INTEGER CHECK (age >= 13 AND age <= 120),
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    goal TEXT CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_weight')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Nutrition Goals Table
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_calories INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calories >= 800 AND daily_calories <= 5000),
    daily_carbs INTEGER NOT NULL DEFAULT 250 CHECK (daily_carbs >= 50 AND daily_carbs <= 800),
    daily_protein INTEGER NOT NULL DEFAULT 150 CHECK (daily_protein >= 40 AND daily_protein <= 400),
    daily_fat INTEGER NOT NULL DEFAULT 65 CHECK (daily_fat >= 20 AND daily_fat <= 200),
    daily_fiber INTEGER CHECK (daily_fiber >= 10 AND daily_fiber <= 100),
    daily_sugar INTEGER CHECK (daily_sugar >= 0 AND daily_sugar <= 200),
    daily_sodium INTEGER CHECK (daily_sodium >= 500 AND daily_sodium <= 5000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. User App Preferences Table
CREATE TABLE IF NOT EXISTS user_app_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    notifications BOOLEAN NOT NULL DEFAULT true,
    weekly_reports BOOLEAN NOT NULL DEFAULT false,
    reminder_time TIME DEFAULT '18:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_goals_user_id ON user_nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_preferences_user_id ON user_app_preferences(user_id);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_nutrition_goals_updated_at 
    BEFORE UPDATE ON user_nutrition_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_app_preferences_updated_at 
    BEFORE UPDATE ON user_app_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_preferences ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 9. Create RLS policies for user_nutrition_goals
CREATE POLICY "Users can view own nutrition goals" ON user_nutrition_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition goals" ON user_nutrition_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition goals" ON user_nutrition_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create RLS policies for user_app_preferences
CREATE POLICY "Users can view own app preferences" ON user_app_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app preferences" ON user_app_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own app preferences" ON user_app_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- 11. Insert default nutrition goals for existing users (optional)
-- This can be run after the tables are created to populate existing users
-- INSERT INTO user_nutrition_goals (user_id, daily_calories, daily_carbs, daily_protein, daily_fat)
-- SELECT id, 2000, 250, 150, 65 FROM auth.users 
-- WHERE id NOT IN (SELECT user_id FROM user_nutrition_goals);

-- 12. Insert default app preferences for existing users (optional)
-- INSERT INTO user_app_preferences (user_id, theme, notifications, weekly_reports)
-- SELECT id, 'system', true, false FROM auth.users 
-- WHERE id NOT IN (SELECT user_id FROM user_app_preferences);

-- Migration completed successfully!
-- Tables created: user_profiles, user_nutrition_goals, user_app_preferences
-- RLS enabled with appropriate policies
-- Triggers set up for automatic updated_at timestamps
