'use client';

import { Clock, ShieldAlert } from 'lucide-react';
import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthContext } from '@/context/AuthContext';
import { ROUTES } from '@/navigation/sidebar/routes';

// Threshold configurations in milliseconds
const TIMEOUT_LIMIT = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION = 60 * 1000; // 60 seconds warning countdown
const THROTTLE_DELAY = 5000; // 5 seconds gate to throttle DOM event updates
const LAST_ACTIVE_KEY = 'curemos_admin_last_active';

// Safe wrappers to access localStorage in SSR environments
const getLastActive = (): number => {
  if (typeof window === 'undefined') return Date.now();
  const stored = localStorage.getItem(LAST_ACTIVE_KEY);
  return stored ? parseInt(stored, 10) : Date.now();
};

const setLastActive = (timestamp: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_ACTIVE_KEY, timestamp.toString());
  }
};

const clearLastActive = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LAST_ACTIVE_KEY);
  }
};

export function SessionTimeoutListener() {
  const { logout, user } = useContext(AuthContext);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(WARNING_DURATION / 1000);

  // References to preserve state across intervals and handlers
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkTimeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggedOutRef = useRef<boolean>(false);

  // Safe logout handler that guarantees single execution
  const handleAutoLogout = useCallback(async () => {
    if (isLoggedOutRef.current) return;
    isLoggedOutRef.current = true;

    try {
      setShowWarning(false);
      clearLastActive();
      // Execute global logout function
      await logout();
      toast.error('Session Expired', {
        description: 'You have been automatically logged out due to inactivity.',
        duration: 8000,
      });
      window.location.replace(ROUTES.auth.login);
    } catch (error) {
      console.error('Error during auto-logout:', error);
    }
  }, [logout]);

  // Throttled function to reset the last active timestamp
  const recordActivity = useCallback(() => {
    // If the modal is showing, do not extend the session via passive background events
    if (showWarning) return;

    const now = Date.now();
    const lastActive = getLastActive();
    if (now - lastActive > THROTTLE_DELAY) {
      setLastActive(now);
    }
  }, [showWarning]);

  // Handle explicit session extension
  const extendSession = useCallback(() => {
    setLastActive(Date.now());
    setShowWarning(false);
    setSecondsRemaining(WARNING_DURATION / 1000);
    toast.success('Session Extended', {
      description: 'Your session remains active.',
      duration: 3000,
    });
  }, []);

  // Reset all timeout state trackers when a new user logs in
  useEffect(() => {
    if (user) {
      isLoggedOutRef.current = false;
      setLastActive(Date.now());
      setShowWarning(false);
      setSecondsRemaining(WARNING_DURATION / 1000);
    }
  }, [user]);

  // 1. Setup global window interaction listeners to monitor activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach((event) => {
      window.addEventListener(event, recordActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });
    };
  }, [user, recordActivity]);

  // 2. Setup high-level interval checking for inactivity
  useEffect(() => {
    if (!user) return;

    checkTimeoutIntervalRef.current = setInterval(() => {
      const lastActive = getLastActive();
      const timeSinceLastActivity = Date.now() - lastActive;

      if (timeSinceLastActivity >= TIMEOUT_LIMIT) {
        // Time limit reached entirely
        handleAutoLogout();
      } else if (timeSinceLastActivity >= TIMEOUT_LIMIT - WARNING_DURATION) {
        // Entering the warning duration window
        if (!showWarning) {
          setShowWarning(true);
        }
        const remainingSeconds = Math.max(
          0,
          Math.ceil((TIMEOUT_LIMIT - timeSinceLastActivity) / 1000),
        );
        setSecondsRemaining(remainingSeconds);
      } else {
        // Active and safe
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      if (checkTimeoutIntervalRef.current) {
        clearInterval(checkTimeoutIntervalRef.current);
      }
    };
  }, [user, showWarning, handleAutoLogout]);

  // 3. Setup countdown interval ticker when warning dialog is visible
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning, handleAutoLogout]);

  // 4. Sync state change instantly when user extends the session on another tab
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVE_KEY && event.newValue) {
        const newTimestamp = parseInt(event.newValue, 10);
        const timeSinceLastActivity = Date.now() - newTimestamp;

        // Close warning dialog immediately if session was extended by another tab
        if (timeSinceLastActivity < TIMEOUT_LIMIT - WARNING_DURATION) {
          setShowWarning(false);
          setSecondsRemaining(WARNING_DURATION / 1000);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Do not render anything if warning modal is closed or user is unauthenticated
  if (!user) return null;

  // Determine dynamic aesthetics based on remaining countdown time
  const progressPercentage = (secondsRemaining / (WARNING_DURATION / 1000)) * 100;
  const progressColor =
    secondsRemaining > 30
      ? 'bg-emerald-500'
      : secondsRemaining > 15
        ? 'bg-amber-500 animate-pulse'
        : 'bg-destructive animate-pulse';

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[420px] rounded-lg border-slate-200 dark:border-slate-800 p-6 shadow-2xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95"
        aria-describedby="session-timeout-warning-desc"
      >
        <DialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 dark:ring-destructive/10 animate-pulse">
            <Clock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription
            id="session-timeout-warning-desc"
            className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-center"
          >
            You have been inactive for some time. For security reasons, your administrative session will close automatically in{' '}
            <span className="font-bold text-slate-950 dark:text-slate-50 text-base">{secondsRemaining}</span> seconds.
          </DialogDescription>
        </DialogHeader>

        {/* Dynamic Countdown Progress Bar */}
        <div className="my-6">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-3 w-full pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 font-medium"
            onClick={handleAutoLogout}
          >
            Logout Now
          </Button>
          <Button
            type="button"
            className="w-full sm:flex-1 bg-red-600 hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium shadow-sm transition-all focus-visible:ring-red-500 active:scale-95"
            onClick={extendSession}
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
