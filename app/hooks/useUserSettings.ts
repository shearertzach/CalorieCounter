'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface NutritionGoals {
  dailyCalories: number;
  dailyCarbs: number;
  dailyProtein: number;
  dailyFat: number;
  dailyFiber?: number;
  dailySugar?: number;
  dailySodium?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight';
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  weekly_reports: boolean;
  reminder_time?: string;
}

export function useUserSettings(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    dailyCalories: 2000,
    dailyCarbs: 250,
    dailyProtein: 150,
    dailyFat: 65
  });
  const [appPreferences, setAppPreferences] = useState<AppPreferences>({
    theme: 'system',
    notifications: true,
    weekly_reports: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Load user profile
  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - create default profile
          const defaultProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          };
          setProfile(defaultProfile);
        } else if (error.code === '42P01') {
          // Table doesn't exist - create default profile
          console.warn('user_profiles table does not exist yet. Please run the database migration.');
          const defaultProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          };
          setProfile(defaultProfile);
        } else {
          console.error('Error loading profile:', error);
          // Still create default profile on error
          const defaultProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          };
          setProfile(defaultProfile);
        }
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Create default profile on any error
      const defaultProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      };
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  // Load nutrition goals
  const loadNutritionGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - use default goals
          return;
        } else if (error.code === '42P01') {
          // Table doesn't exist - use default goals
          console.warn('user_nutrition_goals table does not exist yet. Please run the database migration.');
          return;
        } else {
          console.error('Error loading nutrition goals:', error);
          return;
        }
      }

      if (data) {
        setNutritionGoals({
          dailyCalories: data.daily_calories || 2000,
          dailyCarbs: data.daily_carbs || 250,
          dailyProtein: data.daily_protein || 150,
          dailyFat: data.daily_fat || 65,
          dailyFiber: data.daily_fiber,
          dailySugar: data.daily_sugar,
          dailySodium: data.daily_sodium
        });
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  // Load app preferences
  const loadAppPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_app_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - use default preferences
          return;
        } else if (error.code === '42P01') {
          // Table doesn't exist - use default preferences
          console.warn('user_app_preferences table does not exist yet. Please run the database migration.');
          return;
        } else {
          console.error('Error loading app preferences:', error);
          return;
        }
      }

      if (data) {
        setAppPreferences({
          theme: data.theme || 'system',
          notifications: data.notifications ?? true,
          weekly_reports: data.weekly_reports ?? false,
          reminder_time: data.reminder_time
        });
      }
    } catch (error) {
      console.error('Error loading app preferences:', error);
    }
  };

  // Save profile
  const saveProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return false;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updatedProfile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile:', error);
        return false;
      }

      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save nutrition goals
  const saveNutritionGoals = async (goals: NutritionGoals) => {
    if (!user) return false;
    
    setSaving(true);
    try {
      // First, check if a record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('user_nutrition_goals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing record:', checkError);
        return false;
      }

      let result;
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from('user_nutrition_goals')
          .update({
            daily_calories: goals.dailyCalories,
            daily_carbs: goals.dailyCarbs,
            daily_protein: goals.dailyProtein,
            daily_fat: goals.dailyFat,
            daily_fiber: goals.dailyFiber,
            daily_sugar: goals.dailySugar,
            daily_sodium: goals.dailySodium,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_nutrition_goals')
          .insert({
            user_id: user.id,
            daily_calories: goals.dailyCalories,
            daily_carbs: goals.dailyCarbs,
            daily_protein: goals.dailyProtein,
            daily_fat: goals.dailyFat,
            daily_fiber: goals.dailyFiber,
            daily_sugar: goals.dailySugar,
            daily_sodium: goals.dailySodium
          });
      }

      if (result.error) {
        console.error('Error saving nutrition goals:', result.error);
        return false;
      }

      setNutritionGoals(goals);
      return true;
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save app preferences
  const saveAppPreferences = async (preferences: AppPreferences) => {
    if (!user) return false;
    
    setSaving(true);
    try {
      // First, check if a record already exists
      const { data: existingRecord } = await supabase
        .from('user_app_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from('user_app_preferences')
          .update({
            theme: preferences.theme,
            notifications: preferences.notifications,
            weekly_reports: preferences.weekly_reports,
            reminder_time: preferences.reminder_time,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_app_preferences')
          .insert({
            user_id: user.id,
            theme: preferences.theme,
            notifications: preferences.notifications,
            weekly_reports: preferences.weekly_reports,
            reminder_time: preferences.reminder_time
          });
      }

      if (result.error) {
        console.error('Error saving app preferences:', result.error);
        return false;
      }

      setAppPreferences(preferences);
      return true;
    } catch (error) {
      console.error('Error saving app preferences:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Calculate recommended nutrition goals based on profile
  const calculateRecommendedGoals = (): NutritionGoals => {
    if (!profile || !profile.age || !profile.weight || !profile.height || !profile.gender || !profile.activity_level) {
      return nutritionGoals;
    }

    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[profile.activity_level] || 1.2);

    // Goal adjustment
    let targetCalories = tdee;
    if (profile.goal === 'lose_weight') {
      targetCalories = tdee - 500; // 500 calorie deficit
    } else if (profile.goal === 'gain_weight') {
      targetCalories = tdee + 300; // 300 calorie surplus
    }

    // Macro distribution (40% carbs, 30% protein, 30% fat)
    const dailyCarbs = Math.round((targetCalories * 0.4) / 4); // 4 calories per gram
    const dailyProtein = Math.round((targetCalories * 0.3) / 4); // 4 calories per gram
    const dailyFat = Math.round((targetCalories * 0.3) / 9); // 9 calories per gram

    return {
      dailyCalories: Math.round(targetCalories),
      dailyCarbs,
      dailyProtein,
      dailyFat,
      dailyFiber: 25, // Recommended daily fiber
      dailySugar: 50, // Recommended daily added sugar
      dailySodium: 2300 // Recommended daily sodium (mg)
    };
  };

  // Effects
  useEffect(() => {
    if (user) {
      loadProfile();
      loadNutritionGoals();
      loadAppPreferences();
    }
  }, [user]);

  return {
    profile,
    nutritionGoals,
    appPreferences,
    loading,
    saving,
    saveProfile,
    saveNutritionGoals,
    saveAppPreferences,
    calculateRecommendedGoals
  };
}
