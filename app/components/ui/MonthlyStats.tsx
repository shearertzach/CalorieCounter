'use client';

import { CalendarDay } from '../../hooks/useCalendar';

interface MonthlyStatsProps {
  calendarDays: CalendarDay[];
  currentMonth: Date;
}

export default function MonthlyStats({ calendarDays, currentMonth }: MonthlyStatsProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calculateMonthlyStats = () => {
    const currentMonthDays = calendarDays.filter(day => day.isCurrentMonth);
    const daysWithEntries = currentMonthDays.filter(day => day.hasEntries);
    
    const totalCalories = currentMonthDays.reduce((sum, day) => sum + day.totalCalories, 0);
    const totalCarbs = currentMonthDays.reduce((sum, day) => sum + day.totalCarbs, 0);
    const totalProtein = currentMonthDays.reduce((sum, day) => sum + day.totalProtein, 0);
    const totalFat = currentMonthDays.reduce((sum, day) => sum + day.totalFat, 0);
    
    const averageCalories = daysWithEntries.length > 0 ? totalCalories / daysWithEntries.length : 0;
    const averageCarbs = daysWithEntries.length > 0 ? totalCarbs / daysWithEntries.length : 0;
    const averageProtein = daysWithEntries.length > 0 ? totalProtein / daysWithEntries.length : 0;
    const averageFat = daysWithEntries.length > 0 ? totalFat / daysWithEntries.length : 0;
    
    return {
      totalDays: currentMonthDays.length,
      daysWithEntries: daysWithEntries.length,
      totalCalories,
      totalCarbs,
      totalProtein,
      totalFat,
      averageCalories,
      averageCarbs,
      averageProtein,
      averageFat
    };
  };

  const stats = calculateMonthlyStats();
  const completionRate = Math.round((stats.daysWithEntries / stats.totalDays) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()} Overview
      </h3>
      
      {/* Mobile Stats - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:hidden mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{stats.daysWithEntries}</p>
          <p className="text-xs text-gray-600">Days Logged</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-xs text-gray-600">Completion</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-purple-600">{Math.round(stats.averageCalories)}</p>
          <p className="text-xs text-gray-600">Avg Calories</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-orange-600">{Math.round(stats.averageProtein)}g</p>
          <p className="text-xs text-gray-600">Avg Protein</p>
        </div>
      </div>

      {/* Desktop Stats - 4 Column Grid */}
      <div className="hidden sm:grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.daysWithEntries}</p>
          <p className="text-sm text-gray-600">Days Logged</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-sm text-gray-600">Completion</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{Math.round(stats.averageCalories)}</p>
          <p className="text-sm text-gray-600">Avg Calories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{Math.round(stats.averageProtein)}g</p>
          <p className="text-sm text-gray-600">Avg Protein</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
          <span className="text-sm text-gray-500">{stats.daysWithEntries}/{stats.totalDays} days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Monthly Totals - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
        <div className="text-center sm:text-left">
          <span className="text-gray-600">Total Calories:</span>
          <span className="ml-2 font-medium text-blue-600">{Math.round(stats.totalCalories)}</span>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-gray-600">Total Carbs:</span>
          <span className="ml-2 font-medium text-green-600">{Math.round(stats.totalCarbs)}g</span>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-gray-600">Total Protein:</span>
          <span className="ml-2 font-medium text-purple-600">{Math.round(stats.totalProtein)}g</span>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-gray-600">Total Fat:</span>
          <span className="ml-2 font-medium text-orange-600">{Math.round(stats.totalFat)}g</span>
        </div>
      </div>
    </div>
  );
}
