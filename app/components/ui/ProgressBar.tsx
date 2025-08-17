interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ current, target, label, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOverTarget = current > target;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-600">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${
              isOverTarget 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">0 cal</span>
          <span className="text-gray-600">{target} cal</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {current.toLocaleString()} cal
          </span>
          {isOverTarget && (
            <span className="text-sm text-red-600 font-medium">
              +{(current - target).toLocaleString()} over
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
