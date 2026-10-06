import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  Pill,
  Brain,
  Plus,
  MapPin,
  Clock,
  Battery,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Calendar,
  Image,
  RefreshCw,
  Info,
  Settings,
  Bell,
  BookOpen,
  ListTodo,
  Download,
  Trash2,
  Check,
  X,
  Sparkles,
  Activity,
  Minus,
} from 'lucide-react';
import {
  PatientProfile,
  Medication,
  DailyActivity,
  MemoryItem,
  GameScore,
  GeofenceStatus,
} from '../../types';
import { storageService } from '../../services/storage';
import { speechService } from '../../services/speech';

interface Props {
  patient: PatientProfile;
  onSwitchToPatient: () => void;
  onSwitchToLanding: () => void;
}

type TabType =
  | 'dashboard'
  | 'profile'
  | 'cognitive'
  | 'activities'
  | 'alerts'
  | 'reminders'
  | 'memorybook'
  | 'settings';

export const CaregiverDashboard: React.FC<Props> = ({
  patient,
  onSwitchToPatient,
  onSwitchToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Storage State
  const [medications, setMedications] = useState<Medication[]>(() => storageService.getMedications());
  const [activities, setActivities] = useState<DailyActivity[]>(() => storageService.getActivities());
  const [memories, setMemories] = useState<MemoryItem[]>(() => storageService.getMemories());
  const [scores, setScores] = useState<GameScore[]>(() => storageService.getScores());
  const [geofence, setGeofence] = useState<GeofenceStatus>(() => storageService.getGeofence());

  // Patient Profile Local State (for editing in profile tab)
  const [patientData, setPatientData] = useState<PatientProfile>(patient);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // New Reminder Form State
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remDose, setRemDose] = useState('1 Tablet');
  const [remTiming, setRemTiming] = useState('8:00 AM');
  const [remCategory, setRemCategory] = useState<'medication' | 'routine' | 'hydration' | 'social'>('medication');
  const [remInstructions, setRemInstructions] = useState('');

  // New Memory Modal State
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemRelation, setNewMemRelation] = useState('');
  const [newMemLocation, setNewMemLocation] = useState('Guwahati, Assam');
  const [newMemDesc, setNewMemDesc] = useState('');
  const [newMemAudioText, setNewMemAudioText] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<'family' | 'places' | 'tradition'>('family');

  // Settings State
  const [caregiverPin, setCaregiverPin] = useState('1234');
  const [pinChangeInput, setPinChangeInput] = useState('');
  const [safeZoneRadius, setSafeZoneRadius] = useState(150);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const refreshData = () => {
    setMedications(storageService.getMedications());
    setActivities(storageService.getActivities());
    setMemories(storageService.getMemories());
    setScores(storageService.getScores());
    setGeofence(storageService.getGeofence());
  };

  // --- Calculations for Analytics ---
  const takenMedsCount = medications.filter((m) => m.taken).length;
  const adherenceRate = Math.round((takenMedsCount / (medications.length || 1)) * 100);

  const completedActivitiesCount = activities.filter((a) => a.completed).length;
  const missedActivities = activities.filter((a) => {
    if (a.completed) return false;
    // Check if time is past (heuristic based on hour)
    const currentHour = new Date().getHours();
    const actHour = parseInt(a.time.split(':')[0], 10);
    const isPM = a.time.includes('PM') && actHour !== 12;
    const hour24 = isPM ? actHour + 12 : actHour;
    return hour24 < currentHour;
  });

  const totalGamesPlayed = scores.length;
  const averageAccuracy = Math.round(
    scores.reduce((acc, s) => acc + (s.accuracy ?? 80), 0) / (scores.length || 1)
  );
  const averageResponseTime = Math.round(
    scores.reduce((acc, s) => acc + s.timeTakenSeconds, 0) / (scores.length || 1)
  );

  // Weekly Activity Chart Data (Mon - Sun)
  const weeklyData = [
    { day: 'Mon', count: 3, acc: 88 },
    { day: 'Tue', count: 2, acc: 82 },
    { day: 'Wed', count: 4, acc: 90 },
    { day: 'Thu', count: 1, acc: 75 },
    { day: 'Fri', count: 3, acc: 85 },
    { day: 'Sat', count: 4, acc: 92 },
    { day: 'Sun', count: 2, acc: 80 },
  ];

  // Pattern Observation Rule: Strictly NO medical progression labels
  const getPatternObservation = () => {
    if (averageAccuracy < 65 || missedActivities.length >= 2) {
      return "Recent activity is lower than the patient's usual pattern. Gentle reassurance and regular hydration recommended.";
    }
    return "Recent activity reflects steady engagement with familiar routines and cultural games.";
  };

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle) return;

    if (remCategory === 'medication') {
      const updated = storageService.addMedication({
        name: remTitle,
        dose: remDose,
        timing: remTiming,
        timeOfDay: 'morning',
        purpose: 'Prescribed daily regimen',
        pillColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        instructions: remInstructions || 'Take with warm water.',
      });
      setMedications(updated);
    } else {
      const newAct: DailyActivity = {
        id: `act-${Date.now()}`,
        time: remTiming,
        title: remTitle,
        description: remInstructions || 'Daily routine step',
        iconName: 'Clock',
        completed: false,
        category: 'routine',
      };
      const updated = [...activities, newAct];
      setActivities(updated);
    }

    setShowAddReminderModal(false);
    setRemTitle('');
    setRemInstructions('');
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName) return;
    const updated = storageService.addMemory({
      title: `${newMemName} (${newMemRelation})`,
      personName: newMemName,
      relation: newMemRelation || 'Family Member',
      location: newMemLocation,
      description: newMemDesc || 'Cherished family reminiscence memory.',
      audioNoteText: newMemAudioText || `Remember ${newMemName}, who loves and cares for you deeply.`,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      category: newMemCategory,
      clues: [newMemRelation, newMemLocation, 'Always brings warmth and joy'],
    });
    setMemories(updated);
    setShowAddMemoryModal(false);
    setNewMemName('');
    setNewMemRelation('');
    setNewMemDesc('');
    setNewMemAudioText('');
  };

  const handleExportReport = () => {
    const reportData = {
      title: 'SAATHI Caregiver Summary Report',
      date: new Date().toLocaleDateString(),
      patient: {
        name: patientData.name,
        age: patientData.age,
        condition: patientData.condition,
        stage: patientData.stage,
        residence: patientData.residence,
        doctor: patientData.doctor.name,
      },
      monitoringDisclaimer: 'This information is intended for assistance and monitoring and is not a medical diagnosis.',
      patternObservation: getPatternObservation(),
      metrics: {
        totalGamesPlayed,
        averageAccuracy: `${averageAccuracy}%`,
        averageResponseTime: `${averageResponseTime} seconds`,
        medicationCompliance: `${adherenceRate}%`,
        missedActivitiesCount: missedActivities.length,
      },
      recentGameSessions: scores.slice(0, 5),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAATHI_Report_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 text-slate-800">
      {/* Universal Monitoring & Assistance Disclaimer Banner */}
      <div className="bg-[#1B4332] text-white px-4 py-2 text-xs sm:text-sm font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-300 shrink-0" />
            <span>
              <strong>Platform Notice:</strong> This information is intended for assistance and monitoring and is not a medical diagnosis.
            </span>
          </div>
          <span className="text-emerald-200 text-xs">
            Guwahati Caregiver Node • Priya Sharma
          </span>
        </div>
      </div>

      {/* Caregiver Portal Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToLanding}
              className="flex items-center gap-2 group cursor-pointer text-left"
              title="Return to SAATHI Home"
            >
              <div className="h-10 w-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-black text-lg">
                S
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  SAATHI
                  <span className="text-xs bg-[#2D6A4F] text-white px-2 py-0.5 rounded-md font-bold">
                    Caregiver Mode
                  </span>
                </h1>
                <p className="text-xs text-stone-500 font-medium">
                  Caregiver: <strong>Priya Sharma</strong> • Patient: <strong>{patientData.name}, {patientData.age}</strong>
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={refreshData}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
              title="Refresh live synced data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
              title="Download Clinical Summary Report"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            {/* Switch to Patient Mode */}
            <button
              onClick={onSwitchToPatient}
              className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <span>Switch to Patient Mode</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* 8 Primary Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-stone-200 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'profile', label: 'Patient Profile', icon: User },
            { id: 'cognitive', label: 'Cognitive Progress', icon: Brain },
            { id: 'activities', label: 'Activities', icon: ListTodo },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'reminders', label: 'Reminders', icon: Clock },
            { id: 'memorybook', label: 'Memory Book', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="mt-6 space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Safety & Geofence */}
              <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Safe Zone Status</span>
                    <MapPin className="h-4 w-4 text-[#2D6A4F]" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xl font-extrabold text-[#1B4332]">Inside Safe Zone</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500 font-medium">
                    Beltola Tiniali, Guwahati (GPS accurate)
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="mt-3 text-xs font-bold text-[#2D6A4F] hover:underline text-left"
                >
                  View Geofence &rarr;
                </button>
              </div>

              {/* Card 2: Cognitive Activity */}
              <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Cognitive Activity</span>
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-950">{averageAccuracy}%</span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Avg Accuracy</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500 font-medium">
                    {totalGamesPlayed} neurobic sessions recorded
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('cognitive')}
                  className="mt-3 text-xs font-bold text-purple-700 hover:underline text-left"
                >
                  View Progress &rarr;
                </button>
              </div>

              {/* Card 3: Medication Compliance */}
              <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Meds Compliance</span>
                    <Pill className="h-4 w-4 text-sky-600" />
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{adherenceRate}%</span>
                    <span className="text-xs text-stone-500">({takenMedsCount}/{medications.length} taken)</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-100 rounded-full h-2">
                    <div
                      className="bg-[#2D6A4F] h-2 rounded-full transition-all"
                      style={{ width: `${adherenceRate}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className="mt-3 text-xs font-bold text-sky-700 hover:underline text-left"
                >
                  Manage Reminders &rarr;
                </button>
              </div>

              {/* Card 4: Daily Activities */}
              <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Today&apos;s Activities</span>
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{completedActivitiesCount} / {activities.length}</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Completed</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500 font-medium">
                    {missedActivities.length > 0 ? `${missedActivities.length} missed earlier` : 'All tasks on schedule'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="mt-3 text-xs font-bold text-amber-700 hover:underline text-left"
                >
                  View Schedule &rarr;
                </button>
              </div>
            </div>

            {/* Pattern Observation Card (Strict anti-medicalization rule) */}
            <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                    Caregiver Behavioral Pattern Note
                  </span>
                  <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-800 leading-snug">
                    {getPatternObservation()}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Compiled automatically from Asha&apos;s daily routine check-offs, response speed, and game attempts.
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-center shrink-0">
                <span className="inline-block text-xs font-bold bg-white text-[#2D6A4F] px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                  Updated Just Now
                </span>
              </div>
            </div>

            {/* Two Column Section: Quick Alerts Feed & Today's Schedule Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Alerts Feed */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#2D6A4F]" />
                    <span>Recent Safety & Activity Feed</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-xs font-bold text-[#2D6A4F] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {geofence.alerts.slice(0, 3).map((al) => (
                    <div
                      key={al.id}
                      className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                        al.type === 'sos'
                          ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <Clock className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p>{al.message}</p>
                        <span className="text-[11px] text-stone-400 mt-0.5 block">{al.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medication Compliance Live Status */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Pill className="h-5 w-5 text-sky-600" />
                    <span>Live Medication Status</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="text-xs font-bold text-sky-700 hover:underline"
                  >
                    Manage
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {medications.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{m.name}</span>
                          <span className="text-xs text-stone-500 font-medium">({m.timing})</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{m.purpose}</p>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          m.taken
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.taken ? 'Taken ✓' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: PATIENT PROFILE */}
        {/* ================================================================= */}
        {activeTab === 'profile' && (
          <div className="mt-6 space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-[#2D6A4F] flex items-center justify-center font-black text-2xl shadow-xs">
                    AS
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{patientData.name}, {patientData.age}</h3>
                    <p className="text-sm font-semibold text-[#2D6A4F] mt-0.5">{patientData.condition}</p>
                    <p className="text-xs text-stone-500">{patientData.stage}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  Blood Group: {patientData.bloodGroup}
                </span>
              </div>

              {profileSuccessMsg && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Profile information updated successfully!</span>
                </div>
              )}

              {/* Editable Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-600 block">Patient Full Name</label>
                    <input
                      type="text"
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                      className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-[#2D6A4F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-600 block">Age</label>
                    <input
                      type="number"
                      value={patientData.age}
                      onChange={(e) => setPatientData({ ...patientData, age: parseInt(e.target.value, 10) || 72 })}
                      className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block">Emergency Home Address (Guwahati)</label>
                  <input
                    type="text"
                    value={patientData.emergencyAddress}
                    onChange={(e) => setPatientData({ ...patientData, emergencyAddress: e.target.value })}
                    className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-[#2D6A4F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-600 block">Primary Caregiver Phone (Priya)</label>
                    <input
                      type="text"
                      value={patientData.primaryCaregiver.phone}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          primaryCaregiver: { ...patientData.primaryCaregiver, phone: e.target.value },
                        })
                      }
                      className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-[#2D6A4F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-600 block">Doctor & Hospital Contact</label>
                    <input
                      type="text"
                      value={patientData.doctor.phone}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          doctor: { ...patientData.doctor, phone: e.target.value },
                        })
                      }
                      className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block">Allergies & Sensitivities</label>
                  <input
                    type="text"
                    value={patientData.allergies.join(', ')}
                    onChange={(e) =>
                      setPatientData({ ...patientData, allergies: e.target.value.split(',').map((s) => s.trim()) })
                    }
                    className="mt-1 w-full p-3 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-[#2D6A4F]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-sm shadow-xs transition"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>

              {/* Bio & Cultural Anchors */}
              <div className="mt-8 pt-6 border-t border-stone-100">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Cultural & Reminiscence Anchors
                </h4>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2">
                  <p>• <strong>Hometown & Heritage:</strong> Grew up near the ancestral tea gardens of Jorhat, Upper Assam. Very receptive to memories of tea garden monsoon breezes.</p>
                  <p>• <strong>Family Continuity:</strong> Married to Late Prof. Anand Sharma (Cotton College). Enjoys talking about his history lectures.</p>
                  <p>• <strong>Calming Music:</strong> Responds peacefully to Assamese bamboo flute melodies and Bihu songs during evening sundowning periods.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: COGNITIVE PROGRESS */}
        {/* ================================================================= */}
        {activeTab === 'cognitive' && (
          <div className="mt-6 space-y-6">
            <div className="pb-3 border-b border-stone-200">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Cognitive Activity & Game Progress
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Objective session logs from Memory Match, Remember Sequence, and Object Recognition.
              </p>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Overall Accuracy</span>
                <p className="text-4xl font-black text-purple-950 mt-2">{averageAccuracy}%</p>
                <p className="text-xs text-emerald-700 font-bold mt-1">Steady over recorded sessions</p>
                <p className="text-xs text-stone-500 mt-2">
                  Highest engagement with familiar cultural symbols (Tea Cup, Rhino, Orchid).
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Average Response Time</span>
                <p className="text-4xl font-black text-slate-900 mt-2">{averageResponseTime}s</p>
                <p className="text-xs text-sky-700 font-bold mt-1">Calm, non-hurried pace</p>
                <p className="text-xs text-stone-500 mt-2">
                  Zero indication of cognitive stress or frustration during adaptive play.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Completed Games</span>
                <p className="text-4xl font-black text-[#2D6A4F] mt-2">{totalGamesPlayed}</p>
                <p className="text-xs text-stone-500 font-bold mt-1">Adaptive AI Level active</p>
                <p className="text-xs text-stone-500 mt-2">
                  Difficulty automatically calibrated between Easy, Medium, and Hard based on scores.
                </p>
              </div>
            </div>

            {/* Simple Responsive Weekly Activity Chart */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Weekly Cognitive Activity (Neurobic Sessions)</h4>
                  <p className="text-xs text-stone-500">Number of brain game exercises completed per day this week</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#2D6A4F] border border-emerald-200">
                  Target: 2+ Sessions Daily
                </span>
              </div>

              {/* Bar Chart Visual */}
              <div className="mt-8 flex items-end justify-between gap-2 sm:gap-6 h-48 px-2 sm:px-6">
                {weeklyData.map((item, idx) => {
                  const barHeight = item.count * 22; // px height
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-black text-slate-700">{item.count}</span>
                      <div className="w-full max-w-[44px] bg-stone-100 rounded-t-xl overflow-hidden flex items-end h-32">
                        <div
                          className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] transition-all rounded-t-xl"
                          style={{ height: `${barHeight}%` }}
                          title={`${item.day}: ${item.count} sessions, ${item.acc}% accuracy`}
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-600">{item.day}</span>
                      <span className="text-[10px] text-purple-700 font-semibold">{item.acc}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recorded Game Sessions Table */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Recorded Brain Game Sessions (Local Storage)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="p-3">Session Date</th>
                      <th className="p-3">Game</th>
                      <th className="p-3">Level</th>
                      <th className="p-3">Accuracy</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Attempts</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Observation Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {scores.map((sc) => (
                      <tr key={sc.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-medium text-stone-600 whitespace-nowrap">{sc.timestamp}</td>
                        <td className="p-3 font-bold text-slate-800">{sc.title}</td>
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                            sc.difficultyLevel === 'Hard'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : sc.difficultyLevel === 'Medium'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {sc.difficultyLevel || 'Normal'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-black text-xs px-2.5 py-1 rounded-md ${
                            (sc.accuracy ?? 80) >= 80
                              ? 'bg-emerald-100 text-emerald-900'
                              : (sc.accuracy ?? 50) >= 50
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}>
                            {sc.accuracy !== undefined ? `${sc.accuracy}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-700 bg-stone-100 px-2 py-0.5 rounded">
                            {sc.score} / {sc.maxScore}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-stone-600">{sc.attempts || 1}</td>
                        <td className="p-3 font-medium text-stone-600 whitespace-nowrap">{sc.timeTakenSeconds}s</td>
                        <td className="p-3 text-xs text-stone-600 max-w-xs">{sc.notes || 'Normal engagement.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ACTIVITIES */}
        {/* ================================================================= */}
        {activeTab === 'activities' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  Daily Activities & Schedule
                </h3>
                <p className="text-sm text-stone-500">
                  Track adherence and review completed vs missed activities.
                </p>
              </div>

              <button
                onClick={() => setShowAddReminderModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 text-sm font-bold shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Activity</span>
              </button>
            </div>

            {/* Missed Activities Alert if any */}
            {missedActivities.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    {missedActivities.length} Missed or Delayed Activity Notice
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {missedActivities.map((m) => `${m.title} (${m.time})`).join(', ')} were scheduled earlier but not marked completed.
                  </p>
                </div>
              </div>
            )}

            {/* Full activities list */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3.5">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    a.completed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-stone-50/70 border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
                      {a.time}
                    </span>
                    <div>
                      <h4 className={`text-base font-bold ${a.completed ? 'text-emerald-950' : 'text-slate-800'}`}>
                        {a.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">{a.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      a.completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {a.completed ? 'Completed ✓' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: ALERTS */}
        {/* ================================================================= */}
        {activeTab === 'alerts' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  Safety & Emergency Alerts
                </h3>
                <p className="text-sm text-stone-500">
                  Geofence perimeter breaches, emergency SOS alerts, and device status.
                </p>
              </div>

              <button
                onClick={() => {
                  storageService.triggerCaregiverSOS(patient.name);
                  setGeofence(storageService.getGeofence());
                  alert('Test Emergency SOS alert dispatched to Priya (+91 98765 43210)!');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Trigger Test SOS Alert
              </button>
            </div>

            {/* Geofence Perimeter Map Simulation */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#2D6A4F]" />
                  <h4 className="font-bold text-slate-800 text-base">
                    Home Geofence Perimeter (Beltola Tiniali, Guwahati)
                  </h4>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Safe (Radius: {safeZoneRadius}m)
                </span>
              </div>

              <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-[#EAF2EC] border-2 border-emerald-300 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2D6A4F_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative flex items-center justify-center">
                  <div className="h-48 w-48 sm:h-56 sm:w-56 rounded-full border-4 border-dashed border-[#2D6A4F] bg-[#2D6A4F]/10 flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-[#1B4332] bg-white/90 px-2 py-0.5 rounded shadow-xs">
                      Safe Perimeter ({safeZoneRadius}m)
                    </span>
                  </div>

                  <div className="absolute flex flex-col items-center">
                    <span className="h-5 w-5 rounded-full bg-emerald-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-[10px] font-black">
                      ✓
                    </span>
                    <span className="mt-1 text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md shadow-sm border border-stone-200">
                      Asha (Verandah)
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 p-2.5 rounded-xl border border-stone-200 text-xs">
                  <p className="font-bold text-slate-800">House No. 14, Beltola</p>
                  <p className="text-stone-500">Status: Inside Safe Zone</p>
                </div>
              </div>
            </div>

            {/* Alert Logs */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 text-base mb-3">Alert History Log</h4>
              {geofence.alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-2xl border text-sm flex items-start gap-3.5 ${
                    al.type === 'sos'
                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <Clock className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{al.message}</p>
                    <span className="text-xs text-stone-400 mt-1 block">{al.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: REMINDERS */}
        {/* ================================================================= */}
        {activeTab === 'reminders' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  Medication & Daily Alarms
                </h3>
                <p className="text-sm text-stone-500">
                  Manage prescribed medications and spoken reminders for Asha.
                </p>
              </div>

              <button
                onClick={() => setShowAddReminderModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 text-sm font-bold shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Reminder</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between ${
                    m.taken ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                        {m.timing}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          m.taken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.taken ? 'Taken ✓' : 'Pending'}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-bold text-slate-800">{m.name}</h4>
                    <p className="text-xs text-stone-500 font-semibold">{m.dose} • {m.purpose}</p>
                    <p className="mt-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl font-medium">
                      {m.instructions}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-medium">Daily alarm active</span>
                    {m.taken && m.takenAt && (
                      <span className="text-emerald-700 font-bold">At {m.takenAt}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: MEMORY BOOK */}
        {/* ================================================================= */}
        {activeTab === 'memorybook' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  Reminiscence Memory Book
                </h3>
                <p className="text-sm text-stone-500">
                  Manage family photos and recorded loving voice notes for Asha&apos;s reminiscence sessions.
                </p>
              </div>

              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#6B46C1] hover:bg-[#553C9A] text-white px-4 py-2 text-sm font-bold shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Family Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={mem.photoUrl}
                      alt={mem.personName}
                      className="h-24 w-24 rounded-2xl object-cover shrink-0 shadow-xs"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-purple-700 uppercase bg-purple-50 px-2.5 py-0.5 rounded-md">
                        {mem.relation}
                      </span>
                      <h4 className="text-xl font-bold text-slate-800 mt-1">{mem.personName}</h4>
                      <p className="text-xs text-stone-500 font-medium">{mem.location}</p>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {mem.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-purple-900 font-semibold bg-purple-50/70 p-3 rounded-2xl">
                    <span className="italic truncate max-w-xs">&ldquo;{mem.audioNoteText}&rdquo;</span>
                    <button
                      onClick={() => speechService.speak(mem.audioNoteText, { priority: true })}
                      className="text-xs font-bold text-[#6B46C1] hover:underline shrink-0 ml-2"
                    >
                      Play Voice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: SETTINGS */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="mt-6 space-y-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-2xl font-black text-slate-800 pb-3 border-b border-stone-100">
                Caregiver Portal Settings
              </h3>

              {settingsSaved && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Settings updated successfully!</span>
                </div>
              )}

              {/* PIN Settings */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-sm text-slate-800">Caregiver Security PIN</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Used to prevent accidental patient exit into Caregiver Mode. Current PIN: <strong>{caregiverPin}</strong>
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="New 4-digit PIN"
                    value={pinChangeInput}
                    onChange={(e) => setPinChangeInput(e.target.value)}
                    className="p-2.5 rounded-xl border border-stone-300 text-sm w-36 font-mono"
                  />
                  <button
                    onClick={() => {
                      if (pinChangeInput.length === 4) {
                        setCaregiverPin(pinChangeInput);
                        setPinChangeInput('');
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 2500);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332]"
                  >
                    Update PIN
                  </button>
                </div>
              </div>

              {/* Safe Zone Radius */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-sm text-slate-800">Geofence Safe Zone Radius</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Radius around Beltola home before automated wandering alert triggers.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {[100, 150, 250, 500].map((rad) => (
                    <button
                      key={rad}
                      onClick={() => {
                        setSafeZoneRadius(rad);
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 2000);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        safeZoneRadius === rad
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {rad} meters
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Demo Data */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <h4 className="font-bold text-sm text-rose-900">Reset Demo Data</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Restores original sample data for Asha Sharma and Priya Sharma.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset demo data for Asha Sharma?')) {
                      storageService.resetDemoData();
                      refreshData();
                      alert('Demo data restored.');
                    }
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Reset Sample Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <h3 className="text-xl font-bold text-slate-800">Add Reminder / Schedule</h3>
            <form onSubmit={handleCreateReminder} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon BP check or Evening Tea"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-600 block">Category</label>
                  <select
                    value={remCategory}
                    onChange={(e) => setRemCategory(e.target.value as any)}
                    className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                  >
                    <option value="medication">Medication</option>
                    <option value="routine">Routine</option>
                    <option value="hydration">Hydration</option>
                    <option value="social">Social Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 block">Timing</label>
                  <input
                    type="text"
                    value={remTiming}
                    onChange={(e) => setRemTiming(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Instructions / Voice Note</label>
                <input
                  type="text"
                  placeholder="e.g. Take with warm water after lunch"
                  value={remInstructions}
                  onChange={(e) => setRemInstructions(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold hover:bg-[#1B4332]"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <h3 className="text-xl font-bold text-slate-800">Add Family Reminiscence Card</h3>
            <form onSubmit={handleCreateMemory} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block">Person or Landmark Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Granddaughter Sneha"
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Relationship / Significance</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Granddaughter (Studies in Jorhat)"
                  value={newMemRelation}
                  onChange={(e) => setNewMemRelation(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Loving Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe who they are in simple, warm sentences..."
                  value={newMemDesc}
                  onChange={(e) => setNewMemDesc(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block">Spoken Voice Script</label>
                <input
                  type="text"
                  placeholder="e.g. Ma, remember Sneha loves making pitha with you!"
                  value={newMemAudioText}
                  onChange={(e) => setNewMemAudioText(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6B46C1] text-white text-sm font-bold hover:bg-[#553C9A]"
                >
                  Save Memory Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
