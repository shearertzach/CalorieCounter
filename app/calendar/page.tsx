'use client';

import { useSupabase } from '../providers';
import { AuthGuard, Header, Calendar, DayEntries, MonthlyStats, AddLogEntryModal } from '../components';
import { useCalendar } from '../hooks/useCalendar';
import { useFoodCatalog } from '../hooks/useFoodCatalog';
import { useMealTracker } from '../hooks/useMealTracker';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const { user } = useSupabase();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    selectedDate,
    currentMonth,
    calendarDays,
    selectedDayEntries,
    loading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    goToMonth,
    selectDate,
    addFoodToDate,
    addMealToDate
  } = useCalendar(user?.id);

  const { catalogItems } = useFoodCatalog();
  const { addMeal } = useMealTracker();

  const isHistoricalDate = () => {
    const today = new Date();
    const selected = new Date(selectedDate);
    return selected.toDateString() !== today.toDateString();
  };

  const handleAddToDate = () => {
    setShowAddModal(true);
  };

  const handleAddMeal = async (mealData: any, targetDate?: Date) => {
    try {
      if (targetDate) {
        // For historical dates, use the calendar hook
        const success = await addMealToDate(mealData, targetDate);
        if (success) {
          setShowAddModal(false);
        }
      } else {
        // For current date, use the meal tracker hook
        const createdMeal = await addMeal(mealData, catalogItems);
        if (createdMeal) {
          // This would need to be implemented to add to current day log
          console.log('Meal created for current day:', createdMeal);
        }
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const handleAddFood = async (foodId: string, targetDate?: Date) => {
    try {
      if (targetDate) {
        // For historical dates, use the calendar hook with default quantity
        const success = await addFoodToDate(foodId, 1, targetDate);
        if (success) {
          setShowAddModal(false);
        }
      } else {
        // For current date, this would need to be implemented
        console.log('Food added for current day:', foodId);
      }
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const handleNavigateToCatalog = () => {
    router.push('/catalog');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Nutrition Calendar</h1>
            <p className="text-sm sm:text-base text-gray-600">Browse your nutrition history and track your progress over time</p>
          </div>

          {/* Mobile Layout - Stack vertically on small screens */}
          <div className="space-y-6 sm:hidden">
            {/* Monthly Stats - Simplified for mobile */}
            <div className="mb-4">
              <MonthlyStats 
                calendarDays={calendarDays}
                currentMonth={currentMonth}
              />
            </div>

            {/* Calendar View - Mobile optimized */}
            <div>
              <Calendar
                calendarDays={calendarDays}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateSelect={selectDate}
                onPreviousMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
                onGoToToday={goToToday}
                onMonthChange={goToMonth}
              />
            </div>

            {/* Day Entries - Mobile optimized */}
            <div>
              <DayEntries
                entries={selectedDayEntries}
                selectedDate={selectedDate}
                loading={loading}
                onAddToDate={handleAddToDate}
                isHistoricalDate={isHistoricalDate()}
              />
            </div>
          </div>

          {/* Desktop Layout - Side by side on larger screens */}
          <div className="hidden sm:block space-y-8">
            {/* Monthly Stats */}
            <div>
              <MonthlyStats 
                calendarDays={calendarDays}
                currentMonth={currentMonth}
              />
            </div>

            {/* Calendar and Entries side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Calendar
                  calendarDays={calendarDays}
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  onDateSelect={selectDate}
                  onPreviousMonth={goToPreviousMonth}
                  onNextMonth={goToNextMonth}
                  onGoToToday={goToToday}
                  onMonthChange={goToMonth}
                />
              </div>

              <div>
                <DayEntries
                  entries={selectedDayEntries}
                  selectedDate={selectedDate}
                  loading={loading}
                  onAddToDate={handleAddToDate}
                  isHistoricalDate={isHistoricalDate()}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Add to Historical Date Modal */}
        <AddLogEntryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          catalogItems={catalogItems}
          onAddMeal={handleAddMeal}
          onAddFood={handleAddFood}
          onNavigateToCatalog={handleNavigateToCatalog}
          targetDate={selectedDate}
        />
      </div>
    </AuthGuard>
  );
}
