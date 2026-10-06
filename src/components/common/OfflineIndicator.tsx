import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl border border-amber-500 animate-bounce"
    >
      <WifiOff className="w-5 h-5 text-amber-100" />
      <div>
        <p className="font-bold leading-tight">Offline Mode Active</p>
        <p className="text-xs text-amber-100 font-normal">All games, memories & alarms work locally.</p>
      </div>
    </div>
  );
};

export const NetworkPill: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isOnline
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
      title={isOnline ? 'Online - Cloud Sync enabled' : 'Offline - Running on local storage'}
    >
      {isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>Synced</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Ready</span>
        </>
      )}
    </div>
  );
};
