'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';
import { DailyFoodLog } from '../types';

export interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEntries: boolean;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  entryCount: number;
}

export function useCalendar(userId: string | undefined) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDayEntries, setSelectedDayEntries] = useState<DailyFoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthData, setMonthData] = useState<Record<string, any>>({});
  const supabase = createClient();

  // Generate calendar days for the current month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Create date string in local timezone to avoid shifting
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      const dayData = monthData[dateString] || {
        totalCalories: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0,
        entryCount: 0
      };
      
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString(),
        hasEntries: dayData.entryCount > 0,
        totalCalories: dayData.totalCalories,
        totalCarbs: dayData.totalCarbs,
        totalProtein: dayData.totalProtein,
        totalFat: dayData.totalFat,
        entryCount: dayData.entryCount
      });
    }
    
    setCalendarDays(days);
  };

  // Load month data
  const loadMonthData = async (date: Date) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('daily_food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (error) {
        console.error('Error loading month data:', error);
        return;
      }

      // Group data by date using local timezone to avoid date shifting
      const groupedData: Record<string, any> = {};
      data.forEach(entry => {
        // Create a local date from the entry's created_at to get the correct local date
        const entryDate = new Date(entry.created_at);
        const localDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
        const dateString = localDate.toISOString().split('T')[0];
        
        if (!groupedData[dateString]) {
          groupedData[dateString] = {
            totalCalories: 0,
            totalCarbs: 0,
            totalProtein: 0,
            totalFat: 0,
            entryCount: 0
          };
        }
        
        groupedData[dateString].totalCalories += entry.calories || 0;
        groupedData[dateString].totalCarbs += entry.carbs || 0;
        groupedData[dateString].totalProtein += entry.protein || 0;
        groupedData[dateString].totalFat += entry.totalFat || 0;
        groupedData[dateString].entryCount += 1;
      });

      setMonthData(groupedData);
    } catch (error) {
      console.error('Error loading month data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load entries for a specific day
  const loadDayEntries = async (date: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Parse the date string and create local dates to avoid timezone issues
      const [year, month, day] = date.split('-').map(Number);
      
      // Create start of day in local timezone
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      // Create end of day in local timezone
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('daily_food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading day entries:', error);
        return;
      }

      setSelectedDayEntries(data || []);
    } catch (error) {
      console.error('Error loading day entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const goToMonth = (date: Date) => {
    setCurrentMonth(date);
    setSelectedDate(date);
  };

  // Select a date
  const selectDate = (date: string) => {
    // Parse the date string to create a local date without timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
    loadDayEntries(date);
  };

  // Add food to a specific date
  const addFoodToDate = async (foodId: string, quantity: number, targetDate: Date) => {
    if (!userId) return false;

    try {
      // Create the target date in local timezone
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      
      // Get the food catalog item to calculate nutrition
      const { data: foodData, error: foodError } = await supabase
        .from('food_catalog')
        .select('*')
        .eq('id', foodId)
        .eq('user_id', userId)
        .single();

      if (foodError || !foodData) {
        console.error('Error fetching food data:', foodError);
        return false;
      }

      // Calculate nutrition based on quantity
      const nutritionData = {
        calories: Math.round(foodData.calories * quantity),
        carbs: Math.round(foodData.carbs * quantity),
        protein: Math.round(foodData.protein * quantity),
        totalFat: Math.round(foodData.totalFat * quantity),
        fiber: foodData.fiber ? Math.round(foodData.fiber * quantity) : undefined,
        sugar: foodData.sugar ? Math.round(foodData.sugar * quantity) : undefined,
        sodium: foodData.sodium ? Math.round(foodData.sodium * quantity) : undefined,
        cholesterol: foodData.cholesterol ? Math.round(foodData.cholesterol * quantity) : undefined,
        saturatedFat: foodData.saturatedFat ? Math.round(foodData.saturatedFat * quantity) : undefined,
        transFat: foodData.transFat ? Math.round(foodData.transFat * quantity) : undefined
      };

      // Add to daily food log with the target date
      const { error: logError } = await supabase
        .from('daily_food_logs')
        .insert([{
          user_id: userId,
          food_catalog_id: foodId,
          quantity: quantity,
          type: 'individual',
          name: foodData.name,
          timestamp: startOfDay.toISOString(), // Use the target date
          calories: nutritionData.calories,
          carbs: nutritionData.carbs,
          protein: nutritionData.protein,
          totalFat: nutritionData.totalFat,
          created_at: startOfDay.toISOString() // Use the target date
        }]);

      if (logError) {
        console.error('Error adding food to log:', logError);
        return false;
      }

      // Refresh the data for the selected date
      const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      await loadDayEntries(dateString);
      await loadMonthData(currentMonth);

      return true;
    } catch (error) {
      console.error('Error adding food to date:', error);
      return false;
    }
  };

  // Add meal to a specific date
  const addMealToDate = async (mealData: any, targetDate: Date) => {
    if (!userId) return false;

    try {
      // Create the target date in local timezone
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      
      // First, create the meal
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert([{
          user_id: userId,
          name: mealData.name,
          description: mealData.description || '',
          timestamp: startOfDay.toISOString(), // Use the target date
          created_at: startOfDay.toISOString() // Use the target date
        }])
        .select()
        .single();

      if (mealError || !meal) {
        console.error('Error creating meal:', mealError);
        return false;
      }

      // Calculate total nutrition for the meal
      let totalCalories = 0;
      let totalCarbs = 0;
      let totalProtein = 0;
      let totalFat = 0;

      // Add meal foods (without nutrition data - just relationships)
      for (const mealFood of mealData.foods) {
        const { data: foodData, error: foodError } = await supabase
          .from('food_catalog')
          .select('*')
          .eq('id', mealFood.food_catalog_id)
          .eq('user_id', userId)
          .single();

        if (foodError || !foodData) {
          console.error('Error fetching food data:', foodError);
          continue;
        }

        // Calculate nutrition based on quantity
        const nutritionData = {
          calories: Math.round(foodData.calories * mealFood.quantity),
          carbs: Math.round(foodData.carbs * mealFood.quantity),
          protein: Math.round(foodData.protein * mealFood.quantity),
          totalFat: Math.round(foodData.totalFat * mealFood.quantity)
        };

        // Accumulate totals for the meal
        totalCalories += nutritionData.calories;
        totalCarbs += nutritionData.carbs;
        totalProtein += nutritionData.protein;
        totalFat += nutritionData.totalFat;

        // Add meal food (only relationship data, no nutrition)
        const { error: mealFoodError } = await supabase
          .from('meal_foods')
          .insert([{
            meal_id: meal.id,
            food_catalog_id: mealFood.food_catalog_id,
            quantity: mealFood.quantity
          }]);

        if (mealFoodError) {
          console.error('Error adding meal food:', mealFoodError);
        }
      }

      // Add meal to daily food log with calculated nutrition totals
      const { error: logError } = await supabase
        .from('daily_food_logs')
        .insert([{
          user_id: userId,
          meal_id: meal.id,
          type: 'meal',
          name: mealData.name,
          timestamp: startOfDay.toISOString(), // Use the target date
          calories: totalCalories,
          carbs: totalCarbs,
          protein: totalProtein,
          totalFat: totalFat,
          created_at: startOfDay.toISOString() // Use the target date
        }]);

      if (logError) {
        console.error('Error adding meal to log:', logError);
        return false;
      }

      // Refresh the data for the selected date
      const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      await loadDayEntries(dateString);
      await loadMonthData(currentMonth);

      return true;
    } catch (error) {
      console.error('Error adding meal to date:', error);
      return false;
    }
  };

  // Effects
  useEffect(() => {
    if (userId) {
      loadMonthData(currentMonth);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth, monthData]);

  useEffect(() => {
    if (userId) {
      const today = new Date();
      // Create date string in local timezone
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      loadDayEntries(dateString);
    }
  }, [userId]);

  return {
    selectedDate,
    currentMonth,
    calendarDays,
    selectedDayEntries,
    loading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    goToMonth,
    selectDate,
    loadDayEntries,
    addFoodToDate,
    addMealToDate
  };
}
