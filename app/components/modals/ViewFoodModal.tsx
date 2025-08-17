'use client';

import { FoodCatalogItem } from '../../types';
import { useState } from 'react';

interface ViewFoodModalProps {
  food: FoodCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (food: FoodCatalogItem) => void;
  onQuickAdd: (food: FoodCatalogItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function ViewFoodModal({ 
  food, 
  isOpen, 
  onClose, 
  onEdit, 
  onQuickAdd, 
  onDelete 
}: ViewFoodModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!food) return;
    
    if (confirm(`Are you sure you want to delete "${food.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await onDelete(food.id);
        onClose();
      } catch (error) {
        console.error('Error deleting food:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen || !food) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Food Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Food Name */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">{food.name}</h4>
            </div>

            {/* Basic Nutrition Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Basic Nutrition</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{food.calories}</p>
                  <p className="text-sm text-blue-700 font-medium">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{food.carbs}g</p>
                  <p className="text-sm text-green-700 font-medium">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{food.protein}g</p>
                  <p className="text-sm text-purple-700 font-medium">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{food.totalFat}g</p>
                  <p className="text-sm text-orange-700 font-medium">Fat</p>
                </div>
              </div>
            </div>

            {/* Extra Nutritional Information - Only show if any exist */}
            {(() => {
              const hasExtraNutrition = food.fiber || food.sugar || food.sodium || 
                                      food.cholesterol || food.saturatedFat || food.transFat;
              
              if (!hasExtraNutrition) return null;
              
              return (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h5 className="text-sm font-medium text-blue-700 mb-3">Extra Nutritional Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {food.fiber && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{food.fiber}g</p>
                        <p className="text-sm text-blue-700 font-medium">Fiber</p>
                      </div>
                    )}
                    {food.sugar && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-pink-600">{food.sugar}g</p>
                        <p className="text-sm text-pink-700 font-medium">Sugar</p>
                      </div>
                    )}
                    {food.sodium && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-600">{food.sodium}mg</p>
                        <p className="text-sm text-yellow-700 font-medium">Sodium</p>
                      </div>
                    )}
                    {food.cholesterol && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{food.cholesterol}mg</p>
                        <p className="text-sm text-red-700 font-medium">Cholesterol</p>
                      </div>
                    )}
                    {food.saturatedFat && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-amber-600">{food.saturatedFat}g</p>
                        <p className="text-sm text-amber-700 font-medium">Saturated Fat</p>
                      </div>
                    )}
                    {food.transFat && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-600">{food.transFat}g</p>
                        <p className="text-sm text-gray-700 font-medium">Trans Fat</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Additional Info */}
            <div className="text-sm text-gray-500">
              <p>Added: {food.created_at.toLocaleDateString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => onQuickAdd(food)}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200"
              >
                Quick Add to Log
              </button>
              <button
                onClick={() => onEdit(food)}
                className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-200"
              >
                Edit Food
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Food'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
