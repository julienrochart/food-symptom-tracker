import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Ruler, Weight, Users, Trash2, AlertTriangle, Settings } from 'lucide-react';
import { saveUserProfile, getUserProfile, deleteAllUserData } from '../../lib/firebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types';

interface ProfileFormProps {
  onClose: () => void;
  onSaved: () => void;
  onOpenRoadmap?: () => void;
}

export function ProfileForm({ onClose, onSaved, onOpenRoadmap }: ProfileFormProps) {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const existingProfile = await getUserProfile(user.uid);
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('Form data being submitted:', {
        user_id: user.uid,
        date_of_birth: profile.date_of_birth || null,
        sex: profile.sex || null,
        height_cm: profile.height_cm || null,
        weight_kg: profile.weight_kg || null,
      });
      
      await saveUserProfile({
        user_id: user.uid,
        date_of_birth: profile.date_of_birth || null,
        sex: profile.sex || null,
        height_cm: profile.height_cm || null,
        weight_kg: profile.weight_kg || null,
      });

      onSaved();
    } catch (err: any) {
      console.error('Profile form error:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDeleteAllData = async () => {
    if (!user || deleteConfirmText !== 'DELETE ALL MY DATA') return;

    setDeleteLoading(true);
    try {
      await deleteAllUserData(user.uid);
      // Sign out user after deleting all data
      window.location.reload(); // This will trigger a sign out and refresh
    } catch (error) {
      console.error('Error deleting all data:', error);
      setError('Failed to delete all data. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const calculateBMI = (heightCm: number, weightKg: number) => {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (

    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date of Birth
            </label>
            <input
              type="date"
              value={profile.date_of_birth || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {profile.date_of_birth && (
              <p className="text-xs text-gray-500 mt-1">
                Age: {calculateAge(profile.date_of_birth)} years old
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Biological Sex
            </label>
            <select
              value={profile.sex || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, sex: e.target.value as UserProfile['sex'] }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Ruler className="w-4 h-4 inline mr-1" />
              Height (cm)
            </label>
            <input
              type="number"
              min="50"
              max="250"
              value={profile.height_cm || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, height_cm: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="e.g., 170"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {profile.height_cm && (
              <p className="text-xs text-gray-500 mt-1">
                {(profile.height_cm / 100).toFixed(2)} meters / {Math.round(profile.height_cm * 0.393701)} inches
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Weight className="w-4 h-4 inline mr-1" />
              Weight (kg)
            </label>
            <input
              type="number"
              min="20"
              max="500"
              step="0.1"
              value={profile.weight_kg || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, weight_kg: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="e.g., 70.5"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {profile.weight_kg && (
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(profile.weight_kg * 2.20462)} pounds
              </p>
            )}
          </div>

          {/* BMI Calculation */}
          {profile.height_cm && profile.weight_kg && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-700 mb-1">Body Mass Index (BMI)</p>
              <p className="text-lg font-bold text-blue-800">
                {calculateBMI(profile.height_cm, profile.weight_kg)}
              </p>
              <p className="text-xs text-blue-600">
                {(() => {
                  const bmi = parseFloat(calculateBMI(profile.height_cm, profile.weight_kg));
                  if (bmi < 18.5) return 'Underweight';
                  if (bmi < 25) return 'Normal weight';
                  if (bmi < 30) return 'Overweight';
                  return 'Obese';
                })()}
              </p>
            </div>
          )}

          {/* Roadmap Button */}
          {onOpenRoadmap && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                type="button"
                onClick={onOpenRoadmap}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">View Development Roadmap</span>
              </button>
            </div>
          )}

          {/* Delete All Data Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Danger Zone
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete all your health tracking data. This action cannot be undone and will remove:
                  </p>
                  <ul className="text-sm text-red-700 mb-4 space-y-1">
                    <li>• All food entries</li>
                    <li>• All symptom entries</li>
                    <li>• All custom foods</li>
                    <li>• Your profile information</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All My Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Data Deletion</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium mb-2">⚠️ This action is permanent and irreversible!</p>
                <p className="text-red-700 text-sm">
                  All your health tracking data will be permanently deleted from our servers. 
                  You will not be able to recover this information.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE ALL MY DATA</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE ALL MY DATA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllData}
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE ALL MY DATA'}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete All Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}