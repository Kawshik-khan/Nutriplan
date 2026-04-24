import { useState, useEffect, useCallback } from 'react';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  canNotify: boolean;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    canNotify: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true) {
        setStatus(prev => ({ ...prev, isInstalled: true }));
      }
    };

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, isInstallable: true }));
    };

    // Handle appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setStatus(prev => ({ ...prev, isInstallable: false, isInstalled: true }));
    };

    // Handle online/offline
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOffline: true }));
    };

    // Check notification permission
    const checkNotification = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setStatus(prev => ({ ...prev, canNotify: permission === 'granted' }));
      }
    };

    checkInstalled();
    checkNotification();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const requestNotification = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setStatus(prev => ({ ...prev, canNotify: granted }));
    return granted;
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration);
        return registration;
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }
  }, []);

  return {
    ...status,
    install,
    requestNotification,
    registerServiceWorker,
  };
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
