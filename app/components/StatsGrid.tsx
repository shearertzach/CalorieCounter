import StatsCard from './StatsCard';

interface StatsGridProps {
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  remainingCalories: number;
  entriesCount: number;
  recommendedCalories: number;
}

export default function StatsGrid({ 
  totalCalories, 
  totalCarbs,
  totalProtein,
  totalFat,
  remainingCalories, 
  entriesCount, 
  recommendedCalories 
}: StatsGridProps) {
  const trend = Math.round((totalCalories / recommendedCalories) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Calories Today"
        value={totalCalories.toLocaleString()}
        subtitle="Daily intake"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        color="blue"
        trend={{ value: trend, isPositive: totalCalories <= recommendedCalories }}
      />
      
      <StatsCard
        title="Carbs"
        value={`${totalCarbs}g`}
        subtitle="Daily carbs"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        color="green"
      />
      
      <StatsCard
        title="Protein"
        value={`${totalProtein}g`}
        subtitle="Daily protein"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        color="purple"
      />
      
      <StatsCard
        title="Total Fat"
        value={`${totalFat}g`}
        subtitle="Daily fat"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="orange"
      />
    </div>
  );
}
