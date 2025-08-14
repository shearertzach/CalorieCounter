import { useState, useEffect } from 'react';
import { FoodCatalogItem, CreateFoodCatalogItemData, DailyFoodLog } from '../types';
import { createClient } from '../../lib/supabase';
import { useSupabase } from '../providers';

export function useFoodCatalog() {
  const [catalogItems, setCatalogItems] = useState<FoodCatalogItem[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyFoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCatalog, setAddingToCatalog] = useState(false);
  const [addingToLog, setAddingToLog] = useState(false);
  const [deletingFromLog, setDeletingFromLog] = useState(false);
  const [deletingFromCatalog, setDeletingFromCatalog] = useState(false);
  const supabase = createClient();
  const { user } = useSupabase();

  // Load food catalog and daily logs from Supabase
  useEffect(() => {
    if (!user) {
      setCatalogItems([]);
      setDailyLogs([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load food catalog
        const { data: catalogData, error: catalogError } = await supabase
          .from('food_catalog')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

        if (catalogError) {
          console.error('Error loading food catalog:', catalogError);
          return;
        }

        // Load today's food logs
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const { data: logsData, error: logsError } = await supabase
          .from('daily_food_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startOfDay.toISOString())
          .lt('timestamp', endOfDay.toISOString())
          .order('timestamp', { ascending: false });

        if (logsError) {
          console.error('Error loading daily logs:', logsError);
          return;
        }

        const parsedCatalog = catalogData.map((item: any) => ({
          ...item,
          created_at: new Date(item.created_at)
        }));

        const parsedLogs = logsData.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          created_at: new Date(log.created_at)
        }));

        setCatalogItems(parsedCatalog);
        setDailyLogs(parsedLogs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, supabase]);

  const addToCatalog = async (foodData: CreateFoodCatalogItemData) => {
    if (!user) return;

    setAddingToCatalog(true);
    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .insert([{
          ...foodData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding to catalog:', error);
        return;
      }

      const newItem: FoodCatalogItem = {
        ...data,
        created_at: new Date(data.created_at)
      };

      setCatalogItems([...catalogItems, newItem]);
      return newItem;
    } catch (error) {
      console.error('Error adding to catalog:', error);
    } finally {
      setAddingToCatalog(false);
    }
  };

  const addIndividualFoodToLog = async (catalogItemId: string, quantity: number) => {
    if (!user) return;

    const catalogItem = catalogItems.find(item => item.id === catalogItemId);
    if (!catalogItem) return;

    setAddingToLog(true);
    try {
      const { data, error } = await supabase
        .from('daily_food_logs')
        .insert([{
          user_id: user.id,
          type: 'individual',
          name: catalogItem.name,
          food_catalog_id: catalogItemId,
          quantity,
          calories: Math.round(catalogItem.calories * quantity),
          carbs: catalogItem.carbs * quantity,
          protein: catalogItem.protein * quantity,
          totalFat: catalogItem.totalFat * quantity
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding to daily log:', error);
        return;
      }

      const newLog: DailyFoodLog = {
        ...data,
        timestamp: new Date(data.timestamp),
        created_at: new Date(data.created_at)
      };

      setDailyLogs([newLog, ...dailyLogs]);
    } catch (error) {
      console.error('Error adding to daily log:', error);
    } finally {
      setAddingToLog(false);
    }
  };

  const addMealToLog = async (mealId: string, mealName: string, mealCalories: number, mealCarbs: number, mealProtein: number, mealFat: number) => {
    if (!user) return;

    setAddingToLog(true);
    try {
      const { data, error } = await supabase
        .from('daily_food_logs')
        .insert([{
          user_id: user.id,
          type: 'meal',
          name: mealName,
          meal_id: mealId,
          calories: mealCalories,
          carbs: mealCarbs,
          protein: mealProtein,
          totalFat: mealFat
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding meal to daily log:', error);
        return;
      }

      const newLog: DailyFoodLog = {
        ...data,
        timestamp: new Date(data.timestamp),
        created_at: new Date(data.created_at)
      };

      setDailyLogs([newLog, ...dailyLogs]);
    } catch (error) {
      console.error('Error adding meal to daily log:', error);
    } finally {
      setAddingToLog(false);
    }
  };

  const deleteFromLog = async (id: string) => {
    setDeletingFromLog(true);
    try {
      const { error } = await supabase
        .from('daily_food_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error deleting from log:', error);
        return;
      }

      setDailyLogs(dailyLogs.filter(log => log.id !== id));
    } catch (error) {
      console.error('Error deleting from log:', error);
    } finally {
      setDeletingFromLog(false);
    }
  };

  const deleteFromCatalog = async (id: string) => {
    setDeletingFromCatalog(true);
    try {
      const { error } = await supabase
        .from('food_catalog')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error deleting from catalog:', error);
        return;
      }

      setCatalogItems(catalogItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting from catalog:', error);
    } finally {
      setDeletingFromCatalog(false);
    }
  };

  const getTodayTotals = () => {
    const totalCalories = dailyLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalCarbs = dailyLogs.reduce((sum, log) => sum + log.carbs, 0);
    const totalProtein = dailyLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalFat = dailyLogs.reduce((sum, log) => sum + log.totalFat, 0);

    return { totalCalories, totalCarbs, totalProtein, totalFat };
  };

  const { totalCalories, totalCarbs, totalProtein, totalFat } = getTodayTotals();

  return {
    catalogItems,
    dailyLogs,
    totalCalories,
    totalCarbs,
    totalProtein,
    totalFat,
    loading,
    addingToCatalog,
    addingToLog,
    deletingFromLog,
    deletingFromCatalog,
    addToCatalog,
    addIndividualFoodToLog,
    addMealToLog,
    deleteFromLog,
    deleteFromCatalog,
    getTodayTotals
  };
}
