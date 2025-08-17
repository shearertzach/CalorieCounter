'use client';

import { useState, useEffect } from 'react';
import { FoodCatalogItem, CreateFoodCatalogItemData } from '../types';
import { createClient } from '../../lib/supabase';

export function useCatalog(userId: string | undefined) {
  const [catalogItems, setCatalogItems] = useState<FoodCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (userId) {
      loadCatalogItems();
    }
  }, [userId]);

  const loadCatalogItems = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading catalog items:', error);
        return;
      }

      setCatalogItems(data.map(item => ({
        ...item,
        created_at: new Date(item.created_at)
      })));
    } catch (error) {
      console.error('Error loading catalog items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFood = async (foodData: CreateFoodCatalogItemData) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .insert([{
          ...foodData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding to catalog:', error);
        return false;
      }

      const newItem: FoodCatalogItem = {
        ...data,
        created_at: new Date(data.created_at)
      };

      setCatalogItems([...catalogItems, newItem]);
      return true;
    } catch (error) {
      console.error('Error adding to catalog:', error);
      return false;
    }
  };

  const updateFood = async (id: string, foodData: CreateFoodCatalogItemData) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .update(foodData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating food:', error);
        return false;
      }

      const updatedItem: FoodCatalogItem = {
        ...data,
        created_at: new Date(data.created_at)
      };

      setCatalogItems(catalogItems.map(item => 
        item.id === id ? updatedItem : item
      ));
      return true;
    } catch (error) {
      console.error('Error updating food:', error);
      return false;
    }
  };

  const deleteFood = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_catalog')
        .delete()
        .eq('id', id)
        .eq('user_id', userId!);

      if (error) {
        console.error('Error deleting from catalog:', error);
        return false;
      }

      setCatalogItems(catalogItems.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting from catalog:', error);
      return false;
    }
  };

  const addToDailyLog = async (food: FoodCatalogItem, quantity: number) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('daily_food_logs')
        .insert([{
          user_id: userId,
          type: 'individual',
          name: food.name,
          food_catalog_id: food.id,
          quantity,
          calories: Math.round(food.calories * quantity),
          carbs: food.carbs * quantity,
          protein: food.protein * quantity,
          totalFat: food.totalFat * quantity
        }]);

      if (error) {
        console.error('Error adding to daily log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding to daily log:', error);
      return false;
    }
  };

  return {
    catalogItems,
    loading,
    addFood,
    updateFood,
    deleteFood,
    addToDailyLog,
    refresh: loadCatalogItems
  };
}
