import { useState, useEffect } from 'react';
import { Meal, CreateMealData, MealFood, FoodCatalogItem } from '../types';
import { createClient } from '../../lib/supabase';
import { useSupabase } from '../providers';

export function useMealTracker() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useSupabase();

  // Load meals from Supabase on component mount and when user changes
  useEffect(() => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    const loadMeals = async () => {
      try {
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (mealsError) {
          console.error('Error loading meals:', mealsError);
          return;
        }

        const { data: mealFoodsData, error: mealFoodsError } = await supabase
          .from('meal_foods')
          .select(`
            *,
            food:food_catalog(*)
          `)
          .in('meal_id', mealsData.map(m => m.id));

        if (mealFoodsError) {
          console.error('Error loading meal foods:', mealFoodsError);
          return;
        }

        const mealsWithFoods = mealsData.map((meal: any) => {
          const mealFoods = mealFoodsData.filter((mf: any) => mf.meal_id === meal.id);
          
          const totalCalories = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.calories * mf.quantity), 0);
          const totalCarbs = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.carbs * mf.quantity), 0);
          const totalProtein = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.protein * mf.quantity), 0);
          const totalFat = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.totalFat * mf.quantity), 0);

          return {
            ...meal,
            timestamp: new Date(meal.timestamp),
            foods: mealFoods.map((mf: any) => ({
              ...mf,
              food: {
                ...mf.food,
                created_at: new Date(mf.food.created_at)
              }
            })),
            totalCalories,
            totalCarbs,
            totalProtein,
            totalFat
          };
        });

        setMeals(mealsWithFoods);
      } catch (error) {
        console.error('Error loading meals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, [user, supabase]);

  const addMeal = async (mealData: CreateMealData, catalogItems: FoodCatalogItem[]) => {
    if (!user) return;

    try {
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert([{
          name: mealData.name,
          description: mealData.description,
          user_id: user.id
        }])
        .select()
        .single();

      if (mealError) {
        console.error('Error creating meal:', mealError);
        return;
      }

      if (mealData.foods.length > 0) {
        const mealFoods = mealData.foods.map(food => ({
          meal_id: meal.id,
          food_catalog_id: food.food_catalog_id,
          quantity: food.quantity
        }));

        const { error: mealFoodsError } = await supabase
          .from('meal_foods')
          .insert(mealFoods);

        if (mealFoodsError) {
          console.error('Error creating meal foods:', mealFoodsError);
          // Clean up the meal if meal foods creation fails
          await supabase.from('meals').delete().eq('id', meal.id);
          return;
        }
      }

      // Reload meals to get the updated data
      const loadMeals = async () => {
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (mealsError) return;

        const { data: mealFoodsData, error: mealFoodsError } = await supabase
          .from('meal_foods')
          .select(`
            *,
            food:food_catalog(*)
          `)
          .in('meal_id', mealsData.map(m => m.id));

        if (mealFoodsError) return;

        const mealsWithFoods = mealsData.map((meal: any) => {
          const mealFoods = mealFoodsData.filter((mf: any) => mf.meal_id === meal.id);
          
          const totalCalories = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.calories * mf.quantity), 0);
          const totalCarbs = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.carbs * mf.quantity), 0);
          const totalProtein = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.protein * mf.quantity), 0);
          const totalFat = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.totalFat * mf.quantity), 0);

          return {
            ...meal,
            timestamp: new Date(meal.timestamp),
            foods: mealFoods.map((mf: any) => ({
              ...mf,
              food: {
                ...mf.food,
                created_at: new Date(mf.food.created_at)
              }
            })),
            totalCalories,
            totalCarbs,
            totalProtein,
            totalFat
          };
        });

        setMeals(mealsWithFoods);
      };

      loadMeals();

      // Return the created meal with calculated totals for daily logging
      const createdMeal = {
        ...meal,
        timestamp: new Date(meal.timestamp),
        foods: mealData.foods.map(food => {
          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
          return {
            ...food,
            food: catalogItem
          };
        }),
        totalCalories: mealData.foods.reduce((sum, food) => {
          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
          return sum + (catalogItem?.calories || 0) * food.quantity;
        }, 0),
        totalCarbs: mealData.foods.reduce((sum, food) => {
          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
          return sum + (catalogItem?.carbs || 0) * food.quantity;
        }, 0),
        totalProtein: mealData.foods.reduce((sum, food) => {
          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
          return sum + (catalogItem?.protein || 0) * food.quantity;
        }, 0),
        totalFat: mealData.foods.reduce((sum, food) => {
          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
          return sum + (catalogItem?.totalFat || 0) * food.quantity;
        }, 0)
      };

      return createdMeal;
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting meal:', error);
        return;
      }

      setMeals(meals.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const updateMeal = async (mealId: string, mealData: CreateMealData) => {
    if (!user) return;

    try {
      // Update meal basic info
      const { error: mealError } = await supabase
        .from('meals')
        .update({
          name: mealData.name,
          description: mealData.description
        })
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (mealError) {
        console.error('Error updating meal:', mealError);
        return;
      }

      // Delete existing meal foods
      const { error: deleteError } = await supabase
        .from('meal_foods')
        .delete()
        .eq('meal_id', mealId);

      if (deleteError) {
        console.error('Error deleting meal foods:', deleteError);
        return;
      }

      // Add new meal foods
      if (mealData.foods.length > 0) {
        const mealFoods = mealData.foods.map(food => ({
          meal_id: mealId,
          food_catalog_id: food.food_catalog_id,
          quantity: food.quantity
        }));

        const { error: mealFoodsError } = await supabase
          .from('meal_foods')
          .insert(mealFoods);

        if (mealFoodsError) {
          console.error('Error updating meal foods:', mealFoodsError);
          return;
        }
      }

      // Reload meals to get updated data
      const loadMeals = async () => {
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (mealsError) return;

        const { data: mealFoodsData, error: mealFoodsError } = await supabase
          .from('meal_foods')
          .select(`
            *,
            food:food_catalog(*)
          `)
          .in('meal_id', mealsData.map(m => m.id));

        if (mealFoodsError) return;

        const mealsWithFoods = mealsData.map((meal: any) => {
          const mealFoods = mealFoodsData.filter((mf: any) => mf.meal_id === meal.id);
          
          const totalCalories = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.calories * mf.quantity), 0);
          const totalCarbs = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.carbs * mf.quantity), 0);
          const totalProtein = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.protein * mf.quantity), 0);
          const totalFat = mealFoods.reduce((sum: number, mf: any) => 
            sum + (mf.food.totalFat * mf.quantity), 0);

          return {
            ...meal,
            timestamp: new Date(meal.timestamp),
            foods: mealFoods.map((mf: any) => ({
              ...mf,
              food: {
                ...mf.food,
                created_at: new Date(mf.food.created_at)
              }
            })),
            totalCalories,
            totalCarbs,
            totalProtein,
            totalFat
          };
        });

        setMeals(mealsWithFoods);
      };

      loadMeals();
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  const getMealById = (mealId: string) => {
    return meals.find(meal => meal.id === mealId);
  };

  const getTodayMeals = () => {
    const today = new Date();
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate.toDateString() === today.toDateString();
    });
  };

  const todayMeals = getTodayMeals();
  const totalMealCalories = todayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalMealCarbs = todayMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalMealProtein = todayMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalMealFat = todayMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

  return {
    meals,
    todayMeals,
    totalMealCalories,
    totalMealCarbs,
    totalMealProtein,
    totalMealFat,
    loading,
    addMeal,
    deleteMeal,
    updateMeal,
    getMealById
  };
}
