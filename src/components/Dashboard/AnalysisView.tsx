import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { getFoodEntries, getSymptomEntries } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays, startOfDay, endOfDay, differenceInHours } from 'date-fns';

interface FoodSymptomCorrelation {
  foodName: string;
  symptomName: string;
  occurrences: number;
  avgTimeBetween: number; // hours
  severity: number;
  confidence: 'high' | 'medium' | 'low';
}

interface TriggerFood {
  foodName: string;
  totalSymptoms: number;
  avgSeverity: number;
  mostCommonSymptom: string;
  confidence: 'high' | 'medium' | 'low';
}

export function AnalysisView() {
  const [correlations, setCorrelations] = useState<FoodSymptomCorrelation[]>([]);
  const [triggerFoods, setTriggerFoods] = useState<TriggerFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      analyzeCorrelations();
    }
  }, [user, period]);

  const analyzeCorrelations = async () => {
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

      // Analyze correlations (symptoms within 24 hours of eating)
      const correlationMap = new Map<string, {
        occurrences: number;
        totalSeverity: number;
        timeDifferences: number[];
      }>();

      foodEntries.forEach(foodEntry => {
        const foodTime = new Date(foodEntry.eaten_at);
        
        symptomEntries.forEach(symptomEntry => {
          const symptomTime = new Date(symptomEntry.occurred_at);
          const hoursDiff = differenceInHours(symptomTime, foodTime);
          
          // Consider symptoms that occur 0-24 hours after eating
          if (hoursDiff >= 0 && hoursDiff <= 24) {
            const key = `${foodEntry.food_name}|${symptomEntry.symptom_name}`;
            const existing = correlationMap.get(key) || {
              occurrences: 0,
              totalSeverity: 0,
              timeDifferences: []
            };
            
            correlationMap.set(key, {
              occurrences: existing.occurrences + 1,
              totalSeverity: existing.totalSeverity + symptomEntry.severity,
              timeDifferences: [...existing.timeDifferences, hoursDiff]
            });
          }
        });
      });

      // Convert to correlation objects
      const correlationList: FoodSymptomCorrelation[] = [];
      correlationMap.forEach((data, key) => {
        const [foodName, symptomName] = key.split('|');
        const avgTimeBetween = data.timeDifferences.reduce((a, b) => a + b, 0) / data.timeDifferences.length;
        const avgSeverity = data.totalSeverity / data.occurrences;
        
        // Determine confidence based on occurrences and severity
        let confidence: 'high' | 'medium' | 'low' = 'low';
        if (data.occurrences >= 3 && avgSeverity >= 5) confidence = 'high';
        else if (data.occurrences >= 2 && avgSeverity >= 3) confidence = 'medium';
        
        correlationList.push({
          foodName,
          symptomName,
          occurrences: data.occurrences,
          avgTimeBetween,
          severity: avgSeverity,
          confidence
        });
      });

      // Sort by confidence and occurrences
      correlationList.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
        }
        return b.occurrences - a.occurrences;
      });

      // Analyze trigger foods
      const foodTriggerMap = new Map<string, {
        symptoms: string[];
        severities: number[];
      }>();

      correlationList.forEach(correlation => {
        const existing = foodTriggerMap.get(correlation.foodName) || {
          symptoms: [],
          severities: []
        };
        
        existing.symptoms.push(correlation.symptomName);
        existing.severities.push(correlation.severity);
        foodTriggerMap.set(correlation.foodName, existing);
      });

      const triggerFoodList: TriggerFood[] = [];
      foodTriggerMap.forEach((data, foodName) => {
        const avgSeverity = data.severities.reduce((a, b) => a + b, 0) / data.severities.length;
        const mostCommonSymptom = data.symptoms.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        
        let confidence: 'high' | 'medium' | 'low' = 'low';
        if (data.symptoms.length >= 3 && avgSeverity >= 5) confidence = 'high';
        else if (data.symptoms.length >= 2 && avgSeverity >= 3) confidence = 'medium';
        
        triggerFoodList.push({
          foodName,
          totalSymptoms: data.symptoms.length,
          avgSeverity,
          mostCommonSymptom,
          confidence
        });
      });

      triggerFoodList.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
        }
        return b.totalSymptoms - a.totalSymptoms;
      });

      setCorrelations(correlationList);
      setTriggerFoods(triggerFoodList);
    } catch (error) {
      console.error('Error analyzing correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Food-Symptom Analysis
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('7')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              period === '7' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setPeriod('30')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              period === '30' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => setPeriod('90')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              period === '90' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            90 days
          </button>
        </div>
      </div>

      {correlations.length === 0 && triggerFoods.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Not enough data for analysis.</p>
          <p className="text-gray-400 text-sm mt-1">Keep logging your food and symptoms to see patterns.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Potential Trigger Foods */}
          {triggerFoods.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Potential Trigger Foods
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {triggerFoods.slice(0, 6).map((trigger, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{trigger.foodName}</h5>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(trigger.confidence)}`}>
                        {getConfidenceIcon(trigger.confidence)}
                        <span className="capitalize">{trigger.confidence}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• {trigger.totalSymptoms} symptom correlation{trigger.totalSymptoms !== 1 ? 's' : ''}</p>
                      <p>• Most common: {trigger.mostCommonSymptom}</p>
                      <p>• Avg severity: {trigger.avgSeverity.toFixed(1)}/10</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Correlations */}
          {correlations.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Food-Symptom Correlations
              </h4>
              <div className="space-y-3">
                {correlations.slice(0, 10).map((correlation, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {correlation.foodName} → {correlation.symptomName}
                        </h5>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(correlation.confidence)}`}>
                        {getConfidenceIcon(correlation.confidence)}
                        <span className="capitalize">{correlation.confidence}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Occurrences:</span> {correlation.occurrences}
                      </div>
                      <div>
                        <span className="font-medium">Avg Time:</span> {correlation.avgTimeBetween.toFixed(1)}h
                      </div>
                      <div>
                        <span className="font-medium">Avg Severity:</span> {correlation.severity.toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Notes */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">How to interpret this analysis:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>High confidence:</strong> 3+ occurrences with moderate-severe symptoms</li>
              <li>• <strong>Medium confidence:</strong> 2+ occurrences with mild+ symptoms</li>
              <li>• <strong>Low confidence:</strong> Limited data, monitor for patterns</li>
              <li>• Analysis considers symptoms occurring 0-24 hours after eating</li>
              <li>• Consult healthcare providers for medical advice</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}