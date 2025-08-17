'use client';

import { useState, useEffect } from 'react';
import { FoodEntry } from '../../types';

interface NutritionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
  editingEntry?: FoodEntry | null;
  onEdit?: (id: string, entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
}

export default function NutritionForm({ isOpen, onClose, onSubmit, editingEntry, onEdit }: NutritionFormProps) {
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

  // Pre-fill form when editing
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        name: editingEntry.name,
        calories: editingEntry.calories.toString(),
        carbs: editingEntry.carbs.toString(),
        protein: editingEntry.protein.toString(),
        totalFat: editingEntry.totalFat.toString(),
        fiber: editingEntry.fiber?.toString() || '',
        sugar: editingEntry.sugar?.toString() || '',
        sodium: editingEntry.sodium?.toString() || '',
        cholesterol: editingEntry.cholesterol?.toString() || '',
        saturatedFat: editingEntry.saturatedFat?.toString() || '',
        transFat: editingEntry.transFat?.toString() || ''
      });
    } else {
      // Reset form when not editing
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
    }
    setErrors({});
  }, [editingEntry]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const entry = {
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

    if (editingEntry && onEdit) {
      onEdit(editingEntry.id, entry);
    } else {
      onSubmit(entry);
    }
    
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
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!editingEntry;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit Nutrition Entry' : 'Add Nutrition Entry'}
          </h2>
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
          {/* Food Name */}
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

          {/* Required Nutrition Fields */}
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

          {/* Optional Nutrition Fields */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Nutrition (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fiber (g)</label>
                <input
                  type="number"
                  value={formData.fiber}
                  onChange={(e) => handleInputChange('fiber', e.target.value)}
                  placeholder="3"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sugar (g)</label>
                <input
                  type="number"
                  value={formData.sugar}
                  onChange={(e) => handleInputChange('sugar', e.target.value)}
                  placeholder="2"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sodium (mg)</label>
                <input
                  type="number"
                  value={formData.sodium}
                  onChange={(e) => handleInputChange('sodium', e.target.value)}
                  placeholder="400"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cholesterol (mg)</label>
                <input
                  type="number"
                  value={formData.cholesterol}
                  onChange={(e) => handleInputChange('cholesterol', e.target.value)}
                  placeholder="80"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Saturated Fat (g)</label>
                <input
                  type="number"
                  value={formData.saturatedFat}
                  onChange={(e) => handleInputChange('saturatedFat', e.target.value)}
                  placeholder="4"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trans Fat (g)</label>
                <input
                  type="number"
                  value={formData.transFat}
                  onChange={(e) => handleInputChange('transFat', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

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
              {isEditing ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
