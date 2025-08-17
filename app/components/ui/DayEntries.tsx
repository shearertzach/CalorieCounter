'use client';

import { DailyFoodLog } from '../../types';

interface DayEntriesProps {
  entries: DailyFoodLog[];
  selectedDate: Date;
  loading: boolean;
  onAddToDate: () => void;
  isHistoricalDate?: boolean;
}

export default function DayEntries({ entries, selectedDate, loading, onAddToDate, isHistoricalDate = false }: DayEntriesProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      protein: totals.protein + (entry.protein || 0),
      fat: totals.fat + (entry.totalFat || 0)
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
  };

  const totals = calculateTotals();

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'individual':
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'border-l-purple-500 bg-purple-50';
      case 'individual':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </h3>
          {isHistoricalDate && (
            <button
              onClick={onAddToDate}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 text-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add to This Date</span>
            </button>
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          {entries.length} food entr{entries.length === 1 ? 'y' : 'ies'} logged
        </p>
      </div>

      {/* Daily Totals */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(totals.calories)}</p>
            <p className="text-xs sm:text-sm text-gray-600">Calories</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{Math.round(totals.carbs)}g</p>
            <p className="text-xs sm:text-sm text-gray-600">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{Math.round(totals.protein)}g</p>
            <p className="text-xs sm:text-sm text-gray-600">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{Math.round(totals.fat)}g</p>
            <p className="text-xs sm:text-sm text-gray-600">Fat</p>
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No entries for this day</h4>
          <p className="text-sm sm:text-base text-gray-600">Start logging your food to see your nutrition history</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id || index}
              className={`p-3 sm:p-4 rounded-xl border-l-4 ${getEntryColor(entry.type)}`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                {getEntryIcon(entry.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {entry.name}
                    </h4>
                    <span className="text-xs text-gray-500 capitalize">
                      {entry.type}
                    </span>
                  </div>
                  
                  {/* Mobile: Stack nutrients vertically, Desktop: Grid layout */}
                  <div className="sm:hidden space-y-1">
                    <div className="text-xs">
                      <span className="text-gray-600">Calories:</span>
                      <span className="ml-1 font-medium text-blue-600">{Math.round(entry.calories || 0)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-600">Carbs:</span>
                      <span className="ml-1 font-medium text-green-600">{Math.round(entry.carbs || 0)}g</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-600">Protein:</span>
                      <span className="ml-1 font-medium text-purple-600">{Math.round(entry.protein || 0)}g</span>
                    </div>
                  </div>
                  
                  {/* Desktop: Grid layout */}
                  <div className="hidden sm:grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Calories:</span>
                      <span className="ml-1 font-medium text-blue-600">{Math.round(entry.calories || 0)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Carbs:</span>
                      <span className="ml-1 font-medium text-green-600">{Math.round(entry.carbs || 0)}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Protein:</span>
                      <span className="ml-1 font-medium text-purple-600">{Math.round(entry.protein || 0)}g</span>
                    </div>
                  </div>
                  
                  {entry.quantity && entry.quantity !== 1 && (
                    <div className="mt-1 sm:mt-2 text-xs text-gray-500">
                      Quantity: {entry.quantity}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
