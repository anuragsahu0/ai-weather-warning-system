import { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Bell,
  Menu,
  Clock,
  Navigation,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { useSystemStatus } from '../../context/SystemStatusContext.js';
import { useLocation } from '../../context/LocationContext.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { NotificationCenterDrawer } from '../notifications/NotificationCenterDrawer.js';
import { NotificationPreferencesModal } from '../notifications/NotificationPreferencesModal.js';
import { Button } from '../ui/Button.js';
import { formatUtcTime, formatIstTime } from '../../lib/utils.js';

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isLive, latencyMs } = useSystemStatus();
  const { isGpsDetected, detectUserLocation, isDetectingLocation } = useLocation();
  const { unreadCount } = useNotifications();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-8 flex items-center justify-between gap-4 select-none">
        {/* Left: Mobile trigger & GPS Quick Action */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={detectUserLocation}
            disabled={isDetectingLocation}
            className="hidden sm:flex items-center gap-2 rounded-full border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 h-9 px-3.5"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Detecting GPS...' : 'My Live Location'}</span>
            {isGpsDetected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </Button>
        </div>

        {/* Center: Live UTC/IST Clock */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100/80 font-mono text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-900 font-bold">{formatIstTime(currentTime)}</span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-500">{formatUtcTime(currentTime)}</span>
        </div>

        {/* Right: Status, Notifications, Theme */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isLive ? 'SYSTEM OK' : 'LOCAL CACHE'}</span>
            {latencyMs > 0 && <span className="text-[10px] text-emerald-600">({latencyMs}ms)</span>}
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotificationDrawer(true)}
            className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </Button>

          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
            aria-label="Toggle dark/light theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>
        </div>
      </header>

      {/* Notification Center Drawer */}
      <NotificationCenterDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
    </>
  );
}
