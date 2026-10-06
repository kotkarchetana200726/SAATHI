import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { NetworkPill } from '../common/OfflineIndicator';

interface Props {
  onEnterPatientMode: () => void;
  onEnterCaregiverMode: () => void;
}

export const LandingPage: React.FC<Props> = ({
  onEnterPatientMode,
  onEnterCaregiverMode,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800">
      {/* Top Banner / Product Tagline Banner */}
      <div className="bg-[#1B4332] text-white px-4 py-2.5 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#40916C] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Cognitive Wellness
            </span>
            <span className="text-emerald-100 font-medium">
              Care for the Mind. Connect with Memories.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NetworkPill />
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center font-black text-2xl shadow-sm">
              S
            </div>
            <div>
              <span className="text-2xl font-black text-[#2D6A4F] tracking-tight">
                SAATHI
              </span>
              <p className="text-[11px] text-stone-500 font-semibold tracking-wide">
                সাৰথী • साथी
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton variant="outline" className="hidden sm:inline-flex" />
            <button
              onClick={onEnterCaregiverMode}
              className="text-stone-700 hover:text-[#2D6A4F] font-bold text-xs sm:text-sm px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Caregiver Portal
            </button>
            <button
              onClick={onEnterPatientMode}
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Patient Mode</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Important Platform Disclaimer Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 text-xs sm:text-sm font-semibold mb-6">
            <ShieldCheck className="h-4 w-4 text-[#2D6A4F]" />
            <span>Assistive & Early-Intervention Platform (Not a medical diagnostic system)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            Care for the Mind. <br />
            <span className="text-[#2D6A4F]">Connect with Memories.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            SAATHI is an AI-based cognitive gaming and reminiscence assistance platform, thoughtfully adapted for elderly dementia patients and their family caregivers across the North Eastern Region of India.
          </p>

          {/* Quick Dual Action CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterPatientMode}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-black text-lg shadow-lg hover:shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            >
              <span>Experience Patient Mode (Asha Sharma, 72)</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={onEnterCaregiverMode}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 text-slate-800 font-bold text-lg border-2 border-stone-300 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Users className="h-5 w-5 text-stone-600" />
              <span>Caregiver Portal (Priya Sharma)</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold text-stone-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" /> 100% Offline PWA
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" /> Assamese & Regional Cultural Context
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" /> Ultra-Simple 4-Action Patient UI
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" /> Full Audio Read-Aloud (TTS)
            </span>
          </div>
        </div>
      </header>



      {/* Demo Patient Persona Profile */}
      <section className="py-14 bg-stone-100/70 border-t border-stone-200 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">Fictional Prototype Profile</span>
              <h3 className="text-2xl font-black text-slate-800">Demo Persona: Asha Sharma, 72</h3>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
              Guwahati, Assam
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <p><strong>Patient:</strong> Asha Sharma, 72 yrs</p>
              <p className="mt-1"><strong>Condition:</strong> Early-Stage Cognitive Decline (MCI)</p>
              <p className="mt-1"><strong>Residence:</strong> House 14, Beltola Tiniali, Guwahati</p>
            </div>
            <div>
              <p><strong>Primary Caregiver:</strong> Priya Sharma (Daughter)</p>
              <p className="mt-1"><strong>Doctor:</strong> Dr. Bhaskar Baruah (Neurologist, GMCH)</p>
              <p className="mt-1"><strong>Language:</strong> Assamese, Hindi, English</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onEnterPatientMode}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D6A4F] text-white font-bold text-sm hover:bg-[#1B4332] transition cursor-pointer"
            >
              Launch Patient View (Asha)
            </button>
            <button
              onClick={onEnterCaregiverMode}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-sm transition cursor-pointer"
            >
              Launch Caregiver View (Priya)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-4 sm:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div>
            <p className="font-bold text-stone-200 text-sm">SAATHI — Care for the Mind. Connect with Memories.</p>
            <p className="mt-1">
              AI-based cognitive gaming and memory assistance platform for elderly individuals and family caregivers.
            </p>
            <p className="mt-1 text-stone-500">
              Ethical Mandate: Assistive, non-diagnostic early intervention support tool.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <PWAInstallButton variant="solid" />
            <button
              onClick={onEnterPatientMode}
              className="text-stone-300 hover:text-white font-bold cursor-pointer"
            >
              Patient Mode
            </button>
            <button
              onClick={onEnterCaregiverMode}
              className="text-stone-300 hover:text-white font-bold cursor-pointer"
            >
              Caregiver Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
