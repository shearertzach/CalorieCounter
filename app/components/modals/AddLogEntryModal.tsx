import { useState } from 'react';
import { FoodCatalogItem } from '../../types';

interface AddLogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogItems: FoodCatalogItem[];
  onAddMeal: (mealData: any, targetDate?: Date) => Promise<void>;
  onAddFood: (foodId: string, targetDate?: Date) => Promise<void>;
  onNavigateToCatalog: () => void;
  targetDate?: Date; // Optional target date for historical entries
}

export default function AddLogEntryModal({
  isOpen,
  onClose,
  catalogItems,
  onAddMeal,
  onAddFood,
  onNavigateToCatalog,
  targetDate
}: AddLogEntryModalProps) {
  const [view, setView] = useState<'choice' | 'meal' | 'food'>('choice');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Meal form state
  const [mealFormData, setMealFormData] = useState({
    name: '',
    description: ''
  });
  const [mealFoods, setMealFoods] = useState<Array<{ food_catalog_id: string; quantity: number }>>([]);
  const [mealFormErrors, setMealFormErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    setView('choice');
    setSearchQuery('');
    setMealFormData({ name: '', description: '' });
    setMealFoods([]);
    setMealFormErrors({});
    onClose();
  };

  const handleMealSubmit = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!mealFormData.name.trim()) {
      errors.name = 'Meal name is required';
    }
    if (mealFoods.length === 0) {
      errors.foods = 'At least one food is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setMealFormErrors(errors);
      return;
    }

    try {
      // Create meal
      const mealData = {
        name: mealFormData.name.trim(),
        description: mealFormData.description.trim() || undefined,
        foods: mealFoods
      };

      await onAddMeal(mealData, targetDate);
      handleClose();
    } catch (error) {
      console.error('Error creating meal:', error);
    }
  };

  const handleFoodAdd = async (foodId: string) => {
    await onAddFood(foodId, targetDate);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Choice View */}
        {view === 'choice' && (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {targetDate ? `Add to ${targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : 'Add Log Entry'}
            </h3>
            <p className="text-gray-600 mb-8">
              {targetDate ? 'What would you like to add to this date?' : 'What would you like to add to your daily log?'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
              <button
                onClick={() => setView('meal')}
                className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Meal</h4>
                <p className="text-sm text-gray-600">Combine multiple foods into a single meal</p>
              </button>
              
              <button
                onClick={() => setView('food')}
                className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Food Item</h4>
                <p className="text-sm text-gray-600">Add a single food from your catalog</p>
              </button>
            </div>
            
            <button
              onClick={handleClose}
              className="mt-8 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Meal Creation View */}
        {view === 'meal' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Meal</h3>
              <button
                onClick={() => setView('choice')}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
            
            {/* Meal Form */}
            <div className="space-y-6">
              {/* Meal Name and Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mealFormData.name}
                    onChange={(e) => {
                      setMealFormData(prev => ({ ...prev, name: e.target.value }));
                      if (mealFormErrors.name) {
                        setMealFormErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="Enter meal name"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white ${
                      mealFormErrors.name ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {mealFormErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{mealFormErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={mealFormData.description}
                    onChange={(e) => setMealFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter meal description (optional)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>
              </div>

              {/* Food Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Food Items</h4>
                  <button
                    onClick={() => setMealFoods(prev => [...prev, { food_catalog_id: '', quantity: 1 }])}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Food
                  </button>
                </div>

                {mealFoods.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-600 mb-4">No foods added to this meal yet</p>
                    <p className="text-sm text-gray-500">Click "Add Food" to start building your meal</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mealFoods.map((food, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <select
                            value={food.food_catalog_id}
                            onChange={(e) => {
                              const newFoods = [...mealFoods];
                              newFoods[index].food_catalog_id = e.target.value;
                              setMealFoods(newFoods);
                              if (mealFormErrors.foods) {
                                setMealFormErrors(prev => ({ ...prev, foods: '' }));
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            <option value="">Select a food</option>
                            {catalogItems.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.calories} cal)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => {
                              const newFoods = [...mealFoods];
                              newFoods[index].quantity = parseFloat(e.target.value) || 0;
                              setMealFoods(newFoods);
                            }}
                            min="0.1"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="Qty"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newFoods = mealFoods.filter((_, i) => i !== index);
                            setMealFoods(newFoods);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {mealFormErrors.foods && (
                  <p className="text-sm text-red-600">{mealFormErrors.foods}</p>
                )}

                {/* Nutrition Preview */}
                {mealFoods.length > 0 && (() => {
                  const totalCalories = mealFoods.reduce((sum, food) => {
                    const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                    return sum + (catalogItem?.calories || 0) * food.quantity;
                  }, 0);
                  const totalCarbs = mealFoods.reduce((sum, food) => {
                    const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                    return sum + (catalogItem?.carbs || 0) * food.quantity;
                  }, 0);
                  const totalProtein = mealFoods.reduce((sum, food) => {
                    const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                    return sum + (catalogItem?.protein || 0) * food.quantity;
                  }, 0);
                  const totalFat = mealFoods.reduce((sum, food) => {
                    const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                    return sum + (catalogItem?.totalFat || 0) * food.quantity;
                  }, 0);

                  return (
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h5 className="text-sm font-medium text-blue-900 mb-4">Meal Nutrition Preview:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{Math.round(totalCalories)}</p>
                          <p className="text-sm text-blue-700">Calories</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{Math.round(totalCarbs * 10) / 10}g</p>
                          <p className="text-sm text-green-700">Carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{Math.round(totalProtein * 10) / 10}g</p>
                          <p className="text-sm text-purple-700">Protein</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">{Math.round(totalFat * 10) / 10}g</p>
                          <p className="text-sm text-orange-700">Fat</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setView('choice');
                    // Reset form data
                    setMealFormData({ name: '', description: '' });
                    setMealFoods([]);
                    setMealFormErrors({});
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMealSubmit}
                  disabled={!mealFormData.name.trim() || mealFoods.length === 0}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Meal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Food Selection View */}
        {view === 'food' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Food Item</h3>
              <button
                onClick={() => setView('choice')}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your food catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Food Catalog */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {catalogItems
                .filter(item => 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                        <span>{item.calories} cal</span>
                        <span>{item.carbs}g carbs</span>
                        <span>{item.protein}g protein</span>
                        <span>{item.totalFat}g fat</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFoodAdd(item.id)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                      Add to Log
                    </button>
                  </div>
                ))}
              
              {catalogItems.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No foods found matching "{searchQuery}"</p>
                  <button
                    onClick={onNavigateToCatalog}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Go to Food Catalog
                  </button>
                </div>
              )}
            </div>
            
            {/* Add New Food Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onNavigateToCatalog}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Add New Food to Catalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
