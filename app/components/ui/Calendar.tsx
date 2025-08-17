'use client';

import { CalendarDay } from '../../hooks/useCalendar';
import { useState } from 'react';

interface CalendarProps {
  calendarDays: CalendarDay[];
  currentMonth: Date;
  selectedDate: Date;
  onDateSelect: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onMonthChange?: (date: Date) => void;
}

export default function Calendar({
  calendarDays,
  currentMonth,
  selectedDate,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onMonthChange
}: CalendarProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(currentMonth.getMonth());
  const [tempYear, setTempYear] = useState(currentMonth.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date: Date) => {
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isSelectedDate = (date: string) => {
    // Create a local date string from selectedDate to avoid timezone issues
    const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return date === selectedDateString;
  };

  const handleMonthChange = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    if (onMonthChange) {
      onMonthChange(newDate);
    }
    setShowMonthPicker(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
          >
            {formatDate(currentMonth)}
          </button>
          
          {/* Month/Year Picker */}
          {showMonthPicker && (
            <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <select
                  value={tempMonth}
                  onChange={(e) => setTempMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={tempYear}
                  onChange={(e) => setTempYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={handleMonthChange}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onGoToToday}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            Today
          </button>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={onPreviousMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day.date)}
            disabled={!day.isCurrentMonth}
            className={`
              relative p-2 sm:p-3 text-left rounded-lg transition-all duration-200 
              min-h-[60px] sm:min-h-[80px] flex flex-col justify-between
              ${!day.isCurrentMonth 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'hover:bg-gray-50 cursor-pointer'
              }
              ${isSelectedDate(day.date) 
                ? 'bg-blue-50 border-2 border-blue-500' 
                : 'border border-transparent'
              }
              ${day.isToday && !isSelectedDate(day.date) 
                ? 'bg-blue-50 border border-blue-200' 
                : ''
              }
            `}
          >
            {/* Day Number */}
            <div className={`
              text-xs sm:text-sm font-medium
              ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
              ${day.isToday ? 'text-blue-600' : ''}
              ${isSelectedDate(day.date) ? 'text-blue-700' : ''}
            `}>
              {day.day}
            </div>

            {/* Nutrition Summary - Simplified for mobile */}
            {day.isCurrentMonth && day.hasEntries && (
              <div className="space-y-0.5 sm:space-y-1">
                {/* Calories - Always show */}
                <div className="text-xs text-blue-600 font-medium">
                  {Math.round(day.totalCalories)} cal
                </div>
                
                {/* Entry Count - Show on larger screens */}
                <div className="hidden sm:block text-xs text-gray-500">
                  {day.entryCount} item{day.entryCount !== 1 ? 's' : ''}
                </div>
                
                {/* Quick Macro Preview - Show on larger screens */}
                <div className="hidden sm:flex space-x-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            )}

            {/* No Entries Indicator */}
            {day.isCurrentMonth && !day.hasEntries && (
              <div className="text-xs text-gray-400 mt-1 sm:mt-2">
                <span className="hidden sm:inline">No entries</span>
                <span className="sm:hidden">-</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
