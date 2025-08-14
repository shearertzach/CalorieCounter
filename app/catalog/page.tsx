'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '../providers';
import AuthGuard from '../components/AuthGuard';
import Header from '../components/Header';
import { FoodCatalogItem, CreateFoodCatalogItemData } from '../types';
import { createClient } from '../../lib/supabase';

export default function FoodCatalogPage() {
  const { user } = useSupabase();
  const supabase = createClient();
  
  const [catalogItems, setCatalogItems] = useState<FoodCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'protein' | 'carbs'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodCatalogItem | null>(null);
  const [viewingFood, setViewingFood] = useState<FoodCatalogItem | null>(null);
  const [quickAddFood, setQuickAddFood] = useState<FoodCatalogItem | null>(null);
  const [quickAddQuantity, setQuickAddQuantity] = useState('1');
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    carbs: '',
    protein: '',
    totalFat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    cholesterol: '',
    saturatedFat: '',
    transFat: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadCatalogItems();
    }
  }, [user]);

  const loadCatalogItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .select('*')
        .eq('user_id', user.id)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }

    if (!formData.calories || parseFloat(formData.calories) <= 0) {
      newErrors.calories = 'Valid calories are required';
    }

    if (!formData.carbs || parseFloat(formData.carbs) < 0) {
      newErrors.carbs = 'Valid carbs are required';
    }

    if (!formData.protein || parseFloat(formData.protein) < 0) {
      newErrors.protein = 'Valid protein is required';
    }

    if (!formData.totalFat || parseFloat(formData.totalFat) < 0) {
      newErrors.totalFat = 'Valid total fat is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const foodData: CreateFoodCatalogItemData = {
      name: formData.name.trim(),
      calories: parseFloat(formData.calories),
      carbs: parseFloat(formData.carbs),
      protein: parseFloat(formData.protein),
      totalFat: parseFloat(formData.totalFat),
      fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
      sugar: formData.sugar ? parseFloat(formData.sugar) : undefined,
      sodium: formData.sodium ? parseFloat(formData.sodium) : undefined,
      cholesterol: formData.cholesterol ? parseFloat(formData.cholesterol) : undefined,
      saturatedFat: formData.saturatedFat ? parseFloat(formData.saturatedFat) : undefined,
      transFat: formData.transFat ? parseFloat(formData.transFat) : undefined
    };

    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .insert([{
          ...foodData,
          user_id: user!.id
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
      handleClose();
    } catch (error) {
      console.error('Error adding to catalog:', error);
    }
  };

  const handleEditFood = (food: FoodCatalogItem) => {
    setEditingFood(food);
    setViewingFood(null); // Close view modal when opening edit modal
    setFormData({
      name: food.name,
      calories: food.calories.toString(),
      carbs: food.carbs.toString(),
      protein: food.protein.toString(),
      totalFat: food.totalFat.toString(),
      fiber: food.fiber?.toString() || '',
      sugar: food.sugar?.toString() || '',
      sodium: food.sodium?.toString() || '',
      cholesterol: food.cholesterol?.toString() || '',
      saturatedFat: food.saturatedFat?.toString() || '',
      transFat: food.transFat?.toString() || ''
    });
    setErrors({});
  };

  const handleViewFood = (food: FoodCatalogItem) => {
    setViewingFood(food);
  };

  const handleQuickAdd = (food: FoodCatalogItem) => {
    setQuickAddFood(food);
    setViewingFood(null); // Close view modal when opening quick add modal
    setQuickAddQuantity('1');
  };

  const handleClose = () => {
    setIsAddingFood(false);
    setEditingFood(null);
    setViewingFood(null);
    setQuickAddFood(null);
    setFormData({
      name: '',
      calories: '',
      carbs: '',
      protein: '',
      totalFat: '',
      fiber: '',
      sugar: '',
      sodium: '',
      cholesterol: '',
      saturatedFat: '',
      transFat: ''
    });
    setErrors({});
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isAddingFood || editingFood || viewingFood || quickAddFood) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isAddingFood, editingFood, viewingFood, quickAddFood]);

  const handleQuickAddSubmit = async () => {
    if (!quickAddFood || !user) return;
    
    const quantity = parseFloat(quickAddQuantity);
    if (quantity <= 0) return;

    try {
      const { data, error } = await supabase
        .from('daily_food_logs')
        .insert([{
          user_id: user.id,
          type: 'individual',
          name: quickAddFood.name,
          food_catalog_id: quickAddFood.id,
          quantity,
          calories: Math.round(quickAddFood.calories * quantity),
          carbs: quickAddFood.carbs * quantity,
          protein: quickAddFood.protein * quantity,
          totalFat: quickAddFood.totalFat * quantity
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding to daily log:', error);
        return;
      }

      // Close the modal
      setQuickAddFood(null);
      setQuickAddQuantity('1');
    } catch (error) {
      console.error('Error adding to daily log:', error);
    }
  };

  const handleUpdateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingFood) return;

    const foodData: CreateFoodCatalogItemData = {
      name: formData.name.trim(),
      calories: parseFloat(formData.calories),
      carbs: parseFloat(formData.carbs),
      protein: parseFloat(formData.protein),
      totalFat: parseFloat(formData.totalFat),
      fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
      sugar: formData.sugar ? parseFloat(formData.sugar) : undefined,
      sodium: formData.sodium ? parseFloat(formData.sodium) : undefined,
      cholesterol: formData.cholesterol ? parseFloat(formData.cholesterol) : undefined,
      saturatedFat: formData.saturatedFat ? parseFloat(formData.saturatedFat) : undefined,
      transFat: formData.transFat ? parseFloat(formData.transFat) : undefined
    };

    try {
      const { data, error } = await supabase
        .from('food_catalog')
        .update(foodData)
        .eq('id', editingFood.id)
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating food:', error);
        return;
      }

      const updatedItem: FoodCatalogItem = {
        ...data,
        created_at: new Date(data.created_at)
      };

      setCatalogItems(catalogItems.map(item => 
        item.id === editingFood.id ? updatedItem : item
      ));
      handleClose();
    } catch (error) {
      console.error('Error updating food:', error);
    }
  };

  const deleteFromCatalog = async (id: string) => {
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
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = catalogItems
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Catalog</h1>
            <p className="text-gray-600">Manage your personal food database</p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Foods</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by food name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
                />
              </div>
              
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="name">Name</option>
                    <option value="calories">Calories</option>
                    <option value="protein">Protein</option>
                    <option value="carbs">Carbs</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Add Food Button */}
          <div className="mb-6">
            <button
              onClick={() => setIsAddingFood(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Add New Food
            </button>
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => handleViewFood(item)}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-semibold text-blue-600">{item.calories}</p>
                    <p className="text-blue-700 text-sm">cal</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-semibold text-green-600">{item.carbs}g</p>
                    <p className="text-green-700 text-sm">carbs</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="font-semibold text-purple-600">{item.protein}g</p>
                    <p className="text-purple-700 text-sm">protein</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="font-semibold text-orange-600">{item.totalFat}g</p>
                    <p className="text-orange-700 text-sm">fat</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Added {item.created_at.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No foods found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'Add your first food to get started!'}
              </p>
            </div>
          )}
        </main>

        {/* Add Food Modal */}
        {isAddingFood && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900">Add New Food to Catalog</h3>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Grilled Chicken Breast"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => handleInputChange('calories', e.target.value)}
                      placeholder="250"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.calories ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.calories && <p className="mt-1 text-sm text-red-600">{errors.calories}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carbs (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => handleInputChange('carbs', e.target.value)}
                      placeholder="25"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.carbs ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.carbs && <p className="mt-1 text-sm text-red-600">{errors.carbs}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Protein (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => handleInputChange('protein', e.target.value)}
                      placeholder="30"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.protein ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.protein && <p className="mt-1 text-sm text-red-600">{errors.protein}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Fat (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.totalFat}
                      onChange={(e) => handleInputChange('totalFat', e.target.value)}
                      placeholder="12"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.totalFat ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.totalFat && <p className="mt-1 text-sm text-red-600">{errors.totalFat}</p>}
                  </div>
                </div>

                {/* Additional Nutritional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Nutritional Information (Optional)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiber (g)
                      </label>
                      <input
                        type="number"
                        value={formData.fiber}
                        onChange={(e) => handleInputChange('fiber', e.target.value)}
                        placeholder="3"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugar (g)
                      </label>
                      <input
                        type="number"
                        value={formData.sugar}
                        onChange={(e) => handleInputChange('sugar', e.target.value)}
                        placeholder="5"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        value={formData.sodium}
                        onChange={(e) => handleInputChange('sodium', e.target.value)}
                        placeholder="400"
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cholesterol (mg)
                      </label>
                      <input
                        type="number"
                        value={formData.cholesterol}
                        onChange={(e) => handleInputChange('cholesterol', e.target.value)}
                        placeholder="50"
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturated Fat (g)
                      </label>
                      <input
                        type="number"
                        value={formData.saturatedFat}
                        onChange={(e) => handleInputChange('saturatedFat', e.target.value)}
                        placeholder="2"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trans Fat (g)
                      </label>
                      <input
                        type="number"
                        value={formData.transFat}
                        onChange={(e) => handleInputChange('transFat', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
                  >
                    Add Food
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Food Modal */}
        {editingFood && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900">Edit Food in Catalog</h3>
                <button
                  onClick={() => setEditingFood(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateFood} className="p-6 space-y-6">
                {/* Form content - same as add food modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Grilled Chicken Breast"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => handleInputChange('calories', e.target.value)}
                      placeholder="250"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.calories ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.calories && <p className="mt-1 text-sm text-red-600">{errors.calories}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carbs (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => handleInputChange('carbs', e.target.value)}
                      placeholder="25"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.carbs ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.carbs && <p className="mt-1 text-sm text-red-600">{errors.carbs}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Protein (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => handleInputChange('protein', e.target.value)}
                      placeholder="30"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.protein ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.protein && <p className="mt-1 text-sm text-red-600">{errors.protein}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Fat (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.totalFat}
                      onChange={(e) => handleInputChange('totalFat', e.target.value)}
                      placeholder="12"
                      min="0"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        errors.totalFat ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.totalFat && <p className="mt-1 text-sm text-red-600">{errors.totalFat}</p>}
                  </div>
                </div>

                {/* Additional Nutritional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Nutritional Information (Optional)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiber (g)
                      </label>
                      <input
                        type="number"
                        value={formData.fiber}
                        onChange={(e) => handleInputChange('fiber', e.target.value)}
                        placeholder="3"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugar (g)
                      </label>
                      <input
                        type="number"
                        value={formData.sugar}
                        onChange={(e) => handleInputChange('sugar', e.target.value)}
                        placeholder="5"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        value={formData.sodium}
                        onChange={(e) => handleInputChange('sodium', e.target.value)}
                        placeholder="400"
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cholesterol (mg)
                      </label>
                      <input
                        type="number"
                        value={formData.cholesterol}
                        onChange={(e) => handleInputChange('cholesterol', e.target.value)}
                        placeholder="50"
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturated Fat (g)
                      </label>
                      <input
                        type="number"
                        value={formData.saturatedFat}
                        onChange={(e) => handleInputChange('saturatedFat', e.target.value)}
                        placeholder="2"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trans Fat (g)
                      </label>
                      <input
                        type="number"
                        value={formData.transFat}
                        onChange={(e) => handleInputChange('transFat', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditingFood(null)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Food Details Modal */}
        {viewingFood && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900">Food Details</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickAdd(viewingFood)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    title="Quick add to today's log"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add to Log</span>
                  </button>
                  <button
                    onClick={() => handleEditFood(viewingFood)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    title="Edit food"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this food item?')) {
                        deleteFromCatalog(viewingFood.id);
                        handleClose();
                      }
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    title="Delete food"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Food Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{viewingFood.name}</h4>
                  <p className="text-gray-600 text-sm">
                    Added {viewingFood.created_at.toLocaleDateString()}
                  </p>
                </div>

                {/* Main Nutrition */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Main Nutrition</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{viewingFood.calories}</p>
                      <p className="text-sm text-blue-700 font-medium">Calories</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">{viewingFood.carbs}g</p>
                      <p className="text-sm text-green-700 font-medium">Carbs</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">{viewingFood.protein}g</p>
                      <p className="text-sm text-purple-700 font-medium">Protein</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <p className="text-2xl font-bold text-orange-600">{viewingFood.totalFat}g</p>
                      <p className="text-sm text-orange-700 font-medium">Fat</p>
                    </div>
                  </div>
                </div>

                {/* Additional Nutrition */}
                {(() => {
                  const hasAdditional = viewingFood.fiber || viewingFood.sugar || viewingFood.sodium || 
                                       viewingFood.cholesterol || viewingFood.saturatedFat || viewingFood.transFat;
                  
                  if (!hasAdditional) return null;
                  
                  return (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Nutrition</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {viewingFood.fiber && (
                          <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <p className="text-lg font-bold text-indigo-600">{viewingFood.fiber}g</p>
                            <p className="text-sm text-indigo-700 font-medium">Fiber</p>
                          </div>
                        )}
                        {viewingFood.sugar && (
                          <div className="text-center p-3 bg-pink-50 rounded-lg">
                            <p className="text-lg font-bold text-pink-600">{viewingFood.sugar}g</p>
                            <p className="text-sm text-pink-700 font-medium">Sugar</p>
                          </div>
                        )}
                        {viewingFood.sodium && (
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-lg font-bold text-yellow-600">{viewingFood.sodium}mg</p>
                            <p className="text-sm text-yellow-700 font-medium">Sodium</p>
                          </div>
                        )}
                        {viewingFood.cholesterol && (
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-lg font-bold text-red-600">{viewingFood.cholesterol}mg</p>
                            <p className="text-sm text-red-700 font-medium">Cholesterol</p>
                          </div>
                        )}
                        {viewingFood.saturatedFat && (
                          <div className="text-center p-3 bg-amber-50 rounded-lg">
                            <p className="text-lg font-bold text-amber-600">{viewingFood.saturatedFat}g</p>
                            <p className="text-sm text-amber-700 font-medium">Saturated Fat</p>
                          </div>
                        )}
                        {viewingFood.transFat && (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-600">{viewingFood.transFat}g</p>
                            <p className="text-sm text-gray-700 font-medium">Trans Fat</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Quick Add Modal */}
        {quickAddFood && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Add to Today's Log</h3>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Food Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{quickAddFood.name}</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{quickAddFood.calories}</p>
                      <p className="text-gray-600">cal</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{quickAddFood.carbs}g</p>
                      <p className="text-gray-600">carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-purple-600">{quickAddFood.protein}g</p>
                      <p className="text-gray-600">protein</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quickAddQuantity}
                    onChange={(e) => setQuickAddQuantity(e.target.value)}
                    placeholder="1"
                    min="0.1"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>

                {/* Calculated Nutrition Preview */}
                {(() => {
                  const quantity = parseFloat(quickAddQuantity) || 0;
                  if (quantity <= 0) return null;
                  
                  return (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h5 className="text-sm font-medium text-blue-900 mb-3">Nutrition for {quantity} serving{quantity !== 1 ? 's' : ''}:</h5>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">{Math.round(quickAddFood.calories * quantity)}</p>
                          <p className="text-blue-700">cal</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-600">{Math.round(quickAddFood.carbs * quantity * 10) / 10}g</p>
                          <p className="text-green-700">carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-purple-600">{Math.round(quickAddFood.protein * quantity * 10) / 10}g</p>
                          <p className="text-purple-700">protein</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickAddSubmit}
                    disabled={!quickAddQuantity || parseFloat(quickAddQuantity) <= 0}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
