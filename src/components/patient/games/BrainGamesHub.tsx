import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Volume2,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  Home,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
} from 'lucide-react';
import { speechService } from '../../../services/speech';
import { storageService } from '../../../services/storage';
import { Language, getTranslation } from '../../../services/translations';

interface Props {
  initialGame?: 'match' | 'sequence' | 'recognition';
  onGoHome?: () => void;
  language: Language;
}

interface ObjectDef {
  id: string;
  nameKey: string;
  emoji: string;
  defaultName: string;
  assamese: string;
  hindi: string;
  bengali: string;
  marathi: string;
}

const FAMILIAR_OBJECTS: ObjectDef[] = [
  {
    id: 'tea',
    nameKey: 'tea',
    emoji: '☕',
    defaultName: 'Cup of Tea',
    hindi: 'चाय का कप',
    assamese: 'চাহৰ কাপ',
    bengali: 'চায়ের কাপ',
    marathi: 'चहाचा कप',
  },
  {
    id: 'glasses',
    nameKey: 'glasses',
    emoji: '👓',
    defaultName: 'Reading Glasses',
    hindi: 'चश्मा',
    assamese: 'পঢ়া চশমা',
    bengali: 'পড়ার চশমা',
    marathi: 'वाचनाचा चष्मा',
  },
  {
    id: 'bell',
    nameKey: 'bell',
    emoji: '🔔',
    defaultName: 'Prayer Bell',
    hindi: 'पूजा की घंटी',
    assamese: 'কাঁহৰ ঘণ্টা',
    bengali: 'পূজার ঘণ্টা',
    marathi: 'पूजेची घंटा',
  },
  {
    id: 'flower',
    nameKey: 'flower',
    emoji: '🌸',
    defaultName: 'Kopou Flower',
    hindi: 'सुंदर फूल',
    assamese: 'কপৌ ফুল',
    bengali: 'সুন্দর ফুল',
    marathi: 'सुंदर फूल',
  },
  {
    id: 'pen',
    nameKey: 'pen',
    emoji: '✒️',
    defaultName: 'Writing Pen',
    hindi: 'कलम / पेन',
    assamese: 'লিখা কলম',
    bengali: 'লেখার কলম',
    marathi: 'लेखणी / पेन',
  },
  {
    id: 'clock',
    nameKey: 'clock',
    emoji: '⏰',
    defaultName: 'Table Clock',
    hindi: 'मेज घड़ी',
    assamese: 'মেজ ঘড়ী',
    bengali: 'টেবিল ঘড়ি',
    marathi: 'घड्याळ',
  },
  {
    id: 'apple',
    nameKey: 'apple',
    emoji: '🍎',
    defaultName: 'Fresh Apple',
    hindi: 'सेब',
    assamese: 'আপেল',
    bengali: 'আপেল',
    marathi: 'सफरचंद',
  },
  {
    id: 'book',
    nameKey: 'book',
    emoji: '📖',
    defaultName: 'Story Book',
    hindi: 'किताब',
    assamese: 'সাধুকথাৰ পুথি',
    bengali: 'গল্পের বই',
    marathi: 'गोष्टींचे पुस्तक',
  },
];

interface MemoryCard {
  uniqueId: number;
  pairId: string;
  name: string;
  emoji: string;
}

export const BrainGamesHub: React.FC<Props> = ({
  initialGame = 'match',
  onGoHome,
  language,
}) => {
  const t = getTranslation(language);
  const [activeGame, setActiveGame] = useState<'match' | 'sequence' | 'recognition'>(initialGame);

  // Difficulty States
  const [matchDifficulty, setMatchDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() =>
    storageService.getGameDifficulty('memory-match')
  );
  const [sequenceDifficulty, setSequenceDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() =>
    storageService.getGameDifficulty('sequence')
  );
  const [recognitionDifficulty, setRecognitionDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() =>
    storageService.getGameDifficulty('object-recognition')
  );

  const getLocalizedName = (obj: ObjectDef) => {
    if (language === 'hi') return obj.hindi;
    if (language === 'as') return obj.assamese;
    if (language === 'bn') return obj.bengali;
    if (language === 'mr') return obj.marathi;
    return obj.defaultName;
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    if (mins > 0) {
      return `${mins} min ${s} sec`;
    }
    return `${sec} sec`;
  };

  // =========================================================================
  // 1. MEMORY MATCH
  // =========================================================================
  const [matchCards, setMatchCards] = useState<MemoryCard[]>([]);
  const [matchFlipped, setMatchFlipped] = useState<number[]>([]);
  const [matchMatched, setMatchMatched] = useState<string[]>([]);
  const [matchMoves, setMatchMoves] = useState(0);
  const [matchTimer, setMatchTimer] = useState(0);
  const [matchFinished, setMatchFinished] = useState(false);
  const [matchSummary, setMatchSummary] = useState<{
    accuracy: number;
    time: number;
    moves: number;
    matches: number;
    totalPairs: number;
    diffChange: 'increased' | 'decreased' | 'maintained';
    nextDiff: 'Easy' | 'Medium' | 'Hard';
  } | null>(null);

  const matchTimerRef = useRef<any>(null);

  const getMatchPairsCount = (diff: 'Easy' | 'Medium' | 'Hard') => {
    return diff === 'Easy' ? 2 : diff === 'Medium' ? 3 : 4;
  };

  const startMemoryMatch = (diff = matchDifficulty) => {
    const pairCount = getMatchPairsCount(diff);
    const chosen = [...FAMILIAR_OBJECTS].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const deck: MemoryCard[] = [];
    let id = 1;

    chosen.forEach((item) => {
      const locName = getLocalizedName(item);
      deck.push({ uniqueId: id++, pairId: item.id, name: locName, emoji: item.emoji });
      deck.push({ uniqueId: id++, pairId: item.id, name: locName, emoji: item.emoji });
    });

    setMatchCards(deck.sort(() => Math.random() - 0.5));
    setMatchFlipped([]);
    setMatchMatched([]);
    setMatchMoves(0);
    setMatchTimer(0);
    setMatchFinished(false);
    setMatchSummary(null);

    if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    matchTimerRef.current = setInterval(() => {
      setMatchTimer((t) => t + 1);
    }, 1000);

    speechService.speak(`${t.memoryMatchTitle}. ${t.matchInstruction}`);
  };

  useEffect(() => {
    if (activeGame === 'match' && matchCards.length === 0) {
      startMemoryMatch();
    }
    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    };
  }, [activeGame, language]);

  const handleMatchTap = (idx: number) => {
    if (matchFlipped.length === 2 || matchFlipped.includes(idx) || matchFinished) return;
    const card = matchCards[idx];
    if (matchMatched.includes(card.pairId)) return;

    speechService.playGentleChime('tap');
    const newFlipped = [...matchFlipped, idx];
    setMatchFlipped(newFlipped);
    speechService.speak(card.name);

    if (newFlipped.length === 2) {
      const newMoves = matchMoves + 1;
      setMatchMoves(newMoves);
      const c1 = matchCards[newFlipped[0]];
      const c2 = matchCards[newFlipped[1]];

      if (c1.pairId === c2.pairId) {
        // MATCH!
        const newMatched = [...matchMatched, c1.pairId];
        setMatchMatched(newMatched);
        setMatchFlipped([]);
        speechService.playGentleChime('success');

        const totalPairs = getMatchPairsCount(matchDifficulty);
        if (newMatched.length === totalPairs) {
          // Finished Game
          clearInterval(matchTimerRef.current);
          setMatchFinished(true);

          const accuracy = Math.min(100, Math.max(20, Math.round((totalPairs / newMoves) * 100)));
          const { nextLevel, change } = storageService.updateGameDifficulty('memory-match', accuracy);
          setMatchDifficulty(nextLevel);

          setMatchSummary({
            accuracy,
            time: matchTimer,
            moves: newMoves,
            matches: totalPairs,
            totalPairs,
            diffChange: change,
            nextDiff: nextLevel,
          });

          confetti({ particleCount: 50, spread: 60 });
          storageService.addScore({
            gameType: 'memory-match',
            title: `Memory Match (${matchDifficulty})`,
            score: totalPairs,
            maxScore: totalPairs,
            accuracy,
            attempts: newMoves,
            errors: Math.max(0, newMoves - totalPairs),
            timeTakenSeconds: matchTimer,
            difficultyLevel: matchDifficulty,
            difficultyChange: change,
            notes: `Completed ${matchDifficulty} mode in ${matchTimer}s with ${accuracy}% accuracy.`,
          });

          setTimeout(() => {
            speechService.speak(t.wellDone);
          }, 400);
        }
      } else {
        // MISMATCH
        setTimeout(() => {
          setMatchFlipped([]);
        }, 1100);
      }
    }
  };

  // =========================================================================
  // 2. REMEMBER THE SEQUENCE
  // =========================================================================
  const [seqPhase, setSeqPhase] = useState<'memorize' | 'recall' | 'completed'>('memorize');
  const [seqTarget, setSeqTarget] = useState<ObjectDef[]>([]);
  const [seqUserPicks, setSeqUserPicks] = useState<ObjectDef[]>([]);
  const [seqCountdown, setSeqCountdown] = useState(5);
  const [seqTimer, setSeqTimer] = useState(0);
  const [seqSummary, setSeqSummary] = useState<{
    accuracy: number;
    time: number;
    correctCount: number;
    total: number;
    diffChange: 'increased' | 'decreased' | 'maintained';
    nextDiff: 'Easy' | 'Medium' | 'Hard';
  } | null>(null);

  const seqCountdownRef = useRef<any>(null);
  const seqTimerRef = useRef<any>(null);

  const getSeqLength = (diff: 'Easy' | 'Medium' | 'Hard') => {
    return diff === 'Easy' ? 3 : diff === 'Medium' ? 4 : 5;
  };

  const startSequenceGame = (diff = sequenceDifficulty) => {
    const len = getSeqLength(diff);
    const chosen = [...FAMILIAR_OBJECTS].sort(() => Math.random() - 0.5).slice(0, len);
    setSeqTarget(chosen);
    setSeqUserPicks([]);
    setSeqPhase('memorize');
    const cd = len <= 3 ? 5 : len === 4 ? 7 : 8;
    setSeqCountdown(cd);
    setSeqTimer(0);
    setSeqSummary(null);

    const names = chosen.map((c) => getLocalizedName(c)).join(', ');
    speechService.speak(`${t.sequenceTitle}. ${names}`);

    if (seqCountdownRef.current) clearInterval(seqCountdownRef.current);
    if (seqTimerRef.current) clearInterval(seqTimerRef.current);

    let count = cd;
    seqCountdownRef.current = setInterval(() => {
      count -= 1;
      setSeqCountdown(count);
      if (count <= 0) {
        clearInterval(seqCountdownRef.current);
        switchToSeqRecall();
      }
    }, 1000);

    seqTimerRef.current = setInterval(() => {
      setSeqTimer((s) => s + 1);
    }, 1000);
  };

  const switchToSeqRecall = () => {
    if (seqCountdownRef.current) clearInterval(seqCountdownRef.current);
    setSeqPhase('recall');
    speechService.playGentleChime('alert');
    speechService.speak(t.sequenceRecall);
  };

  const handleSeqPick = (obj: ObjectDef) => {
    if (seqPhase !== 'recall' || seqUserPicks.length >= seqTarget.length) return;
    speechService.playGentleChime('tap');
    speechService.speak(getLocalizedName(obj));

    const nextPicks = [...seqUserPicks, obj];
    setSeqUserPicks(nextPicks);

    if (nextPicks.length === seqTarget.length) {
      if (seqTimerRef.current) clearInterval(seqTimerRef.current);
      setSeqPhase('completed');

      let correct = 0;
      nextPicks.forEach((p, i) => {
        if (p.id === seqTarget[i].id) correct += 1;
      });

      const accuracy = Math.round((correct / seqTarget.length) * 100);
      const { nextLevel, change } = storageService.updateGameDifficulty('sequence', accuracy);
      setSequenceDifficulty(nextLevel);

      setSeqSummary({
        accuracy,
        time: seqTimer,
        correctCount: correct,
        total: seqTarget.length,
        diffChange: change,
        nextDiff: nextLevel,
      });

      if (accuracy >= 80) {
        confetti({ particleCount: 50, spread: 60 });
        speechService.playGentleChime('success');
      }

      storageService.addScore({
        gameType: 'sequence',
        title: `Remember the Sequence (${sequenceDifficulty})`,
        score: correct,
        maxScore: seqTarget.length,
        accuracy,
        attempts: 1,
        errors: seqTarget.length - correct,
        timeTakenSeconds: seqTimer,
        difficultyLevel: sequenceDifficulty,
        difficultyChange: change,
        notes: `Reproduced ${correct}/${seqTarget.length} sequence items correctly with ${accuracy}% accuracy.`,
      });

      setTimeout(() => speechService.speak(t.wellDone), 400);
    }
  };

  // =========================================================================
  // 3. OBJECT RECOGNITION (Culturally Familiar Simple Questions)
  // =========================================================================
  interface RecQuestion {
    id: number;
    promptEn: string;
    promptHi: string;
    promptAs: string;
    promptBn: string;
    promptMr: string;
    correctId: string;
    options: ObjectDef[];
  }

  const QUESTIONS_DATA: RecQuestion[] = [
    {
      id: 1,
      promptEn: 'Which one is a cup of hot tea?',
      promptHi: 'इनमें से गर्म चाय का कप कौन सा है?',
      promptAs: 'ইয়াৰ ভিতৰত গৰম চাহৰ কাপ কোনটো?',
      promptBn: 'এর মধ্যে গরম চায়ের কাপ কোনটি?',
      promptMr: 'यापैकी गरम चहाचा कप कोणता आहे?',
      correctId: 'tea',
      options: [FAMILIAR_OBJECTS[0], FAMILIAR_OBJECTS[1], FAMILIAR_OBJECTS[4]],
    },
    {
      id: 2,
      promptEn: 'What do you use for reading words clearly?',
      promptHi: 'अक्षरों को साफ-साफ पढ़ने के लिए किसका उपयोग करते हैं?',
      promptAs: 'আখৰ স্পষ্টকৈ পঢ়িবলৈ কি ব্যৱহাৰ কৰা হয়?',
      promptBn: 'লেখা স্পষ্টভাবে পড়ার জন্য কোনটি ব্যবহার করা হয়?',
      promptMr: 'अक्षरे स्पष्ट वाचण्यासाठी कशाचा वापर केला जातो?',
      correctId: 'glasses',
      options: [FAMILIAR_OBJECTS[1], FAMILIAR_OBJECTS[2], FAMILIAR_OBJECTS[6]],
    },
    {
      id: 3,
      promptEn: 'Which one is a writing pen?',
      promptHi: 'इनमें से लिखने वाली कलम (पेन) कौन सी है?',
      promptAs: 'ইয়াৰ ভিতৰত লিখা কলম কোনটো?',
      promptBn: 'এর মধ্যে লেখার কলম কোনটি?',
      promptMr: 'यापैकी लिहिण्याची लेखणी (पेन) कोणती आहे?',
      correctId: 'pen',
      options: [FAMILIAR_OBJECTS[4], FAMILIAR_OBJECTS[0], FAMILIAR_OBJECTS[5]],
    },
    {
      id: 4,
      promptEn: 'Which one rings in the morning temple prayer?',
      promptHi: 'सुबह पूजा के समय कौन सी घंटी बजाई जाती है?',
      promptAs: 'পুৱাৰ প্ৰাৰ্থনাত কোনটো ঘণ্টা বজোৱা হয়?',
      promptBn: 'সকালের পূজোর সময় কোন ঘণ্টাটি বাজানো হয়?',
      promptMr: 'सकाळच्या पूजेच्या वेळी कोणती घंटा वाजवली जाते?',
      correctId: 'bell',
      options: [FAMILIAR_OBJECTS[2], FAMILIAR_OBJECTS[3], FAMILIAR_OBJECTS[7]],
    },
  ];

  const [recIndex, setRecIndex] = useState(0);
  const [recSelectedId, setRecSelectedId] = useState<string | null>(null);
  const [recScore, setRecScore] = useState(0);
  const [recTimer, setRecTimer] = useState(0);
  const [recFinished, setRecFinished] = useState(false);
  const [recSummary, setRecSummary] = useState<{
    accuracy: number;
    time: number;
    score: number;
    total: number;
    diffChange: 'increased' | 'decreased' | 'maintained';
    nextDiff: 'Easy' | 'Medium' | 'Hard';
  } | null>(null);

  const recTimerRef = useRef<any>(null);

  const startRecognitionGame = (diff = recognitionDifficulty) => {
    setRecIndex(0);
    setRecSelectedId(null);
    setRecScore(0);
    setRecTimer(0);
    setRecFinished(false);
    setRecSummary(null);

    if (recTimerRef.current) clearInterval(recTimerRef.current);
    recTimerRef.current = setInterval(() => setRecTimer((t) => t + 1), 1000);

    const first = QUESTIONS_DATA[0];
    const promptText = getQuestionPrompt(first);
    speechService.speak(`${t.objectRecTitle}. ${promptText}`);
  };

  const getQuestionPrompt = (q: RecQuestion) => {
    if (language === 'hi') return q.promptHi;
    if (language === 'as') return q.promptAs;
    if (language === 'bn') return q.promptBn;
    if (language === 'mr') return q.promptMr;
    return q.promptEn;
  };

  const handleRecAnswer = (pickedId: string) => {
    if (recSelectedId !== null) return;
    setRecSelectedId(pickedId);
    const q = QUESTIONS_DATA[recIndex];
    const isCorrect = pickedId === q.correctId;

    if (isCorrect) {
      setRecScore((s) => s + 1);
      speechService.playGentleChime('success');
      speechService.speak(t.correctExclamation);
    } else {
      speechService.playGentleChime('tap');
      speechService.speak(t.gentleClose);
    }

    setTimeout(() => {
      if (recIndex < QUESTIONS_DATA.length - 1) {
        setRecIndex((i) => i + 1);
        setRecSelectedId(null);
        const nextQ = QUESTIONS_DATA[recIndex + 1];
        speechService.speak(getQuestionPrompt(nextQ));
      } else {
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        setRecFinished(true);

        const finalScore = recScore + (isCorrect ? 1 : 0);
        const accuracy = Math.round((finalScore / QUESTIONS_DATA.length) * 100);
        const { nextLevel, change } = storageService.updateGameDifficulty('object-recognition', accuracy);
        setRecognitionDifficulty(nextLevel);

        setRecSummary({
          accuracy,
          time: recTimer,
          score: finalScore,
          total: QUESTIONS_DATA.length,
          diffChange: change,
          nextDiff: nextLevel,
        });

        if (accuracy >= 80) confetti({ particleCount: 50, spread: 60 });
        storageService.addScore({
          gameType: 'object-recognition',
          title: `Object Recognition (${recognitionDifficulty})`,
          score: finalScore,
          maxScore: QUESTIONS_DATA.length,
          accuracy,
          attempts: QUESTIONS_DATA.length,
          errors: QUESTIONS_DATA.length - finalScore,
          timeTakenSeconds: recTimer,
          difficultyLevel: recognitionDifficulty,
          difficultyChange: change,
          notes: `Recognized ${finalScore}/${QUESTIONS_DATA.length} familiar objects with ${accuracy}% accuracy.`,
        });

        setTimeout(() => speechService.speak(t.wellDone), 400);
      }
    }, 1800);
  };

  // Generic Result Card Component complying with Requirement #9
  const renderFriendlyResult = (data: {
    accuracy: number;
    time: number;
    matchesStr: string;
    diffChange: 'increased' | 'decreased' | 'maintained';
    nextDiff: 'Easy' | 'Medium' | 'Hard';
    onPlayAgain: () => void;
  }) => {
    const encouragement =
      data.accuracy >= 80
        ? t.encouragementGreat
        : data.accuracy >= 50
        ? t.encouragementGood
        : t.encouragementGentle;

    return (
      <div className="my-6 p-6 sm:p-8 rounded-3xl bg-white border-3 border-stone-200 shadow-md text-center animate-in zoom-in-95 max-w-lg mx-auto">
        <span className="text-5xl mb-2 inline-block">🌟</span>
        <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          {t.wellDone}
        </h3>
        <p className="mt-2 text-base sm:text-lg text-[#2D6A4F] font-bold">
          {encouragement}
        </p>

        {/* Big Clean Results Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase text-stone-500">{t.accuracy}</span>
            <p className="text-2xl font-black text-[#2D6A4F] mt-1">{data.accuracy}%</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-stone-500">{t.time}</span>
            <p className="text-xl font-black text-slate-800 mt-1">{formatSeconds(data.time)}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-stone-500">{t.matches}</span>
            <p className="text-2xl font-black text-purple-900 mt-1">{data.matchesStr}</p>
          </div>
        </div>

        {/* Adaptive progression message */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
          {data.diffChange === 'increased' && (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span>{t.adaptiveIncreased}</span>
            </>
          )}
          {data.diffChange === 'decreased' && (
            <>
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <span>{t.adaptiveDecreased}</span>
            </>
          )}
          {data.diffChange === 'maintained' && (
            <>
              <Minus className="h-4 w-4 text-stone-600" />
              <span>{t.adaptiveMaintained}</span>
            </>
          )}
        </div>

        {/* Action Buttons: Play Again, Try Another Game, Go Home */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={data.onPlayAgain}
            className="w-full py-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-black text-lg shadow-sm cursor-pointer transition active:scale-98"
          >
            {t.playAgain}
          </button>

          <button
            onClick={() => {
              if (activeGame === 'match') {
                setActiveGame('sequence');
                startSequenceGame();
              } else if (activeGame === 'sequence') {
                setActiveGame('recognition');
                startRecognitionGame();
              } else {
                setActiveGame('match');
                startMemoryMatch();
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-[#E8F4FA] hover:bg-[#D9ECF7] text-[#0284C7] font-bold text-base border-2 border-[#A8D3EF] cursor-pointer transition"
          >
            {t.tryAnotherGame}
          </button>

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full py-3 rounded-2xl text-stone-600 hover:text-slate-800 hover:bg-stone-100 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>{t.goHome}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 pb-6 border-b border-stone-200">
        <button
          onClick={() => {
            setActiveGame('match');
            if (matchCards.length === 0) startMemoryMatch();
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-base sm:text-lg font-black transition cursor-pointer ${
            activeGame === 'match'
              ? 'bg-[#2D6A4F] text-white shadow-md'
              : 'bg-white border-2 border-stone-300 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <span>🧠</span>
          <span>{t.memoryMatchTitle}</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('sequence');
            if (seqTarget.length === 0) startSequenceGame();
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-base sm:text-lg font-black transition cursor-pointer ${
            activeGame === 'sequence'
              ? 'bg-[#2D6A4F] text-white shadow-md'
              : 'bg-white border-2 border-stone-300 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <span>🔢</span>
          <span>{t.sequenceTitle}</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('recognition');
            if (!recFinished && recIndex === 0 && recTimer === 0) startRecognitionGame();
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-base sm:text-lg font-black transition cursor-pointer ${
            activeGame === 'recognition'
              ? 'bg-[#2D6A4F] text-white shadow-md'
              : 'bg-white border-2 border-stone-300 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <span>🖼️</span>
          <span>{t.objectRecTitle}</span>
        </button>
      </div>

      {/* GAME 1: MEMORY MATCH */}
      {activeGame === 'match' && (
        <div className="mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-[#1B4332]">
                  {t.memoryMatchTitle}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {t.level}: {matchDifficulty === 'Easy' ? t.levelEasy : matchDifficulty === 'Medium' ? t.levelMedium : t.levelHard}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                {t.matchInstruction}
              </p>
            </div>

            <button
              onClick={() => startMemoryMatch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.restart}</span>
            </button>
          </div>

          {matchFinished && matchSummary ? (
            renderFriendlyResult({
              accuracy: matchSummary.accuracy,
              time: matchSummary.time,
              matchesStr: `${matchSummary.matches} / ${matchSummary.totalPairs}`,
              diffChange: matchSummary.diffChange,
              nextDiff: matchSummary.nextDiff,
              onPlayAgain: () => startMemoryMatch(matchSummary.nextDiff),
            })
          ) : (
            <div className={`grid gap-4 mt-6 ${
              matchCards.length <= 4 ? 'grid-cols-2 max-w-sm mx-auto' : 'grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto'
            }`}>
              {matchCards.map((card, idx) => {
                const isFlipped = matchFlipped.includes(idx) || matchMatched.includes(card.pairId);
                const isMatched = matchMatched.includes(card.pairId);

                return (
                  <button
                    key={card.uniqueId}
                    onClick={() => handleMatchTap(idx)}
                    className={`h-36 sm:h-44 rounded-3xl border-3 flex flex-col items-center justify-center p-3 transition-all duration-300 cursor-pointer shadow-sm select-none ${
                      isMatched
                        ? 'bg-emerald-100 border-emerald-400 opacity-90 scale-98'
                        : isFlipped
                        ? 'bg-white border-[#2D6A4F] shadow-lg scale-102'
                        : 'bg-[#D8F3DC] border-[#95D5B2] hover:bg-[#B7E4C7] active:scale-95'
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span className="text-5xl">{card.emoji}</span>
                        <span className="mt-2 text-base sm:text-lg font-black text-slate-800 text-center">
                          {card.name}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl opacity-60">🌿</span>
                        <span className="mt-2 text-sm font-bold text-[#2D6A4F]">
                          {t.tapToFlip}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!matchFinished && (
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-stone-600 font-bold">
              <span>{t.pairsFound}: {matchMatched.length} / {getMatchPairsCount(matchDifficulty)}</span>
              <span>{t.moves}: {matchMoves}</span>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: REMEMBER THE SEQUENCE */}
      {activeGame === 'sequence' && (
        <div className="mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-[#0369A1]">
                  {t.sequenceTitle}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                  {t.level}: {sequenceDifficulty === 'Easy' ? t.levelEasy : sequenceDifficulty === 'Medium' ? t.levelMedium : t.levelHard}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                {t.sequenceSubtitle}
              </p>
            </div>

            <button
              onClick={() => startSequenceGame()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.restart}</span>
            </button>
          </div>

          {/* Memorize Phase */}
          {seqPhase === 'memorize' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border-3 border-amber-300 text-center animate-in fade-in max-w-xl mx-auto">
              <span className="inline-block text-xs font-bold text-amber-900 bg-amber-200 px-3 py-1 rounded-full mb-3">
                {t.sequenceHidingIn} {seqCountdown}s
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-slate-800">
                {t.sequenceMemorize}
              </h4>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                {seqTarget.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm min-w-[100px]"
                  >
                    <span className="text-xs font-black text-amber-800 mb-1">#{idx + 1}</span>
                    <span className="text-5xl">{item.emoji}</span>
                    <span className="mt-2 text-xs sm:text-sm font-bold text-slate-800 text-center">
                      {getLocalizedName(item)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={switchToSeqRecall}
                className="mt-6 px-6 py-3 rounded-2xl bg-[#2D6A4F] text-white font-bold text-base shadow-sm cursor-pointer"
              >
                {t.iMemorizedIt}
              </button>
            </div>
          )}

          {/* Recall Phase */}
          {seqPhase === 'recall' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="p-5 rounded-3xl bg-white border-2 border-stone-200 text-center">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-500 uppercase">
                    {seqUserPicks.length} of {seqTarget.length} picked
                  </span>
                  {seqUserPicks.length > 0 && (
                    <button
                      onClick={() => setSeqUserPicks([])}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      {t.clearPicks}
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                  {seqTarget.map((_, idx) => {
                    const picked = seqUserPicks[idx];
                    return (
                      <div
                        key={idx}
                        className={`h-24 w-20 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 ${
                          picked ? 'bg-emerald-50 border-emerald-400' : 'bg-stone-50 border-dashed border-stone-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-stone-400">#{idx + 1}</span>
                        {picked ? (
                          <>
                            <span className="text-3xl">{picked.emoji}</span>
                            <span className="text-[11px] font-bold text-slate-800 truncate max-w-[70px]">
                              {getLocalizedName(picked)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl text-stone-300">?</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#FAF8F5] border-2 border-stone-200 text-center">
                <h4 className="text-sm font-bold text-slate-800 mb-3">{t.sequenceRecall}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FAMILIAR_OBJECTS.slice(0, 8).map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => handleSeqPick(obj)}
                      className="p-3 rounded-2xl bg-white hover:bg-emerald-50 border-2 border-stone-300 hover:border-[#2D6A4F] flex flex-col items-center justify-center transition cursor-pointer active:scale-95"
                    >
                      <span className="text-3xl">{obj.emoji}</span>
                      <span className="mt-1 text-xs font-bold text-slate-800 text-center">
                        {getLocalizedName(obj)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Completed Phase */}
          {seqPhase === 'completed' && seqSummary && (
            renderFriendlyResult({
              accuracy: seqSummary.accuracy,
              time: seqSummary.time,
              matchesStr: `${seqSummary.correctCount} / ${seqSummary.total}`,
              diffChange: seqSummary.diffChange,
              nextDiff: seqSummary.nextDiff,
              onPlayAgain: () => startSequenceGame(seqSummary.nextDiff),
            })
          )}
        </div>
      )}

      {/* GAME 3: OBJECT RECOGNITION */}
      {activeGame === 'recognition' && (
        <div className="mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-[#92400E]">
                  {t.objectRecTitle}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {t.level}: {recognitionDifficulty === 'Easy' ? t.levelEasy : recognitionDifficulty === 'Medium' ? t.levelMedium : t.levelHard}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                {t.objectRecSubtitle}
              </p>
            </div>

            <button
              onClick={() => startRecognitionGame()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.restart}</span>
            </button>
          </div>

          {recFinished && recSummary ? (
            renderFriendlyResult({
              accuracy: recSummary.accuracy,
              time: recSummary.time,
              matchesStr: `${recSummary.score} / ${recSummary.total}`,
              diffChange: recSummary.diffChange,
              nextDiff: recSummary.nextDiff,
              onPlayAgain: () => startRecognitionGame(recSummary.nextDiff),
            })
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border-3 border-stone-200 shadow-md max-w-xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Question {recIndex + 1} of {QUESTIONS_DATA.length}
                </span>

                <button
                  onClick={() => speechService.speak(getQuestionPrompt(QUESTIONS_DATA[recIndex]))}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
                >
                  <Volume2 className="h-4 w-4 text-[#2D6A4F]" />
                  <span>{t.readAloud}</span>
                </button>
              </div>

              {/* Question prompt */}
              <h4 className="mt-5 text-xl sm:text-2xl font-black text-slate-800 text-center leading-snug">
                {getQuestionPrompt(QUESTIONS_DATA[recIndex])}
              </h4>

              {/* Large Options Cards */}
              <div className="mt-6 space-y-3.5">
                {QUESTIONS_DATA[recIndex].options.map((opt) => {
                  const isSelected = recSelectedId === opt.id;
                  const isCorrect = opt.id === QUESTIONS_DATA[recIndex].correctId;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleRecAnswer(opt.id)}
                      disabled={recSelectedId !== null}
                      className={`w-full p-4.5 rounded-2xl border-3 flex items-center justify-between font-black text-lg sm:text-xl transition cursor-pointer active:scale-98 ${
                        recSelectedId !== null
                          ? isCorrect
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-md'
                            : isSelected
                            ? 'bg-rose-100 border-rose-400 text-rose-900'
                            : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                          : 'bg-white hover:bg-emerald-50/50 border-stone-300 text-slate-800 hover:border-[#2D6A4F] shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{opt.emoji}</span>
                        <span>{getLocalizedName(opt)}</span>
                      </div>
                      {recSelectedId !== null && isCorrect && (
                        <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
