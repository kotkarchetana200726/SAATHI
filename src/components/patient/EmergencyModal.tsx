import React from 'react';
import { Phone, AlertTriangle, ShieldCheck, Volume2, X, MapPin } from 'lucide-react';
import { PatientProfile } from '../../types';
import { speechService } from '../../services/speech';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onTriggerAlert: () => void;
}

export const EmergencyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patient,
  onTriggerAlert,
}) => {
  if (!isOpen) return null;

  const readAddressAloud = () => {
    speechService.speak(
      `My name is ${patient.name}. I am at ${patient.emergencyAddress}. My daughter Priya's phone number is 9 8 7 6 5, 4 3 2 1 0. My blood group is ${patient.bloodGroup}.`,
      { priority: true }
    );
  };

  const handleCallPriya = () => {
    speechService.playGentleChime('alert');
    onTriggerAlert();
    speechService.speak('Connecting call to your daughter Priya now.', { priority: true });
    // In a real device this triggers tel:
    window.location.href = `tel:${patient.primaryCaregiver.phone}`;
  };

  const handleCallDoctor = () => {
    speechService.speak(`Calling ${patient.doctor.name} at Guwahati Neurological Institute.`, { priority: true });
    window.location.href = `tel:${patient.doctor.phone}`;
  };

  const handleCall108 = () => {
    speechService.speak('Connecting to emergency helpline 108.', { priority: true });
    window.location.href = 'tel:108';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-4 border-rose-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h2 id="emergency-title" className="text-2xl sm:text-3xl font-extrabold text-rose-900 tracking-tight">
                Emergency & Help
              </h2>
              <p className="text-base text-rose-700 font-medium">
                সাহায্য / आपातकालीन मदद
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              speechService.stop();
              onClose();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-600 hover:bg-stone-200 cursor-pointer"
            aria-label="Close emergency screen"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Big Actions */}
        <div className="mt-6 space-y-4">
          {/* Main button: Call Daughter Priya */}
          <button
            onClick={handleCallPriya}
            className="w-full flex items-center justify-between rounded-2xl bg-rose-600 hover:bg-rose-700 text-white p-5 shadow-lg active:scale-98 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Phone className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-rose-200">Primary Contact</span>
                <p className="text-2xl sm:text-3xl font-black">Call Priya (Daughter)</p>
                <p className="text-sm sm:text-base text-rose-100 mt-0.5">প্ৰিয়া (জীয়াৰী) ক ফোন কৰক • +91 98765 43210</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-white text-rose-700 font-bold px-4 py-2 rounded-xl text-lg">
              CALL
            </span>
          </button>

          {/* Call Doctor */}
          <button
            onClick={handleCallDoctor}
            className="w-full flex items-center justify-between rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white p-4.5 shadow-md active:scale-98 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">Geriatric Doctor</span>
                <p className="text-xl sm:text-2xl font-bold">Call Dr. Baruah (GMCH)</p>
                <p className="text-sm text-emerald-100">{patient.doctor.hospital}</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg text-sm">
              DOCTOR
            </span>
          </button>

          {/* National Ambulance 108 */}
          <button
            onClick={handleCall108}
            className="w-full flex items-center justify-between rounded-2xl bg-amber-600 hover:bg-amber-700 text-white p-4 shadow-md active:scale-98 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">Ambulance (108 / 112)</p>
                <p className="text-sm text-amber-100">National Emergency Assam Service</p>
              </div>
            </div>
            <span className="font-extrabold text-xl px-3 py-1 rounded-lg bg-black/20">
              108
            </span>
          </button>
        </div>

        {/* Large Print Location & Identity Card */}
        <div className="mt-6 rounded-2xl bg-amber-50/80 border-2 border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span>Patient Identity & Current Address</span>
            </div>
            <button
              onClick={readAddressAloud}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg hover:bg-amber-300"
              title="Read address out loud"
            >
              <Volume2 className="h-4 w-4" />
              <span>Read Aloud</span>
            </button>
          </div>
          <p className="text-xl font-extrabold text-slate-800 mt-2">
            {patient.name}, Age {patient.age}
          </p>
          <p className="text-base text-slate-700 mt-1 font-medium leading-relaxed">
            {patient.emergencyAddress}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="bg-white px-2.5 py-1 rounded-md border border-amber-200">
              Blood: <strong>{patient.bloodGroup}</strong>
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-amber-200">
              Allergies: <strong>{patient.allergies.join(', ')}</strong>
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            speechService.stop();
            onClose();
          }}
          className="mt-6 w-full py-3.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-lg cursor-pointer transition"
        >
          I Am Safe Now (Close)
        </button>
      </div>
    </div>
  );
};
