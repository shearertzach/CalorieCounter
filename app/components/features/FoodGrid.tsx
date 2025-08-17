import { FoodCatalogItem } from '../../types';

interface FoodGridProps {
  items: FoodCatalogItem[];
  onViewFood: (food: FoodCatalogItem) => void;
}

export default function FoodGrid({ items, onViewFood }: FoodGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No foods found</h3>
        <p className="text-gray-600">Try adjusting your search or add a new food to your catalog.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onViewFood(item)}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer group hover-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
              {item.name}
            </h3>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Calories</span>
              <span className="font-semibold text-blue-600">{item.calories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Protein</span>
              <span className="font-semibold text-purple-600">{item.protein}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Carbs</span>
              <span className="font-semibold text-green-600">{item.carbs}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fat</span>
              <span className="font-semibold text-orange-600">{item.totalFat}g</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Added {item.created_at.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
