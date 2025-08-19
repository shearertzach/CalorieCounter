-- Add unit_system column to user_app_preferences table
-- This migration adds support for imperial/metric unit system preferences

-- Add the unit_system column to existing table
ALTER TABLE user_app_preferences 
ADD COLUMN IF NOT EXISTS unit_system TEXT NOT NULL DEFAULT 'imperial' 
CHECK (unit_system IN ('metric', 'imperial'));

-- Update existing records to use imperial as default
UPDATE user_app_preferences 
SET unit_system = 'imperial' 
WHERE unit_system IS NULL;

-- Fix height column to allow decimal values for precise conversions from feet/inches
ALTER TABLE user_profiles 
ALTER COLUMN height TYPE DECIMAL(5,1) USING height::DECIMAL(5,1);

-- Update the check constraint to work with decimal values
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_height_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_height_check 
CHECK (height >= 100.0 AND height <= 250.0);