import React from 'react';
import { usePushNotificationStore } from '../../store/pushNotificationStore';
import {
  Bell,
  Volume2,
  VolumeX,
  X,
  Smartphone,
  Clock,
  Sparkles,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react';

export const PushNotificationSettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    isSettingsOpen,
    setSettingsOpen,
    testPush,
    playChime,
  } = usePushNotificationStore();

  if (!isSettingsOpen) return null;

  const eventLabels: Array<{ key: keyof typeof settings.subscribedEvents; label: string; desc: string }> = [
    { key: 'placed', label: 'Order Placed', desc: 'Alert when order is confirmed by payment' },
    { key: 'accepted', label: 'Store Accepted', desc: 'When merchant verifies and accepts items' },
    { key: 'preparing', label: 'Order Packing', desc: 'When merchant starts packaging produce' },
    { key: 'ready', label: 'Ready for Dispatch', desc: 'When order is packed in pickup station' },
    { key: 'picked_up', label: 'Picked Up by Courier', desc: 'When delivery partner takes custody' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'When partner is within 1–2 km' },
    { key: 'delivered', label: 'Order Delivered', desc: 'When successfully dropped to customer' },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-950 dark:text-white">
                Simulated Push Notifications
              </h2>
              <p className="text-xs text-stone-400">
                Configure mobile lockscreen & banner push alerts for order updates
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60">
          <div>
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
              Enable Mobile Push Simulation
            </div>
            <div className="text-[11px] text-stone-500">
              Triggers visual mobile push banners on live order state updates
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.enabled ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Visual Device Skin (iOS vs Android) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider block">
            Push Banner Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ style: 'ios' })}
              className={`p-3.5 rounded-2xl border text-left transition-all text-xs ${
                settings.style === 'ios'
                  ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-stone-900 dark:text-white font-semibold ring-2 ring-orange-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600'
              }`}
            >
              <div className="font-bold">iOS Dynamic Frosted Glass</div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Glassmorphic acrylic with swipe pill
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ style: 'android' })}
              className={`p-3.5 rounded-2xl border text-left transition-all text-xs ${
                settings.style === 'android'
                  ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-stone-900 dark:text-white font-semibold ring-2 ring-orange-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600'
              }`}
            >
              <div className="font-bold">Android Material 3 Banner</div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Top accent line with action buttons
              </div>
            </button>
          </div>
        </div>

        {/* 3. Audio Chime & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Push Sound Chime
              </span>
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  settings.soundEnabled
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                }`}
                title="Toggle notification sound"
              >
                {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={playChime}
              className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Play sample chime ♪</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-2">
            <label className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
              Auto-Dismiss Time
            </label>
            <select
              value={settings.autoDismissSeconds}
              onChange={(e) => updateSettings({ autoDismissSeconds: Number(e.target.value) })}
              className="w-full py-1.5 px-2.5 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
            >
              <option value={4}>4 seconds</option>
              <option value={6}>6 seconds (Default)</option>
              <option value={10}>10 seconds</option>
              <option value={0}>Manual dismiss only</option>
            </select>
          </div>
        </div>

        {/* 4. Subscribed Event Triggers */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider block">
            Subscribed Order Triggers
          </label>
          <div className="space-y-1.5">
            {eventLabels.map(({ key, label, desc }) => {
              const isChecked = settings.subscribedEvents[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    updateSettings({
                      subscribedEvents: {
                        ...settings.subscribedEvents,
                        [key]: !isChecked,
                      },
                    })
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 text-left transition-colors text-xs"
                >
                  <div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200">{label}</div>
                    <div className="text-[11px] text-stone-400">{desc}</div>
                  </div>
                  <div className="text-orange-500 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 fill-orange-500 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3">
          <button
            type="button"
            onClick={testPush}
            className="flex-1 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Test Push Now</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="py-2.5 px-6 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
