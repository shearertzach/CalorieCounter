'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center animate-fadeIn ${className}`}>
      <div className="text-center animate-slideInUp">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4`}></div>
        {text && <p className="text-gray-600 animate-pulse">{text}</p>}
      </div>
    </div>
  );
}
