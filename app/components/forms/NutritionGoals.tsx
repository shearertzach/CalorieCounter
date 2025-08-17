'use client';

import { useState } from 'react';
import type { NutritionGoals } from '../../hooks/useUserSettings';

interface NutritionGoalsProps {
  goals: NutritionGoals;
  onSave: (goals: NutritionGoals) => Promise<boolean>;
  onCalculateRecommended: () => NutritionGoals;
  saving: boolean;
}

export default function NutritionGoals({ goals, onSave, onCalculateRecommended, saving }: NutritionGoalsProps) {
  const [formData, setFormData] = useState<NutritionGoals>(goals);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof NutritionGoals, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCalculateRecommended = () => {
    const recommended = onCalculateRecommended();
    setFormData(recommended);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Daily Nutrition Goals</h3>
          <button
            type="button"
            onClick={handleCalculateRecommended}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            Calculate Recommended
          </button>
        </div>
        <p className="text-sm text-gray-600">Set your daily targets for calories and macronutrients</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Macros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="dailyCalories" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Calories
            </label>
            <input
              type="number"
              id="dailyCalories"
              value={formData.dailyCalories}
              onChange={(e) => handleInputChange('dailyCalories', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="2000"
              min="800"
              max="5000"
            />
            <p className="text-xs text-gray-500 mt-1">kcal</p>
          </div>

          <div>
            <label htmlFor="dailyCarbs" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Carbs
            </label>
            <input
              type="number"
              id="dailyCarbs"
              value={formData.dailyCarbs}
              onChange={(e) => handleInputChange('dailyCarbs', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="250"
              min="50"
              max="800"
            />
            <p className="text-xs text-gray-500 mt-1">grams</p>
          </div>

          <div>
            <label htmlFor="dailyProtein" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Protein
            </label>
            <input
              type="number"
              id="dailyProtein"
              value={formData.dailyProtein}
              onChange={(e) => handleInputChange('dailyProtein', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="150"
              min="40"
              max="400"
            />
            <p className="text-xs text-gray-500 mt-1">grams</p>
          </div>

          <div>
            <label htmlFor="dailyFat" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Fat
            </label>
            <input
              type="number"
              id="dailyFat"
              value={formData.dailyFat}
              onChange={(e) => handleInputChange('dailyFat', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="65"
              min="20"
              max="200"
            />
            <p className="text-xs text-gray-500 mt-1">grams</p>
          </div>
        </div>

        {/* Additional Nutrients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="dailyFiber" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Fiber
            </label>
            <input
              type="number"
              id="dailyFiber"
              value={formData.dailyFiber || ''}
              onChange={(e) => handleInputChange('dailyFiber', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="25"
              min="10"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">grams</p>
          </div>

          <div>
            <label htmlFor="dailySugar" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Added Sugar
            </label>
            <input
              type="number"
              id="dailySugar"
              value={formData.dailySugar || ''}
              onChange={(e) => handleInputChange('dailySugar', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="50"
              min="0"
              max="200"
            />
            <p className="text-xs text-gray-500 mt-1">grams</p>
          </div>

          <div>
            <label htmlFor="dailySodium" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Sodium
            </label>
            <input
              type="number"
              id="dailySodium"
              value={formData.dailySodium || ''}
              onChange={(e) => handleInputChange('dailySodium', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              placeholder="2300"
              min="500"
              max="5000"
            />
            <p className="text-xs text-gray-500 mt-1">mg</p>
          </div>
        </div>

        {/* Macro Distribution Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Macro Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formData.dailyCalories > 0 ? Math.round((formData.dailyCarbs * 4 / formData.dailyCalories) * 100) : 0}%
              </div>
              <div className="text-gray-600">Carbs</div>
              <div className="text-xs text-gray-500">{formData.dailyCarbs * 4} kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {formData.dailyCalories > 0 ? Math.round((formData.dailyProtein * 4 / formData.dailyCalories) * 100) : 0}%
              </div>
              <div className="text-gray-600">Protein</div>
              <div className="text-xs text-gray-500">{formData.dailyProtein * 4} kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {formData.dailyCalories > 0 ? Math.round((formData.dailyFat * 9 / formData.dailyCalories) * 100) : 0}%
              </div>
              <div className="text-gray-600">Fat</div>
              <div className="text-xs text-gray-500">{formData.dailyFat * 9} kcal</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? 'Saving...' : 'Save Goals'}
          </button>

          {showSuccess && (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Nutrition goals saved successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
