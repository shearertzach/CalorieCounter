import { useState, useEffect } from 'react';
import { MealForm } from '../';
import { FoodCatalogItem, CreateFoodCatalogItemData, CreateMealData } from '../../types';

interface MainContentProps {
  catalogItems: FoodCatalogItem[];
  onAddMeal: (mealData: CreateMealData) => void;
  showMealForm?: boolean; // New prop to control meal form visibility
}

export default function MainContent({
  catalogItems,
  onAddMeal,
  showMealForm = false // Default to false for backward compatibility
}: MainContentProps) {
  const [isMealFormVisible, setIsMealFormVisible] = useState(showMealForm);

  const handleToggleMealForm = () => {
    setIsMealFormVisible(!isMealFormVisible);
  };

  // Update local state when prop changes
  useEffect(() => {
    setIsMealFormVisible(showMealForm);
  }, [showMealForm]);

  return (
    <div className="space-y-6">
      {/* Meal Form */}
      <MealForm
        isOpen={isMealFormVisible}
        onClose={handleToggleMealForm}
        onSubmit={onAddMeal}
        availableFoods={catalogItems}
      />
    </div>
  );
}
