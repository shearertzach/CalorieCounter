'use client';

import { useState, useEffect } from 'react';
import { FoodCatalogItem, CreateMealData } from '../../types';

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mealData: CreateMealData) => void;
  availableFoods: FoodCatalogItem[];
}

export default function MealForm({ isOpen, onClose, onSubmit, availableFoods }: MealFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [selectedFoods, setSelectedFoods] = useState<Array<{
    food_catalog_id: string;
    quantity: number;
    food: FoodCatalogItem;
  }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addFoodToMeal = () => {
    if (availableFoods.length === 0) return;
    
    const firstFood = availableFoods[0];
    setSelectedFoods(prev => [...prev, {
      food_catalog_id: firstFood.id,
      quantity: 1,
      food: firstFood
    }]);
  };

  const removeFoodFromMeal = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const updateFoodQuantity = (index: number, quantity: number) => {
    setSelectedFoods(prev => prev.map((food, i) => 
      i === index ? { ...food, quantity: Math.max(0.1, quantity) } : food
    ));
  };

  const updateFoodSelection = (index: number, foodId: string) => {
    const food = availableFoods.find(f => f.id === foodId);
    if (food) {
      setSelectedFoods(prev => prev.map((item, i) => 
        i === index ? { ...item, food_catalog_id: foodId, food } : item
      ));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Meal name is required';
    }

    if (selectedFoods.length === 0) {
      newErrors.foods = 'At least one food is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const mealData: CreateMealData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      foods: selectedFoods.map(food => ({
        food_catalog_id: food.food_catalog_id,
        quantity: food.quantity
      }))
    };

    onSubmit(mealData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setSelectedFoods([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">Create New Meal</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Breakfast, Lunch, Dinner, Snack"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Quick morning meal"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Foods Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Foods in Meal</h3>
              <button
                type="button"
                onClick={addFoodToMeal}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Add Food
              </button>
            </div>

            {errors.foods && <p className="mb-4 text-sm text-red-600">{errors.foods}</p>}

            {selectedFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No foods added yet. Click "Add Food" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedFoods.map((selectedFood, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Food</label>
                        <select
                          value={selectedFood.food_catalog_id}
                          onChange={(e) => updateFoodSelection(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {availableFoods.map(food => (
                            <option key={food.id} value={food.id}>
                              {food.name} ({food.calories} cal)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={selectedFood.quantity}
                          onChange={(e) => updateFoodQuantity(index, parseFloat(e.target.value))}
                          min="0.1"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="text-sm text-gray-600">
                          <p><strong>Calories:</strong> {Math.round(selectedFood.food.calories * selectedFood.quantity)}</p>
                          <p><strong>Carbs:</strong> {Math.round(selectedFood.food.carbs * selectedFood.quantity * 10) / 10}g</p>
                          <p><strong>Protein:</strong> {Math.round(selectedFood.food.protein * selectedFood.quantity * 10) / 10}g</p>
                          <p><strong>Fat:</strong> {Math.round(selectedFood.food.totalFat * selectedFood.quantity * 10) / 10}g</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFoodFromMeal(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Summary */}
          {selectedFoods.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Meal Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(selectedFoods.reduce((sum, food) => sum + (food.food.calories * food.quantity), 0))}
                  </p>
                  <p className="text-sm text-gray-600">Total Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(selectedFoods.reduce((sum, food) => sum + (food.food.carbs * food.quantity), 0) * 10) / 10}
                  </p>
                  <p className="text-sm text-gray-600">Total Carbs (g)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(selectedFoods.reduce((sum, food) => sum + (food.food.protein * food.quantity), 0) * 10) / 10}
                  </p>
                  <p className="text-sm text-gray-600">Total Protein (g)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(selectedFoods.reduce((sum, food) => sum + (food.food.totalFat * food.quantity), 0) * 10) / 10}
                  </p>
                  <p className="text-sm text-gray-600">Total Fat (g)</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
            >
              Create Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
