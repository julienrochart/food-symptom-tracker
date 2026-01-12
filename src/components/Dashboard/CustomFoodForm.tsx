import React, { useState, useEffect } from 'react';
import { ArrowLeft, Apple, Banana, Cherry, Grape, Carrot, Salad, Leaf, Dice1 as Rice, Wheat, Heading as Bread, Fish, Beef, Egg, Milk, Coffee, Droplets, Cookie, Candy, Cake, IceCream, Pizza, Sandwich, Soup, Popcorn, Delete as Pretzel, Star, Utensils, Search, AlertTriangle, Trash2 } from 'lucide-react';
import { saveCustomFood, getCustomFoods, deleteCustomFood } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { CustomFood } from '../../types';

const FOOD_ICONS = [
  { icon: Apple, name: 'Apple' },
  { icon: Banana, name: 'Banana' },
  { icon: Cherry, name: 'Cherry' },
  { icon: Grape, name: 'Grape' },
  { icon: Carrot, name: 'Carrot' },
  { icon: Salad, name: 'Salad' },
  { icon: Leaf, name: 'Leaf' },
  { icon: Rice, name: 'Rice' },
  { icon: Wheat, name: 'Wheat' },
  { icon: Bread, name: 'Bread' },
  { icon: Fish, name: 'Fish' },
  { icon: Beef, name: 'Meat' },
  { icon: Egg, name: 'Egg' },
  { icon: Milk, name: 'Milk' },
  { icon: Coffee, name: 'Coffee' },
  { icon: Droplets, name: 'Water' },
  { icon: Cookie, name: 'Cookie' },
  { icon: Candy, name: 'Candy' },
  { icon: Cake, name: 'Cake' },
  { icon: IceCream, name: 'Ice Cream' },
  { icon: Pizza, name: 'Pizza' },
  { icon: Sandwich, name: 'Sandwich' },
  { icon: Soup, name: 'Soup' },
  { icon: Popcorn, name: 'Popcorn' },
  { icon: Pretzel, name: 'Pretzel' },
  { icon: Star, name: 'Star' },
  { icon: Utensils, name: 'Utensils' },
];

const FOOD_CATEGORIES = [
  { value: 'fruit', label: 'Fruit' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'herb', label: 'Herbs & Spices' },
  { value: 'grain', label: 'Grains & Starches' },
  { value: 'protein', label: 'Protein' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'nuts', label: 'Nuts & Seeds' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'meal', label: 'Complete Meal' },
  { value: 'other', label: 'Other' },
];

const FODMAP_LEVELS = [
  { value: 'low', label: 'Low FODMAP (Safe)' },
  { value: 'moderate', label: 'Moderate FODMAP (Caution)' },
  { value: 'high', label: 'High FODMAP (Limit/Avoid)' },
  { value: 'unknown', label: 'Unknown FODMAP Level' },
];

interface CustomFoodFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export function CustomFoodForm({ onClose, onSaved }: CustomFoodFormProps) {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add new food form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCategory, setNewFoodCategory] = useState('other');
  const [newFoodFodmap, setNewFoodFodmap] = useState('low');
  const [selectedIcon, setSelectedIcon] = useState(FOOD_ICONS[0]);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState<string[]>([]);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCustomFoods();
    }
  }, [user]);

  const loadCustomFoods = async () => {
    if (!user) return;
    setLoadingFoods(true);
    try {
      const foods = await getCustomFoods(user.uid);
      setCustomFoods(foods);
    } catch (error) {
      console.error('Error loading custom foods:', error);
      setError('Failed to load custom foods');
    } finally {
      setLoadingFoods(false);
    }
  };

  const checkForDuplicateFood = (foodName: string) => {
    if (!foodName.trim()) {
      setDuplicateWarning('');
      setFoodSuggestions([]);
      return;
    }

    const trimmedName = foodName.trim().toLowerCase();
    
    // Find similar foods for suggestions
    const allFoodNames = customFoods.map(food => food.food_name);
    
    const suggestions = allFoodNames.filter(name => 
      name.toLowerCase().includes(trimmedName) && 
      name.toLowerCase() !== trimmedName
    ).slice(0, 5);
    
    setFoodSuggestions(suggestions);
    
    // Check for exact duplicates
    const existsInCustom = customFoods.some(food => 
      food.food_name.toLowerCase() === trimmedName
    );
    
    if (existsInCustom) {
      setDuplicateWarning('This food already exists in your custom foods');
    } else {
      setDuplicateWarning('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewFoodName(suggestion);
    setShowSuggestions(false);
    checkForDuplicateFood(suggestion);
  };

  const handleAddCustomFood = async () => {
    if (!user || !newFoodName.trim() || duplicateWarning) return;

    setLoading(true);
    try {
      const combinedCategory = `${newFoodFodmap}-fodmap-${newFoodCategory}`;
      await saveCustomFood({
        user_id: user.uid,
        food_name: newFoodName.trim(),
        category: combinedCategory,
        notes: null
      });
      
      // Reset form
      setNewFoodName('');
      setNewFoodCategory('other');
      setNewFoodFodmap('low');
      setSelectedIcon(FOOD_ICONS[0]);
      setShowAddForm(false);
      setDuplicateWarning('');
      setFoodSuggestions([]);
      
      await loadCustomFoods();
      onSaved();
    } catch (error) {
      console.error('Error adding custom food:', error);
      setError('Failed to add custom food');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomFood = async (foodId: string, foodName: string) => {
    if (window.confirm(`Are you sure you want to delete "${foodName}"?`)) {
      try {
        await deleteCustomFood(foodId);
        await loadCustomFoods();
      } catch (error) {
        console.error('Error deleting custom food:', error);
        setError('Failed to delete custom food');
      }
    }
  };

  const getFilteredFoods = () => {
    if (!searchQuery.trim()) return customFoods;
    
    return customFoods.filter(food =>
      food.food_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFodmapColor = (category: string) => {
    if (category.includes('low-fodmap')) return 'bg-green-100 text-green-800';
    if (category.includes('moderate-fodmap')) return 'bg-yellow-100 text-yellow-800';
    if (category.includes('high-fodmap')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFodmapLabel = (category: string) => {
    if (category.includes('low-fodmap')) return 'Low FODMAP';
    if (category.includes('moderate-fodmap')) return 'Moderate FODMAP';
    if (category.includes('high-fodmap')) return 'High FODMAP';
    return 'Unknown FODMAP';
  };

  if (loadingFoods) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading custom foods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {!showAddForm ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Custom Foods</h3>
              <p className="text-sm text-gray-600">Manage your personal food database</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Add New Food</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your custom foods..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Custom Foods List */}
          <div className="space-y-3">
            {getFilteredFoods().length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'No foods found' : 'No custom foods yet'}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Try a different search term' : 'Add your first custom food to get started'}
                </p>
              </div>
            ) : (
              getFilteredFoods().map((food) => (
                <div key={food.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{food.food_name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">
                          {food.category.split('-').pop()?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFodmapColor(food.category)}`}>
                          {getFodmapLabel(food.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomFood(food.id!, food.food_name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete custom food"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Add New Food Form */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Custom Foods</span>
            </button>
            <h3 className="text-lg font-semibold text-gray-900">Add New Custom Food</h3>
            <p className="text-sm text-gray-600">Create a new food item for your personal database</p>
          </div>

          <div className="space-y-6">
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Icon
              </label>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {FOOD_ICONS.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => setSelectedIcon(iconOption)}
                      className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                        selectedIcon.name === iconOption.name
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Selected: {selectedIcon.name}</p>
            </div>

            {/* Food Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newFoodName}
                  onChange={(e) => {
                    setNewFoodName(e.target.value);
                    checkForDuplicateFood(e.target.value);
                  }}
                  onFocus={() => {
                    if (foodSuggestions.length > 0 && newFoodName.length > 1) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="e.g., My Special Recipe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && foodSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs text-gray-500 mb-2 flex items-center">
                        <Search className="w-3 h-3 mr-1" />
                        Similar foods found:
                      </p>
                      {foodSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {duplicateWarning && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {duplicateWarning}
                </p>
              )}
            </div>
            
            {/* Food Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Category
              </label>
              <select
                value={newFoodCategory}
                onChange={(e) => setNewFoodCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {FOOD_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* FODMAP Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                FODMAP Level
              </label>
              <select
                value={newFoodFodmap}
                onChange={(e) => setNewFoodFodmap(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {FODMAP_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {newFoodFodmap === 'low' && '✅ Generally safe for IBS/sensitive stomachs'}
                {newFoodFodmap === 'moderate' && '⚠️ May cause symptoms in some people'}
                {newFoodFodmap === 'high' && '🚫 Often triggers symptoms, limit or avoid'}
                {newFoodFodmap === 'unknown' && '❓ FODMAP level not determined yet'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomFood}
                disabled={loading || !newFoodName.trim() || !!duplicateWarning}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <selectedIcon.icon className="w-4 h-4" />
                    <span>Add Food</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}