import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { usePushNotificationStore } from '../../store/pushNotificationStore';
import {
  Bell,
  X,
  Settings2,
  ChevronRight,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const SimulatedPushNotification: React.FC = () => {
  const navigate = useNavigate();
  const { activePush, dismissPush, settings, setSettingsOpen } = usePushNotificationStore();

  if (!activePush || !settings.enabled) return null;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissPush();
    if (activePush.actionUrl) {
      navigate(activePush.actionUrl);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsOpen(true);
  };

  const isAndroid = settings.style === 'android';

  return (
    <AnimatePresence>
      <motion.div
        key={activePush.id}
        initial={{ opacity: 0, y: -60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 26, stiffness: 380 }}
        className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] sm:w-[420px] max-w-[440px] pointer-events-auto"
      >
        {isAndroid ? (
          /* Android Material 3 Style Banner */
          <div
            onClick={handleActionClick}
            className="group cursor-pointer bg-stone-900 text-stone-100 rounded-2xl border border-stone-700/80 p-4 shadow-2xl relative overflow-hidden transition-all hover:border-orange-500/60"
          >
            {/* Top Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">
                  NB
                </div>
                <span className="text-[11px] font-bold tracking-wide uppercase text-stone-300">
                  NearBuy
                </span>
                <span className="text-[10px] text-stone-500">· {activePush.timestamp}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Configure Push Notifications"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissPush();
                  }}
                  className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{activePush.title}</span>
                <span className="text-[10px] font-mono font-medium text-orange-400">
                  #{activePush.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {activePush.message}
              </p>
            </div>

            {/* Android Bottom Action Strip */}
            <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 truncate max-w-[200px]">
                {activePush.merchantName}
              </span>
              <button
                type="button"
                onClick={handleActionClick}
                className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span>Track Order</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* iOS Dynamic Frosted Glass Style Banner */
          <div
            onClick={handleActionClick}
            className="group cursor-pointer bg-stone-900/95 dark:bg-stone-900/95 backdrop-blur-2xl text-white rounded-3xl border border-white/15 p-4 shadow-2xl relative overflow-hidden transition-all hover:ring-2 hover:ring-orange-500/40"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                    <circle cx="12" cy="9" r="2" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-[11px] font-bold tracking-tight uppercase text-stone-300">
                  NearBuy · Hyperlocal
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 font-medium">{activePush.timestamp}</span>
                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Push Notification Settings"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissPush();
                  }}
                  className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Body */}
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-white leading-snug">
                {activePush.title}
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed line-clamp-2">
                {activePush.message}
              </p>
            </div>

            {/* Quick Action Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-stone-400 text-[10px]">
                From <strong>{activePush.merchantName}</strong>
              </span>
              <span className="font-bold text-orange-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                <span>View Live GPS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* iOS Bottom Swipe Pill Indicator */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
