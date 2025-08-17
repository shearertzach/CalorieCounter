'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '../providers';
import { 
  AuthGuard, 
  Header, 
  LoadingSpinner, 
  SearchAndFilterControls, 
  FoodGrid, 
  AddFoodModal, 
  EditFoodModal, 
  ViewFoodModal, 
  QuickAddModal 
} from '../components';
import { FoodCatalogItem, CreateFoodCatalogItemData } from '../types';
import { useCatalog } from '../hooks/useCatalog';

export default function FoodCatalogPage() {
  const { user } = useSupabase();
  const { catalogItems, loading, addFood, updateFood, deleteFood, addToDailyLog } = useCatalog(user?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'protein' | 'carbs'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodCatalogItem | null>(null);
  const [viewingFood, setViewingFood] = useState<FoodCatalogItem | null>(null);
  const [quickAddFood, setQuickAddFood] = useState<FoodCatalogItem | null>(null);

  const handleAddFood = async (foodData: CreateFoodCatalogItemData) => {
    const success = await addFood(foodData);
    if (success) {
      setIsAddingFood(false);
    }
  };

  const handleUpdateFood = async (foodData: CreateFoodCatalogItemData) => {
    if (!editingFood) return;
    
    const success = await updateFood(editingFood.id, foodData);
    if (success) {
      setEditingFood(null);
    }
  };

  const handleDeleteFood = async (id: string) => {
    await deleteFood(id);
  };

  const handleQuickAdd = async (quantity: number) => {
    if (!quickAddFood) return;
    
    const success = await addToDailyLog(quickAddFood, quantity);
    if (success) {
      setQuickAddFood(null);
    }
  };

  const handleViewFood = (food: FoodCatalogItem) => {
    setViewingFood(food);
  };

  const handleEditFood = (food: FoodCatalogItem) => {
    setEditingFood(food);
    setViewingFood(null);
  };

  const handleQuickAddFood = (food: FoodCatalogItem) => {
    setQuickAddFood(food);
    setViewingFood(null);
  };

  const handleCloseModals = () => {
    setIsAddingFood(false);
    setEditingFood(null);
    setViewingFood(null);
    setQuickAddFood(null);
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModals();
      }
    };

    if (isAddingFood || editingFood || viewingFood || quickAddFood) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isAddingFood, editingFood, viewingFood, quickAddFood]);

  // Filter and sort items
  const filteredAndSortedItems = catalogItems
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 animate-fadeIn">
        <Header />
        
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8 animate-slideInUp">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Catalog</h1>
              <p className="text-gray-600">Manage your personal food database</p>
            </div>
            <button
              onClick={() => setIsAddingFood(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add New Food
            </button>
          </div>

          <SearchAndFilterControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          {loading ? (
            <LoadingSpinner />
          ) : (
            <FoodGrid
              items={filteredAndSortedItems}
              onViewFood={handleViewFood}
            />
          )}
        </main>

        {/* Modals */}
        <AddFoodModal
          isOpen={isAddingFood}
          onClose={() => setIsAddingFood(false)}
          onSubmit={handleAddFood}
        />

        <EditFoodModal
          food={editingFood}
          isOpen={!!editingFood}
          onClose={() => setEditingFood(null)}
          onSubmit={handleUpdateFood}
        />

        <ViewFoodModal
          food={viewingFood}
          isOpen={!!viewingFood}
          onClose={() => setViewingFood(null)}
          onEdit={handleEditFood}
          onQuickAdd={handleQuickAddFood}
          onDelete={handleDeleteFood}
        />

        <QuickAddModal
          food={quickAddFood}
          isOpen={!!quickAddFood}
          onClose={() => setQuickAddFood(null)}
          onSubmit={handleQuickAdd}
        />
      </div>
    </AuthGuard>
  );
}
