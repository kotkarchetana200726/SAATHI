import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, PhoneCall, KeyRound, Type, Home, Globe } from 'lucide-react';
import { PatientProfile } from '../../types';
import { speechService } from '../../services/speech';
import { Language, getTranslation } from '../../services/translations';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface Props {
  currentView: 'home' | 'games' | 'memory' | 'assistant' | 'today';
  onNavigate: (view: 'home' | 'games' | 'memory' | 'assistant' | 'today') => void;
  onOpenEmergency: () => void;
  onSwitchToCaregiver: () => void;
  onSwitchToLanding: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  patient: PatientProfile;
}

export const PatientHeader: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenEmergency,
  onSwitchToCaregiver,
  onSwitchToLanding,
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  patient,
}) => {
  const t = getTranslation(language);
  const [soundOn, setSoundOn] = useState(speechService.soundEnabled);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    speechService.setSoundEnabled(next);
    if (next) {
      speechService.speak('Voice assistance turned on.');
    }
  };

  const handleCaregiverAccess = () => {
    setShowPinModal(true);
    setPinInput('');
    setPinError(false);
  };

  const verifyPin = (digit?: string) => {
    const newPin = digit !== undefined ? pinInput + digit : pinInput;
    if (digit !== undefined) {
      setPinInput(newPin);
    }
    // Default demo caregiver pin is 1234 or skip
    if (newPin.length === 4) {
      if (newPin === '1234' || newPin === '0000') {
        setShowPinModal(false);
        onSwitchToCaregiver();
      } else {
        setPinError(true);
        speechService.playGentleChime('alert');
        setTimeout(() => {
          setPinInput('');
          setPinError(false);
        }, 1000);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b-2 border-stone-200/80 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back to Home or Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentView !== 'home' ? (
              <button
                onClick={() => {
                  speechService.playGentleChime('tap');
                  speechService.speak('Returning to home screen.');
                  onNavigate('home');
                }}
                className="flex items-center gap-2 rounded-2xl bg-white border-2 border-stone-300 hover:border-[#2D6A4F] px-4 py-2.5 shadow-sm text-slate-800 active:scale-95 transition cursor-pointer"
                title="Go back to Home"
              >
                <ArrowLeft className="h-6 w-6 text-[#2D6A4F]" />
                <span className="text-lg sm:text-xl font-bold">{t.home}</span>
              </button>
            ) : (
              <button
                onClick={onSwitchToLanding}
                className="flex items-center gap-2.5 text-left group cursor-pointer"
                title="View SAATHI Info"
              >
                <div className="h-11 w-11 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center font-black text-xl shadow-sm">
                  S
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#2D6A4F] tracking-tight flex items-center gap-1.5">
                    SAATHI
                  </h1>
                  <p className="text-[11px] text-stone-500 font-semibold hidden sm:block">
                    {t.brandTagline}
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Right Controls: High touch target for elderly */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prominent Language Switcher */}
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />

            {/* Font Size Toggle */}
            <div className="hidden lg:flex items-center bg-white border border-stone-300 rounded-xl p-0.5 shadow-xs">
              <button
                onClick={() => onFontSizeChange('normal')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                  fontSize === 'normal'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                onClick={() => onFontSizeChange('large')}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-bold ${
                  fontSize === 'large'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Large Text Size"
              >
                A+
              </button>
              <button
                onClick={() => onFontSizeChange('xlarge')}
                className={`px-2.5 py-1.5 rounded-lg text-base font-bold ${
                  fontSize === 'xlarge'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Extra Large Text Size"
              >
                A++
              </button>
            </div>

            {/* Voice Sound Readout Toggle */}
            <button
              onClick={toggleSound}
              className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 transition cursor-pointer ${
                soundOn
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-stone-100 border-stone-300 text-stone-500'
              }`}
              title={soundOn ? 'Voice Read-Aloud is ON' : 'Voice is Muted'}
              aria-label={soundOn ? 'Voice Read-Aloud is ON' : 'Voice is Muted'}
            >
              {soundOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </button>

            {/* Emergency SOS Call (High touch target, muted red) */}
            <button
              onClick={() => {
                speechService.playGentleChime('alert');
                onOpenEmergency();
              }}
              className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md transition cursor-pointer border-2 border-rose-500"
              title="Emergency Call Priya (Daughter)"
            >
              <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="text-base sm:text-lg font-black tracking-wide">{t.sos}</span>
            </button>

            {/* Caregiver Switch Button */}
            <button
              onClick={handleCaregiverAccess}
              className="flex items-center gap-1.5 rounded-2xl bg-stone-200/80 hover:bg-stone-300 active:scale-95 text-stone-700 px-3 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Caregiver Portal for Priya Sharma"
            >
              <KeyRound className="h-4 w-4 text-stone-600" />
              <span className="hidden sm:inline">Caregiver</span>
            </button>
          </div>
        </div>
      </header>

      {/* PIN Security Modal for Switching to Caregiver Mode */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-2 border-stone-200">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-800">Caregiver Mode Access</h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter Caregiver PIN (Default: <strong>1234</strong>) to view monitoring dashboard.
              </p>
            </div>

            {/* PIN Dots */}
            <div className="mt-5 flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-4 w-4 rounded-full transition-all ${
                    pinInput.length > idx
                      ? pinError
                        ? 'bg-rose-500 scale-125'
                        : 'bg-[#2D6A4F] scale-110'
                      : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="mt-2 text-center text-xs font-bold text-rose-600">
                Incorrect PIN. Use 1234 or tap Quick Access below.
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') {
                      setPinInput('');
                      setPinError(false);
                    } else if (key === '✓') {
                      verifyPin();
                    } else {
                      if (pinInput.length < 4) {
                        verifyPin(key);
                      }
                    }
                  }}
                  className="flex h-12 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 font-bold text-lg text-slate-800 transition cursor-pointer"
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  onSwitchToCaregiver();
                }}
                className="w-full py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-semibold transition"
              >
                Quick Enter (Caregiver)
              </button>
              <button
                onClick={() => setShowPinModal(false)}
                className="w-full py-2 rounded-xl text-stone-500 hover:text-stone-700 text-xs font-medium"
              >
                Cancel & Stay in Patient Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
