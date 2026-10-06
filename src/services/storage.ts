import {
  PatientProfile,
  Medication,
  DailyActivity,
  MemoryItem,
  GameScore,
  MoodEntry,
  GeofenceStatus,
} from '../types';
import { syncService } from './sync';

export const INITIAL_PATIENT: PatientProfile = {
  id: 'patient-asha-001',
  name: 'Asha Sharma',
  age: 72,
  condition: 'Early-Stage Cognitive Decline (MCI)',
  stage: 'Stage 2 - Mild Memory & Spatial Recall Impairment',
  residence: 'House No. 14, Beltola Tiniali, Guwahati, Assam - 781028',
  primaryCaregiver: {
    name: 'Priya Sharma',
    relationship: 'Daughter & Primary Caregiver',
    phone: '+91 98765 43210',
    location: 'Guwahati, Assam (Co-resident)',
  },
  doctor: {
    name: 'Dr. Bhaskar Baruah',
    specialty: 'Consultant Geriatric Neurologist',
    hospital: 'Guwahati Neurological Institute & GMCH',
    phone: '+91 94350 12345',
  },
  emergencyAddress: 'House 14, By-Lane 3, Near Beltola Tiniali Bazaar, Guwahati, Assam',
  bloodGroup: 'B Positive (B+)',
  allergies: ['Penicillin', 'Sulfa drugs'],
};

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Amlodipine 5mg',
    dose: '1 Tablet',
    timing: '8:00 AM',
    timeOfDay: 'morning',
    purpose: 'Blood Pressure Control',
    taken: true,
    takenAt: '8:12 AM',
    pillColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    instructions: 'Take with warm water after morning tea.',
  },
  {
    id: 'med-2',
    name: 'Vitamin D3 & Calcium',
    dose: '1 Softgel Capsule',
    timing: '9:30 AM',
    timeOfDay: 'morning',
    purpose: 'Bone & Joint Strength',
    taken: false,
    pillColor: 'bg-amber-100 text-amber-800 border-amber-300',
    instructions: 'Take right after breakfast.',
  },
  {
    id: 'med-3',
    name: 'Donepezil 5mg',
    dose: '1 Small Tablet',
    timing: '8:30 PM',
    timeOfDay: 'night',
    purpose: 'Cognitive Memory Support',
    taken: false,
    pillColor: 'bg-sky-100 text-sky-800 border-sky-300',
    instructions: 'Take with a small glass of milk before sleeping.',
  },
];

export const INITIAL_ACTIVITIES: DailyActivity[] = [
  {
    id: 'act-1',
    time: '7:30 AM',
    title: 'Morning Garden Walk & Tea',
    description: '15 minutes in the front verandah with warm ginger tea.',
    iconName: 'Sun',
    completed: true,
    category: 'routine',
  },
  {
    id: 'act-2',
    time: '10:00 AM',
    title: 'SAATHI Brain Games',
    description: 'Play Memory Match and Familiar Places puzzle.',
    iconName: 'Brain',
    completed: false,
    category: 'cognitive',
  },
  {
    id: 'act-3',
    time: '1:00 PM',
    title: 'Lunch with Priya',
    description: 'Fresh warm rice, yellow dal and light ridge gourd curry.',
    iconName: 'Utensils',
    completed: false,
    category: 'meal',
  },
  {
    id: 'act-4',
    time: '2:30 PM',
    title: 'Afternoon Rest & Soft Music',
    description: 'Quiet time listening to gentle bamboo flute or Bhupen Hazarika tunes.',
    iconName: 'Moon',
    completed: false,
    category: 'rest',
  },
  {
    id: 'act-5',
    time: '5:30 PM',
    title: 'Video Call with Grandson Aarav',
    description: 'Aarav will share his school drawing from Delhi.',
    iconName: 'PhoneCall',
    completed: false,
    category: 'social',
  },
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'My Loving Daughter Priya',
    personName: 'Priya Sharma',
    relation: 'Daughter (Lives with you in Beltola)',
    location: 'Guwahati, Assam',
    description: 'Priya is your elder daughter. She prepares your ginger tea every morning and holds your hand during your evening walk.',
    audioNoteText: 'Namaskar Ma! This is Priya. Remember I am right here in the house with you. You are safe and deeply loved.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    category: 'family',
    clues: ['She makes your morning ginger tea', 'Lives in Guwahati with you', 'Has a warm smiling face'],
  },
  {
    id: 'mem-2',
    title: 'Husband Late Anand Sharma',
    personName: 'Prof. Anand Sharma',
    relation: 'Husband (Married for 48 Years)',
    location: 'Cotton College, Guwahati',
    year: '1976 - 2024',
    description: 'Anand was a dedicated professor of History at Cotton College. He loved reading Assamese poetry on Sunday afternoons and walking by the Brahmaputra.',
    audioNoteText: 'Anand always said your smile was as radiant as the morning sun over the Brahmaputra river.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    category: 'family',
    clues: ['Taught History at Cotton College', 'Married 48 beautiful years', 'Loved reading poetry by the river'],
  },
  {
    id: 'mem-3',
    title: 'Grandson Aarav (9 Years)',
    personName: 'Aarav Sharma',
    relation: 'Grandson',
    location: 'Guwahati / Delhi',
    year: 'Born 2017',
    description: 'Aarav calls you "Aita". He loves listening to your bedtime folktales about the wise rhinos of Kaziranga and eating sweet Til Pitha.',
    audioNoteText: 'Aita, I love you! When I visit next week, will you tell me the story of the magic river again?',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    category: 'family',
    clues: ['Calls you Aita', 'Loves cricket and Kaziranga animal stories', 'Has sparkling playful eyes'],
  },
  {
    id: 'mem-4',
    title: 'Family Tea Garden Home in Jorhat',
    personName: 'Ancestral Home',
    relation: 'Cherished Place',
    location: 'Jorhat, Upper Assam',
    description: 'The green tea bushes that stretch to the horizon. You loved sitting in the wooden wicker chair smelling the fresh monsoon rain on tea leaves.',
    audioNoteText: 'The serene tea garden in Jorhat, with gentle morning mist and the songs of birds waking up.',
    photoUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    category: 'places',
    clues: ['Green tea garden in Jorhat', 'Wooden wicker chair in verandah', 'Smell of morning tea leaves'],
  },
  {
    id: 'mem-5',
    title: 'Rongali Bihu Celebrations',
    personName: 'Spring Festival of Assam',
    relation: 'Cultural Tradition',
    location: 'Beltola Courtyard',
    description: 'Dressing in golden Muga silk, weaving Gamusa for Anand, and listening to the rhythmic beats of the Dhol and Pepa.',
    audioNoteText: 'Rongali Bihu brings new beginnings. You always wove the most delicate Phulam Gamusa with red flower borders.',
    photoUrl: 'https://images.unsplash.com/photo-1609137144820-25256e29783f?auto=format&fit=crop&w=600&q=80',
    category: 'tradition',
    clues: ['Golden Muga silk dress', 'Sound of Dhol and Pepa', 'Weaving Gamusa for family'],
  },
  {
    id: 'mem-6',
    title: 'Sister Meera Barua',
    personName: 'Meera Barua',
    relation: 'Younger Sister (Lives in Jorhat)',
    location: 'Jorhat, Assam',
    description: 'Meera is your beloved younger sister. She lives in Jorhat, loves cooking traditional pitha, and phones you every Sunday afternoon to reminisce.',
    audioNoteText: 'Namaskar Baideo! This is your sister Meera from Jorhat. Sending you lots of love and looking forward to our Sunday chat.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    category: 'family',
    clues: ['Your younger sister in Jorhat', 'Calls you Baideo', 'Calls every Sunday afternoon'],
  },
];

export const INITIAL_SCORES: GameScore[] = [
  {
    id: 'sc-1',
    gameType: 'memory-match',
    title: 'Memory Match (NER Items)',
    score: 6,
    maxScore: 6,
    accuracy: 86,
    attempts: 7,
    errors: 1,
    timeTakenSeconds: 48,
    difficultyLevel: 'Medium',
    timestamp: 'Yesterday 10:24 AM',
    dateStr: '2026-10-04',
    notes: 'High visual engagement, matched tea cup and rhino quickly.',
  },
  {
    id: 'sc-2',
    gameType: 'object-recognition',
    title: 'Everyday Object Recognition',
    score: 3,
    maxScore: 3,
    accuracy: 100,
    attempts: 3,
    errors: 0,
    timeTakenSeconds: 26,
    difficultyLevel: 'Easy',
    timestamp: 'Yesterday 4:15 PM',
    dateStr: '2026-10-04',
    notes: 'Promptly recognized tea cup and reading glasses.',
  },
  {
    id: 'sc-3',
    gameType: 'sequence',
    title: 'Remember the Sequence',
    score: 3,
    maxScore: 3,
    accuracy: 75,
    attempts: 4,
    errors: 1,
    timeTakenSeconds: 38,
    difficultyLevel: 'Easy',
    timestamp: '2 days ago',
    dateStr: '2026-10-03',
    notes: 'Reproduced 3-object sequence with gentle encouragement.',
  },
];

export const INITIAL_GEOFENCE: GeofenceStatus = {
  isSafe: true,
  zoneName: 'Beltola Home & Verandah Perimeter',
  address: 'House 14, Beltola, Guwahati, Assam',
  lastUpdated: 'Just now (GPS accurate to 4m)',
  batteryLevel: 86,
  currentActivity: 'Resting in Living Room / Verandah',
  alerts: [
    {
      id: 'al-1',
      time: '10:02 AM',
      type: 'info',
      message: 'Asha entered the Front Verandah (Inside Safe Perimeter).',
    },
    {
      id: 'al-2',
      time: '8:15 AM',
      type: 'info',
      message: 'Morning BP medication confirmed taken on schedule.',
    },
  ],
};

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const data = localStorage.getItem(`saathi_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`saathi_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  public getPatient(): PatientProfile {
    return this.get<PatientProfile>('patient', INITIAL_PATIENT);
  }

  public getMedications(): Medication[] {
    return this.get<Medication[]>('medications', INITIAL_MEDICATIONS);
  }

  public toggleMedication(id: string): Medication[] {
    const list = this.getMedications();
    const updated = list.map((m) => {
      if (m.id === id) {
        const nextTaken = !m.taken;
        return {
          ...m,
          taken: nextTaken,
          takenAt: nextTaken
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      }
      return m;
    });
    this.set('medications', updated);
    return updated;
  }

  public addMedication(med: Omit<Medication, 'id' | 'taken'>): Medication[] {
    const list = this.getMedications();
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
      taken: false,
    };
    const updated = [...list, newMed];
    this.set('medications', updated);
    return updated;
  }

  public getActivities(): DailyActivity[] {
    return this.get<DailyActivity[]>('activities', INITIAL_ACTIVITIES);
  }

  public toggleActivity(id: string): DailyActivity[] {
    const list = this.getActivities();
    const updated = list.map((a) => {
      if (a.id === id) {
        return { ...a, completed: !a.completed };
      }
      return a;
    });
    this.set('activities', updated);
    return updated;
  }

  public getMemories(): MemoryItem[] {
    return this.get<MemoryItem[]>('memories', INITIAL_MEMORIES);
  }

  public addMemory(mem: Omit<MemoryItem, 'id'>): MemoryItem[] {
    const list = this.getMemories();
    const newMem: MemoryItem = {
      ...mem,
      id: `mem-${Date.now()}`,
    };
    const updated = [newMem, ...list];
    this.set('memories', updated);
    return updated;
  }

  public getScores(): GameScore[] {
    return this.get<GameScore[]>('scores', INITIAL_SCORES);
  }

  public addScore(score: Omit<GameScore, 'id' | 'timestamp' | 'dateStr'>): GameScore[] {
    const list = this.getScores();
    const now = new Date();
    const newScore: GameScore = {
      ...score,
      id: `sc-${Date.now()}`,
      timestamp: 'Today ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: now.toISOString().split('T')[0],
    };
    const updated = [newScore, ...list];
    this.set('scores', updated);
    if (syncService.isOffline()) {
      syncService.incrementPendingSync();
    }
    return updated;
  }

  public getGameDifficulty(gameType: string): 'Easy' | 'Medium' | 'Hard' {
    return this.get<'Easy' | 'Medium' | 'Hard'>(`diff_${gameType}`, 'Easy');
  }

  public updateGameDifficulty(
    gameType: string,
    accuracy: number
  ): { nextLevel: 'Easy' | 'Medium' | 'Hard'; change: 'increased' | 'decreased' | 'maintained' } {
    const current = this.getGameDifficulty(gameType);
    let nextLevel: 'Easy' | 'Medium' | 'Hard' = current;
    let change: 'increased' | 'decreased' | 'maintained' = 'maintained';

    if (accuracy > 80) {
      if (current === 'Easy') {
        nextLevel = 'Medium';
        change = 'increased';
      } else if (current === 'Medium') {
        nextLevel = 'Hard';
        change = 'increased';
      }
    } else if (accuracy < 50) {
      if (current === 'Hard') {
        nextLevel = 'Medium';
        change = 'decreased';
      } else if (current === 'Medium') {
        nextLevel = 'Easy';
        change = 'decreased';
      }
    }

    this.set(`diff_${gameType}`, nextLevel);
    return { nextLevel, change };
  }

  public getMoods(): MoodEntry[] {
    return this.get<MoodEntry[]>('moods', [
      { id: 'm-1', mood: 'peaceful', label: 'Peaceful & Calm', timestamp: 'Today 8:00 AM' },
    ]);
  }

  public addMood(mood: MoodEntry['mood'], label: string): MoodEntry[] {
    const list = this.getMoods();
    const newEntry: MoodEntry = {
      id: `mood-${Date.now()}`,
      mood,
      label,
      timestamp: 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newEntry, ...list];
    this.set('moods', updated);
    return updated;
  }

  public getGeofence(): GeofenceStatus {
    return this.get<GeofenceStatus>('geofence', INITIAL_GEOFENCE);
  }

  public triggerCaregiverSOS(patientName: string): void {
    const geo = this.getGeofence();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = {
      ...geo,
      alerts: [
        {
          id: `sos-${Date.now()}`,
          time,
          type: 'sos' as const,
          message: `EMERGENCY SOS pressed by ${patientName}. Priya Sharma (+91 98765 43210) notified via SMS and audio alert.`,
        },
        ...geo.alerts,
      ],
    };
    this.set('geofence', updated);
  }

  public resetDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('saathi_patient');
    localStorage.removeItem('saathi_medications');
    localStorage.removeItem('saathi_activities');
    localStorage.removeItem('saathi_memories');
    localStorage.removeItem('saathi_scores');
    localStorage.removeItem('saathi_moods');
    localStorage.removeItem('saathi_geofence');
  }
}

export const storageService = new StorageService();
