import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Sunset, CheckCircle2, Circle, Clock, Volume2, Pill, Smile, Sparkles } from 'lucide-react';
import { Medication, DailyActivity, MoodEntry, PatientProfile } from '../../../types';
import { storageService } from '../../../services/storage';
import { speechService } from '../../../services/speech';

interface Props {
  patient: PatientProfile;
}

export const TodaySchedule: React.FC<Props> = ({ patient }) => {
  const [medications, setMedications] = useState<Medication[]>(() => storageService.getMedications());
  const [activities, setActivities] = useState<DailyActivity[]>(() => storageService.getActivities());
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const now = new Date();
  const hours = now.getHours();

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const timePeriod =
    hours >= 5 && hours < 12
      ? { label: 'Morning (ৰাতিপুৱা)', icon: Sunrise, bg: 'from-amber-100 to-amber-50', color: 'text-amber-700' }
      : hours >= 12 && hours < 17
      ? { label: 'Afternoon (দুপৰীয়া)', icon: Sun, bg: 'from-sky-100 to-sky-50', color: 'text-sky-700' }
      : hours >= 17 && hours < 21
      ? { label: 'Evening (সন্ধিয়া)', icon: Sunset, bg: 'from-orange-100 to-rose-50', color: 'text-orange-700' }
      : { label: 'Night (নিশা)', icon: Moon, bg: 'from-indigo-100 to-slate-100', color: 'text-indigo-800' };

  const dayFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleToggleMed = (id: string, name: string, alreadyTaken: boolean) => {
    speechService.playGentleChime(alreadyTaken ? 'tap' : 'success');
    const updated = storageService.toggleMedication(id);
    setMedications(updated);
    if (!alreadyTaken) {
      speechService.speak(`Very good! Marked ${name} as taken. Priya can see this on her phone.`);
    } else {
      speechService.speak(`Unmarked ${name}.`);
    }
  };

  const handleToggleActivity = (id: string, title: string, completed: boolean) => {
    speechService.playGentleChime('tap');
    const updated = storageService.toggleActivity(id);
    setActivities(updated);
    if (!completed) {
      speechService.speak(`Wonderful! ${title} completed.`);
    }
  };

  const handleMoodSelect = (mood: MoodEntry['mood'], label: string) => {
    speechService.playGentleChime('success');
    setCurrentMood(mood);
    storageService.addMood(mood, label);
    if (mood === 'confused' || mood === 'sad') {
      speechService.speak(
        `Thank you for sharing, Asha ji. Remember Priya is with you, and everything is completely safe. Take a gentle sip of warm water.`
      );
    } else {
      speechService.speak(`So wonderful to know you feel ${label}, Asha ji! Wishing you a peaceful day.`);
    }
  };

  const readScheduleOverview = () => {
    const remainingMeds = medications.filter((m) => !m.taken).length;
    speechService.speak(
      `Today is ${dayFormatted}, ${dateFormatted}. It is ${timePeriod.label}, currently ${currentTimeStr}. You have ${remainingMeds} scheduled medications remaining for today.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* 1. Large Orientation Banner (Time, Day, Period) */}
      <section 
        aria-label="Current time and date"
        className={`rounded-3xl bg-gradient-to-br ${timePeriod.bg} border-3 border-amber-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6`}
      >
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-3xl bg-white shadow-md">
            <timePeriod.icon className={`h-12 w-12 sm:h-14 sm:w-14 ${timePeriod.color}`} />
          </div>
          <div>
            <span className={`text-base sm:text-lg font-extrabold uppercase tracking-wide ${timePeriod.color}`}>
              {timePeriod.label}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight mt-0.5">
              {dayFormatted}
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 font-bold mt-1">
              {dateFormatted}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-2xl shadow-xs border border-amber-200">
            <Clock className="h-6 w-6 text-amber-600" />
            <span className="text-2xl sm:text-3xl font-black text-slate-800">
              {currentTimeStr}
            </span>
          </div>
          <button
            onClick={readScheduleOverview}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 font-bold text-sm hover:bg-stone-50 border border-stone-300 shadow-xs cursor-pointer"
            title="Read orientation aloud"
          >
            <Volume2 className="h-5 w-5 text-amber-700" />
            <span>Read Aloud</span>
          </button>
        </div>
      </section>

      {/* 2. Today's Medicines (High Contrast, Big Check-offs) */}
      <section aria-labelledby="medicines-heading" className="rounded-3xl bg-white border-3 border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[#2D6A4F]">
              <Pill className="h-7 w-7" />
            </div>
            <div>
              <h3 id="medicines-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] tracking-tight">
                Today&apos;s Medicines
              </h3>
              <p className="text-sm sm:text-base text-stone-500 font-medium">
                ঔষধ • Tap the large box when taken
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
            {medications.filter((m) => m.taken).length} of {medications.length} Taken
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`rounded-2xl border-3 p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                med.taken
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-white border-stone-300 hover:border-emerald-500 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 font-bold text-sm">
                  {med.timing}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl sm:text-2xl font-black text-slate-800">
                      {med.name}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {med.dose}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-emerald-800 font-semibold mt-1">
                    {med.purpose}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    {med.instructions}
                  </p>
                  {med.taken && med.takenAt && (
                    <span className="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      ✓ Taken at {med.takenAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Huge Tactile Checkbox Button */}
              <button
                onClick={() => handleToggleMed(med.id, med.name, med.taken)}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-lg transition cursor-pointer active:scale-95 shadow-sm ${
                  med.taken
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-stone-100 hover:bg-emerald-50 text-slate-800 border-2 border-stone-300 hover:border-emerald-400'
                }`}
                aria-label={`Mark ${med.name} as ${med.taken ? 'not taken' : 'taken'}`}
              >
                {med.taken ? (
                  <>
                    <CheckCircle2 className="h-7 w-7 text-white" />
                    <span>Taken ✓</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-7 w-7 text-stone-400" />
                    <span>I Took This</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Daily Gentle Routine */}
      <section aria-labelledby="routine-heading" className="rounded-3xl bg-white border-3 border-stone-200 p-6 sm:p-8 shadow-sm">
        <h3 id="routine-heading" className="text-2xl sm:text-3xl font-extrabold text-[#92400E] tracking-tight pb-4 border-b border-stone-200">
          Daily Gentle Routine
        </h3>

        <div className="mt-6 space-y-3.5">
          {activities.map((act) => (
            <div
              key={act.id}
              onClick={() => handleToggleActivity(act.id, act.title, act.completed)}
              className={`flex items-center justify-between p-4.5 rounded-2xl border-2 transition cursor-pointer ${
                act.completed
                  ? 'bg-stone-50 border-stone-200 opacity-75'
                  : 'bg-white border-stone-300 hover:border-amber-400 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl">
                  {act.time}
                </span>
                <div>
                  <h4 className={`text-lg sm:text-xl font-bold ${act.completed ? 'line-through text-stone-400' : 'text-slate-800'}`}>
                    {act.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="p-2">
                {act.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <Circle className="h-6 w-6 text-stone-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Gentle Feeling Check-in */}
      <section aria-labelledby="feelings-heading" className="rounded-3xl bg-[#FAF5FF] border-3 border-purple-200 p-6 sm:p-8 shadow-sm text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 mb-3">
          <Smile className="h-8 w-8" />
        </div>
        <h3 id="feelings-heading" className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Asha ji, how are you feeling right now?
        </h3>
        <p className="text-base text-purple-800 mt-1">
          আপুনি এতিয়া কেনে অনুভৱ কৰিছে? Tap one emoji below.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { id: 'happy', emoji: '😊', label: 'Happy & Loved', assamese: 'আনন্দিত' },
            { id: 'peaceful', emoji: '😌', label: 'Calm & Peaceful', assamese: 'শান্ত' },
            { id: 'confused', emoji: '😕', label: 'A Bit Confused', assamese: 'বিভ্ৰান্ত' },
            { id: 'sleepy', emoji: '🥱', label: 'Sleepy / Tired', assamese: 'ভাগৰুৱা' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleMoodSelect(item.id as MoodEntry['mood'], item.label)}
              className={`p-4 rounded-2xl border-3 flex flex-col items-center justify-center transition cursor-pointer ${
                currentMood === item.id
                  ? 'bg-purple-200 border-purple-600 scale-105 shadow-md'
                  : 'bg-white border-purple-200 hover:bg-purple-100 active:scale-95'
              }`}
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="mt-2 text-sm sm:text-base font-bold text-slate-800">
                {item.label}
              </span>
              <span className="text-xs text-purple-700 font-semibold mt-0.5">
                {item.assamese}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
