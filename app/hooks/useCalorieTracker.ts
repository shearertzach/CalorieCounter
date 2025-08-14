import { useState, useEffect } from 'react';
import { FoodEntry } from '../types';
import { createClient } from '../../lib/supabase';
import { useSupabase } from '../providers';

export function useCalorieTracker() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useSupabase();

  // Load entries from Supabase on component mount and when user changes
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const loadEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error loading entries:', error);
          return;
        }

        const parsedEntries = data.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [user, supabase]);

  const addEntry = async (nutritionData: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newEntry: Omit<FoodEntry, 'id'> = {
      ...nutritionData,
      timestamp: new Date(),
      user_id: user.id
    };

    try {
      const { data, error } = await supabase
        .from('food_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        return;
      }

      const entryWithId: FoodEntry = {
        ...data,
        timestamp: new Date(data.timestamp)
      };

      setEntries([entryWithId, ...entries]);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const editEntry = async (id: string, nutritionData: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase
        .from('food_entries')
        .update(nutritionData)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating entry:', error);
        return;
      }

      setEntries(entries.map(entry => 
        entry.id === id 
          ? { ...entry, ...nutritionData }
          : entry
      ));
      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting entry:', error);
        return;
      }

      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const startEditing = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setIsFormVisible(true);
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setIsFormVisible(false);
  };

  const getTodayEntries = () => {
    const today = new Date();
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toDateString() === today.toDateString();
    });
  };

  const toggleForm = () => {
    if (editingEntry) {
      setEditingEntry(null);
    }
    setIsFormVisible(!isFormVisible);
  };

  const todayEntries = getTodayEntries();
  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalCarbs = todayEntries.reduce((sum, entry) => sum + entry.carbs, 0);
  const totalProtein = todayEntries.reduce((sum, entry) => sum + entry.protein, 0);
  const totalFat = todayEntries.reduce((sum, entry) => sum + entry.totalFat, 0);
  
  const recommendedCalories = 2000; // Default recommendation
  const remainingCalories = Math.max(0, recommendedCalories - totalCalories);

  return {
    entries,
    todayEntries,
    totalCalories,
    totalCarbs,
    totalProtein,
    totalFat,
    remainingCalories,
    recommendedCalories,
    isFormVisible,
    editingEntry,
    loading,
    addEntry,
    editEntry,
    deleteEntry,
    startEditing,
    cancelEditing,
    toggleForm
  };
}
