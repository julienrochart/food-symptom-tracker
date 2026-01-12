import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Utensils, Activity, Clock, Trash2 } from 'lucide-react';
import { getFoodEntries, getSymptomEntries, deleteFoodEntry, deleteSymptomEntry } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { FoodEntry, SymptomEntry } from '../../types';

interface DailyViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  refreshKey: number;
}

export function DailyView({ selectedDate, onDateChange, refreshKey }: DailyViewProps) {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDayData();
    }
  }, [user, selectedDate, refreshKey]);

  const fetchDayData = async () => {
    if (!user) return;

    setLoading(true);
    const startDate = startOfDay(selectedDate);
    const endDate = endOfDay(selectedDate);

    try {
      const allFoodEntries = await getFoodEntries(user.uid);
      const allSymptomEntries = await getSymptomEntries(user.uid);
      
      // Filter entries for the selected date
      const dayFoodEntries = allFoodEntries.filter(entry => {
        const entryDate = new Date(entry.eaten_at);
        return entryDate >= startDate && entryDate <= endDate;
      }).sort((a, b) => new Date(a.eaten_at).getTime() - new Date(b.eaten_at).getTime());
      
      const daySymptomEntries = allSymptomEntries.filter(entry => {
        const entryDate = new Date(entry.occurred_at);
        return entryDate >= startDate && entryDate <= endDate;
      }).sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
      
      setFoodEntries(dayFoodEntries);
      setSymptomEntries(daySymptomEntries);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeColor = (mealType: string) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-700',
      morning_snack: 'bg-green-100 text-green-700',
      lunch: 'bg-orange-100 text-orange-700',
      afternoon_snack: 'bg-blue-100 text-blue-700',
      dinner: 'bg-purple-100 text-purple-700',
      evening_snack: 'bg-pink-100 text-pink-700'
    };
    return colors[mealType as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-700';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-700'; 
    return 'bg-red-100 text-red-700';
  };

  const handleDeleteFoodEntry = async (entryId: string) => {
    if (!entryId) return;
    
    if (window.confirm('Are you sure you want to delete this food entry?')) {
      try {
        await deleteFoodEntry(entryId);
        // Refresh the data
        await fetchDayData();
      } catch (error) {
        console.error('Error deleting food entry:', error);
      }
    }
  };

  const handleDeleteSymptomEntry = async (entryId: string) => {
    if (!entryId) return;
    
    if (window.confirm('Are you sure you want to delete this symptom entry?')) {
      try {
        await deleteSymptomEntry(entryId);
        // Refresh the data
        await fetchDayData();
      } catch (error) {
        console.error('Error deleting symptom entry:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDateChange(subDays(selectedDate, 1))}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => onDateChange(addDays(selectedDate, 1))}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading entries...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {foodEntries.length === 0 && symptomEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No entries for this day yet.</p>
                <p className="text-gray-400 text-sm mt-1">Start by adding a food entry or logging a symptom.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Food Entries */}
                {foodEntries.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Utensils className="w-5 h-5 mr-2 text-green-600" />
                      Food Entries
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {foodEntries.map((entry) => (
                        <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{entry.food_name}</h5>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <div className="flex flex-col items-end space-y-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(entry.meal_type)}`}>
                                  {entry.meal_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteFoodEntry(entry.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete food entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Quantity: {entry.quantity} {entry.quantity === 1 ? 'serving' : 'servings'}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{entry.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Symptom Entries */}
                {symptomEntries.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Symptoms
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {symptomEntries.map((entry) => (
                        <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{entry.symptom_name}</h5>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {format(new Date(entry.occurred_at), 'h:mm a')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                                {entry.severity <= 3 ? 'Mild' : entry.severity <= 6 ? 'Moderate' : 'Severe'}
                              </span>
                              <button
                                onClick={() => handleDeleteSymptomEntry(entry.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete symptom entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{entry.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}