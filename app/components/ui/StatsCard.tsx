interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  progress?: number;
  target?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600'
};

export default function StatsCard({ title, value, subtitle, icon, color, progress, target, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-slideInUp hover-lift">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <svg className={`w-3 h-3 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="font-medium">{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {/* Progress Bar for Macronutrients */}
      {progress !== undefined && target !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>0g</span>
            <span>{target}g</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                progress > 100 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : progress >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : `bg-gradient-to-r ${colorClasses[color]}`
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-center">
            <span className={`text-xs font-medium ${
              progress > 100 ? 'text-red-600' : progress >= 80 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {progress}% {progress > 100 ? 'over' : 'complete'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
