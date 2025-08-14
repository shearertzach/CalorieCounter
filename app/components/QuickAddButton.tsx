import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickAddButtonProps {
  onAddFood: () => void;
  onAddMeal: () => void;
  isVisible: boolean;
}

export default function QuickAddButton({ onAddFood, onAddMeal, isVisible }: QuickAddButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-3">
          <button
            onClick={() => {
              router.push('/catalog');
              setIsExpanded(false);
            }}
            className="flex items-center space-x-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 transform hover:scale-105 whitespace-nowrap min-w-[160px]"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-medium text-sm">Add Food</span>
          </button>

          <button
            onClick={() => {
              onAddMeal();
              setIsExpanded(false);
            }}
            className="flex items-center space-x-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 transform hover:scale-105 whitespace-nowrap min-w-[160px]"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="font-medium text-sm">Create Meal</span>
          </button>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}
