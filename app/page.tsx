'use client';

import { useSupabase } from './providers';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import MainContent from './components/MainContent';
import QuickAddButton from './components/QuickAddButton';
import { useFoodCatalog } from './hooks/useFoodCatalog';
import { useMealTracker } from './hooks/useMealTracker';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const { user, loading } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
    addMeal
  } = useMealTracker();

  const recommendedCalories = 2000; // Default recommendation
  const remainingCalories = Math.max(0, recommendedCalories - totalCalories);

  // Handle meal creation and add to daily log
  const handleAddMeal = async (mealData: any) => {
    const createdMeal = await addMeal(mealData, catalogItems);
    if (createdMeal) {
      await addMealToLog(createdMeal.id, createdMeal.name, createdMeal.totalCalories, createdMeal.totalCarbs, createdMeal.totalProtein, createdMeal.totalFat);
    }
  };

  // Handle OAuth completion if user lands here with auth parameters
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Track Your Nutrition Journey
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              A beautiful, modern dashboard to monitor your daily nutrition intake. 
              Track calories, macros, and micronutrients with ease.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor calories, carbs, protein, fat, and more</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Beautiful Dashboard</h3>
                  <p className="text-sm text-gray-600">Modern, responsive design that works on all devices</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-sm text-gray-600">Your data is protected with Google authentication</p>
                </div>
              </div>
            </div>
            
            <a
              href="/auth/signin"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show the main app
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          <StatsGrid
            totalCalories={totalCalories}
            totalCarbs={totalCarbs}
            totalProtein={totalProtein}
            totalFat={totalFat}
            remainingCalories={remainingCalories}
            entriesCount={dailyLogs.length}
            recommendedCalories={recommendedCalories}
          />

          <MainContent
            totalCalories={totalCalories}
            recommendedCalories={recommendedCalories}
            catalogItems={catalogItems}
            dailyLogs={dailyLogs}
            addingToLog={addingToLog}
            deletingFromLog={deletingFromLog}
            onAddToCatalog={addToCatalog}
            onAddToLog={addIndividualFoodToLog}
            onAddMeal={handleAddMeal}
            onDeleteFromLog={deleteFromLog}
            onDeleteFromCatalog={deleteFromCatalog}
          />
        </main>

        <QuickAddButton
          onAddFood={() => {}} // This will be handled by the catalog
          onAddMeal={() => {}} // This will be handled by the meals tab
          isVisible={true}
        />
      </div>
    </AuthGuard>
  );
}
