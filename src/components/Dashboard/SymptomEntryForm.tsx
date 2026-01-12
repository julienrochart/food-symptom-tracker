import React, { useState } from 'react';
import { X, Activity, Brain, Heart, Zap, AlertTriangle, Thermometer, Eye, Ear, Smile, Frown, Wind, Droplets, Moon, Coffee, Trash2 } from 'lucide-react';
import { saveSymptomEntry } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const SYMPTOM_OPTIONS = [
  // Head & Brain
  { icon: Brain, name: 'Headache', category: 'head' },
  { icon: Brain, name: 'Migraine', category: 'head' },
  { icon: Eye, name: 'Eye Strain', category: 'head' },
  { icon: Ear, name: 'Ear Pain', category: 'head' },
  { icon: Brain, name: 'Dizziness', category: 'head' },
  { icon: Eye, name: 'Blurred Vision', category: 'head' },
  
  // Digestive
  { icon: AlertTriangle, name: 'Nausea', category: 'digestive' },
  { icon: Wind, name: 'Bloating', category: 'digestive' },
  { icon: AlertTriangle, name: 'Stomach Pain', category: 'digestive' },
  { icon: Wind, name: 'Gas', category: 'digestive' },
  { icon: AlertTriangle, name: 'Heartburn', category: 'digestive' },
  { icon: Wind, name: 'Indigestion', category: 'digestive' },
  { icon: AlertTriangle, name: 'Cramps', category: 'digestive' },
  { icon: Wind, name: 'Constipation', category: 'digestive' },
  
  // Energy & Mood
  { icon: Zap, name: 'Fatigue', category: 'energy' },
  { icon: Moon, name: 'Sleepiness', category: 'energy' },
  { icon: Coffee, name: 'Low Energy', category: 'energy' },
  { icon: Frown, name: 'Irritability', category: 'mood' },
  { icon: Smile, name: 'Anxiety', category: 'mood' },
  { icon: Frown, name: 'Mood Swings', category: 'mood' },
  
  // Physical
  { icon: Heart, name: 'Chest Pain', category: 'physical' },
  { icon: Thermometer, name: 'Fever', category: 'physical' },
  { icon: Droplets, name: 'Sweating', category: 'physical' },
  { icon: Heart, name: 'Rapid Heartbeat', category: 'physical' },
  { icon: Zap, name: 'Muscle Pain', category: 'physical' },
  { icon: AlertTriangle, name: 'Joint Pain', category: 'physical' },
  { icon: Thermometer, name: 'Chills', category: 'physical' },
  { icon: Droplets, name: 'Dehydration', category: 'physical' },
  
  // Respiratory
  { icon: Wind, name: 'Shortness of Breath', category: 'respiratory' },
  { icon: Wind, name: 'Cough', category: 'respiratory' },
  { icon: Droplets, name: 'Runny Nose', category: 'respiratory' },
  { icon: Wind, name: 'Congestion', category: 'respiratory' },
  
  // Skin
  { icon: AlertTriangle, name: 'Rash', category: 'skin' },
  { icon: Droplets, name: 'Itching', category: 'skin' },
  { icon: AlertTriangle, name: 'Hives', category: 'skin' },
  { icon: Droplets, name: 'Dry Skin', category: 'skin' },
];

const CATEGORY_COLORS = {
  head: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  digestive: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
  energy: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
  mood: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
  physical: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
  respiratory: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  skin: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
};

interface SelectedSymptom {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

interface SymptomEntryFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSaved: () => void;
}

export function SymptomEntryForm({ selectedDate, onClose, onSaved }: SymptomEntryFormProps) {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const addSymptom = (symptom: typeof SYMPTOM_OPTIONS[0]) => {
    const newSelectedSymptom: SelectedSymptom = {
      id: Math.random().toString(36).substr(2, 9),
      name: symptom.name,
      icon: symptom.icon,
      category: symptom.category
    };
    setSelectedSymptoms(prev => [...prev, newSelectedSymptom]);
  };

  const removeSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.filter(symptom => symptom.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedSymptoms.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const occurredAt = new Date(selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      occurredAt.setHours(hours, minutes, 0, 0);

      // Save each selected symptom as a separate entry
      for (const symptom of selectedSymptoms) {
        await saveSymptomEntry({
          user_id: user.uid,
          symptom_name: symptom.name,
          severity,
          notes: notes || null,
          occurred_at: occurredAt.toISOString(),
        });
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save symptom entries');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (value: number) => {
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityLabel = (value: number) => {
    if (value <= 3) return 'Mild';
    if (value <= 6) return 'Moderate';
    return 'Severe';
  };

  const handleNext = () => {
    if (step === 1 && selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
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
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {step === 1 && 'Step 1: Select Symptoms'}
              {step === 2 && 'Step 2: Choose Severity'}
              {step === 3 && 'Step 3: Time & Notes'}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Symptom Selection */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Symptoms *
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto mb-4">
                {SYMPTOM_OPTIONS.map((symptom) => {
                  const IconComponent = symptom.icon;
                  return (
                    <button
                      key={symptom.name}
                      type="button"
                      onClick={() => addSymptom(symptom)}
                      className={`p-3 border-2 rounded-lg transition-all flex flex-col items-center space-y-1 ${
                        CATEGORY_COLORS[symptom.category as keyof typeof CATEGORY_COLORS]
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-xs font-medium text-center leading-tight">{symptom.name}</span>
                    </button>
                  );
                })}
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => {
                      const IconComponent = symptom.icon;
                      return (
                        <div
                          key={symptom.id}
                          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{symptom.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

              {selectedSymptoms.length === 0 && (
                <p className="text-red-500 text-xs mt-1">Please select at least one symptom</p>
              )}
            </div>
          )}

          {/* Step 2: Severity Level */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How severe are your symptoms?
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSeverity(2)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    severity <= 3
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">😊</div>
                    <div className="text-lg font-medium">Mild</div>
                    <div className="text-sm opacity-75 mt-1">1-3</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity(5)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    severity > 3 && severity <= 6
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">😐</div>
                    <div className="text-lg font-medium">Moderate</div>
                    <div className="text-sm opacity-75 mt-1">4-6</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity(8)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    severity > 6
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">😣</div>
                    <div className="text-lg font-medium">Severe</div>
                    <div className="text-sm opacity-75 mt-1">7-10</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Time & Notes */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the symptoms, potential triggers, what you were doing, etc..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adding details helps identify patterns and triggers more effectively.
                </p>
              </div>
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
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                disabled={loading || selectedSymptoms.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : `Save ${selectedSymptoms.length} Symptom${selectedSymptoms.length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </form>
    </div>
  );
}