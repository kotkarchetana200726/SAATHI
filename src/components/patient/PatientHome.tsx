import React from 'react';
import {
  Brain,
  Hash,
  Eye,
  HeartHandshake,
  Mic,
  Calendar,
  Volume2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PatientProfile } from '../../types';
import { speechService } from '../../services/speech';
import { Language, getTranslation } from '../../services/translations';

interface Props {
  patient: PatientProfile;
  onSelectAction: (
    action: 'games' | 'memory' | 'assistant' | 'today',
    specificGame?: 'match' | 'sequence' | 'recognition'
  ) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  language: Language;
}

export const PatientHome: React.FC<Props> = ({
  patient,
  onSelectAction,
  fontSize,
  language,
}) => {
  const t = getTranslation(language);
  const now = new Date();
  const hours = now.getHours();
  const timeGreeting =
    hours < 12 ? t.goodMorning : hours < 17 ? t.goodAfternoon : t.goodEvening;

  const firstName = patient.name.split(' ')[0];
  const fullGreeting = `${timeGreeting}, ${firstName}`;

  const dateFormatted = now.toLocaleDateString(
    language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'bn' ? 'bn-IN' : 'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  const fontHeading =
    fontSize === 'xlarge'
      ? 'text-3xl sm:text-4xl'
      : fontSize === 'large'
      ? 'text-2xl sm:text-3xl'
      : 'text-2xl sm:text-3xl';
  const descSize =
    fontSize === 'xlarge' ? 'text-lg sm:text-xl' : fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  const readGreetingAloud = () => {
    speechService.speak(
      `${fullGreeting}. ${t.readyToExercise}. Tap any game below to play.`,
      { priority: true }
    );
  };

  const handleCardClick = (
    action: 'games' | 'memory' | 'assistant' | 'today',
    title: string,
    specificGame?: 'match' | 'sequence' | 'recognition'
  ) => {
    speechService.playGentleChime('tap');
    speechService.speak(title, { priority: true });
    onSelectAction(action, specificGame);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Calm Greeting Banner */}
      <section
        aria-label="Daily greeting"
        className="rounded-3xl bg-white/95 border-2 border-stone-200/90 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#2D6A4F] text-xs sm:text-sm font-bold border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{dateFormatted}</span>
          </span>
          <h2 className={`mt-2 font-black text-slate-800 tracking-tight ${fontHeading}`}>
            {fullGreeting}
          </h2>
          <p className="mt-1 text-slate-600 font-bold text-base sm:text-lg">
            {t.readyToExercise}
          </p>
        </div>

        <button
          onClick={readGreetingAloud}
          className="self-start sm:self-center flex items-center gap-2.5 rounded-2xl bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2D6A4F] px-4 py-3 font-bold text-sm sm:text-base transition cursor-pointer active:scale-95 border border-emerald-300 shadow-xs"
          title="Listen to this greeting"
        >
          <Volume2 className="h-5 w-5 text-[#2D6A4F]" />
          <span>{t.readAloud}</span>
        </button>
      </section>

      {/* GAMING-FIRST PRIMARY CARDS (3 Games + Memories + Assistant) */}
      <section aria-label="Cognitive Games & Memory" className="mt-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-500">
            Cognitive Exercise Games
          </h3>
          <span className="text-xs font-semibold text-[#2D6A4F]">
            Gentle & Playable
          </span>
        </div>

        {/* 1. 🧠 Memory Match */}
        <button
          onClick={() => handleCardClick('games', t.memoryMatchTitle, 'match')}
          className="w-full group relative flex items-center justify-between text-left rounded-3xl p-5 sm:p-7 bg-[#EBF7EE] hover:bg-[#D8F0DE] active:scale-98 border-3 border-[#A3D9B5] shadow-md hover:shadow-lg transition cursor-pointer"
          aria-label={t.memoryMatchTitle}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#2D6A4F] text-white shadow-sm group-hover:scale-105 transition shrink-0">
              <Brain className="h-9 w-9 sm:h-11 sm:w-11" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl" role="img" aria-label="brain">🧠</span>
                <h4 className={`font-black text-[#1B4332] tracking-tight ${fontHeading}`}>
                  {t.memoryMatchTitle}
                </h4>
              </div>
              <p className={`font-semibold text-[#2D6A4F] mt-1 ${descSize}`}>
                {t.memoryMatchSubtitle}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-white/80 items-center justify-center text-[#2D6A4F] shadow-xs shrink-0 group-hover:translate-x-1 transition">
            <ArrowRight className="h-6 w-6" />
          </div>
        </button>

        {/* 2. 🔢 Remember the Sequence */}
        <button
          onClick={() => handleCardClick('games', t.sequenceTitle, 'sequence')}
          className="w-full group relative flex items-center justify-between text-left rounded-3xl p-5 sm:p-7 bg-[#EBF4FA] hover:bg-[#D9ECF7] active:scale-98 border-3 border-[#A8D3EF] shadow-md hover:shadow-lg transition cursor-pointer"
          aria-label={t.sequenceTitle}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#0284C7] text-white shadow-sm group-hover:scale-105 transition shrink-0">
              <Hash className="h-9 w-9 sm:h-11 sm:w-11" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl" role="img" aria-label="numbers">🔢</span>
                <h4 className={`font-black text-[#0369A1] tracking-tight ${fontHeading}`}>
                  {t.sequenceTitle}
                </h4>
              </div>
              <p className={`font-semibold text-[#0284C7] mt-1 ${descSize}`}>
                {t.sequenceSubtitle}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-white/80 items-center justify-center text-[#0284C7] shadow-xs shrink-0 group-hover:translate-x-1 transition">
            <ArrowRight className="h-6 w-6" />
          </div>
        </button>

        {/* 3. 🖼️ Object Recognition */}
        <button
          onClick={() => handleCardClick('games', t.objectRecTitle, 'recognition')}
          className="w-full group relative flex items-center justify-between text-left rounded-3xl p-5 sm:p-7 bg-[#FFF8E7] hover:bg-[#FCEFD0] active:scale-98 border-3 border-[#F7D896] shadow-md hover:shadow-lg transition cursor-pointer"
          aria-label={t.objectRecTitle}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#D97706] text-white shadow-sm group-hover:scale-105 transition shrink-0">
              <Eye className="h-9 w-9 sm:h-11 sm:w-11" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl" role="img" aria-label="frame">🖼️</span>
                <h4 className={`font-black text-[#92400E] tracking-tight ${fontHeading}`}>
                  {t.objectRecTitle}
                </h4>
              </div>
              <p className={`font-semibold text-[#B45309] mt-1 ${descSize}`}>
                {t.objectRecSubtitle}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-white/80 items-center justify-center text-[#D97706] shadow-xs shrink-0 group-hover:translate-x-1 transition">
            <ArrowRight className="h-6 w-6" />
          </div>
        </button>
      </section>

      {/* SECONDARY ROW: My Memories & Talk to Assistant */}
      <section aria-label="Memory and Voice Assistance" className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 4. 💭 My Memories */}
        <button
          onClick={() => handleCardClick('memory', t.myMemoriesTitle)}
          className="group relative flex flex-col justify-between text-left rounded-3xl p-6 sm:p-7 bg-[#F4EEFB] hover:bg-[#EAE0F7] active:scale-98 border-3 border-[#D8C6F2] shadow-sm hover:shadow-md transition cursor-pointer min-h-[160px]"
          aria-label={t.myMemoriesTitle}
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6B46C1] text-white shadow-xs group-hover:scale-105 transition">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <span className="text-3xl" role="img" aria-label="thought">💭</span>
          </div>

          <div className="mt-4">
            <h4 className={`font-black text-[#3B1F75] tracking-tight ${fontHeading}`}>
              {t.myMemoriesTitle}
            </h4>
            <p className={`font-semibold text-[#5E32B0] mt-0.5 ${descSize}`}>
              {t.myMemoriesSubtitle}
            </p>
          </div>
        </button>

        {/* 5. 🎙️ Talk to Assistant */}
        <button
          onClick={() => handleCardClick('assistant', t.voiceAssistantTitle)}
          className="group relative flex flex-col justify-between text-left rounded-3xl p-6 sm:p-7 bg-[#EBF4FA] hover:bg-[#D9ECF7] active:scale-98 border-3 border-[#A8D3EF] shadow-sm hover:shadow-md transition cursor-pointer min-h-[160px]"
          aria-label={t.voiceAssistantTitle}
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0284C7] text-white shadow-xs group-hover:scale-105 transition">
              <Mic className="h-8 w-8" />
            </div>
            <span className="text-3xl" role="img" aria-label="mic">🎙️</span>
          </div>

          <div className="mt-4">
            <h4 className={`font-black text-[#0369A1] tracking-tight ${fontHeading}`}>
              {t.voiceAssistantTitle}
            </h4>
            <p className={`font-semibold text-[#0284C7] mt-0.5 ${descSize}`}>
              {t.voiceAssistantSubtitle}
            </p>
          </div>
        </button>
      </section>

      {/* QUICK BAR: Today's Schedule & Medicines */}
      <section className="mt-6">
        <button
          onClick={() => handleCardClick('today', t.todayScheduleTitle)}
          className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border-2 border-stone-200 hover:border-amber-400 shadow-xs transition cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-base font-extrabold text-slate-800">{t.todayScheduleTitle}</p>
              <p className="text-xs text-stone-500 font-semibold">{t.todayScheduleSubtitle}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            View Schedule &rarr;
          </span>
        </button>
      </section>

      {/* Reassurance footer */}
      <footer className="mt-8 text-center">
        <p className="text-stone-500 font-semibold text-xs sm:text-sm">
          Priya is with you at home. Tap any large card above anytime.
        </p>
      </footer>
    </main>
  );
};
