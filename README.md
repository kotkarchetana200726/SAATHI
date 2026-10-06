# 🧠 SAATHI — Care for the Mind. Connect with Memories.

**SAATHI** (সাৰথী • साथी) is an AI-powered, voice-assisted, and offline-first cognitive wellness & reminiscence platform designed specifically for elderly individuals experiencing mild cognitive impairment or dementia, along with their family caregivers.

---

## 🌐 Live Deployment Link

> 🔗 **Deployment Link:** [Insert your deployment link here] *(e.g., https://saathi-care.vercel.app)*

---

## 📌 Project Overview

Dementia and mild cognitive decline present significant challenges for elderly individuals and their families. Conventional medical apps often feature complex, high-friction user interfaces that cause stress and anxiety for senior citizens. 

**SAATHI** addresses this with:
- **Ultra-Simple Patient Interface**: High-contrast, large-touch, 4-action dashboard designed for stress-free interaction.
- **Reminiscence & Cognitive Training**: Interactive memory games, personal family photo banks, and voice recall clues.
- **Assistive Voice Companion**: Respectful voice assistant that answers repetitive queries calmly and provides reassuring interaction.
- **Caregiver Reassurance**: Real-time compliance tracking, medication logs, safe perimeter geofencing, and immediate SOS alert routing.
- **Offline-First PWA**: Built to function seamlessly without active internet connections using local storage caching.

---

## ✨ Features Implemented

### 👴 Patient Mode
- **Today's Schedule & Medication Check-off**: Tactile day-time clock, visual sunrise/sunset cues, and one-tap medication completion logs.
- **Cognitive Training Games**:
  - *Memory Match*: Frustration-free card matching with adaptive difficulty.
  - *Object Recall*: Identifying familiar household objects and memory items.
  - *Routine Sequencing*: Step-by-step daily activity sequencing.
- **Reminiscence Memory Bank**: Familial continuity bank pairing family photos (loved ones) with recorded audio notes and recall hints.
- **Assistive Voice Companion**: Interactive voice assistant providing calm responses, honorific greetings, and comforting stories.
- **One-Tap Emergency SOS**: Quick emergency call trigger for immediate caregiver contact.

### 👩‍⚕️ Caregiver Portal
- **Cognitive & Adherence Analytics**: Objective health trends, game participation stats, and daily medication completion metrics.
- **Memory & Routine Management**: Ability to upload family photos, voice notes, and set daily schedule items.
- **Safe Perimeter Geofencing**: Interactive geofence tracker with simulated patient location updates and perimeter alerts.
- **Emergency Alert Routing**: Direct contact links and instant notifications during patient SOS triggers.

### 📶 Offline-First & Accessibility
- **Progressive Web App (PWA)**: Full PWA support with manifest, service worker caching, and home-screen installability on mobile/desktop.
- **Multilingual Support**: Interface available in English, Hindi, and Assamese.
- **Full Text-to-Speech (TTS)**: Built-in audio read-aloud support for all patient controls and reminders.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Vanilla CSS design tokens
- **Animations & Micro-interactions**: Motion (Framer Motion), Canvas Confetti
- **Icons**: Lucide React
- **AI & Voice**: Google GenAI SDK (`@google/genai`), Web Speech API (TTS & Voice Recognition)
- **PWA & Offline Storage**: `vite-plugin-pwa`, Workbox, LocalStorage / IndexedDB API
- **Deployment**: Vercel ready (`vercel.json`)

---

## 🔑 Required Credentials & Setup Instructions

No API keys are required for the current prototype.

The current version of SAATHI does not require:
- API keys
- Database credentials
- Login credentials
- Secret environment variables

### 🎙️ Microphone Permission
Voice-based features may require microphone permission.

When the browser asks for microphone access:
- Select **Allow** → Microphone Access

> *Note: If microphone permission is blocked, voice-based functionality may not work correctly.*

### 🔒 Security
Do not add private API keys, passwords, tokens, or other secrets directly to the source code or GitHub repository. If future versions require external APIs, use environment variables (`.env`).

---

## ⚙️ How to Install & Run Locally

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)

### Step 1: Clone the Repository
```bash
git clone https://github.com/kotkarchetana200726/SAATHI.git
cd SAATHI
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
VITE_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
VITE_PUBLIC_ENV="development"
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000/`.

### Step 5: Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
SAATHI/
├── public/                # Static assets, PWA icons, manifest
├── src/
│   ├── components/        # React components
│   │   ├── caregiver/     # Caregiver Portal & Monitoring Dashboard
│   │   ├── common/        # Offline indicator, Language selector, PWA button
│   │   ├── landing/       # Landing page & navigation
│   │   └── patient/       # Patient Mode, Games, Memory Bank & Voice Assistant
│   ├── hooks/             # Custom React hooks (PWA install, online status)
│   ├── services/          # Storage, Speech TTS/STT, Sync & Translations
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application router/state
│   ├── index.css          # Tailwind CSS styles & design tokens
│   └── main.tsx           # Application entry point
├── package.json           # Dependencies and build scripts
├── vite.config.ts         # Vite & PWA configuration
└── vercel.json            # Vercel deployment configuration
```

---

## 🛡️ License & Disclaimer

*Disclaimer: SAATHI is an assistive cognitive intervention tool designed to support elderly seniors and family caregivers. It is not a medical diagnostic system.*
