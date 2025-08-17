'use client';

import { useSupabase } from './providers';
import { AuthGuard, Header, StatsGrid, MainContent, MealList, DashboardHeader, FoodLogSection, AddLogEntryModal } from './components';
import { useFoodCatalog } from './hooks/useFoodCatalog';
import { useMealTracker } from './hooks/useMealTracker';
import { useUserSettings } from './hooks/useUserSettings';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DailyFoodLog from './components/data/DailyFoodLog';
import { createClient } from '../lib/supabase';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LandingPage from './components/layout/LandingPage';

// Component that handles OAuth completion - needs to be separate for Suspense
function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCompletion = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Clear the URL parameters
        router.replace('/', { scroll: false });
      }
    };

    handleOAuthCompletion();
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}

export default function Home() {
  const { user, loading } = useSupabase();
  const router = useRouter();
  
  const {
    catalogItems,
    dailyLogs,
    totalCalories,
    totalCarbs,
    totalProtein,
    totalFat,
    loading: catalogLoading,
    addingToCatalog,
    addingToLog,
    deletingFromLog,
    deletingFromCatalog,
    addToCatalog,
    addIndividualFoodToLog,
    addMealToLog,
    deleteFromLog,
    deleteFromCatalog
  } = useFoodCatalog();

  const {
    addMeal,
    updateMeal
  } = useMealTracker();

  // Get user's nutrition goals from settings
  const { nutritionGoals } = useUserSettings(user);

  // Use user's custom goals or fall back to defaults
  const recommendedCalories = nutritionGoals?.dailyCalories || 2000;
  const recommendedCarbs = nutritionGoals?.dailyCarbs || 250;
  const recommendedProtein = nutritionGoals?.dailyProtein || 150;
  const recommendedFat = nutritionGoals?.dailyFat || 65;
  
  const remainingCalories = Math.max(0, recommendedCalories - totalCalories);
  const remainingCarbs = Math.max(0, recommendedCarbs - totalCarbs);
  const remainingProtein = Math.max(0, recommendedProtein - totalProtein);
  const remainingFat = Math.max(0, recommendedFat - totalFat);

  // Modal state for food log items
  const [selectedLogItem, setSelectedLogItem] = useState<any>(null);
  const [mealDetails, setMealDetails] = useState<any>(null);
  const [loadingMealDetails, setLoadingMealDetails] = useState(false);
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [editingMealData, setEditingMealData] = useState<{
    name: string;
    description: string;
    foods: Array<{ food_catalog_id: string; quantity: number }>;
  }>({
    name: '',
    description: '',
    foods: []
  });

  // Add entry modal state
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);

  // Handle meal creation and add to daily log
  const handleAddMeal = async (mealData: any) => {
    const createdMeal = await addMeal(mealData, catalogItems);
    if (createdMeal) {
      await addMealToLog(createdMeal.id, createdMeal.name, createdMeal.totalCalories, createdMeal.totalCarbs, createdMeal.totalProtein, createdMeal.totalFat);
    }
  };

  // Handle food log item click
  const handleEditLog = async (log: any) => {
    setSelectedLogItem(log);
    setIsEditingMeal(false); // Reset to view mode when opening modal
    
    // If it's a meal, load the detailed meal data
    if (log.type === 'meal' && log.meal_id) {
      setLoadingMealDetails(true);
      try {
        
        // Fetch the meal details
        const supabase = createClient();
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('*')
          .eq('id', log.meal_id)
          .eq('user_id', user?.id)
          .single();

        if (mealError) {
          console.error('Error loading meal:', mealError);
          return;
        }

        // Fetch the meal foods with food details
        const { data: mealFoodsData, error: mealFoodsError } = await supabase
          .from('meal_foods')
          .select(`
            *,
            food:food_catalog(*)
          `)
          .eq('meal_id', log.meal_id);

        if (mealFoodsError) {
          console.error('Error loading meal foods:', mealFoodsError);
          return;
        }

        // Calculate totals from individual foods
        const calculatedTotals = mealFoodsData.reduce((totals: any, mf: any) => {
          const food = mf.food;
          const quantity = mf.quantity;
          
          totals.calories += (food.calories || 0) * quantity;
          totals.carbs += (food.carbs || 0) * quantity;
          totals.protein += (food.protein || 0) * quantity;
          totals.totalFat += (food.totalFat || 0) * quantity;
          
          return totals;
        }, { calories: 0, carbs: 0, protein: 0, totalFat: 0 });

        const mealWithFoods = {
          ...mealData,
          foods: mealFoodsData.map((mf: any) => ({
            id: mf.id,
            food_catalog_id: mf.food_catalog_id,
            quantity: mf.quantity,
            food: mf.food
          })),
          calculatedTotals
        };

        setMealDetails(mealWithFoods);
        
        // Set up editing data
        setEditingMealData({
          name: mealData.name || log.name,
          description: mealData.description || '',
          foods: mealFoodsData.map((mf: any) => ({
            food_catalog_id: mf.food_catalog_id,
            quantity: mf.quantity
          }))
        });
      } catch (error) {
        console.error('Error loading meal details:', error);
      } finally {
        setLoadingMealDetails(false);
      }
    }
  };


  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  // If not authenticated, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // If authenticated, show the main app
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <OAuthHandler />
      </Suspense>
      <div className="min-h-screen bg-gray-50 animate-fadeIn">
        <Header />
        
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Dashboard Header */}
          <DashboardHeader />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
            {/* Left Column - Nutrition Statistics (2/3 width) */}
            <div className="lg:col-span-2">
              <StatsGrid
                totalCalories={totalCalories}
                totalCarbs={totalCarbs}
                totalProtein={totalProtein}
                totalFat={totalFat}
                remainingCalories={remainingCalories}
                remainingCarbs={remainingCarbs}
                remainingProtein={remainingProtein}
                remainingFat={remainingFat}
                entriesCount={dailyLogs.length}
                recommendedCalories={recommendedCalories}
                recommendedCarbs={recommendedCarbs}
                recommendedProtein={recommendedProtein}
                recommendedFat={recommendedFat}
              />
            </div>

            {/* Right Column - Food Log (1/3 width) */}
            <FoodLogSection
              dailyLogs={dailyLogs}
              catalogItems={catalogItems}
              addingToLog={addingToLog}
              deletingFromLog={deletingFromLog}
              onDeleteFromLog={deleteFromLog}
              onEditLog={handleEditLog}
              onAddLogEntry={() => setShowAddEntryModal(true)}
            />
          </div>

          {/* Full Width Content Below */}
          <div className="mt-6">
            <MainContent
              catalogItems={catalogItems}
              onAddMeal={handleAddMeal}
            />
          </div>
        </main>

        {/* Add Log Entry Modal */}
        <AddLogEntryModal
          isOpen={showAddEntryModal}
          onClose={() => setShowAddEntryModal(false)}
          catalogItems={catalogItems}
          onAddMeal={async (mealData, targetDate) => {
            const createdMeal = await addMeal(mealData, catalogItems);
            if (createdMeal) {
              await addMealToLog(createdMeal.id, createdMeal.name, createdMeal.totalCalories, createdMeal.totalCarbs, createdMeal.totalProtein, createdMeal.totalFat);
            }
          }}
          onAddFood={async (foodId, targetDate) => {
            await addIndividualFoodToLog(foodId, 1);
          }}
          onNavigateToCatalog={() => {
            setShowAddEntryModal(false);
            router.push('/catalog');
          }}
        />
        
        {/* Food Log Item Modal */}
        {selectedLogItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setSelectedLogItem(null)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideInUp" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedLogItem.type === 'individual' ? 'Food Details' : 'Meal Details'}
                </h3>
                <div className="flex space-x-2">
                  {selectedLogItem.type === 'meal' && (
                    <button
                      onClick={() => setIsEditingMeal(!isEditingMeal)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>{isEditingMeal ? 'View Details' : 'Edit Meal'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedLogItem(null)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {isEditingMeal && selectedLogItem.type === 'meal' ? (
                  // Meal Editing Interface
                  <div className="space-y-6">
                    {/* Meal Name and Description */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meal Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingMealData.name}
                          onChange={(e) => setEditingMealData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                          placeholder="Enter meal name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={editingMealData.description}
                          onChange={(e) => setEditingMealData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                          placeholder="Enter meal description (optional)"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Food Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Food Items</h4>
                        <button
                          onClick={() => setEditingMealData(prev => ({
                            ...prev,
                            foods: [...prev.foods, { food_catalog_id: '', quantity: 1 }]
                          }))}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          Add Food
                        </button>
                      </div>

                      <div className="space-y-3">
                        {editingMealData.foods.map((food: any, index: number) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex-1">
                              <select
                                value={food.food_catalog_id}
                                onChange={(e) => {
                                  const newFoods = [...editingMealData.foods];
                                  newFoods[index].food_catalog_id = e.target.value;
                                  setEditingMealData(prev => ({ ...prev, foods: newFoods }));
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                              >
                                <option value="">Select a food</option>
                                {catalogItems.map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.calories} cal)
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-24">
                              <input
                                type="number"
                                value={food.quantity}
                                onChange={(e) => {
                                  const newFoods = [...editingMealData.foods];
                                  newFoods[index].quantity = parseFloat(e.target.value) || 0;
                                  setEditingMealData(prev => ({ ...prev, foods: newFoods }));
                                }}
                                min="0.1"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="Qty"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const newFoods = editingMealData.foods.filter((_: any, i: number) => i !== index);
                                setEditingMealData(prev => ({ ...prev, foods: newFoods }));
                              }}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Nutrition Preview */}
                      {(() => {
                        const totalCalories = editingMealData.foods.reduce((sum: number, food: any) => {
                          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                          return sum + (catalogItem?.calories || 0) * food.quantity;
                        }, 0);
                        const totalCarbs = editingMealData.foods.reduce((sum: number, food: any) => {
                          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                          return sum + (catalogItem?.carbs || 0) * food.quantity;
                        }, 0);
                        const totalProtein = editingMealData.foods.reduce((sum: number, food: any) => {
                          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                          return sum + (catalogItem?.protein || 0) * food.quantity;
                        }, 0);
                        const totalFat = editingMealData.foods.reduce((sum: number, food: any) => {
                          const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                          return sum + (catalogItem?.totalFat || 0) * food.quantity;
                        }, 0);

                        return (
                          <div className="bg-blue-50 rounded-xl p-6">
                            <h5 className="text-sm font-medium text-blue-900 mb-4">Meal Nutrition Preview:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-blue-600">{Math.round(totalCalories)}</p>
                                <p className="text-sm text-blue-700">Calories</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-green-600">{Math.round(totalCarbs * 10) / 10}g</p>
                                <p className="text-sm text-green-700">Carbs</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-purple-600">{Math.round(totalProtein * 10) / 10}g</p>
                                <p className="text-sm text-purple-700">Protein</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-orange-600">{Math.round(totalFat * 10) / 10}g</p>
                                <p className="text-sm text-orange-700">Fat</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsEditingMeal(false);
                          // Reset to original data
                          if (mealDetails) {
                            setEditingMealData({
                              name: mealDetails.name || selectedLogItem.name,
                              description: mealDetails.description || '',
                              foods: mealDetails.foods.map((f: any) => ({
                                food_catalog_id: f.food_catalog_id,
                                quantity: f.quantity
                              }))
                            });
                          }
                        }}
                        className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!selectedLogItem.meal_id) return;
                          
                          try {
                            // Update the meal in the database
                            const success = await updateMeal(selectedLogItem.meal_id, editingMealData);
                            
                            if (success) {
                              // Calculate new nutrition totals
                              const newTotalCalories = editingMealData.foods.reduce((sum: number, food: any) => {
                                const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                                return sum + (catalogItem?.calories || 0) * food.quantity;
                              }, 0);
                              const newTotalCarbs = editingMealData.foods.reduce((sum: number, food: any) => {
                                const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                                return sum + (catalogItem?.carbs || 0) * food.quantity;
                              }, 0);
                              const newTotalProtein = editingMealData.foods.reduce((sum: number, food: any) => {
                                const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                                return sum + (catalogItem?.protein || 0) * food.quantity;
                              }, 0);
                              const newTotalFat = editingMealData.foods.reduce((sum: number, food: any) => {
                                const catalogItem = catalogItems.find(item => item.id === food.food_catalog_id);
                                return sum + (catalogItem?.totalFat || 0) * food.quantity;
                              }, 0);

                              // Update the daily food log entry with new nutrition values
                              const supabase = createClient();
                              const { error: updateLogError } = await supabase
                                .from('daily_food_logs')
                                .update({
                                  name: editingMealData.name,
                                  calories: newTotalCalories,
                                  carbs: newTotalCarbs,
                                  protein: newTotalProtein,
                                  "totalFat": newTotalFat
                                })
                                .eq('id', selectedLogItem.id)
                                .eq('user_id', user?.id);

                              if (updateLogError) {
                                console.error('Error updating daily food log:', updateLogError);
                                alert('Meal updated but failed to update log entry. Please refresh the page.');
                                return;
                              }

                              // Reload the meal details to show updated values
                              await handleEditLog(selectedLogItem);
                              
                              // Close editing mode
                              setIsEditingMeal(false);
                              
                              // Meal updated successfully - no alert needed
                            } else {
                              alert('Failed to update meal. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error updating meal:', error);
                            alert('An error occurred while updating the meal. Please try again.');
                          }
                        }}
                        disabled={!editingMealData.name.trim() || editingMealData.foods.length === 0}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {/* Item Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedLogItem.type === 'individual' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {selectedLogItem.type === 'individual' ? 'Food' : 'Meal'}
                        </span>
                        <h4 className="text-xl font-semibold text-gray-900">{selectedLogItem.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Added at {new Date(selectedLogItem.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {selectedLogItem.quantity && (
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {selectedLogItem.quantity}
                        </p>
                      )}
                    </div>

                    {/* Main Nutrition */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Nutrition Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedLogItem.type === 'meal' && mealDetails 
                              ? Math.round(mealDetails.calculatedTotals.calories)
                              : Math.round(selectedLogItem.calories)
                            }
                          </p>
                          <p className="text-sm text-blue-700 font-medium">Calories</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <p className="text-2xl font-bold text-green-600">
                            {selectedLogItem.type === 'meal' && mealDetails 
                              ? Math.round(mealDetails.calculatedTotals.carbs * 10) / 10
                              : Math.round(selectedLogItem.carbs * 10) / 10
                            }
                          </p>
                          <p className="text-sm text-green-700 font-medium">Carbs (g)</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedLogItem.type === 'meal' && mealDetails 
                              ? Math.round(mealDetails.calculatedTotals.protein * 10) / 10
                              : Math.round(selectedLogItem.protein * 10) / 10
                            }
                          </p>
                          <p className="text-sm text-purple-700 font-medium">Protein (g)</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-xl">
                          <p className="text-2xl font-bold text-orange-600">
                            {Math.round(selectedLogItem.totalFat * 10) / 10}
                          </p>
                          <p className="text-sm text-orange-700 font-medium">Fat (g)</p>
                        </div>
                      </div>
                      
                      {/* Show if these are calculated totals */}
                      {selectedLogItem.type === 'meal' && mealDetails && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-gray-500">
                            These values are calculated from the individual food items below
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Meal Contents (if it's a meal) */}
                    {selectedLogItem.type === 'meal' && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Meal Contents</h4>
                        {loadingMealDetails ? (
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              <p className="text-gray-600">Loading meal details...</p>
                            </div>
                          </div>
                        ) : mealDetails ? (
                          <div className="space-y-3">
                            {mealDetails.foods.map((foodItem: any, index: number) => (
                              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    </div>
                                    <h5 className="font-semibold text-gray-900 text-lg">{foodItem.food.name}</h5>
                                  </div>
                                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    × {foodItem.quantity}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-3">
                                  <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                                    <div className="text-lg font-bold text-blue-600 mb-1">
                                      {Math.round(foodItem.food.calories * foodItem.quantity)}
                                    </div>
                                    <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">Calories</div>
                                  </div>
                                  <div className="text-center bg-white rounded-lg p-3 border border-green-100">
                                    <div className="text-lg font-bold text-green-600 mb-1">
                                      {Math.round(foodItem.food.carbs * foodItem.quantity * 10) / 10}g
                                    </div>
                                    <div className="text-xs text-green-700 font-medium uppercase tracking-wide">Carbs</div>
                                  </div>
                                  <div className="text-center bg-white rounded-lg p-3 border border-purple-100">
                                    <div className="text-lg font-bold text-purple-600 mb-1">
                                      {Math.round(foodItem.food.protein * foodItem.quantity * 10) / 10}g
                                    </div>
                                    <div className="text-xs text-purple-700 font-medium uppercase tracking-wide">Protein</div>
                                  </div>
                                  <div className="text-center bg-white rounded-lg p-3 border border-orange-100">
                                    <div className="text-lg font-bold text-orange-600 mb-1">
                                      {Math.round(foodItem.food.totalFat * foodItem.quantity * 10) / 10}g
                                    </div>
                                    <div className="text-xs text-orange-700 font-medium uppercase tracking-wide">Fat</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-600 text-sm">
                              Unable to load meal details. The meal may have been deleted or modified.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          deleteFromLog(selectedLogItem.id);
                          setSelectedLogItem(null);
                        }}
                        className="px-6 py-3 text-red-700 bg-red-100 hover:bg-red-200 rounded-xl font-medium transition-colors duration-200"
                      >
                        Delete Entry
                      </button>
                      <button
                        onClick={() => setSelectedLogItem(null)}
                        className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
