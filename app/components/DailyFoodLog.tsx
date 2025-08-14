'use client';

import { FoodCatalogItem } from '../types';
import type { DailyFoodLog } from '../types';

interface DailyFoodLogProps {
  dailyLogs: DailyFoodLog[];
  catalogItems: FoodCatalogItem[];
  addingToLog: boolean;
  deletingFromLog: boolean;
  onDeleteFromLog: (logId: string) => void;
  onEditLog?: (log: DailyFoodLog) => void;
}

export default function DailyFoodLog({ dailyLogs, catalogItems, addingToLog, deletingFromLog, onDeleteFromLog, onEditLog }: DailyFoodLogProps) {
  if (dailyLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {addingToLog ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p>Adding to log...</p>
          </div>
        ) : (
          <p>No foods logged today. Add some foods from your catalog or create a meal!</p>
        )}
      </div>
    );
  }

  const getFoodName = (log: DailyFoodLog) => {
    if (log.type === 'individual' && log.food_catalog_id) {
      const catalogItem = catalogItems.find(item => item.id === log.food_catalog_id);
      return catalogItem?.name || 'Unknown Food';
    }
    return 'Meal';
  };

  const getFoodDetails = (log: DailyFoodLog) => {
    if (log.type === 'individual' && log.food_catalog_id) {
      const catalogItem = catalogItems.find(item => item.id === log.food_catalog_id);
      if (catalogItem && log.quantity) {
        return `${catalogItem.name} × ${log.quantity}`;
      }
      return catalogItem?.name || 'Unknown Food';
    }
    return log.name;
  };

  return (
    <div className="space-y-4">
      {dailyLogs.map((log) => (
        <div 
          key={log.id} 
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => onEditLog && onEditLog(log)}
        >
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                log.type === 'individual' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {log.type === 'individual' ? 'Food' : 'Meal'}
              </span>
              <h3 className="text-xl font-semibold text-gray-900">
                {getFoodDetails(log)}
              </h3>
            </div>
            
            <p className="text-gray-500 text-sm">
              {new Date(log.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Nutritional Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(log.calories)}</p>
              <p className="text-sm text-blue-700 font-medium">Calories</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{Math.round(log.carbs * 10) / 10}</p>
              <p className="text-sm text-green-700 font-medium">Carbs (g)</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Math.round(log.protein * 10) / 10}</p>
              <p className="text-sm text-purple-700 font-medium">Protein (g)</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{Math.round(log.totalFat * 10) / 10}</p>
              <p className="text-sm text-orange-700 font-medium">Fat (g)</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
