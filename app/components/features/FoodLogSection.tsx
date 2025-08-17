import DailyFoodLog from '../data/DailyFoodLog';
import { DailyFoodLog as DailyFoodLogType, FoodCatalogItem } from '../../types';

interface FoodLogSectionProps {
  dailyLogs: DailyFoodLogType[];
  catalogItems: FoodCatalogItem[];
  addingToLog: boolean;
  deletingFromLog: boolean;
  onDeleteFromLog: (id: string) => void;
  onEditLog: (log: any) => void;
  onAddLogEntry: () => void;
}

export default function FoodLogSection({
  dailyLogs,
  catalogItems,
  addingToLog,
  deletingFromLog,
  onDeleteFromLog,
  onEditLog,
  onAddLogEntry
}: FoodLogSectionProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Today's Food Log</h2>
          <p className="text-sm text-gray-600 mb-3">Track what you've eaten today</p>
          <button
            onClick={onAddLogEntry}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
          >
            Add Log Entry
          </button>
        </div>

        <div className="p-4">
          <DailyFoodLog
            dailyLogs={dailyLogs}
            catalogItems={catalogItems}
            addingToLog={addingToLog}
            deletingFromLog={deletingFromLog}
            onDeleteFromLog={onDeleteFromLog}
            onEditLog={onEditLog}
          />
        </div>
      </div>
    </div>
  );
}
