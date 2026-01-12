import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Utensils, Activity } from 'lucide-react';
import { getFoodEntries, getSymptomEntries } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface StatsData {
  totalFoodEntries: number;
  totalSymptomEntries: number;
  avgSeverity: number;
  mostCommonMeal: string;
  mostCommonSymptom: string;
}

export function StatsView() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, period]);

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);
    const daysAgo = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), daysAgo));
    const endDate = endOfDay(new Date());

    try {
      const allFoodEntries = await getFoodEntries(user.uid);
      const allSymptomEntries = await getSymptomEntries(user.uid);
      
      // Filter entries for the selected period
      const foodEntries = allFoodEntries.filter(entry => {
        const entryDate = new Date(entry.eaten_at);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      const symptomEntries = allSymptomEntries.filter(entry => {
        const entryDate = new Date(entry.occurred_at);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Calculate stats
      const totalFoodEntries = foodEntries.length;
      const totalSymptomEntries = symptomEntries.length;
      
      const avgSeverity = symptomEntries.length > 0 
        ? symptomEntries.reduce((sum, entry) => sum + entry.severity, 0) / symptomEntries.length
        : 0;

      // Most common meal type
      const mealCounts = foodEntries.reduce((acc, entry) => {
        acc[entry.meal_type] = (acc[entry.meal_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostCommonMeal = Object.keys(mealCounts).reduce((a, b) => 
        mealCounts[a] > mealCounts[b] ? a : b, 'breakfast'
      );

      // Most common symptom
      const symptomCounts = symptomEntries.reduce((acc, entry) => {
        acc[entry.symptom_name] = (acc[entry.symptom_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostCommonSymptom = Object.keys(symptomCounts).reduce((a, b) => 
        symptomCounts[a] > symptomCounts[b] ? a : b, 'None'
      );

      setStats({
        totalFoodEntries,
        totalSymptomEntries,
        avgSeverity,
        mostCommonMeal: totalFoodEntries > 0 ? mostCommonMeal : 'None',
        mostCommonSymptom: totalSymptomEntries > 0 ? mostCommonSymptom : 'None'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Health Insights
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('7')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              period === '7' 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setPeriod('30')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              period === '30' 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            30 days
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Food Entries</p>
                <p className="text-2xl font-bold text-green-700">{stats.totalFoodEntries}</p>
              </div>
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Symptoms</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalSymptomEntries}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg Severity</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.avgSeverity > 0 ? stats.avgSeverity.toFixed(1) : '0'}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Top Meal</p>
                <p className="text-lg font-bold text-purple-700 capitalize">
                  {stats.mostCommonMeal}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {stats && stats.totalFoodEntries === 0 && stats.totalSymptomEntries === 0 && (
        <div className="text-center py-8">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No data available for the selected period.</p>
          <p className="text-gray-400 text-sm mt-1">Start logging your food and symptoms to see insights.</p>
        </div>
      )}
    </div>
  );
}