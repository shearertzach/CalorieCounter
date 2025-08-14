import { useState } from 'react';
import ProgressBar from './ProgressBar';
import MealForm from './MealForm';
import DailyFoodLog from './DailyFoodLog';
import { FoodCatalogItem, CreateFoodCatalogItemData, CreateMealData, DailyFoodLog as DailyFoodLogType, Meal } from '../types';
import { useMealTracker } from '../hooks/useMealTracker';
import { useEffect } from 'react';

interface MainContentProps {
  totalCalories: number;
  recommendedCalories: number;
  catalogItems: FoodCatalogItem[];
  dailyLogs: any[];
  addingToLog: boolean;
  deletingFromLog: boolean;
  onAddToCatalog: (foodData: CreateFoodCatalogItemData) => Promise<FoodCatalogItem | undefined>;
  onAddToLog: (catalogItemId: string, quantity: number) => void;
  onAddMeal: (mealData: CreateMealData) => void;
  onDeleteFromLog: (logId: string) => void;
  onDeleteFromCatalog: (catalogItemId: string) => void;
}

export default function MainContent({
  totalCalories,
  recommendedCalories,
  catalogItems,
  dailyLogs,
  addingToLog,
  deletingFromLog,
  onAddToCatalog,
  onAddToLog,
  onAddMeal,
  onDeleteFromLog,
  onDeleteFromCatalog
}: MainContentProps) {
  const [isMealFormVisible, setIsMealFormVisible] = useState(false);
  const [selectedLogItem, setSelectedLogItem] = useState<DailyFoodLogType | null>(null);
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [editingMealData, setEditingMealData] = useState<CreateMealData>({
    name: '',
    description: '',
    foods: []
  });

  const { updateMeal, getMealById } = useMealTracker();

  const handleToggleMealForm = () => {
    setIsMealFormVisible(!isMealFormVisible);
  };

  const handleEditLog = (log: DailyFoodLogType) => {
    setSelectedLogItem(log);
    
    // If it's a meal, load the meal data for editing
    if (log.type === 'meal' && log.meal_id) {
      const meal = getMealById(log.meal_id);
      if (meal) {
        setEditingMealData({
          name: meal.name,
          description: meal.description || '',
          foods: meal.foods.map(food => ({
            food_catalog_id: food.food_catalog_id,
            quantity: food.quantity
          }))
        });
      }
    }
  };

  const handleSaveMealEdit = async () => {
    if (selectedLogItem?.type === 'meal' && selectedLogItem.meal_id) {
      await updateMeal(selectedLogItem.meal_id, editingMealData);
      setIsEditingMeal(false);
      setSelectedLogItem(null);
    }
  };

  const handleCancelMealEdit = () => {
    setIsEditingMeal(false);
    if (selectedLogItem?.type === 'meal' && selectedLogItem.meal_id) {
      const meal = getMealById(selectedLogItem.meal_id);
      if (meal) {
        setEditingMealData({
          name: meal.name,
          description: meal.description || '',
          foods: meal.foods.map(food => ({
            food_catalog_id: food.food_catalog_id,
            quantity: food.quantity
          }))
        });
      }
    }
  };

  const getDetailedNutrition = (log: DailyFoodLogType) => {
    if (log.type === 'individual' && log.food_catalog_id) {
      const catalogItem = catalogItems.find(item => item.id === log.food_catalog_id);
      if (catalogItem) {
        return {
          fiber: catalogItem.fiber ? catalogItem.fiber * (log.quantity || 1) : undefined,
          sugar: catalogItem.sugar ? catalogItem.sugar * (log.quantity || 1) : undefined,
          sodium: catalogItem.sodium ? catalogItem.sodium * (log.quantity || 1) : undefined,
          cholesterol: catalogItem.cholesterol ? catalogItem.cholesterol * (log.quantity || 1) : undefined,
          saturatedFat: catalogItem.saturatedFat ? catalogItem.saturatedFat * (log.quantity || 1) : undefined,
          transFat: catalogItem.transFat ? catalogItem.transFat * (log.quantity || 1) : undefined
        };
      }
    } else if (log.type === 'meal' && log.meal_id) {
      const meal = getMealById(log.meal_id);
      if (meal) {
        // Calculate additional nutrition by summing up all foods in the meal
        let totalFiber = 0;
        let totalSugar = 0;
        let totalSodium = 0;
        let totalCholesterol = 0;
        let totalSaturatedFat = 0;
        let totalTransFat = 0;

        meal.foods.forEach(food => {
          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
          if (catalogItem) {
            if (catalogItem.fiber) totalFiber += catalogItem.fiber * food.quantity;
            if (catalogItem.sugar) totalSugar += catalogItem.sugar * food.quantity;
            if (catalogItem.sodium) totalSodium += catalogItem.sodium * food.quantity;
            if (catalogItem.cholesterol) totalCholesterol += catalogItem.cholesterol * food.quantity;
            if (catalogItem.saturatedFat) totalSaturatedFat += catalogItem.saturatedFat * food.quantity;
            if (catalogItem.transFat) totalTransFat += catalogItem.transFat * food.quantity;
          }
        });

        return {
          fiber: totalFiber > 0 ? totalFiber : undefined,
          sugar: totalSugar > 0 ? totalSugar : undefined,
          sodium: totalSodium > 0 ? totalSodium : undefined,
          cholesterol: totalCholesterol > 0 ? totalCholesterol : undefined,
          saturatedFat: totalSaturatedFat > 0 ? totalSaturatedFat : undefined,
          transFat: totalTransFat > 0 ? totalTransFat : undefined
        };
      }
    }
    return {};
  };

  const getMealDetails = (log: DailyFoodLogType) => {
    if (log.type === 'meal' && log.meal_id) {
      return getMealById(log.meal_id);
    }
    return null;
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedLogItem(null);
      }
    };

    if (selectedLogItem) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedLogItem]);

  return (
    <div className="space-y-8">
      <ProgressBar
        current={totalCalories}
        target={recommendedCalories}
        label="Daily Progress"
      />

      {/* Meal Form */}
      <MealForm
        isOpen={isMealFormVisible}
        onClose={handleToggleMealForm}
        onSubmit={onAddMeal}
        availableFoods={catalogItems}
      />

      {/* Daily Food Log */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Today's Food Log</h2>
            <p className="text-gray-600">Track what you've eaten today</p>
          </div>
          <button
            onClick={handleToggleMealForm}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Create Meal
          </button>
        </div>

        <div className="p-6">
          <DailyFoodLog
            dailyLogs={dailyLogs}
            catalogItems={catalogItems}
            addingToLog={addingToLog}
            deletingFromLog={deletingFromLog}
            onDeleteFromLog={onDeleteFromLog}
            onEditLog={handleEditLog}
          />
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedLogItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLogItem(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900">Nutrition Details</h3>
              <div className="flex space-x-2">
                {selectedLogItem.type === 'meal' && (
                  <button
                    onClick={() => setIsEditingMeal(!isEditingMeal)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {isEditingMeal ? 'View Details' : 'Edit Meal'}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this log entry?')) {
                      onDeleteFromLog(selectedLogItem.id);
                      setSelectedLogItem(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  title="Delete log entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedLogItem(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {isEditingMeal && selectedLogItem.type === 'meal' ? (
                // Meal Editing Interface
                <div className="space-y-8">
                  {/* Meal Name and Description */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingMealData.name}
                        onChange={(e) => setEditingMealData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="Enter meal name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingMealData.description}
                        onChange={(e) => setEditingMealData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="Enter meal description (optional)"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">Food Items</h4>
                      <button
                        onClick={() => setEditingMealData(prev => ({
                          ...prev,
                          foods: [...prev.foods, { food_catalog_id: '', quantity: 1 }]
                        }))}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Add Food
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editingMealData.foods.map((food, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <select
                              value={food.food_catalog_id}
                              onChange={(e) => {
                                const newFoods = [...editingMealData.foods];
                                newFoods[index].food_catalog_id = e.target.value;
                                setEditingMealData(prev => ({ ...prev, foods: newFoods }));
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
                                const newFoods = [...editingMealData.foods];
                                newFoods[index].quantity = parseFloat(e.target.value) || 0;
                                setEditingMealData(prev => ({ ...prev, foods: newFoods }));
                              }}
                              min="0.1"
                              step="0.1"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                              placeholder="Qty"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newFoods = editingMealData.foods.filter((_, i) => i !== index);
                              setEditingMealData(prev => ({ ...prev, foods: newFoods }));
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

                    {/* Nutrition Preview */}
                    {(() => {
                      const totalCalories = editingMealData.foods.reduce((sum, food) => {
                        const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                        return sum + (catalogItem?.calories || 0) * food.quantity;
                      }, 0);
                      const totalCarbs = editingMealData.foods.reduce((sum, food) => {
                        const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                        return sum + (catalogItem?.carbs || 0) * food.quantity;
                      }, 0);
                      const totalProtein = editingMealData.foods.reduce((sum, food) => {
                        const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                        return sum + (catalogItem?.protein || 0) * food.quantity;
                      }, 0);
                      const totalFat = editingMealData.foods.reduce((sum, food) => {
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
                      onClick={handleCancelMealEdit}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMealEdit}
                      disabled={!editingMealData.name.trim() || editingMealData.foods.length === 0}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  {/* Item Info */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedLogItem.type === 'individual' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedLogItem.type === 'individual' ? 'Food' : 'Meal'}
                      </span>
                      <h4 className="text-xl font-semibold text-gray-900">{selectedLogItem.name}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Added at {new Date(selectedLogItem.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {selectedLogItem.quantity && (
                      <p className="text-gray-600 text-sm mt-1">
                        Quantity: {selectedLogItem.quantity}
                      </p>
                    )}
                  </div>

                  {/* Main Nutrition */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Main Nutrition</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        // Calculate nutrition based on type
                        let calories, carbs, protein, totalFat;
                        
                        if (selectedLogItem.type === 'individual') {
                          // For individual foods, use the stored values
                          calories = selectedLogItem.calories;
                          carbs = selectedLogItem.carbs;
                          protein = selectedLogItem.protein;
                          totalFat = selectedLogItem.totalFat;
                        } else {
                          // For meals, calculate from the actual meal data
                          const meal = getMealDetails(selectedLogItem);
                          if (meal) {
                            calories = meal.totalCalories;
                            carbs = meal.totalCarbs;
                            protein = meal.totalProtein;
                            totalFat = meal.totalFat;
                          } else {
                            // Fallback to stored values if meal not found
                            calories = selectedLogItem.calories;
                            carbs = selectedLogItem.carbs;
                            protein = selectedLogItem.protein;
                            totalFat = selectedLogItem.totalFat;
                          }
                        }

                        return (
                          <>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                              <p className="text-2xl font-bold text-blue-600">{Math.round(calories)}</p>
                              <p className="text-sm text-blue-700 font-medium">Calories</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                              <p className="text-2xl font-bold text-green-600">{Math.round(carbs * 10) / 10}</p>
                              <p className="text-sm text-green-700 font-medium">Carbs (g)</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                              <p className="text-2xl font-bold text-purple-600">{Math.round(protein * 10) / 10}</p>
                              <p className="text-sm text-purple-700 font-medium">Protein (g)</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-xl">
                              <p className="text-2xl font-bold text-orange-600">{Math.round(totalFat * 10) / 10}</p>
                              <p className="text-sm text-orange-700 font-medium">Fat (g)</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Meal Foods (if it's a meal) */}
                  {selectedLogItem.type === 'meal' && (() => {
                    const meal = getMealDetails(selectedLogItem);
                    if (!meal) return null;

                    return (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Meal Contents</h4>
                        <div className="space-y-3">
                          {meal.foods.map((food, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{food.food.name}</h5>
                                <p className="text-sm text-gray-600">
                                  {Math.round(food.food.calories * food.quantity)} cal, {Math.round(food.food.carbs * food.quantity * 10) / 10}g carbs, {Math.round(food.food.protein * food.quantity * 10) / 10}g protein
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">× {food.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Additional Nutrition */}
                  {(() => {
                    const additional = getDetailedNutrition(selectedLogItem);
                    const hasAdditional = Object.values(additional).some(val => val !== undefined);
                    
                    if (!hasAdditional) return null;
                    
                    return (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Nutrition</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {additional.fiber !== undefined && (
                            <div className="text-center p-3 bg-indigo-50 rounded-lg">
                              <p className="text-lg font-bold text-indigo-600">{Math.round(additional.fiber * 10) / 10}</p>
                              <p className="text-sm text-indigo-700 font-medium">Fiber (g)</p>
                            </div>
                          )}
                          {additional.sugar !== undefined && (
                            <div className="text-center p-3 bg-pink-50 rounded-lg">
                              <p className="text-lg font-bold text-pink-600">{Math.round(additional.sugar * 10) / 10}</p>
                              <p className="text-sm text-pink-700 font-medium">Sugar (g)</p>
                            </div>
                          )}
                          {additional.sodium !== undefined && (
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <p className="text-lg font-bold text-yellow-600">{Math.round(additional.sodium)}</p>
                              <p className="text-sm text-yellow-700 font-medium">Sodium (mg)</p>
                            </div>
                          )}
                          {additional.cholesterol !== undefined && (
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <p className="text-lg font-bold text-red-600">{Math.round(additional.cholesterol)}</p>
                              <p className="text-sm text-red-700 font-medium">Cholesterol (mg)</p>
                            </div>
                          )}
                          {additional.saturatedFat !== undefined && (
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                              <p className="text-lg font-bold text-amber-600">{Math.round(additional.saturatedFat * 10) / 10}</p>
                              <p className="text-sm text-amber-700 font-medium">Saturated Fat (g)</p>
                            </div>
                          )}
                          {additional.transFat !== undefined && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-lg font-bold text-gray-600">{Math.round(additional.transFat * 10) / 10}</p>
                              <p className="text-sm text-gray-700 font-medium">Trans Fat (g)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
