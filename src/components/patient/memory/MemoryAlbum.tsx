import React, { useState } from 'react';
import { Volume2, Play, Heart, Users, MapPin, Sparkles, HelpCircle, Plus, Calendar, Bookmark, X } from 'lucide-react';
import { MemoryItem } from '../../../types';
import { storageService } from '../../../services/storage';
import { speechService } from '../../../services/speech';
import { Language, getTranslation } from '../../../services/translations';

interface Props {
  language: Language;
}

export const MemoryAlbum: React.FC<Props> = ({ language }) => {
  const t = getTranslation(language);
  const [memories, setMemories] = useState<MemoryItem[]>(() => storageService.getMemories());
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'family' | 'places' | 'moments' | 'routine' | 'people'
  >('all');
  const [quizMemoryId, setQuizMemoryId] = useState<string | null>(null);
  const [revealedClueCount, setRevealedClueCount] = useState<Record<string, number>>({});

  // Add memory state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRelation, setAddRelation] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addCategory, setAddCategory] = useState<'family' | 'places' | 'moments' | 'routine' | 'people'>('family');
  const [addPhotoUrl, setAddPhotoUrl] = useState('');

  const filtered = memories.filter((m) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'family') return m.category === 'family';
    if (selectedCategory === 'places') return m.category === 'places';
    if (selectedCategory === 'moments') return m.category === 'moments' || m.category === 'tradition';
    if (selectedCategory === 'routine') return m.category === 'routine';
    if (selectedCategory === 'people') return m.category === 'people' || m.category === 'family';
    return true;
  });

  const playVoiceNote = (memory: MemoryItem) => {
    speechService.playGentleChime('tap');
    speechService.speak(memory.audioNoteText, { priority: true });
  };

  const readDetails = (memory: MemoryItem) => {
    speechService.speak(
      `${memory.personName}. ${memory.relation}. ${memory.description}`,
      { priority: true }
    );
  };

  const revealNextClue = (memId: string, maxClues: number) => {
    const current = revealedClueCount[memId] || 0;
    if (current < maxClues) {
      setRevealedClueCount({ ...revealedClueCount, [memId]: current + 1 });
      speechService.playGentleChime('tap');
    }
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName) return;

    const defaultImages = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    ];

    const updated = storageService.addMemory({
      title: `${addName} (${addRelation})`,
      personName: addName,
      relation: addRelation || 'Beloved',
      location: 'Guwahati, Assam',
      description: addDesc || 'A cherished memory in your life.',
      audioNoteText: `Remember ${addName}, who brings warmth and love to your heart.`,
      photoUrl: addPhotoUrl || defaultImages[Math.floor(Math.random() * defaultImages.length)],
      category: addCategory,
      clues: [addRelation || 'Family', 'Brings warmth and joy'],
    });

    setMemories(updated);
    setShowAddModal(false);
    setAddName('');
    setAddRelation('');
    setAddDesc('');
    setAddPhotoUrl('');
    speechService.playGentleChime('success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#3B1F75] tracking-tight">
            {t.memoryBankTitle}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-0.5">
            {t.memoryBankSubtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6B46C1] hover:bg-[#553C9A] text-white font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addMemory}</span>
        </button>
      </div>

      {/* 5 Requested Categories Filter Bar */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: t.categoryAll, icon: '🌟' },
          { id: 'family', label: t.categoryFamily, icon: '👨‍👩‍👧' },
          { id: 'places', label: t.categoryPlaces, icon: '📍' },
          { id: 'moments', label: t.categoryMoments, icon: '❤️' },
          { id: 'routine', label: t.categoryRoutine, icon: '📅' },
          { id: 'people', label: t.categoryPeople, icon: '👥' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id as any);
              speechService.playGentleChime('tap');
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-[#6B46C1] text-white shadow-sm'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Memory Cards Grid */}
      <div className="mt-6 space-y-6">
        {filtered.map((item) => {
          const isQuizMode = quizMemoryId === item.id;
          const cluesShown = revealedClueCount[item.id] || 0;

          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white border-3 border-stone-200 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Large Photo Section */}
                <div className="md:col-span-5 relative bg-stone-100 min-h-[220px] md:min-h-[260px]">
                  <img
                    src={item.photoUrl}
                    alt={item.personName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-stone-800 shadow-sm">
                      <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                      <span>{item.relation}</span>
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                          {item.personName}
                        </h3>
                        <p className="text-base sm:text-lg font-bold text-[#6B46C1] mt-0.5">
                          {item.relation}
                        </p>
                      </div>

                      <button
                        onClick={() => readDetails(item)}
                        className="p-2.5 rounded-xl bg-purple-50 text-[#6B46C1] hover:bg-purple-100 cursor-pointer transition border border-purple-200"
                        title={t.readAloud}
                      >
                        <Volume2 className="h-6 w-6" />
                      </button>
                    </div>

                    <p className="mt-3 text-slate-700 text-base sm:text-lg leading-relaxed font-semibold">
                      {item.description}
                    </p>
                  </div>

                  {/* Loving Voice Note & Interaction */}
                  <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={() => playVoiceNote(item)}
                      className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-[#6B46C1] hover:bg-[#553C9A] text-white py-3.5 px-4 font-bold text-base shadow-xs active:scale-98 transition cursor-pointer"
                    >
                      <Play className="h-5 w-5 fill-white" />
                      <span>{t.listenVoiceNote}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isQuizMode) {
                          setQuizMemoryId(null);
                        } else {
                          setQuizMemoryId(item.id);
                          speechService.speak(
                            `Can you recall who this is? Tap clue buttons below to see gentle reminders.`
                          );
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 text-[#553C9A] py-3.5 px-4 font-bold text-sm cursor-pointer"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span>{isQuizMode ? 'Hide Clues' : t.recallPractice}</span>
                    </button>
                  </div>

                  {/* Gentle Recall Clues if activated */}
                  {isQuizMode && (
                    <div className="mt-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                          Gentle Memory Hints
                        </span>
                        <span className="text-xs text-purple-700 font-semibold">
                          {cluesShown} of {item.clues.length} revealed
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {item.clues.slice(0, cluesShown).map((clue, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-purple-950 font-medium bg-white p-2.5 rounded-xl border border-purple-200"
                          >
                            <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
                            <span>{clue}</span>
                          </div>
                        ))}
                      </div>

                      {cluesShown < item.clues.length && (
                        <button
                          onClick={() => revealNextClue(item.id, item.clues.length)}
                          className="mt-3 w-full py-2 bg-white hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-300 transition"
                        >
                          + Reveal Next Hint
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-xl font-bold text-slate-800">Add New Memory</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-600 block">Name or Place</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya or Pune"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Relationship / Significance</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My daughter or A city I visited often"
                  value={addRelation}
                  onChange={(e) => setAddRelation(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Category</label>
                <select
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value as any)}
                  className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold"
                >
                  <option value="family">👨‍👩‍👧 Family</option>
                  <option value="places">📍 Places</option>
                  <option value="moments">❤️ Important Moments</option>
                  <option value="routine">📅 Daily Routine</option>
                  <option value="people">👥 People I Know</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Short Loving Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe who or what this is in warm, clear sentences..."
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#6B46C1] hover:bg-[#553C9A] text-white text-sm font-bold shadow-xs"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
