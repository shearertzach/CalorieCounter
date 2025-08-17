'use client';

import { useState, useEffect } from 'react';
import { FoodCatalogItem, CreateFoodCatalogItemData } from '../../types';

interface EditFoodModalProps {
  food: FoodCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (foodData: CreateFoodCatalogItemData) => Promise<void>;
}

export default function EditFoodModal({ food, isOpen, onClose, onSubmit }: EditFoodModalProps) {
  const [formData, setFormData] = useState<CreateFoodCatalogItemData>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    totalFat: 0,
    fiber: undefined,
    sugar: undefined,
    sodium: undefined,
    cholesterol: undefined,
    saturatedFat: undefined,
    transFat: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExtraNutrition, setShowExtraNutrition] = useState(false);

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        totalFat: food.totalFat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        cholesterol: food.cholesterol,
        saturatedFat: food.saturatedFat,
        transFat: food.transFat
      });
    }
  }, [food]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Clean up undefined values to match database expectations
      const cleanData = {
        ...formData,
        fiber: formData.fiber || undefined,
        sugar: formData.sugar || undefined,
        sodium: formData.sodium || undefined,
        cholesterol: formData.cholesterol || undefined,
        saturatedFat: formData.saturatedFat || undefined,
        transFat: formData.transFat || undefined
      };
      
      await onSubmit(cleanData);
      handleClose();
    } catch (error) {
      console.error('Error updating food:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !food) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Food</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Food Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Enter food name"
              />
            </div>

            {/* Basic Nutrition - Required Fields */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Basic Nutrition (Required)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.totalFat}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalFat: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Extra Nutritional Information - Collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setShowExtraNutrition(!showExtraNutrition)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-700">Extra Nutritional Information (Optional)</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showExtraNutrition ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showExtraNutrition && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiber (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.fiber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, fiber: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugar (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.sugar || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sugar: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.sodium || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sodium: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cholesterol (mg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.cholesterol || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cholesterol: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturated Fat (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.saturatedFat || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, saturatedFat: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trans Fat (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.transFat || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, transFat: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Food'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
