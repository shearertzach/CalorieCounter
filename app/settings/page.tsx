'use client';

import { useState } from 'react';
import { useSupabase } from '../providers';
import { AuthGuard, Header, ProfileSettings, NutritionGoals, AppPreferences } from '../components';
import { useUserSettings } from '../hooks/useUserSettings';

type SettingsTab = 'profile' | 'nutrition' | 'preferences';

export default function SettingsPage() {
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const {
    profile,
    nutritionGoals,
    appPreferences,
    loading,
    saving,
    saveProfile,
    saveNutritionGoals,
    saveAppPreferences,
    calculateRecommendedGoals
  } = useUserSettings(user);

  const tabs = [
    { id: 'profile' as SettingsTab, name: 'Profile', icon: '👤' },
    { id: 'nutrition' as SettingsTab, name: 'Nutrition Goals', icon: '🎯' },
    { id: 'preferences' as SettingsTab, name: 'App Preferences', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  if (!profile) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
              <p className="text-gray-600">Unable to load your profile information.</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your profile, nutrition goals, and app preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl">
            {activeTab === 'profile' && (
              <ProfileSettings
                profile={profile}
                onSave={saveProfile}
                saving={saving}
                unitSystem={appPreferences.unit_system}
              />
            )}

            {activeTab === 'nutrition' && (
              <NutritionGoals
                goals={nutritionGoals}
                onSave={saveNutritionGoals}
                onCalculateRecommended={calculateRecommendedGoals}
                saving={saving}
              />
            )}

            {activeTab === 'preferences' && (
              <AppPreferences
                preferences={appPreferences}
                onSave={saveAppPreferences}
                saving={saving}
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-medium text-gray-900">View Progress</h4>
                  <p className="text-sm text-gray-600">Check your nutrition progress</p>
                </button>
                
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium text-gray-900">Mobile App</h4>
                  <p className="text-sm text-gray-600">Download mobile app</p>
                </button>
                
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200">
                  <div className="text-2xl mb-2">❓</div>
                  <h4 className="font-medium text-gray-900">Help & Support</h4>
                  <p className="text-sm text-gray-600">Get help and support</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
