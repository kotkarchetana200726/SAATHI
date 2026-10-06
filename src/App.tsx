/**
 * SAATHI - AI-based Cognitive Gaming and Memory Assistance Platform
 * Specialized for Elderly Individuals and Family Caregivers.
 */

import React, { useState, useEffect } from 'react';
import { AppMode, Language, PatientProfile } from './types';
import { storageService } from './services/storage';
import { speechService } from './services/speech';

// Landing Page
import { LandingPage } from './components/landing/LandingPage';

// Patient Mode Components
import { PatientHeader } from './components/patient/PatientHeader';
import { PatientHome } from './components/patient/PatientHome';
import { BrainGamesHub } from './components/patient/games/BrainGamesHub';
import { MemoryAlbum } from './components/patient/memory/MemoryAlbum';
import { VoiceAssistantModal } from './components/patient/assistant/VoiceAssistantModal';
import { TodaySchedule } from './components/patient/today/TodaySchedule';
import { EmergencyModal } from './components/patient/EmergencyModal';

// Caregiver Mode Components
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';

// PWA Offline & Sync Status Indicator
import { SyncStatusIndicator } from './components/common/SyncStatusIndicator';

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [patientView, setPatientView] = useState<'home' | 'games' | 'memory' | 'assistant' | 'today'>('home');
  const [selectedGame, setSelectedGame] = useState<'match' | 'sequence' | 'recognition'>('match');
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [patient] = useState<PatientProfile>(() => storageService.getPatient());

  // Handle switching views with speech feedback
  const handlePatientNavigate = (
    view: 'home' | 'games' | 'memory' | 'assistant' | 'today',
    specificGame?: 'match' | 'sequence' | 'recognition'
  ) => {
    if (specificGame) {
      setSelectedGame(specificGame);
    }
    setPatientView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEmergency = () => {
    setIsEmergencyOpen(true);
  };

  const handleTriggerAlert = () => {
    storageService.triggerCaregiverSOS(patient.name);
  };

  const handleSwitchToCaregiver = () => {
    speechService.stop();
    setMode('caregiver');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToPatient = () => {
    speechService.stop();
    setMode('patient');
    setPatientView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    speechService.speak(`Welcome back to Patient Mode, Asha ji.`);
  };

  const handleSwitchToLanding = () => {
    speechService.stop();
    setMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-[#FAF8F5] text-slate-800 ${fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm sm:text-base'}`}>
      {/* 1. LANDING PAGE MODE */}
      {mode === 'landing' && (
        <LandingPage
          onEnterPatientMode={handleSwitchToPatient}
          onEnterCaregiverMode={handleSwitchToCaregiver}
        />
      )}

      {/* 2. PATIENT MODE */}
      {mode === 'patient' && (
        <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
          <PatientHeader
            currentView={patientView}
            onNavigate={handlePatientNavigate}
            onOpenEmergency={handleOpenEmergency}
            onSwitchToCaregiver={handleSwitchToCaregiver}
            onSwitchToLanding={handleSwitchToLanding}
            language={language}
            onLanguageChange={setLanguage}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            patient={patient}
          />

          <div className="flex-1">
            {patientView === 'home' && (
              <PatientHome
                patient={patient}
                onSelectAction={handlePatientNavigate}
                fontSize={fontSize}
                language={language}
              />
            )}

            {patientView === 'games' && (
              <BrainGamesHub
                key={`${selectedGame}-${language}`}
                initialGame={selectedGame}
                onGoHome={() => handlePatientNavigate('home')}
                language={language}
              />
            )}

            {patientView === 'memory' && <MemoryAlbum language={language} />}

            {patientView === 'assistant' && (
              <VoiceAssistantModal patient={patient} language={language} />
            )}

            {patientView === 'today' && <TodaySchedule patient={patient} />}
          </div>

          {/* Emergency SOS Modal */}
          <EmergencyModal
            isOpen={isEmergencyOpen}
            onClose={() => setIsEmergencyOpen(false)}
            patient={patient}
            onTriggerAlert={handleTriggerAlert}
          />
        </div>
      )}

      {/* 3. CAREGIVER MODE */}
      {mode === 'caregiver' && (
        <CaregiverDashboard
          patient={patient}
          onSwitchToPatient={handleSwitchToPatient}
          onSwitchToLanding={handleSwitchToLanding}
        />
      )}

      {/* Offline-First & PWA Sync Status Indicator */}
      <SyncStatusIndicator />
    </div>
  );
}
