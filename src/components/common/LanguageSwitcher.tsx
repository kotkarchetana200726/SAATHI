import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES } from '../../services/translations';
import { speechService } from '../../services/speech';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'header' | 'modal' | 'pill';
}

export const LanguageSwitcher: React.FC<Props> = ({
  currentLanguage,
  onLanguageChange,
  variant = 'header',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    speechService.playGentleChime('tap');
    onLanguageChange(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('saathi_lang', lang);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-2xl border-2 transition cursor-pointer select-none ${
          variant === 'pill'
            ? 'px-4 py-2.5 bg-white border-stone-300 hover:border-[#2D6A4F] text-slate-800 font-bold shadow-xs'
            : 'px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-stone-50 border-stone-300 hover:border-[#2D6A4F] text-slate-800 font-bold shadow-xs'
        }`}
        aria-label="Select Language (भाषा)"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="h-5 w-5 text-[#2D6A4F]" />
        <span className="text-sm sm:text-base font-extrabold text-slate-800">
          {currentOption.nativeName}
        </span>
        <ChevronDown className="h-4 w-4 text-stone-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-3xl bg-white p-2.5 shadow-2xl border-2 border-stone-200 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#2D6A4F]" />
              <span>Select Language / भाषा বাছক</span>
            </span>
          </div>

          <div className="mt-1 space-y-1">
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === currentLanguage;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#1B4332] font-black border border-emerald-300'
                      : 'hover:bg-stone-50 text-slate-700 font-bold'
                  }`}
                >
                  <div>
                    <p className="text-base sm:text-lg leading-tight">{item.nativeName}</p>
                    <p className="text-xs text-stone-500 font-medium">{item.name}</p>
                  </div>
                  {isSelected && (
                    <span className="h-6 w-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
