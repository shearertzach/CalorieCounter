'use client';

import { FoodCatalogItem } from '../../types';

interface FoodGridProps {
  items: FoodCatalogItem[];
  onViewFood: (food: FoodCatalogItem) => void;
}

export default function FoodGrid({ items, onViewFood }: FoodGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No foods found</h3>
        <p className="text-gray-600">Add your first food to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
          onClick={() => onViewFood(item)}
        >
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
  );
}
