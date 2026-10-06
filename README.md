# SAATHI — Dementia Care Platform

SAATHI is an AI-powered, voice-first, and culturally adaptive cognitive assistance platform designed for elderly individuals and family caregivers, supporting offline-first PWA operation and multilingual features.

## Features
- **Patient Mode**: Simple 4-action high-contrast interface designed for elderly users.
- **Caregiver Portal**: Medication compliance tracking, real-time sync, and emergency SOS routing.
- **Offline-First**: PWA architecture with IndexedDB/LocalStorage persistence.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Set up environment variables in `.env`:
   ```bash
   GEMINI_API_KEY=""
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
