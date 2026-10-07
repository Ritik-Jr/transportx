import React from 'react';
import { Building2, CheckCircle2, ShieldCheck, Sparkles, MapPin, Phone, Hash } from 'lucide-react';

export default function ProfileSuccessAnimation({
  companyName = 'Transport Enterprise',
  gstin = '',
  phone = '',
  address = ''
}) {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl select-none text-left">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes profileBadgeDrop {
          0% {
            opacity: 0;
            transform: perspective(800px) rotateX(25deg) translateY(-25px) scale(0.85);
          }
          60% {
            opacity: 1;
            transform: perspective(800px) rotateX(-6deg) translateY(4px) scale(1.03);
          }
          85% {
            transform: perspective(800px) rotateX(2deg) translateY(-2px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: perspective(800px) rotateX(0deg) translateY(0) scale(1);
          }
        }

        @keyframes orbitCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes orbitCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes laserScan {
          0% { transform: translateY(-70px); opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { transform: translateY(70px); opacity: 0; }
        }

        @keyframes stampSlam {
          0% {
            opacity: 0;
            transform: scale(2.2) rotate(-18deg);
          }
          65% {
            opacity: 1;
            transform: scale(0.94) rotate(-3deg);
          }
          85% {
            transform: scale(1.04) rotate(-3deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(-3deg);
          }
        }

        @keyframes shockwavePulse {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @keyframes starGlint {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes pulseRadio {
          0% { transform: scale(0.7); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes gridFlow {
          0% { background-position: 0 0; }
          100% { background-position: 24px 24px; }
        }
      `}</style>

      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          animation: 'gridFlow 8s linear infinite'
        }}
      />

      {/* Radial Neon Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      {/* HUD Header Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3" />
          <span className="font-mono text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
            REGISTRY • COMPANY PROFILE VERIFIED
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold text-zinc-300">
            BILTY SYNC 100%
          </span>
        </div>
      </div>

      {/* Visual Animation Stage */}
      <div className="relative p-6 sm:p-8 flex flex-col items-center justify-center min-h-[220px]">
        {/* Floating Particles / Stars */}
        <div className="absolute top-6 left-8 text-emerald-400" style={{ animation: 'starGlint 2.4s ease-in-out infinite' }}>
          <Sparkles className="w-4 h-4 opacity-75" />
        </div>
        <div className="absolute bottom-10 left-12 text-teal-400" style={{ animation: 'starGlint 3.1s ease-in-out infinite 0.7s' }}>
          <Sparkles className="w-3 h-3 opacity-60" />
        </div>
        <div className="absolute top-8 right-12 text-emerald-300" style={{ animation: 'starGlint 2.8s ease-in-out infinite 1.2s' }}>
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        </div>
        <div className="absolute bottom-8 right-16 text-amber-300" style={{ animation: 'starGlint 3.5s ease-in-out infinite 0.4s' }}>
          <Sparkles className="w-4 h-4 opacity-70" />
        </div>

        {/* Central 3D Corporate Seal Container */}
        <div 
          className="relative w-44 h-44 flex items-center justify-center"
          style={{ animation: 'profileBadgeDrop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Shockwave Rings on Impact */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none"
            style={{ animation: 'shockwavePulse 1.8s ease-out infinite 0.5s' }}
          />
          <div 
            className="absolute inset-2 rounded-full border border-teal-300 pointer-events-none"
            style={{ animation: 'shockwavePulse 1.8s ease-out infinite 0.9s' }}
          />

          {/* SVG Multi-Layered Rotating Dials */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 176 176">
            {/* Outer Technical Dial (Clockwise) */}
            <g style={{ transformOrigin: '88px 88px', animation: 'orbitCW 26s linear infinite' }}>
              <circle cx="88" cy="88" r="82" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 8" opacity="0.5" />
              <circle cx="88" cy="88" r="77" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="20 6" opacity="0.7" />
              {/* Corner Tick Nodes */}
              <circle cx="88" cy="11" r="2.5" fill="#34d399" />
              <circle cx="88" cy="165" r="2.5" fill="#34d399" />
              <circle cx="11" cy="88" r="2.5" fill="#34d399" />
              <circle cx="165" cy="88" r="2.5" fill="#34d399" />
            </g>

            {/* Inner Precision Dial (Counter-Clockwise) */}
            <g style={{ transformOrigin: '88px 88px', animation: 'orbitCCW 18s linear infinite' }}>
              <circle cx="88" cy="88" r="68" fill="none" stroke="#0d9488" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
              <circle cx="88" cy="88" r="62" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="14 10" opacity="0.75" />
              <circle cx="88" cy="26" r="2" fill="#5eead4" />
              <circle cx="88" cy="150" r="2" fill="#5eead4" />
              <circle cx="26" cy="88" r="2" fill="#5eead4" />
              <circle cx="150" cy="88" r="2" fill="#5eead4" />
            </g>

            {/* Inner Seal Radial Background */}
            <circle cx="88" cy="88" r="54" fill="#064e3b" fillOpacity="0.45" stroke="#059669" strokeWidth="2" />
          </svg>

          {/* Central Fleet & Building Emblem */}
          <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center overflow-hidden">
            {/* Laser Scanning Line */}
            <div 
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] z-20 pointer-events-none"
              style={{ animation: 'laserScan 2.2s ease-in-out infinite' }}
            />

            {/* Radio / Satellite Wave pulses from top */}
            <div 
              className="absolute top-3 w-4 h-4 rounded-full border border-emerald-400/80 pointer-events-none"
              style={{ animation: 'pulseRadio 2s ease-out infinite' }}
            />

            {/* Vector Building + Fleet Silhouette */}
            <svg className="w-16 h-16 text-emerald-400" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="bldgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="truckGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Antenna on central tower */}
              <line x1="32" y1="6" x2="32" y2="14" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
              <circle cx="32" cy="5" r="2" fill="#34d399" />

              {/* High-Rise Enterprise Transport HQ */}
              <rect x="22" y="14" width="20" height="34" rx="2" fill="url(#bldgGrad)" fillOpacity="0.85" stroke="#10b981" strokeWidth="1.5" />
              {/* Windows Grid */}
              <rect x="25" y="18" width="3" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="30" y="18" width="4" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="36" y="18" width="3" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="25" y="24" width="3" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="30" y="24" width="4" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="36" y="24" width="3" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="25" y="30" width="3" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="30" y="30" width="4" height="3" rx="0.5" fill="#ecfdf5" />
              <rect x="36" y="30" width="3" height="3" rx="0.5" fill="#ecfdf5" />

              {/* Side Wings */}
              <rect x="12" y="26" width="10" height="22" rx="1.5" fill="#047857" fillOpacity="0.9" stroke="#059669" strokeWidth="1.2" />
              <rect x="15" y="30" width="4" height="2.5" fill="#a7f3d0" />
              <rect x="15" y="35" width="4" height="2.5" fill="#a7f3d0" />

              <rect x="42" y="24" width="10" height="24" rx="1.5" fill="#047857" fillOpacity="0.9" stroke="#059669" strokeWidth="1.2" />
              <rect x="45" y="28" width="4" height="2.5" fill="#a7f3d0" />
              <rect x="45" y="33" width="4" height="2.5" fill="#a7f3d0" />

              {/* Transport Fleet Truck at base dock */}
              <g transform="translate(10, 43)">
                {/* Truck Cargo Body */}
                <rect x="2" y="2" width="24" height="11" rx="1" fill="url(#truckGrad)" stroke="#047857" strokeWidth="0.8" />
                {/* Cabin */}
                <path d="M26 6 L33 6 L37 10 L37 13 L26 13 Z" fill="#34d399" stroke="#047857" strokeWidth="0.8" />
                <path d="M28 7.5 L32 7.5 L34.5 10 L28 10 Z" fill="#ecfdf5" />
                {/* Wheels */}
                <circle cx="8" cy="14" r="2.5" fill="#0f172a" stroke="#6ee7b7" strokeWidth="1" />
                <circle cx="21" cy="14" r="2.5" fill="#0f172a" stroke="#6ee7b7" strokeWidth="1" />
                <circle cx="32" cy="14" r="2.5" fill="#0f172a" stroke="#6ee7b7" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Dramatic "SEALED & SAVED" Stamp Overlay */}
          <div 
            className="absolute -bottom-2 -right-3 z-30 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg border-2 border-white/80 shadow-[0_4px_16px_rgba(16,185,129,0.6)] font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
            style={{ animation: 'stampSlam 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.35s' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SEALED</span>
          </div>
        </div>

        {/* Company Header Typography */}
        <div className="mt-5 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Company Profile Successfully Synced</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight pt-1">
            {companyName || 'Sai Transport Company'}
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 max-w-sm mx-auto">
            Printed automatically on all transport bilties, receipts, invoices, and cloud reports.
          </p>
        </div>
      </div>

      {/* Profile Details Snapshot Card */}
      <div className="p-3.5 sm:p-4 bg-zinc-900/80 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {gstin && (
          <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
              <Hash className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">GSTIN</span>
              <span className="font-mono font-bold text-zinc-200 truncate block text-[11px]">{gstin}</span>
            </div>
          </div>
        )}

        {phone && (
          <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-950/60 text-teal-400 border border-teal-800/40 shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Contact</span>
              <span className="font-mono font-bold text-zinc-200 truncate block text-[11px]">{phone}</span>
            </div>
          </div>
        )}

        {address && (
          <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center gap-2 sm:col-span-1">
            <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Registered Hub</span>
              <span className="text-zinc-200 truncate block text-[11px] font-medium" title={address}>{address}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
