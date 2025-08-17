'use client';

import { useState } from 'react';
import type { AppPreferences } from '../../hooks/useUserSettings';

interface AppPreferencesProps {
  preferences: AppPreferences;
  onSave: (preferences: AppPreferences) => Promise<boolean>;
  saving: boolean;
}

export default function AppPreferences({ preferences, onSave, saving }: AppPreferencesProps) {
  const [formData, setFormData] = useState<AppPreferences>(preferences);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof AppPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">App Preferences</h3>
        <p className="text-sm text-gray-600">Customize your app experience and notification settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme Settings */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            id="theme"
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value as 'light' | 'dark' | 'system')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose your preferred app appearance</p>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
              <p className="text-xs text-gray-500">Receive reminders and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.notifications}
                onChange={(e) => handleInputChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="weekly_reports" className="text-sm font-medium text-gray-700">
                Weekly Reports
              </label>
              <p className="text-xs text-gray-500">Get weekly nutrition summaries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="weekly_reports"
                checked={formData.weekly_reports}
                onChange={(e) => handleInputChange('weekly_reports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Reminder Time */}
        <div>
          <label htmlFor="reminder_time" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Reminder Time
          </label>
          <input
            type="time"
            id="reminder_time"
            value={formData.reminder_time || '18:00'}
            onChange={(e) => handleInputChange('reminder_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">When to remind you to log your meals</p>
        </div>

        {/* Data Management */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Data Management</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Export Data</p>
                <p className="text-xs text-gray-500">Download your nutrition data</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Export
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Clear Data</p>
                <p className="text-xs text-gray-500">Remove all your nutrition data</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>

          {showSuccess && (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Preferences saved successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
