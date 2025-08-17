'use client';

import { useState } from 'react';
import { FoodCatalogItem, CreateFoodCatalogItemData } from '../../types';

interface FoodCatalogProps {
  catalogItems: FoodCatalogItem[];
  onAddToCatalog: (foodData: CreateFoodCatalogItemData) => Promise<FoodCatalogItem | undefined>;
  onAddToLog: (catalogItemId: string, quantity: number) => void;
  onDeleteFromCatalog: (catalogItemId: string) => void;
}

export default function FoodCatalog({ 
  catalogItems, 
  onAddToCatalog, 
  onAddToLog, 
  onDeleteFromCatalog 
}: FoodCatalogProps) {
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [quickAddQuantity, setQuickAddQuantity] = useState('1');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedFoodForQuickAdd, setSelectedFoodForQuickAdd] = useState<FoodCatalogItem | null>(null);
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

    await onAddToCatalog(foodData);
    handleClose();
  };

  const handleClose = () => {
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
    setIsAddingFood(false);
  };

  const handleQuickAdd = (catalogItem: FoodCatalogItem) => {
    setSelectedFoodForQuickAdd(catalogItem);
    setQuickAddQuantity('1');
    setShowQuickAddModal(true);
  };

  const handleQuickAddSubmit = () => {
    if (selectedFoodForQuickAdd) {
      const quantity = parseFloat(quickAddQuantity);
      if (quantity > 0) {
        onAddToLog(selectedFoodForQuickAdd.id, quantity);
        setShowQuickAddModal(false);
        setSelectedFoodForQuickAdd(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Food Catalog</h2>
        <button
          onClick={() => setIsAddingFood(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Add New Food
        </button>
      </div>

      {catalogItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No foods in your catalog yet. Add your first food to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                <button
                  onClick={() => onDeleteFromCatalog(item.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove from catalog"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="font-semibold text-blue-600">{item.calories}</p>
                  <p className="text-blue-700">cal</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="font-semibold text-green-600">{item.carbs}g</p>
                  <p className="text-green-700">carbs</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <p className="font-semibold text-purple-600">{item.protein}g</p>
                  <p className="text-purple-700">protein</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="font-semibold text-orange-600">{item.totalFat}g</p>
                  <p className="text-orange-700">fat</p>
                </div>
              </div>

              <button
                onClick={() => handleQuickAdd(item)}
                className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Add to Today's Log
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Food Modal */}
      {isAddingFood && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAddModal && selectedFoodForQuickAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900">Add to Today's Log</h3>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">{selectedFoodForQuickAdd.name}</h4>
                <p className="text-gray-700 text-sm">
                  {selectedFoodForQuickAdd.calories} cal
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quickAddQuantity}
                    onChange={(e) => setQuickAddQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={handleQuickAddSubmit}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Add to Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
