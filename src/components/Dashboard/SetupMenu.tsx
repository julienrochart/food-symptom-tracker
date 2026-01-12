import React from 'react';
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface SetupMenuProps {
  onClose?: () => void;
}

export function SetupMenu({ onClose }: SetupMenuProps) {
  const roadmapItems = [
    {
      title: "User Authentication",
      description: "Secure sign-up and sign-in with email/password",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Food Entry System",
      description: "Log daily food intake with meal types, quantities, and FODMAP-aware food selection",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Symptom Tracking",
      description: "Record symptoms with severity levels, timestamps, and categorized symptom selection",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Daily View Dashboard",
      description: "View food and symptom entries for any selected date with date navigation and entry management",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Health Insights & Statistics",
      description: "View health statistics including food entries, symptoms, average severity, and trends over 7/30 day periods",
      status: "completed" as const,
      category: "Analytics"
    },
    {
      title: "Food-Symptom Analysis",
      description: "Correlation analysis to identify potential trigger foods based on timing and symptom patterns",
      status: "completed" as const,
      category: "Analytics"
    },
    {
      title: "User Profile Management",
      description: "Personal health information including age, height, weight, BMI calculation, and data management",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Custom Food Database",
      description: "Add, manage, and delete personal food items with FODMAP levels and category classification",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Progressive Web App (PWA)",
      description: "Install app on mobile devices with offline support, service worker, and native-like experience",
      status: "completed" as const,
      category: "Technical"
    },
    {
      title: "FODMAP-Aware Food Selection",
      description: "Comprehensive food database with Low/High FODMAP classification and visual indicators",
      status: "completed" as const,
      category: "Core Features"
    },
    {
      title: "Data Privacy & Security",
      description: "Complete data deletion functionality and secure user data management with Firebase",
      status: "completed" as const,
      category: "Technical"
    },
    {
      title: "Mobile-First Design",
      description: "Responsive design optimized for mobile devices with touch-friendly interface and bottom navigation",
      status: "completed" as const,
      category: "Technical"
    },
    {
      title: "Real-time Data Synchronization",
      description: "Cloud-based data storage with real-time synchronization across devices using Firebase",
      status: "completed" as const,
      category: "Technical"
    },
    {
      title: "Entry Management",
      description: "Edit and delete food and symptom entries with confirmation dialogs and data integrity",
      status: "completed" as const,
      category: "Core Features"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'planned':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'planned':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Core Features': 'bg-blue-100 text-blue-800',
      'Analytics': 'bg-purple-100 text-purple-800',
      'Technical': 'bg-green-100 text-green-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const groupedItems = roadmapItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof roadmapItems>);

  const completedCount = roadmapItems.filter(item => item.status === 'completed').length;
  const totalCount = roadmapItems.length;
  const progressPercentage = 100; // All features are completed

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">HealthTracker Roadmap</h2>
        <p className="text-gray-600 mb-6">
          Track our progress as we build the most comprehensive health tracking platform for people with dietary sensitivities and chronic conditions.
        </p>
        
        {/* Progress Overview */}
      </div>

      {/* Roadmap Items by Category */}
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                  {items.length} feature{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 flex-1 pr-3">{item.title}</h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getStatusIcon(item.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Our Mission</h3>
          <p className="text-blue-800 leading-relaxed">
            HealthTracker is a complete, production-ready application that empowers individuals with dietary 
            sensitivities and chronic health conditions. Track your food intake, log symptoms, and discover 
            patterns to understand your body's unique responses to different foods and improve your quality of life.
          </p>
        </div>
        
        <div className="text-sm text-gray-500">
          Powered by{' '}
          <a 
            href="https://julienrochart.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
          >
            Ptipiment
          </a>
        </div>
      </div>
    </div>
  );
}