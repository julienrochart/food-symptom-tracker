import React, { useState } from 'react';
import { X, Utensils, Apple, Coffee, Sandwich, Pizza, Salad, Fish, Beef, Egg, Milk, Grape, Banana, Carrot, Wheat, Dice1 as Rice, Trash2, Cookie, Candy, Cherry, Croissant, Donut, Zap, Leaf, Droplets, AlertTriangle, Plus, Star, Soup, Cake, IceCream, Popcorn, Delete as Pretzel, Heading as Bread, Search, ExternalLink } from 'lucide-react';
import { saveFoodEntry, getCustomFoods, saveCustomFood, deleteCustomFood } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { CustomFood } from '../../types';

const FOOD_OPTIONS = [
  // LOW FODMAP FRUITS (prefer)
  { icon: Banana, name: 'Firm Banana', category: 'low-fodmap-fruit' },
  { icon: Apple, name: 'Orange', category: 'low-fodmap-fruit' },
  { icon: Apple, name: 'Clementine', category: 'low-fodmap-fruit' },
  { icon: Apple, name: 'Grapefruit', category: 'low-fodmap-fruit' },
  { icon: Apple, name: 'Kiwi', category: 'low-fodmap-fruit' },
  { icon: Cherry, name: 'Strawberry', category: 'low-fodmap-fruit' },
  { icon: Cherry, name: 'Blueberry', category: 'low-fodmap-fruit' },
  { icon: Grape, name: 'Grapes', category: 'low-fodmap-fruit' },
  { icon: Apple, name: 'Pineapple', category: 'low-fodmap-fruit' },
  { icon: Apple, name: 'Papaya', category: 'low-fodmap-fruit' },

  // LOW FODMAP VEGETABLES (prefer)
  { icon: Carrot, name: 'Carrot', category: 'low-fodmap-vegetable' },
  { icon: Salad, name: 'Cucumber', category: 'low-fodmap-vegetable' },
  { icon: Salad, name: 'Lettuce/Rocket', category: 'low-fodmap-vegetable' },
  { icon: Salad, name: 'Spinach', category: 'low-fodmap-vegetable' },
  { icon: Cherry, name: 'Tomato', category: 'low-fodmap-vegetable' },
  { icon: Salad, name: 'Zucchini', category: 'low-fodmap-vegetable' },
  { icon: Carrot, name: 'Bell Pepper', category: 'low-fodmap-vegetable' },
  { icon: Salad, name: 'Eggplant', category: 'low-fodmap-vegetable' },
  { icon: Salad, name: 'Green Bean', category: 'low-fodmap-vegetable' },
  { icon: Carrot, name: 'Potato', category: 'low-fodmap-vegetable' },
  { icon: Carrot, name: 'Sweet Potato (small)', category: 'low-fodmap-vegetable' },
  { icon: Carrot, name: 'Pumpkin/Kabocha', category: 'low-fodmap-vegetable' },

  // LOW FODMAP HERBS/SPICES (prefer)
  { icon: Leaf, name: 'Chives', category: 'low-fodmap-herb' },
  { icon: Leaf, name: 'Parsley', category: 'low-fodmap-herb' },
  { icon: Leaf, name: 'Cilantro', category: 'low-fodmap-herb' },
  { icon: Leaf, name: 'Basil', category: 'low-fodmap-herb' },
  { icon: Leaf, name: 'Dill', category: 'low-fodmap-herb' },
  { icon: Leaf, name: 'Ginger', category: 'low-fodmap-herb' },
  { icon: Leaf, name: 'Turmeric', category: 'low-fodmap-herb' },

  // LOW FODMAP GRAINS/STARCHES (prefer)
  { icon: Rice, name: 'Rice', category: 'low-fodmap-grain' },
  { icon: Rice, name: 'Quinoa', category: 'low-fodmap-grain' },
  { icon: Rice, name: 'Buckwheat', category: 'low-fodmap-grain' },
  { icon: Rice, name: 'Millet', category: 'low-fodmap-grain' },
  { icon: Rice, name: 'Corn/Polenta', category: 'low-fodmap-grain' },
  { icon: Rice, name: 'Rolled Oats (small)', category: 'low-fodmap-grain' },
  { icon: Wheat, name: 'GF Bread/Pasta', category: 'low-fodmap-grain' },
  { icon: Rice, name: 'Corn Tortillas', category: 'low-fodmap-grain' },

  // LOW FODMAP PROTEINS (prefer)
  { icon: Fish, name: 'Fish', category: 'low-fodmap-protein' },
  { icon: Beef, name: 'Meat', category: 'low-fodmap-protein' },
  { icon: Egg, name: 'Eggs', category: 'low-fodmap-protein' },
  { icon: Fish, name: 'Chicken', category: 'low-fodmap-protein' },
  { icon: Beef, name: 'Firm Tofu', category: 'low-fodmap-protein' },
  { icon: Beef, name: 'Tempeh', category: 'low-fodmap-protein' },
  { icon: Fish, name: 'Seafood', category: 'low-fodmap-protein' },

  // LOW FODMAP DAIRY (prefer)
  { icon: Milk, name: 'Lactose-free Milk', category: 'low-fodmap-dairy' },
  { icon: Milk, name: 'Lactose-free Yogurt', category: 'low-fodmap-dairy' },
  { icon: Milk, name: 'Hard Cheese', category: 'low-fodmap-dairy' },
  { icon: Milk, name: 'Butter/Ghee', category: 'low-fodmap-dairy' },
  { icon: Milk, name: 'Rice/Oat/Almond Milk', category: 'low-fodmap-dairy' },

  // LOW FODMAP NUTS/SEEDS (prefer)
  { icon: Cherry, name: 'Peanuts', category: 'low-fodmap-nuts' },
  { icon: Cherry, name: 'Walnuts', category: 'low-fodmap-nuts' },
  { icon: Cherry, name: 'Pecans', category: 'low-fodmap-nuts' },
  { icon: Cherry, name: 'Macadamias', category: 'low-fodmap-nuts' },
  { icon: Cherry, name: 'Chia/Flax Seeds', category: 'low-fodmap-nuts' },
  { icon: Cherry, name: 'Peanut Butter', category: 'low-fodmap-nuts' },

  // LOW FODMAP BEVERAGES (prefer)
  { icon: Coffee, name: 'Coffee', category: 'low-fodmap-beverage' },
  { icon: Coffee, name: 'Tea', category: 'low-fodmap-beverage' },
  { icon: Droplets, name: 'Water', category: 'low-fodmap-beverage' },
  { icon: Coffee, name: 'Peppermint Tea', category: 'low-fodmap-beverage' },
  { icon: Coffee, name: 'Ginger Tea', category: 'low-fodmap-beverage' },
  { icon: Coffee, name: 'Small Wine/Gin', category: 'low-fodmap-beverage' },

  // LOW FODMAP SNACKS (prefer)
  { icon: Cookie, name: 'Rice Cakes', category: 'low-fodmap-snack' },
  { icon: Cookie, name: 'GF Crackers', category: 'low-fodmap-snack' },
  { icon: Cookie, name: 'Corn Chips', category: 'low-fodmap-snack' },
  { icon: Cookie, name: 'Dark Chocolate', category: 'low-fodmap-snack' },
  { icon: Cookie, name: 'Popcorn', category: 'low-fodmap-snack' },
  { icon: Cookie, name: 'GF Oat Cookies', category: 'low-fodmap-snack' },

  // HIGH FODMAP FRUITS (limit/avoid)
  { icon: AlertTriangle, name: 'Apple', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Pear', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Mango', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Watermelon', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Cherry', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Plum', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Apricot', category: 'high-fodmap-fruit' },
  { icon: AlertTriangle, name: 'Very Ripe Banana', category: 'high-fodmap-fruit' },

  // HIGH FODMAP VEGETABLES (limit/avoid)
  { icon: AlertTriangle, name: 'Onion', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Garlic', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Leek (white part)', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Cauliflower', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Mushrooms', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Artichoke', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Asparagus', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Chickpeas (large)', category: 'high-fodmap-vegetable' },
  { icon: AlertTriangle, name: 'Lentils (large)', category: 'high-fodmap-vegetable' },

  // HIGH FODMAP GRAINS (limit/avoid)
  { icon: AlertTriangle, name: 'Wheat Bread', category: 'high-fodmap-grain' },
  { icon: AlertTriangle, name: 'Wheat Pasta', category: 'high-fodmap-grain' },
  { icon: AlertTriangle, name: 'Rye', category: 'high-fodmap-grain' },
  { icon: AlertTriangle, name: 'Barley', category: 'high-fodmap-grain' },

  // HIGH FODMAP DAIRY (limit/avoid)
  { icon: AlertTriangle, name: 'Regular Milk', category: 'high-fodmap-dairy' },
  { icon: AlertTriangle, name: 'Regular Yogurt', category: 'high-fodmap-dairy' },
  { icon: AlertTriangle, name: 'Soft Cheese', category: 'high-fodmap-dairy' },

  // HIGH FODMAP NUTS (limit/avoid)
  { icon: AlertTriangle, name: 'Pistachios', category: 'high-fodmap-nuts' },
  { icon: AlertTriangle, name: 'Cashews', category: 'high-fodmap-nuts' },

  // HIGH FODMAP SUGARS/SWEETENERS (limit/avoid)
  { icon: AlertTriangle, name: 'Honey', category: 'high-fodmap-sugar' },
  { icon: AlertTriangle, name: 'Agave Syrup', category: 'high-fodmap-sugar' },
  { icon: AlertTriangle, name: 'Sorbitol/Xylitol', category: 'high-fodmap-sugar' },

  // HIGH FODMAP BEVERAGES (limit/avoid)
  { icon: AlertTriangle, name: 'Apple/Pear Juice', category: 'high-fodmap-beverage' },
  { icon: AlertTriangle, name: 'Mango Juice', category: 'high-fodmap-beverage' },
  { icon: AlertTriangle, name: 'Diet Soda (polyols)', category: 'high-fodmap-beverage' },
  { icon: AlertTriangle, name: 'Fruit Smoothies', category: 'high-fodmap-beverage' },

  // HIGH FODMAP SNACKS (limit/avoid)
  { icon: AlertTriangle, name: 'Regular Cookies', category: 'high-fodmap-snack' },
  { icon: AlertTriangle, name: 'Wheat Crackers', category: 'high-fodmap-snack' },
  { icon: AlertTriangle, name: 'Granola Bars', category: 'high-fodmap-snack' },
  { icon: AlertTriangle, name: 'Protein Bars (inulin)', category: 'high-fodmap-snack' },
  { icon: AlertTriangle, name: 'Sugar-free Gum', category: 'high-fodmap-snack' },
];

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

const CATEGORY_COLORS = {
  // Low FODMAP categories (green tones - preferred)
  'low-fodmap-fruit': 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100',
  'low-fodmap-vegetable': 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100',
  'low-fodmap-herb': 'bg-lime-50 border-lime-300 text-lime-800 hover:bg-lime-100',
  'low-fodmap-grain': 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100',
  'low-fodmap-protein': 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100',
  'low-fodmap-dairy': 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100',
  'low-fodmap-nuts': 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100',
  'low-fodmap-beverage': 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100',
  'low-fodmap-snack': 'bg-violet-50 border-violet-300 text-violet-800 hover:bg-violet-100',
  
  // High FODMAP categories (red/orange tones - limit/avoid)
  'high-fodmap-fruit': 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100',
  'high-fodmap-vegetable': 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100',
  'high-fodmap-grain': 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100',
  'high-fodmap-dairy': 'bg-pink-50 border-pink-300 text-pink-800 hover:bg-pink-100',
  'high-fodmap-nuts': 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100',
  'high-fodmap-sugar': 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100',
  'high-fodmap-beverage': 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200',
  'high-fodmap-snack': 'bg-orange-100 border-orange-400 text-orange-900 hover:bg-orange-200',
};

interface SelectedFood {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

interface FoodEntryFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSaved: () => void;
  onOpenCustomFoods?: () => void;
}

export function FoodEntryForm({ selectedDate, onClose, onSaved, onOpenCustomFoods }: FoodEntryFormProps) {
  const [step, setStep] = useState(1);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack' | 'evening_snack'>('breakfast');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
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
    try {
      const foods = await getCustomFoods(user.uid);
      setCustomFoods(foods);
    } catch (error) {
      console.error('Error loading custom foods:', error);
    }
  };

  const filterCategories = [
    { key: 'all', label: 'All Foods' },
    { key: 'custom', label: 'My Foods' },
    { key: 'fruit', label: 'Fruits' },
    { key: 'vegetable', label: 'Vegetables' },
    { key: 'herb', label: 'Herbs/Spices' },
    { key: 'grain', label: 'Grains' },
    { key: 'protein', label: 'Proteins' },
    { key: 'dairy', label: 'Dairy' },
    { key: 'nuts', label: 'Nuts/Seeds' },
    { key: 'snack', label: 'Snacks' },
  ];

  const getFilteredFoods = () => {
    let foods;
    if (activeFilter === 'all') {
      // Combine default foods with custom foods
      const customFoodOptions = customFoods.map(food => ({
        icon: Star, // We'll use Star for now, but could store icon preference later
        name: food.food_name,
        category: food.category
      }));
      foods = [...FOOD_OPTIONS, ...customFoodOptions];
    }
    
    else if (activeFilter === 'custom') {
      foods = customFoods.map(food => ({
        icon: Star, // We'll use Star for now, but could store icon preference later
        name: food.food_name,
        category: food.category
      }));
    }
    
    else {
      foods = FOOD_OPTIONS.filter(food => {
      const categoryType = food.category.split('-').pop(); // Gets 'fruit', 'vegetable', etc.
      return categoryType === activeFilter;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      foods = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return foods;
  };

  const addFood = (food: typeof FOOD_OPTIONS[0]) => {
    const newSelectedFood: SelectedFood = {
      id: Math.random().toString(36).substr(2, 9),
      name: food.name,
      icon: food.icon,
      category: food.category
    };
    setSelectedFoods(prev => [...prev, newSelectedFood]);
  };

  const removeFood = (id: string) => {
    setSelectedFoods(prev => prev.filter(food => food.id !== id));
  };

  const handleDeleteCustomFood = async (foodName: string) => {
    const customFood = customFoods.find(food => food.food_name === foodName);
    if (!customFood?.id) return;
    
    if (window.confirm(`Are you sure you want to delete "${foodName}"?`)) {
      try {
        await deleteCustomFood(customFood.id);
        await loadCustomFoods(); // Refresh the list
        
        // Remove from selected foods if it was selected
        setSelectedFoods(prev => prev.filter(selected => selected.name !== foodName));
      } catch (error) {
        console.error('Error deleting custom food:', error);
        setError('Failed to delete custom food');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedFoods.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const eatenAt = new Date(selectedDate);
      eatenAt.setHours(12, 0, 0, 0); // Set to noon as default time

      // Group foods by name and count quantities
      const foodCounts = selectedFoods.reduce((acc, food) => {
        acc[food.name] = (acc[food.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Save each unique food with its quantity
      for (const [foodName, quantity] of Object.entries(foodCounts)) {
        await saveFoodEntry({
          user_id: user.uid,
          food_name: foodName,
          meal_type: mealType,
          quantity,
          notes: notes || null,
          eaten_at: eatenAt.toISOString(),
        });
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save food entries');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedFoods.length === 0) {
      setError('Please select at least one food item');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {step === 1 && 'Step 1: Select Foods'}
              {step === 2 && 'Step 2: Choose Time'}
              {step === 3 && 'Step 3: Add Notes'}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Food Selection */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Foods *
                <span className="text-xs text-gray-500 ml-2">
                  (Green = Low FODMAP preferred, Red/Orange = High FODMAP limit/avoid)
                </span>
              </label>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1 mb-3">
                {filterCategories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveFilter(category.key)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      activeFilter === category.key
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search foods..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto mb-4">
                {getFilteredFoods().map((food) => {
                  const IconComponent = food.icon;
                  const isCustomFood = customFoods.some(customFood => customFood.food_name === food.name);
                  return (
                    <div
                      key={food.name}
                      className={`relative p-3 border-2 rounded-lg transition-all flex flex-col items-center justify-between min-h-[80px] group ${
                        CATEGORY_COLORS[food.category as keyof typeof CATEGORY_COLORS]
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => addFood(food)}
                        className="flex flex-col items-center space-y-1 flex-1 justify-center"
                      >
                        <IconComponent className="w-6 h-6" />
                        <span className="text-xs font-medium text-center leading-tight">{food.name}</span>
                      </button>

                      {isCustomFood && (
                        <div className="w-full flex justify-center mt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomFood(food.name);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete custom food"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {getFilteredFoods().length === 0 && searchQuery && (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No foods found for "{searchQuery}"</p>
                    <p className="text-xs mt-1">Try a different search term or add a custom food</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onOpenCustomFoods}
                  className="p-3 border-2 border-dashed border-gray-300 rounded-lg transition-all flex flex-col items-center space-y-1 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="text-xs font-medium text-center leading-tight">Manage Foods</span>
                </button>
              </div>

              {selectedFoods.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Foods:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFoods.map((food) => {
                      const IconComponent = food.icon;
                      return (
                        <div
                          key={food.id}
                          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium flex-1">{food.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFood(food.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            title="Remove from selection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedFoods.length === 0 && (
                <p className="text-red-500 text-xs mt-1">Please select at least one food item</p>
              )}
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                When did you eat this?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
                  { value: 'morning_snack', label: 'Morning Snack', icon: '☕' },
                  { value: 'lunch', label: 'Lunch', icon: '☀️' },
                  { value: 'afternoon_snack', label: 'Afternoon Snack', icon: '🍎' },
                  { value: 'dinner', label: 'Dinner', icon: '🌙' },
                  { value: 'evening_snack', label: 'Evening Snack', icon: '🌃' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMealType(option.value as any)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      mealType === option.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium text-gray-700">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Notes */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details about this meal..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add details like portion size, preparation method, or how you felt after eating.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex space-x-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                disabled={loading || selectedFoods.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : `Save ${selectedFoods.length} Item${selectedFoods.length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </form>
    </div>
  );
}