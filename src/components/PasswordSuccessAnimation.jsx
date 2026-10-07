import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, CheckCircle2, Eye, EyeOff, ShieldAlert, Sparkles, Cpu } from 'lucide-react';

export default function PasswordSuccessAnimation({
  newPasscode = '******',
  isAdminReset = false,
  onClose
}) {
  const [revealCode, setRevealCode] = useState(false);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl select-none text-left">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes vaultEntrance {
          0% {
            opacity: 0;
            transform: perspective(700px) rotateX(25deg) scale(0.85);
          }
          65% {
            opacity: 1;
            transform: perspective(700px) rotateX(-5deg) scale(1.04);
          }
          85% {
            transform: perspective(700px) rotateX(2deg) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: perspective(700px) rotateX(0deg) scale(1);
          }
        }

        @keyframes shackleSnap {
          0% {
            transform: translateY(-16px) rotate(8deg);
          }
          40% {
            transform: translateY(-16px) rotate(0deg);
          }
          70% {
            transform: translateY(2px);
          }
          85% {
            transform: translateY(-1px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes lockBodyImpact {
          0%, 65% {
            transform: scale(1);
          }
          72% {
            transform: scale(0.97) translateY(2px);
          }
          85% {
            transform: scale(1.02) translateY(-1px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @keyframes hexShieldExpand {
          0% {
            transform: scale(0.65);
            opacity: 0;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: scale(1.85);
            opacity: 0;
          }
        }

        @keyframes tumblerCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes tumblerCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes cyberScan {
          0% { transform: translateY(-55px); opacity: 0; }
          20% { opacity: 0.85; }
          80% { opacity: 0.85; }
          100% { transform: translateY(55px); opacity: 0; }
        }

        @keyframes dotGlowSeq {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.9);
            box-shadow: 0 0 0px #10b981;
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
            box-shadow: 0 0 12px #34d399;
          }
        }

        @keyframes cyberGrid {
          0% { background-position: 0 0; }
          100% { background-position: 24px 24px; }
        }
      `}</style>

      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          animation: 'cyberGrid 10s linear infinite'
        }}
      />

      {/* Ambient Neon Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

      {/* HUD Header Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3" />
          <span className="font-mono text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
            SECURITY • 6-DIGIT PASSCODE ENCRYPTED
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold text-zinc-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            256-BIT SECURED
          </span>
        </div>
      </div>

      {/* Central Animation Stage */}
      <div className="relative p-6 sm:p-8 flex flex-col items-center justify-center min-h-[220px]">
        {/* Floating Sparkles */}
        <div className="absolute top-6 left-10 text-cyan-400 opacity-60">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute top-8 right-12 text-emerald-400 opacity-70">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="absolute bottom-8 left-14 text-teal-400 opacity-50">
          <Sparkles className="w-3 h-3" />
        </div>

        {/* 3D Cyber Vault Padlock Container */}
        <div 
          className="relative w-44 h-44 flex items-center justify-center"
          style={{ animation: 'vaultEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Hex Shield Energy Wave on Lock Latch */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-emerald-400/80 pointer-events-none"
            style={{ animation: 'hexShieldExpand 1.8s ease-out infinite 0.7s' }}
          />
          <div 
            className="absolute inset-4 rounded-full border border-cyan-400/80 pointer-events-none"
            style={{ animation: 'hexShieldExpand 1.8s ease-out infinite 1.1s' }}
          />

          {/* SVG Rotating Dials / Gear Tumblers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 176 176">
            {/* Outer Cyan Tumbler Ring */}
            <g style={{ transformOrigin: '88px 88px', animation: 'tumblerCW 20s linear infinite' }}>
              <circle cx="88" cy="88" r="80" fill="none" stroke="#0891b2" strokeWidth="1" strokeDasharray="6 8" opacity="0.6" />
              <circle cx="88" cy="88" r="74" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="18 10" opacity="0.75" />
              {/* Nodes */}
              <circle cx="88" cy="14" r="2.5" fill="#22d3ee" />
              <circle cx="88" cy="162" r="2.5" fill="#22d3ee" />
              <circle cx="14" cy="88" r="2.5" fill="#22d3ee" />
              <circle cx="162" cy="88" r="2.5" fill="#22d3ee" />
            </g>

            {/* Inner Emerald Tumbler Ring */}
            <g style={{ transformOrigin: '88px 88px', animation: 'tumblerCCW 15s linear infinite' }}>
              <circle cx="88" cy="88" r="66" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
              <circle cx="88" cy="88" r="60" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="12 8" opacity="0.8" />
              <circle cx="88" cy="28" r="2" fill="#34d399" />
              <circle cx="88" cy="148" r="2" fill="#34d399" />
              <circle cx="28" cy="88" r="2" fill="#34d399" />
              <circle cx="148" cy="88" r="2" fill="#34d399" />
            </g>
          </svg>

          {/* Heavy 3D Padlock Mechanism */}
          <div 
            className="relative z-10 w-28 h-28 flex flex-col items-center justify-center"
            style={{ animation: 'lockBodyImpact 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
          >
            {/* Padlock SVG with Animated Snapping Shackle */}
            <svg className="w-24 h-24 drop-shadow-[0_0_25px_rgba(16,185,129,0.45)]" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="shackleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="60%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Padlock Shackle - Snaps shut into lock body */}
              <g style={{ transformOrigin: '32px 30px', animation: 'shackleSnap 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <path
                  d="M20 28 V19 C20 12.37 25.37 7 32 7 C38.63 7 44 12.37 44 19 V28"
                  fill="none"
                  stroke="url(#shackleGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Metallic Highlights on Shackle */}
                <path
                  d="M20 23 V19 C20 14 24 9 30 7.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>

              {/* Padlock Solid Body */}
              <rect
                x="14"
                y="26"
                width="36"
                height="30"
                rx="7"
                fill="url(#bodyGrad)"
                stroke="#10b981"
                strokeWidth="2"
              />

              {/* Body Neon Accent Rim */}
              <rect
                x="17"
                y="29"
                width="30"
                height="24"
                rx="4"
                fill="none"
                stroke="#0891b2"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.7"
              />

              {/* Keyhole / Biometric Sensor */}
              <circle cx="32" cy="38" r="4.5" fill="url(#glowGrad)" />
              <polygon points="30,40 34,40 33,47 31,47" fill="url(#glowGrad)" />

              {/* Status Indicator LED (Glowing Green) */}
              <circle cx="43" cy="32" r="1.8" fill="#34d399" />
              <circle cx="43" cy="32" r="3.5" fill="#34d399" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* 6 Cyber Digit Indicator Dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center shadow-[0_0_8px_#10b981]"
              style={{
                animation: `dotGlowSeq 1.4s ease-in-out infinite ${idx * 0.15}s`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          ))}
        </div>

        {/* Header Typography */}
        <div className="mt-4 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passcode Successfully Updated & Locked</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight pt-1">
            {isAdminReset ? 'User Passcode Reset by Admin Master' : 'New 6-Digit Passcode Is Active'}
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 max-w-sm mx-auto">
            {isAdminReset 
              ? 'New passcode assigned. The permanent Admin Master Password (400242) remains unchanged.'
              : 'Previous passcode has been permanently revoked across all browsers and devices.'}
          </p>
        </div>
      </div>

      {/* Security Status Snapshot Card */}
      <div className="p-3.5 sm:p-4 bg-zinc-900/80 border-t border-zinc-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Active Passcode</span>
              <span className="font-mono font-bold text-emerald-400 text-sm tracking-widest">
                {revealCode ? newPasscode : '••••••'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {newPasscode && newPasscode !== '******' && (
              <button
                type="button"
                onClick={() => setRevealCode(prev => !prev)}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                {revealCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{revealCode ? 'Hide Code' : 'Show Code'}</span>
              </button>
            )}

            <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono font-semibold">
              ADMIN: 400242 ACTIVE
            </div>
          </div>
        </div>

        {/* Security Checklist Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/80 flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Old passcode expired</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/80 flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted in cloud database</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/80 flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Master 400242 preserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
