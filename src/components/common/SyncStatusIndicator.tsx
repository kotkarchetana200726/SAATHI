import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  CloudOff,
  Cloud,
  ChevronDown,
  X,
  Play,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { syncService, SyncStatus } from '../../services/sync';

export const SyncStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>(() => syncService.getStatus());
  const [pendingCount, setPendingCount] = useState<number>(() => syncService.getPendingSyncCount());
  const [isSimulated, setIsSimulated] = useState<boolean>(() => syncService.isSimulatedOffline());
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((newStatus, count) => {
      setStatus(newStatus);
      setPendingCount(count);
      setIsSimulated(syncService.isSimulatedOffline());
    });
    return unsubscribe;
  }, []);

  const handleToggleSimulatedOffline = () => {
    const next = !isSimulated;
    setIsSimulated(next);
    syncService.setSimulatedOffline(next);
  };

  const handleForceSync = () => {
    syncService.triggerSync();
  };

  return (
    <>
      {/* Floating Status Pill (Fixed at bottom-left for immediate visibility) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowDemoModal(true)}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shadow-lg border text-xs font-bold transition-all cursor-pointer backdrop-blur-md active:scale-95 ${
            status === 'connected'
              ? 'bg-white/95 text-emerald-900 border-emerald-300 hover:bg-emerald-50'
              : status === 'offline'
              ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-700 animate-pulse'
              : status === 'syncing'
              ? 'bg-sky-600 text-white border-sky-500'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}
          title="Click to open Offline & Sync Demo Control"
        >
          {status === 'connected' && (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span>Connected</span>
            </>
          )}

          {status === 'offline' && (
            <>
              <WifiOff className="h-3.5 w-3.5 text-white animate-bounce" />
              <span>Offline Mode</span>
              {pendingCount > 0 && (
                <span className="bg-amber-800 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {pendingCount} queued
                </span>
              )}
            </>
          )}

          {status === 'syncing' && (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-white animate-spin" />
              <span>Syncing...</span>
            </>
          )}

          {status === 'synced' && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span>Synced</span>
            </>
          )}

          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </div>

      {/* Interactive Offline & Sync Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-stone-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#2D6A4F]" />
                <h3 className="text-lg font-bold text-slate-800">
                  Offline-First & PWA Controller
                </h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current State Status */}
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Current System Status
              </span>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${
                    status === 'connected'
                      ? 'bg-emerald-500'
                      : status === 'offline'
                      ? 'bg-amber-500'
                      : status === 'syncing'
                      ? 'bg-sky-500 animate-spin'
                      : 'bg-emerald-600'
                  }`}
                />
                <div>
                  <p className="text-base font-extrabold text-slate-800 capitalize">
                    {status === 'connected' && 'Connected (Online)'}
                    {status === 'offline' && 'Offline Mode (Local Storage)'}
                    {status === 'syncing' && 'Syncing Game Sessions...'}
                    {status === 'synced' && 'Synced (All Records Current)'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {status === 'offline'
                      ? 'App assets and all 3 brain games run from service worker cache.'
                      : 'Connected to local synchronization node.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Offline Mode Simulation Toggle */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Simulate Offline Mode
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Test offline resilience without disconnecting system WiFi.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSimulated}
                    onChange={handleToggleSimulatedOffline}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {isSimulated && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 text-xs text-amber-900 font-semibold">
                  ⚡ Offline Simulation Active: Play Memory Match or Check Medicines to generate queued local sessions!
                </div>
              )}
            </div>

            {/* Pending Records in Queue */}
            <div className="mt-4 flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <span className="font-semibold text-stone-600">
                Queued Local Game Sessions:
              </span>
              <span className="font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                {pendingCount} sessions
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleForceSync}
                disabled={status === 'syncing'}
                className="w-full py-3 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RefreshCw className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Simulate Cloud Sync Now</span>
              </button>

              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition cursor-pointer"
              >
                Close Control Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
