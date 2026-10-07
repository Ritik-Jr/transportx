import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, CheckCircle2, Eye, EyeOff, Truck } from 'lucide-react';

export default function PasswordSuccessAnimation({
  newPasscode = '******',
  isAdminReset = false,
  onClose
}) {
  const [revealCode, setRevealCode] = useState(false);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl select-none text-left">
      {/* Dynamic Keyframes for Transport Depot Gate & Cargo Lock */}
      <style>{`
        @keyframes boomGateLower {
          0% {
            transform: rotate(-48deg);
          }
          65% {
            transform: rotate(2deg);
          }
          85% {
            transform: rotate(-1deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes cargoLockDrop {
          0% {
            opacity: 0;
            transform: translateY(-28px) scale(0.9);
          }
          60% {
            opacity: 1;
            transform: translateY(2px) scale(1.04);
          }
          85% {
            transform: translateY(-2px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shackleSnapDown {
          0% {
            transform: translateY(-16px);
          }
          50% {
            transform: translateY(-16px);
          }
          75% {
            transform: translateY(2px);
          }
          90% {
            transform: translateY(-1px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes gateLightPulse {
          0%, 100% {
            opacity: 0.65;
            box-shadow: 0 0 10px #10b981;
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 24px #34d399;
          }
        }

        @keyframes dashPipsSeq {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes truckHeadlight {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.28; }
        }
      `}</style>

      {/* Header Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-xs font-bold text-zinc-200 tracking-wide uppercase">
            Fleet Depot Security Gate
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>PASSCODE SECURED</span>
        </div>
      </div>

      {/* Visual Animation Stage - Fleet Security Gate & Heavy Cargo Lock */}
      <div className="relative w-full h-56 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 flex items-center justify-center overflow-hidden">
        
        {/* Vector Transport Gate Scene */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gateSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="boothGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <linearGradient id="steelLock" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="40%" stopColor="#71717a" />
              <stop offset="70%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <linearGradient id="goldBrass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="hardShackle" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e4e4e7" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
            <pattern id="barrierStripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="16" fill="#ef4444" />
              <rect x="8" width="8" height="16" fill="#f8fafc" />
            </pattern>
          </defs>

          {/* Background Night Sky */}
          <rect width="500" height="220" fill="url(#gateSky)" />

          {/* Distant Depot Perimeter Fence */}
          <line x1="0" y1="135" x2="500" y2="135" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="6 3" />
          {[20, 60, 100, 140, 360, 400, 440, 480].map(x => (
            <line key={x} x1={x} y1="115" x2={x} y2="145" stroke="#52525b" strokeWidth="2" />
          ))}

          {/* Asphalt Depot Road */}
          <rect x="0" y="145" width="500" height="75" fill="#18181b" />
          <line x1="0" y1="145" x2="500" y2="145" stroke="#3f3f46" strokeWidth="2" />
          <line x1="0" y1="185" x2="500" y2="185" stroke="#71717a" strokeWidth="1.5" strokeDasharray="14 10" />

          {/* Transport Truck approaching Checkpoint (Left Side) */}
          <g transform="translate(15, 95)">
            {/* Headlights beam across road */}
            <polygon points="120,44 240,24 240,68 120,52" fill="#fef08a" opacity="0.14" style={{ animation: 'truckHeadlight 2.5s infinite' }} />

            {/* Container Body */}
            <rect x="0" y="12" width="80" height="38" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
            <line x1="26" y1="14" x2="26" y2="48" stroke="#334155" strokeWidth="1.5" />
            <line x1="52" y1="14" x2="52" y2="48" stroke="#334155" strokeWidth="1.5" />
            {/* Cabin */}
            <path d="M80 22 L102 22 L116 34 L118 50 L80 50 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <path d="M86 25 L100 25 L110 34 L86 34 Z" fill="#93c5fd" opacity="0.8" />
            <circle cx="116" cy="45" r="2.5" fill="#fef08a" />
            {/* Wheels */}
            <circle cx="20" cy="51" r="7" fill="#09090b" stroke="#64748b" strokeWidth="1.8" />
            <circle cx="40" cy="51" r="7" fill="#09090b" stroke="#64748b" strokeWidth="1.8" />
            <circle cx="102" cy="51" r="7" fill="#09090b" stroke="#64748b" strokeWidth="1.8" />
          </g>

          {/* Depot Security Gate Booth (Right Side) */}
          <g transform="translate(355, 60)">
            {/* Security Cabin */}
            <rect x="20" y="20" width="85" height="75" rx="3" fill="url(#boothGrad)" stroke="#3f3f46" strokeWidth="1.5" />
            {/* Window */}
            <rect x="30" y="32" width="45" height="26" rx="2" fill="#09090b" stroke="#52525b" strokeWidth="1" />
            <rect x="33" y="35" width="39" height="20" rx="1" fill="#0284c7" opacity="0.4" />
            {/* Guard Booth Sign */}
            <rect x="25" y="6" width="75" height="12" rx="2" fill="#09090b" stroke="#10b981" strokeWidth="1" />
            <text x="62" y="15" fill="#34d399" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              SECURITY CHECKPOINT
            </text>

            {/* Checkpoint Signal Light Pole */}
            <rect x="5" y="8" width="10" height="28" rx="2" fill="#09090b" stroke="#52525b" strokeWidth="1" />
            <circle cx="10" cy="15" r="3.5" fill="#71717a" opacity="0.4" />
            {/* Glowing Green Signal Light */}
            <circle cx="10" cy="27" r="4" fill="#10b981" style={{ animation: 'gateLightPulse 1.8s infinite' }} />

            {/* Boom Barrier Gate Base Pivot */}
            <rect x="-6" y="65" width="16" height="30" rx="2" fill="#52525b" stroke="#71717a" strokeWidth="1.2" />
            <circle cx="2" cy="72" r="5" fill="#27272a" stroke="#d4d4d8" strokeWidth="1.5" />

            {/* Boom Barrier Striped Arm (Lowers into closed position) */}
            <g style={{ transformOrigin: '2px 72px', animation: 'boomGateLower 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <rect x="-180" y="68" width="180" height="7" rx="2" fill="url(#barrierStripes)" stroke="#18181b" strokeWidth="0.8" />
              {/* Red Tip Marker */}
              <circle cx="-182" cy="71.5" r="3" fill="#ef4444" />
            </g>
          </g>

          {/* Central Heavy Cargo Container Lock Mechanism */}
          <g transform="translate(250, 80)" style={{ animation: 'cargoLockDrop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            
            {/* Cargo Container Lock Shackle (Snaps shut into solid lock body) */}
            <g style={{ animation: 'shackleSnapDown 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
              <path
                d="M-22 0 V-28 C-22 -42 22 -42 22 -28 V0"
                fill="none"
                stroke="url(#hardShackle)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Heavy Steel Highlights on Shackle */}
              <path
                d="M-22 -14 V-28 C-22 -38 0 -38 0 -38"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>

            {/* Heavy-Duty Solid Steel Padlock Body */}
            <rect 
              x="-36" y="-6" width="72" height="64" rx="8" 
              fill="url(#steelLock)" 
              stroke="#52525b" 
              strokeWidth="2.5" 
              filter="drop-shadow(0 12px 24px rgba(0,0,0,0.7))" 
            />

            {/* Brass Core Faceplate */}
            <rect x="-26" y="4" width="52" height="44" rx="5" fill="url(#goldBrass)" stroke="#78350f" strokeWidth="1.5" />
            
            {/* Rivets / Industrial Bolts on Lock Body */}
            <circle cx="-30" cy="0" r="2.5" fill="#a1a1aa" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="30" cy="0" r="2.5" fill="#a1a1aa" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="-30" cy="52" r="2.5" fill="#a1a1aa" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="30" cy="52" r="2.5" fill="#a1a1aa" stroke="#3f3f46" strokeWidth="0.8" />

            {/* Keyway / Cylinder Cylinder with Truck Silhouette */}
            <circle cx="0" cy="22" r="10" fill="#09090b" stroke="#78350f" strokeWidth="1.5" />
            <polygon points="-3,24 3,24 2,34 -2,34" fill="#09090b" />
            
            {/* Emerald Transport Clearance Badge */}
            <circle cx="0" cy="22" r="5" fill="#10b981" />
            <path d="M-2 22 L-0.5 24 L3 19.5" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Engraved "TRANSPORTX • SECURED" Text on Lock */}
            <text x="0" y="44" fill="#fef3c7" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">
              TRANSPORT • SECURE
            </text>
          </g>
        </svg>

        {/* Floating Checkpoint Status Banner */}
        <div 
          className="absolute bottom-3 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-emerald-500/50 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-semibold text-emerald-300"
          style={{ animation: 'cargoLockDrop 0.6s ease-out forwards 0.3s' }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Depot Barrier Locked • Access Code Secured</span>
        </div>
      </div>

      {/* 6 Clean Dashboard Indicator Lamps (Truck Instrument Cluster Style) */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-col items-center justify-center gap-1.5">
        <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
          Passcode Status Verification
        </span>
        <div className="flex items-center gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 border border-emerald-300 flex items-center justify-center shadow-[0_0_8px_#10b981]"
              style={{
                animation: `dashPipsSeq 1.4s ease-in-out infinite ${idx * 0.15}s`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          ))}
        </div>
      </div>

      {/* Readout Typography */}
      <div className="px-4 py-3 bg-zinc-950 text-center space-y-1 border-t border-zinc-800/80">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {isAdminReset ? 'User Passcode Reset by Admin' : 'New 6-Digit Passcode Is Active'}
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          {isAdminReset 
            ? 'New user passcode assigned. Admin Master Passcode remains safe and unchanged.'
            : 'Previous access passcode has been revoked. All transport logs and bills are securely locked.'}
        </p>
      </div>

      {/* Security Status Snapshot Card */}
      <div className="p-3.5 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
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

            <div className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono font-semibold">
              ADMIN MASTER PROTECTED
            </div>
          </div>
        </div>

        {/* Transport Security Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Old passcode expired</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Fleet database protected</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Depot gate access synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
