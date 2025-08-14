'use client';

import { Meal } from '../types';

interface MealListProps {
  meals: Meal[];
  onDeleteMeal: (id: string) => void;
}

export default function MealList({ meals, onDeleteMeal }: MealListProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No meals logged yet. Create your first meal to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <div key={meal.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Meal Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{meal.name}</h3>
              {meal.description && (
                <p className="text-gray-600 text-sm">{meal.description}</p>
              )}
              <p className="text-gray-500 text-sm">
                {new Date(meal.timestamp).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <button
              onClick={() => onDeleteMeal(meal.id)}
              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete meal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Nutritional Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(meal.totalCalories)}</p>
              <p className="text-sm text-blue-700 font-medium">Calories</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{Math.round(meal.totalCarbs * 10) / 10}</p>
              <p className="text-sm text-green-700 font-medium">Carbs (g)</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Math.round(meal.totalProtein * 10) / 10}</p>
              <p className="text-sm text-purple-700 font-medium">Protein (g)</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{Math.round(meal.totalFat * 10) / 10}</p>
              <p className="text-sm text-orange-700 font-medium">Fat (g)</p>
            </div>
          </div>

          {/* Foods List */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Foods in this meal:</h4>
            <div className="space-y-2">
              {meal.foods.map((mealFood) => (
                <div key={mealFood.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{mealFood.food.name}</span>
                    {mealFood.quantity !== 1 && (
                      <span className="text-gray-600 ml-2">× {mealFood.quantity}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round(mealFood.food.calories * mealFood.quantity)} cal
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
