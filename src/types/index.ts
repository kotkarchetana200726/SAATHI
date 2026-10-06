export type Language = 'en' | 'hi' | 'as' | 'bn' | 'mr';

export type AppMode = 'landing' | 'patient' | 'caregiver';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  condition: string;
  stage: string;
  residence: string;
  primaryCaregiver: {
    name: string;
    relationship: string;
    phone: string;
    location: string;
  };
  doctor: {
    name: string;
    specialty: string;
    hospital: string;
    phone: string;
  };
  emergencyAddress: string;
  bloodGroup: string;
  allergies: string[];
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  timing: string; // e.g. "8:30 AM"
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  purpose: string;
  taken: boolean;
  takenAt?: string;
  pillColor: string;
  instructions: string;
}

export interface DailyActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  iconName: string;
  completed: boolean;
  category: 'routine' | 'cognitive' | 'meal' | 'social' | 'rest';
}

export interface MemoryItem {
  id: string;
  title: string;
  personName: string;
  relation: string;
  location: string;
  year?: string;
  description: string;
  audioNoteText: string;
  photoUrl: string;
  category: 'family' | 'places' | 'moments' | 'routine' | 'people' | 'tradition' | 'cherished';
  clues: string[];
}

export interface GameScore {
  id: string;
  gameType: 'memory-match' | 'sequence' | 'object-recognition' | 'familiar-places' | 'routine-sequence';
  title: string;
  score: number;
  maxScore: number;
  accuracy: number; // percentage 0 - 100
  attempts: number;
  errors: number;
  timeTakenSeconds: number;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  difficultyChange?: 'increased' | 'decreased' | 'maintained';
  timestamp: string;
  dateStr: string;
  notes?: string;
}

export interface MoodEntry {
  id: string;
  mood: 'happy' | 'peaceful' | 'confused' | 'sleepy' | 'sad';
  label: string;
  timestamp: string;
  note?: string;
}

export interface GeofenceStatus {
  isSafe: boolean;
  zoneName: string;
  address: string;
  lastUpdated: string;
  batteryLevel: number;
  currentActivity: string;
  alerts: Array<{
    id: string;
    time: string;
    type: 'info' | 'warning' | 'sos';
    message: string;
  }>;
}
