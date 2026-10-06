import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Send,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { PatientProfile } from '../../../types';
import { speechService } from '../../../services/speech';
import { storageService } from '../../../services/storage';
import { Language, getTranslation, SUPPORTED_LANGUAGES } from '../../../services/translations';

interface Props {
  patient: PatientProfile;
  language: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  subText?: string;
  timestamp: string;
}

export const VoiceAssistantModal: React.FC<Props> = ({ patient, language }) => {
  const t = getTranslation(language);
  const firstName = patient.name.split(' ')[0];

  const getGreeting = () => {
    if (language === 'hi') return `नमस्ते ${firstName} जी, मैं आज आपकी क्या मदद कर सकता हूँ?`;
    if (language === 'as') return `নমস্কাৰ ${firstName} জী, মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?`;
    if (language === 'bn') return `নমস্কার ${firstName} জী, আমি আজ আপনাকে কীভাবে সাহায্য করতে পারি?`;
    if (language === 'mr') return `नमस्कार ${firstName} ताई, मी आज तुम्हाला कशी मदत करू शकतो?`;
    return `Hello ${firstName}, how can I help you today?`;
  };

  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: getGreeting(),
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const DEMO_QUESTIONS = [
    { label: t.qToday, query: t.qToday },
    { label: t.qMeera, query: t.qMeera },
    { label: t.qNext, query: t.qNext },
    { label: t.qPriya, query: t.qPriya },
    { label: t.qMedicine, query: t.qMedicine },
    { label: t.qWhereAmI, query: t.qWhereAmI },
  ];

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    } else {
      setIsSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = langConfig.speechLang;

        recognition.onstart = () => {
          setIsListening(true);
          setAssistantStatus('listening');
          speechService.playGentleChime('alert');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            handleProcessQuery(transcriptText);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setAssistantStatus('idle');
        };

        recognition.onend = () => {
          setIsListening(false);
          if (assistantStatus === 'listening') {
            setAssistantStatus('idle');
          }
        };

        recognitionRef.current = recognition;
      } catch {
        setIsSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      speechService.stop();
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantStatus]);

  const toggleListening = () => {
    if (!isSpeechSupported) {
      speechService.speak(t.voiceUnsupported);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setAssistantStatus('idle');
    } else {
      speechService.stop();
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch {
        try {
          recognitionRef.current?.abort();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch {
          setIsListening(false);
          setAssistantStatus('idle');
        }
      }
    }
  };

  const generateAnswer = (rawQuery: string): string => {
    const q = rawQuery.toLowerCase();
    const activities = storageService.getActivities();
    const medications = storageService.getMedications();
    const memories = storageService.getMemories();

    if (q.includes('today') || q.includes('आज') || q.includes('আজি')) {
      const summary = activities.map((a) => `${a.time}: ${a.title}`).join(', ');
      return `Today, ${firstName} ji, you have: ${summary}. You also have your morning BP medicine marked as taken!`;
    }

    if (q.includes('meera') || q.includes('मीरा') || q.includes('মীৰা')) {
      const meera = memories.find((m) => m.personName.toLowerCase().includes('meera'));
      if (meera) {
        return `Meera Barua is your beloved younger sister from Jorhat. She loves making sweet pitha and phones you every Sunday afternoon to share tea recipes and love.`;
      }
      return `Meera is your loving younger sister in Jorhat who calls you with immense affection.`;
    }

    if (q.includes('next') || q.includes('अगला') || q.includes('পৰৱৰ্তী') || q.includes('पुढची')) {
      const nextAct = activities.find((a) => !a.completed);
      if (nextAct) {
        return `Your next activity is "${nextAct.title}" scheduled at ${nextAct.time}.`;
      }
      return `You have completed all scheduled tasks for today! Take a peaceful rest with warm tea.`;
    }

    if (q.includes('priya') || q.includes('प्रिया') || q.includes('প্ৰিয়া')) {
      return `Priya Sharma is your elder daughter and primary caregiver. She is right here at home in Guwahati with you, making your morning ginger tea.`;
    }

    if (q.includes('medicine') || q.includes('दवा') || q.includes('ঔষধ') || q.includes('औषध')) {
      const pending = medications.filter((m) => !m.taken);
      if (pending.length === 0) {
        return `All scheduled medicines for today have already been taken!`;
      }
      return `You have taken your morning BP medicine. Your remaining medicines are: ${pending.map((m) => `${m.name} (${m.timing})`).join(', ')}.`;
    }

    if (q.includes('where') || q.includes('कहाँ') || q.includes('ক’ত') || q.includes('कोठे')) {
      return `You are safely at home in House No. 14, Beltola, Guwahati, Assam. Priya is here in the house with you.`;
    }

    return `I am right here with you, ${firstName} ji. You are in your peaceful home surrounded by love. Feel free to ask what you have today, about your sister Meera, or your medicines.`;
  };

  const handleProcessQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscript('');
    setInputText('');
    setAssistantStatus('thinking');

    setTimeout(() => {
      const reply = generateAnswer(queryText);
      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setAssistantStatus('speaking');
      speechService.playGentleChime('success');
      speechService.speak(reply, {
        lang: langConfig.speechLang,
        onEnd: () => setAssistantStatus('idle'),
      });
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="text-center pb-4 border-b border-stone-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] font-bold text-xs uppercase tracking-wider mb-2 border border-sky-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.voiceTitle}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          {t.voiceTitle}
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mt-0.5">
          {t.voiceSubtitle}
        </p>
      </div>

      {/* Warning if Speech is unsupported in browser */}
      {!isSpeechSupported && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{t.voiceUnsupported}</p>
          </div>
        </div>
      )}

      {/* LARGE MICROPHONE BUTTON SECTION */}
      <div className="my-6 text-center">
        <div className="relative inline-flex items-center justify-center">
          {assistantStatus === 'listening' && (
            <>
              <span className="absolute h-36 w-36 rounded-full bg-rose-200 animate-ping opacity-75" />
              <span className="absolute h-44 w-44 rounded-full bg-rose-100 animate-pulse opacity-50" />
            </>
          )}

          {assistantStatus === 'speaking' && (
            <span className="absolute h-36 w-36 rounded-full bg-emerald-200 animate-pulse opacity-60" />
          )}

          <button
            onClick={toggleListening}
            className={`relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full shadow-xl transition-all duration-300 cursor-pointer ${
              assistantStatus === 'listening'
                ? 'bg-rose-600 text-white scale-110 shadow-rose-300 ring-4 ring-rose-400'
                : assistantStatus === 'speaking'
                ? 'bg-emerald-600 text-white scale-105 shadow-emerald-200 ring-4 ring-emerald-300'
                : 'bg-[#0284C7] hover:bg-[#0369A1] text-white hover:scale-105 shadow-sky-200 active:scale-95'
            }`}
            aria-label={t.tapToTalk}
          >
            {assistantStatus === 'listening' ? (
              <MicOff className="h-14 w-14 animate-pulse" />
            ) : (
              <Mic className="h-14 w-14" />
            )}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xl sm:text-2xl font-black text-slate-800">
            {assistantStatus === 'listening' && t.listeningNow}
            {assistantStatus === 'thinking' && 'Thinking...'}
            {assistantStatus === 'speaking' && t.speakingNow}
            {assistantStatus === 'idle' && t.tapToTalk}
          </p>

          {transcript && (
            <p className="mt-2 text-sm italic font-semibold text-sky-800 bg-sky-50 px-4 py-1.5 rounded-full inline-block border border-sky-200">
              &ldquo;{transcript}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* QUICK SUGGESTION CHIPS (DEMO QUESTIONS) */}
      <div className="mt-4 bg-white/70 p-4 rounded-3xl border border-stone-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-[#0284C7]" />
          <span>Tap to ask any question:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                speechService.playGentleChime('tap');
                handleProcessQuery(q.query);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 border-2 border-stone-200 hover:border-sky-400 text-slate-800 font-bold text-sm sm:text-base shadow-xs active:scale-95 transition cursor-pointer text-left"
            >
              💬 {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONVERSATION THREAD */}
      <div className="mt-6 rounded-3xl bg-white border-3 border-stone-200 p-4 sm:p-6 shadow-sm min-h-[220px] max-h-[380px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                m.sender === 'user'
                  ? 'bg-[#0284C7] text-white rounded-br-none'
                  : 'bg-[#F0F9FF] border-2 border-sky-200 text-slate-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg sm:text-xl font-bold leading-relaxed">{m.text}</p>
                {m.sender === 'assistant' && (
                  <button
                    onClick={() => speechService.speak(m.text, { lang: langConfig.speechLang, priority: true })}
                    className="p-1.5 rounded-xl text-sky-700 hover:text-sky-900 hover:bg-sky-100 shrink-0 cursor-pointer"
                    title={t.readAloud}
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <span className={`text-[11px] block mt-1.5 font-medium ${m.sender === 'user' ? 'text-sky-200' : 'text-stone-400'}`}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* TEXT FALLBACK INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputText.trim()) handleProcessQuery(inputText);
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.textFallbackPlaceholder}
          className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-stone-300 focus:border-[#0284C7] focus:outline-none text-base font-semibold shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white font-black text-base shadow-sm active:scale-95 transition cursor-pointer flex items-center gap-2"
        >
          <span>{t.askButton}</span>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
