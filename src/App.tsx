import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = (e) => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [user]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Install prompt banner
  const InstallPrompt = () => {
    if (!showInstallPrompt) return null;

    return (
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-3 shadow-lg z-50 flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">📱 Install HealthTracker</p>
          <p className="text-xs opacity-90">Add to home screen for app experience</p>
        </div>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={handleInstallApp}
            className="bg-white text-green-600 px-3 py-1 rounded text-xs font-bold"
          >
            Install
          </button>
          <button
            onClick={dismissInstallPrompt}
            className="text-white opacity-75 px-2"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm 
          mode={authMode} 
          onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')} 
        />
        <InstallPrompt />
      </>
    );
  }

  return (
    <>
      <Dashboard />
      <InstallPrompt />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;