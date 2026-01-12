import React, { useState, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { DailyView } from './DailyView';
import { StatsView } from './StatsView';
import { AnalysisView } from './AnalysisView';
import { SetupMenu } from './SetupMenu';
import { FoodEntryForm } from './FoodEntryForm';
import { SymptomEntryForm } from './SymptomEntryForm';
import { ProfileForm } from './ProfileForm';
import { CustomFoodForm } from './CustomFoodForm';
import { Utensils, Activity, Calendar, BarChart3, User, Settings, TrendingUp, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'daily' | 'stats' | 'analysis' | 'roadmap' | 'add-food' | 'add-symptom' | 'profile' | 'custom-foods'>('daily');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSymptomAdded = () => {
    setRefreshKey(prev => prev + 1);
    setActiveView('daily');
  };

  const handleFoodAdded = () => {
    setRefreshKey(prev => prev + 1);
    setActiveView('daily');
  };

  const handleProfileSaved = () => {
    setActiveView('daily');
  };

  const handleCustomFoodSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  const goBack = () => {
    setActiveView('daily');
  };

  // Listen for shortcut events
  useEffect(() => {
    const handleOpenFoodForm = () => setActiveView('add-food');
    const handleOpenSymptomForm = () => setActiveView('add-symptom');

    window.addEventListener('open-food-form', handleOpenFoodForm);
    window.addEventListener('open-symptom-form', handleOpenSymptomForm);

    return () => {
      window.removeEventListener('open-food-form', handleOpenFoodForm);
      window.removeEventListener('open-symptom-form', handleOpenSymptomForm);
    };
  }, []);

  const getPageTitle = () => {
    switch (activeView) {
      case 'daily': return 'Health Dashboard';
      case 'stats': return 'Health Insights';
      case 'analysis': return 'Food-Symptom Analysis';
      case 'roadmap': return 'Development Roadmap';
      case 'add-food': return 'Add Food Entry';
      case 'add-symptom': return 'Log Symptoms';
      case 'profile': return 'My Profile';
      case 'custom-foods': return 'Custom Foods';
      default: return 'Health Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case 'daily': return `Track your food intake and symptoms for ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`;
      case 'stats': return 'View your health insights and patterns over time';
      case 'analysis': return 'Analyze correlations between foods and symptoms to identify potential triggers';
      case 'roadmap': return 'See what features are completed and what\'s coming next in HealthTracker';
      case 'add-food': return 'Add foods you\'ve eaten to track your daily intake';
      case 'add-symptom': return 'Log symptoms you\'re experiencing to identify patterns';
      case 'profile': return 'Manage your personal health information and preferences';
      case 'custom-foods': return 'Create and manage your personal food database with FODMAP levels';
      default: return 'Track your health journey';
    }
  };

  const isFormView = ['add-food', 'add-symptom', 'profile'].includes(activeView);
  const showMainTabs = !isFormView && !['roadmap', 'custom-foods'].includes(activeView);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            {isFormView && (
              <button
                onClick={goBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h2>
          </div>
          <p className="text-gray-600">
            {getPageDescription()}
          </p>
        </div>

        {showMainTabs && activeView !== 'analysis' && (
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
              <button
                onClick={() => setActiveView('daily')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'daily'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Daily View</span>
              </button>
              <button
                onClick={() => setActiveView('stats')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'stats'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Insights</span>
              </button>
            </div>
          </div>
        )}

        <div className="pb-20">
          {activeView === 'daily' && (
            <DailyView 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
              refreshKey={refreshKey}
            />
          )}
          {activeView === 'stats' && (
            <StatsView />
          )}
          {activeView === 'analysis' && (
            <AnalysisView />
          )}
          {activeView === 'roadmap' && (
            <SetupMenu />
          )}
          {activeView === 'add-food' && (
            <div className="bg-white rounded-xl shadow-sm">
              <FoodEntryForm
                selectedDate={selectedDate}
                onClose={goBack}
                onSaved={handleFoodAdded}
                onOpenCustomFoods={() => setActiveView('custom-foods')}
              />
            </div>
          )}
          {activeView === 'add-symptom' && (
            <div className="bg-white rounded-xl shadow-sm">
              <SymptomEntryForm
                selectedDate={selectedDate}
                onClose={goBack}
                onSaved={handleSymptomAdded}
              />
            </div>
          )}
          {activeView === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm">
              <ProfileForm
                onClose={goBack}
                onSaved={handleProfileSaved}
              />
            </div>
          )}
          {activeView === 'custom-foods' && (
            <div className="bg-white rounded-xl shadow-sm">
              <CustomFoodForm
                onClose={goBack}
                onSaved={handleCustomFoodSaved}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => setActiveView('add-food')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                activeView === 'add-food' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              <Utensils className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Add Food</span>
            </button>
            
            <button
              onClick={() => setActiveView('add-symptom')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                activeView === 'add-symptom' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Activity className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Log Symptom</span>
            </button>
            
            <button
              onClick={() => setActiveView('analysis')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                activeView === 'analysis' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-orange-600 hover:bg-orange-50'
              }`}
            >
              <TrendingUp className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Analysis</span>
            </button>
            
            <button
              onClick={() => setActiveView('roadmap')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                activeView === 'roadmap' 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Settings className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Roadmap</span>
            </button>
            
            <button
              onClick={() => setActiveView('profile')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                activeView === 'profile' 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-purple-600 hover:bg-purple-50'
              }`}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}