import { StatsCard } from "../ui";

interface StatsGridProps {
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  remainingCalories: number;
  remainingCarbs: number;
  remainingProtein: number;
  remainingFat: number;
  entriesCount: number;
  recommendedCalories: number;
  recommendedCarbs: number;
  recommendedProtein: number;
  recommendedFat: number;
}

export default function StatsGrid({ 
  totalCalories, 
  totalCarbs,
  totalProtein,
  totalFat,
  remainingCalories, 
  remainingCarbs,
  remainingProtein,
  remainingFat,
  entriesCount, 
  recommendedCalories,
  recommendedCarbs,
  recommendedProtein,
  recommendedFat
}: StatsGridProps) {
  const caloriesProgress = Math.round((totalCalories / recommendedCalories) * 100);
  const carbsProgress = Math.round((totalCarbs / recommendedCarbs) * 100);
  const proteinProgress = Math.round((totalProtein / recommendedProtein) * 100);
  const fatProgress = Math.round((totalFat / recommendedFat) * 100);

  return (
    <div className="space-y-4 mb-6">
      {/* Main Calories Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-slideInUp hover-lift transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Daily Calories</h3>
              <p className="text-xs text-gray-600">{entriesCount} entries today</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{totalCalories.toLocaleString()}</div>
            <div className="text-xs text-gray-600">/ {recommendedCalories.toLocaleString()} cal</div>
            <div className={`text-xs font-medium ${caloriesProgress <= 100 ? 'text-green-600' : 'text-red-600'}`}>
              {caloriesProgress}% {caloriesProgress > 100 ? 'over' : 'complete'}
            </div>
          </div>
        </div>
        
        {/* Calories Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-3">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              caloriesProgress > 100 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : caloriesProgress >= 80
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>0 cal</span>
          <span>{recommendedCalories.toLocaleString()} cal</span>
        </div>
        
        {remainingCalories > 0 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-xs text-green-800">
              <span className="font-medium">{remainingCalories.toLocaleString()} calories remaining</span> to reach your daily goal
            </div>
          </div>
        )}
        
        {caloriesProgress > 100 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-xs text-red-800">
              <span className="font-medium">{(totalCalories - recommendedCalories).toLocaleString()} calories over</span> your daily goal
            </div>
          </div>
        )}
      </div>

      {/* Macronutrients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <StatsCard
          title="Carbohydrates"
          value={`${totalCarbs}g`}
          subtitle={`${remainingCarbs}g remaining`}
          progress={carbsProgress}
          target={recommendedCarbs}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="green"
        />
        
        <StatsCard
          title="Protein"
          value={`${totalProtein}g`}
          subtitle={`${remainingProtein}g remaining`}
          progress={proteinProgress}
          target={recommendedProtein}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
        />
        
        <StatsCard
          title="Fat"
          value={`${totalFat}g`}
          subtitle={`${remainingFat}g remaining`}
          progress={fatProgress}
          target={recommendedFat}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="orange"
        />
      </div>
    </div>
  );
}
