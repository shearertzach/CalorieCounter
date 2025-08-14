import { FoodEntry } from '../types';

interface FoodLogProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: FoodEntry) => void;
}

export default function FoodLog({ entries, onDelete, onEdit }: FoodLogProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet today</h3>
        <p className="text-gray-500">Add your first meal to start tracking your nutrition!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Today's Food Log</h2>
        <p className="text-sm text-gray-500">{entries.length} entries</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate mb-2">
                  {entry.name}
                </h3>
                
                {/* Main Nutrition Info */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {entry.calories}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {entry.carbs}g
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {entry.protein}g
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Protein</div>
                  </div>
                </div>

                {/* Additional Nutrition Info */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">
                    Fat: <span className="font-medium text-orange-600">{entry.totalFat}g</span>
                  </span>
                  {entry.fiber && (
                    <span className="text-gray-600">
                      Fiber: <span className="font-medium text-green-600">{entry.fiber}g</span>
                    </span>
                  )}
                  {entry.sugar && (
                    <span className="text-gray-600">
                      Sugar: <span className="font-medium text-red-600">{entry.sugar}g</span>
                    </span>
                  )}
                  {entry.sodium && (
                    <span className="text-gray-600">
                      Sodium: <span className="font-medium text-blue-600">{entry.sodium}mg</span>
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {entry.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              <div className="ml-4 flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => onEdit(entry)}
                  className="w-8 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-all duration-200"
                  title="Edit entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-200"
                  title="Delete entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
