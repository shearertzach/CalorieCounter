export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  totalFat: number;
  // Optional nutritional fields
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
  transFat?: number;
  timestamp: Date;
  user_id?: string;
}

// New: Food catalog items that users can reuse
export interface FoodCatalogItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  totalFat: number;
  // Optional nutritional fields
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
  transFat?: number;
  user_id?: string;
  created_at: Date;
}

// New: Daily food log entries (either individual foods or meals)
export interface DailyFoodLog {
  id: string;
  type: 'individual' | 'meal';
  name: string; // Name of the food or meal
  timestamp: Date;
  user_id?: string;
  // For individual foods
  food_catalog_id?: string;
  quantity?: number;
  // For meals
  meal_id?: string;
  // Computed nutrition
  calories: number;
  carbs: number;
  protein: number;
  totalFat: number;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  user_id?: string;
  foods: MealFood[];
  // Computed totals
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
}

export interface MealFood {
  id: string;
  meal_id: string;
  food_catalog_id: string;
  quantity: number;
  food: FoodCatalogItem; // The actual food from catalog
}

export interface CreateMealData {
  name: string;
  description?: string;
  foods: {
    food_catalog_id: string;
    quantity: number;
  }[];
}

export interface CreateFoodCatalogItemData {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  totalFat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
  transFat?: number;
}
