"use client";

import { useEffect, useState, useMemo } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

// Check if push is supported
function isPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Get initial dismissed state synchronously
function getInitialDismissed() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('push-notification-dismissed') === 'true';
}

export function PushNotificationManager() {
  const { status } = useSession();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(getInitialDismissed);
  
  // Get initial permission synchronously to avoid setState in effect
  const permission = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!isPushSupported()) return null;
    return Notification.permission;
  }, []);

  useEffect(() => {
    if (!isPushSupported()) return;
    if (dismissed) return;
    
    // Show prompt after 5 seconds for authenticated users
    if (status === 'authenticated' && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, dismissed]);

  const handleEnable = async () => {
    try {
      const result = await Notification.requestPermission();
      
      if (result === 'granted') {
        await registerServiceWorker();
        // Show a test notification
        await showTestNotification();
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('push-notification-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
  };

  // Don't show anything if not supported or already decided
  if (!isPushSupported() || dismissed || permission === 'granted' || permission === 'denied') {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-60 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/60 to-primary" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="text-primary" size={22} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-bold text-foreground mb-1">Stay Updated!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get instant notifications for new jobs, messages, and updates.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Button 
            variant="outline" 
            onClick={handleRemindLater}
            className="flex-1 rounded-xl h-10 text-sm font-medium"
          >
            Later
          </Button>
          <Button 
            onClick={handleEnable}
            className="flex-1 rounded-xl h-10 text-sm font-bold"
          >
            Enable
          </Button>
        </div>
      </div>
    </div>
  );
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
}

async function showTestNotification() {
  if (!('serviceWorker' in navigator)) return;
  
  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification('Notifications Enabled! 🎉', {
    body: 'You will now receive updates about jobs, messages, and more.',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'welcome-notification'
  });
}

// Hook to send local notifications (for use in other components)
export function usePushNotification() {
  const sendNotification = async (title: string, options?: NotificationOptions & { url?: string }) => {
    if (!isPushSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body: options?.body || '',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: options?.tag || 'notification',
        data: { url: options?.url || '/' },
        ...options
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  };

  const checkPermission = () => {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
  };

  return { sendNotification, checkPermission };
}

// Settings component for notification preferences
export function NotificationSettings() {
  const [loading, setLoading] = useState(false);
  
  // Get permission synchronously to avoid setState in effect
  const permission = useMemo(() => {
    if (typeof window === 'undefined') return 'default';
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
  }, []);

  const handleToggle = async () => {
    if (permission === 'granted') {
      // Can't programmatically disable - user needs to do it in browser settings
      alert('To disable notifications, go to your browser settings.');
      return;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      
      if (result === 'granted') {
        await registerServiceWorker();
        window.location.reload(); // Reload to update permission state
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
      <div className="flex items-center gap-3">
        {permission === 'granted' ? (
          <Bell className="text-primary" size={20} />
        ) : (
          <BellOff className="text-muted-foreground" size={20} />
        )}
        <div>
          <p className="font-medium text-foreground">Push Notifications</p>
          <p className="text-xs text-muted-foreground">
            {permission === 'granted' && 'Enabled'}
            {permission === 'denied' && 'Blocked in browser'}
            {permission === 'default' && 'Not enabled'}
            {permission === 'unsupported' && 'Not supported'}
          </p>
        </div>
      </div>
      <Button
        variant={permission === 'granted' ? 'outline' : 'default'}
        size="sm"
        onClick={handleToggle}
        disabled={loading || permission === 'denied' || permission === 'unsupported'}
        className="rounded-lg"
      >
        {loading ? 'Loading...' : permission === 'granted' ? 'Enabled' : 'Enable'}
      </Button>
    </div>
  );
}
