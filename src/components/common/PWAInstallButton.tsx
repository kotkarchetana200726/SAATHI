import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'solid' | 'outline' | 'subtle';
}

export const PWAInstallButton: React.FC<Props> = ({
  className = '',
  variant = 'solid',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const baseStyles = 'inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition cursor-pointer select-none';
  const variantStyles =
    variant === 'solid'
      ? 'bg-[#2D6A4F] text-white px-4 py-2 hover:bg-[#1B4332] shadow-sm active:scale-95'
      : variant === 'outline'
      ? 'border-2 border-[#2D6A4F] text-[#2D6A4F] px-3.5 py-1.5 hover:bg-[#2D6A4F]/10'
      : 'bg-[#E8F5E9] text-[#2D6A4F] px-3 py-1.5 hover:bg-[#C8E6C9]';

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`${baseStyles} ${variantStyles} ${className}`}
        title="Install SAATHI app for offline access"
      >
        <Download className="w-4 h-4" />
        <span>Install App (Offline)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`${baseStyles} ${variantStyles} ${className}`}
          title="Install on iPhone / iPad"
        >
          <Download className="w-4 h-4" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-lg font-bold text-slate-800">Install SAATHI on iPhone</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-xs font-bold text-[#2D6A4F]">1</span>
                  <span>Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-xs font-bold text-[#2D6A4F]">2</span>
                  <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-xs font-bold text-[#2D6A4F]">3</span>
                  <span>Tap <strong>Add</strong> at top right. SAATHI will now work offline anytime.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#2D6A4F] py-2.5 text-sm font-semibold text-white hover:bg-[#1B4332]"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback demo indicator for testing or desktop browsers that have already loaded
  return (
    <button
      onClick={() => {
        alert('SAATHI is configured as a Progressive Web App (PWA) with full offline support. If you open this in Chrome, Edge, or mobile browsers, use the browser menu or address bar to install!');
      }}
      className={`${baseStyles} ${variantStyles} ${className}`}
      title="PWA Ready"
    >
      <Download className="w-4 h-4" />
      <span>PWA Ready</span>
    </button>
  );
};
