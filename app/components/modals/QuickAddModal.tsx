'use client';

import { useState } from 'react';
import { FoodCatalogItem } from '../../types';

interface QuickAddModalProps {
  food: FoodCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => Promise<void>;
}

export default function QuickAddModal({ food, isOpen, onClose, onSubmit }: QuickAddModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(quantity);
      handleClose();
    } catch (error) {
      console.error('Error adding food to log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  if (!isOpen || !food) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full animate-slideInUp" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Quick Add to Log</h3>
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
            {/* Food Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{food.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Calories:</span>
                  <span className="ml-2 font-medium text-blue-600">{food.calories}</span>
                </div>
                <div>
                  <span className="text-gray-600">Protein:</span>
                  <span className="ml-2 font-medium text-purple-600">{food.protein}g</span>
                </div>
                <div>
                  <span className="text-gray-600">Carbs:</span>
                  <span className="ml-2 font-medium text-green-600">{food.carbs}g</span>
                </div>
                <div>
                  <span className="text-gray-600">Fat:</span>
                  <span className="ml-2 font-medium text-orange-600">{food.totalFat}g</span>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0.1, quantity - 0.1))}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0.1)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white text-center"
                />
                
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 0.1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Nutrition Preview */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-3">Nutrition Preview:</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{Math.round(food.calories * quantity)}</p>
                  <p className="text-sm text-blue-700">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{Math.round(food.carbs * quantity * 10) / 10}g</p>
                  <p className="text-sm text-green-700">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{Math.round(food.protein * quantity * 10) / 10}g</p>
                  <p className="text-sm text-purple-700">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">{Math.round(food.totalFat * quantity * 10) / 10}g</p>
                  <p className="text-sm text-orange-700">Fat</p>
                </div>
              </div>
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
                onClick={handleSubmit}
                disabled={isSubmitting || quantity <= 0}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add to Log'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
