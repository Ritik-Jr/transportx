import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function TruckSuccessAnimation({ fromCity = '', toCity = '', lrNo = '', vehicleNo = '' }) {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl select-none">
      
      {/* Dynamic Inline Keyframes */}
      <style>{`
        @keyframes roadDash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -120; }
        }
        @keyframes roadLines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes speedLine {
          0% { transform: translateX(120%) scaleX(0.5); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateX(-120%) scaleX(1.5); opacity: 0; }
        }
        @keyframes truckCamShift {
          0% {
            transform: perspective(700px) rotateY(-28deg) rotateX(6deg) scale(0.92) translate3d(-35px, 8px, -40px);
          }
          28% {
            transform: perspective(700px) rotateY(-18deg) rotateX(4deg) scale(1.02) translate3d(-10px, 4px, 0px);
          }
          55% {
            transform: perspective(700px) rotateY(15deg) rotateX(2deg) scale(1.06) translate3d(20px, 0px, 20px);
          }
          78% {
            transform: perspective(700px) rotateY(42deg) rotateX(0deg) scale(1.03) translate3d(70px, -4px, 30px);
          }
          100% {
            transform: perspective(700px) rotateY(55deg) rotateX(-2deg) scale(0.96) translate3d(140px, -8px, -10px);
          }
        }
        @keyframes truckBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2.5px); }
        }
        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes headlightGlow {
          0%, 100% { opacity: 0.65; transform: scaleY(1); }
          50% { opacity: 0.95; transform: scaleY(1.08); }
        }
        @keyframes destinationPulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        @keyframes beaconRing {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes exhaustPuff {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0.6; }
          100% { transform: translate(-30px, -15px) scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* Top Overlay Badge Bar */}
      <div className="absolute top-2.5 left-3 right-3 z-20 flex items-center justify-between text-[11px] pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 text-zinc-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="font-semibold tracking-wide">
            {fromCity && toCity ? `${fromCity} ➔ ${toCity}` : 'DISPATCH IN TRANSIT'}
          </span>
        </div>

        {vehicleNo && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900/70 backdrop-blur-md border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
            <Navigation className="w-2.5 h-2.5 text-emerald-400" />
            <span>{vehicleNo}</span>
          </div>
        )}
      </div>

      {/* Main Cinematic Viewport Canvas */}
      <div className="h-40 sm:h-48 w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        
        {/* Sky, Distant Stars and Mountains Silhouette */}
        <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden pointer-events-none opacity-40">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 120">
            {/* Distant Mountains */}
            <path d="M0,120 L0,75 L80,50 L160,85 L280,35 L400,90 L520,45 L650,85 L780,40 L900,75 L1000,55 L1000,120 Z" fill="#18181b" />
            <path d="M0,120 L0,88 L120,68 L240,95 L360,60 L480,95 L620,65 L760,95 L880,70 L1000,85 L1000,120 Z" fill="#27272a" opacity="0.6" />
            {/* Stars */}
            <circle cx="90" cy="25" r="1" fill="#ffffff" />
            <circle cx="210" cy="18" r="1.2" fill="#ffffff" />
            <circle cx="340" cy="28" r="1" fill="#ffffff" />
            <circle cx="580" cy="15" r="1.4" fill="#ffffff" />
            <circle cx="720" cy="22" r="1" fill="#ffffff" />
            <circle cx="890" cy="18" r="1.2" fill="#ffffff" />
          </svg>
        </div>

        {/* Destination Waypoint Beacon in the Horizon */}
        <div className="absolute top-[28%] right-[22%] sm:right-[26%] z-10 flex flex-col items-center pointer-events-none">
          <div className="relative">
            <span className="absolute -inset-2 rounded-full bg-emerald-500/30" style={{ animation: 'beaconRing 2s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block shadow-[0_0_12px_#34d399]" style={{ animation: 'destinationPulse 2s ease-in-out infinite' }} />
          </div>
          <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
            <MapPin className="w-2.5 h-2.5" />
            <span>{toCity || 'Destination'}</span>
          </div>
        </div>

        {/* 3D Highway Road Surface */}
        <div 
          className="absolute inset-x-0 bottom-0 h-28 sm:h-32 pointer-events-none"
          style={{ perspective: '450px' }}
        >
          <div 
            className="w-full h-full bg-zinc-900 border-t-2 border-emerald-500/30 shadow-2xl relative"
            style={{ 
              transform: 'rotateX(55deg)', 
              transformOrigin: 'bottom center',
              background: 'linear-gradient(to bottom, #111113 0%, #18181b 40%, #09090b 100%)'
            }}
          >
            {/* Left & Right Shoulder Rumble Lines */}
            <div className="absolute top-0 bottom-0 left-[12%] w-1 bg-amber-500/40" />
            <div className="absolute top-0 bottom-0 right-[12%] w-1 bg-zinc-500/40" />

            {/* Road Center Divider Dashes (Rushing Backwards) */}
            <svg className="w-full h-full absolute inset-0">
              <line 
                x1="50%" y1="0" 
                x2="50%" y2="100%" 
                stroke="#facc15" 
                strokeWidth="4" 
                strokeDasharray="20 20" 
                style={{ animation: 'roadDash 0.35s linear infinite' }} 
              />
            </svg>
          </div>
        </div>

        {/* Speed Wind Streaks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute top-[35%] left-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'speedLine 0.7s linear infinite 0.1s' }} />
          <div className="absolute top-[52%] left-0 w-48 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" style={{ animation: 'speedLine 0.6s linear infinite 0.3s' }} />
          <div className="absolute top-[68%] left-0 w-40 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'speedLine 0.5s linear infinite 0.2s' }} />
          <div className="absolute top-[78%] left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" style={{ animation: 'speedLine 0.65s linear infinite 0.45s' }} />
        </div>

        {/* 3D Dramatic Camera Angle Swiveling Truck Container */}
        <div 
          className="relative z-15 flex items-center justify-center"
          style={{ 
            animation: 'truckCamShift 4.2s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Subtle Suspension Bounce Container */}
          <div style={{ animation: 'truckBounce 0.4s ease-in-out infinite' }}>
            
            {/* The Cinematic Freight Truck Vector Illustration */}
            <svg 
              className="w-72 sm:w-88 h-28 sm:h-34 drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]" 
              viewBox="0 0 340 130" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Headlight Cones */}
                <linearGradient id="headlightBeam" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                {/* Cabin Metallic Gradient */}
                <linearGradient id="cabinBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fafafa" />
                  <stop offset="50%" stopColor="#e4e4e7" />
                  <stop offset="100%" stopColor="#71717a" />
                </linearGradient>

                {/* Trailer Gradient */}
                <linearGradient id="trailerBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="60%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>

                {/* Windshield Glass Reflection */}
                <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="40%" stopColor="#0284c7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
                </linearGradient>

                {/* Wheel Chrome Rim */}
                <linearGradient id="rimChrome" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#71717a" />
                  <stop offset="100%" stopColor="#27272a" />
                </linearGradient>
              </defs>

              {/* Headlight Glowing Light Beams illuminating road forward */}
              <polygon 
                points="295,78 340,65 340,96 295,84" 
                fill="url(#headlightBeam)" 
                style={{ animation: 'headlightGlow 1.2s ease-in-out infinite' }} 
              />
              <polygon 
                points="292,82 340,75 340,105 292,86" 
                fill="url(#headlightBeam)" 
                opacity="0.8" 
              />

              {/* Exhaust Smoke Plumes */}
              <circle cx="230" cy="38" r="4" fill="#a1a1aa" style={{ animation: 'exhaustPuff 1s linear infinite 0.1s' }} />
              <circle cx="230" cy="36" r="3" fill="#d4d4d8" style={{ animation: 'exhaustPuff 1s linear infinite 0.4s' }} />

              {/* --- 1. CARGO TRAILER CONTAINER --- */}
              {/* Main Container Box */}
              <rect x="25" y="24" width="205" height="66" rx="4" fill="url(#trailerBody)" stroke="#3f3f46" strokeWidth="1.5" />
              
              {/* Trailer Aerodynamic Corrugated Wall Ribs */}
              <line x1="55" y1="26" x2="55" y2="88" stroke="#27272a" strokeWidth="2" />
              <line x1="85" y1="26" x2="85" y2="88" stroke="#27272a" strokeWidth="2" />
              <line x1="115" y1="26" x2="115" y2="88" stroke="#27272a" strokeWidth="2" />
              <line x1="145" y1="26" x2="145" y2="88" stroke="#27272a" strokeWidth="2" />
              <line x1="175" y1="26" x2="175" y2="88" stroke="#27272a" strokeWidth="2" />
              <line x1="205" y1="26" x2="205" y2="88" stroke="#27272a" strokeWidth="2" />

              {/* High-Tech Branding on Trailer */}
              <rect x="42" y="44" width="145" height="24" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="1" />
              <text x="50" y="60" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="2">
                TRANSPORTX
              </text>
              <text x="145" y="60" fill="#10b981" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                FLEET
              </text>

              {/* Trailer Reflective Hazard Stripe at Bottom */}
              <rect x="25" y="85" width="205" height="4" fill="#eab308" />
              <line x1="35" y1="85" x2="40" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="60" y1="85" x2="65" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="85" y1="85" x2="90" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="110" y1="85" x2="115" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="135" y1="85" x2="140" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="160" y1="85" x2="165" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="185" y1="85" x2="190" y2="89" stroke="#000000" strokeWidth="2" />
              <line x1="210" y1="85" x2="215" y2="89" stroke="#000000" strokeWidth="2" />

              {/* Rear Trailer Mudguard and Underride Guard */}
              <rect x="18" y="78" width="10" height="18" fill="#18181b" rx="2" />
              <rect x="15" y="86" width="6" height="4" fill="#ef4444" /> {/* Tail brake light */}

              {/* Kingpin / Hitch connection */}
              <rect x="225" y="65" width="12" height="22" fill="#52525b" rx="2" />

              {/* --- 2. CABIN PRIME MOVER TRUCK --- */}
              {/* Vertical Exhaust Stack behind cabin */}
              <rect x="232" y="20" width="4" height="45" fill="#71717a" rx="1.5" />
              <path d="M232,20 Q230,14 227,15" stroke="#71717a" strokeWidth="3" fill="none" />

              {/* Cabin Roof Fairing Deflector */}
              <path d="M236,44 L258,26 L278,26 L286,44 Z" fill="url(#cabinBody)" stroke="#71717a" strokeWidth="1" />

              {/* Main Cabin Shell */}
              <path d="M236,44 L288,44 L298,62 L298,92 L236,92 Z" fill="url(#cabinBody)" stroke="#52525b" strokeWidth="1.2" />

              {/* Aerodynamic Windshield */}
              <path d="M258,34 L276,34 L288,52 L260,52 Z" fill="url(#glassReflection)" stroke="#0284c7" strokeWidth="1" />
              {/* Windshield Glare Reflection Line */}
              <line x1="265" y1="36" x2="280" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />

              {/* Cabin Side Door Window */}
              <path d="M242,48 L256,48 L256,62 L242,62 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              {/* Door Handle */}
              <rect x="244" y="66" width="6" height="2" fill="#71717a" rx="1" />

              {/* Aerodynamic Front Nose Hood & Bumper */}
              <path d="M288,58 L299,62 L300,82 L288,82 Z" fill="#d4d4d8" />
              {/* Front Chrome Bumper */}
              <rect x="288" y="82" width="14" height="12" rx="3" fill="#71717a" stroke="#a1a1aa" strokeWidth="1" />
              {/* Front Chrome Grille */}
              <line x1="294" y1="84" x2="294" y2="92" stroke="#18181b" strokeWidth="1.5" />
              <line x1="297" y1="84" x2="297" y2="92" stroke="#18181b" strokeWidth="1.5" />
              <line x1="300" y1="84" x2="300" y2="92" stroke="#18181b" strokeWidth="1.5" />

              {/* LED Headlamp Lens */}
              <polygon points="296,75 301,77 301,83 296,82" fill="#38bdf8" />
              <circle cx="298" cy="79" r="2.5" fill="#ffffff" />

              {/* Chrome Side Mirror */}
              <rect x="286" y="48" width="3" height="8" rx="1" fill="#71717a" />
              <line x1="284" y1="52" x2="286" y2="52" stroke="#a1a1aa" strokeWidth="1.5" />

              {/* Chassis Underbody */}
              <rect x="20" y="88" width="275" height="6" fill="#18181b" />

              {/* --- 3. WHEELS & ALLOY RIMS --- */}
              {/* Wheel 1: Trailer Rear Axle 1 */}
              <g transform="translate(52, 94)">
                <circle cx="0" cy="0" r="16" fill="#09090b" stroke="#27272a" strokeWidth="2" />
                <circle cx="0" cy="0" r="10" fill="url(#rimChrome)" />
                <circle cx="0" cy="0" r="4" fill="#09090b" />
                {/* Rotating Spokes */}
                <g style={{ transformOrigin: '0px 0px', animation: 'wheelSpin 0.3s linear infinite' }}>
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#d4d4d8" strokeWidth="1.5" />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#d4d4d8" strokeWidth="1.5" />
                </g>
              </g>

              {/* Wheel 2: Trailer Rear Axle 2 */}
              <g transform="translate(86, 94)">
                <circle cx="0" cy="0" r="16" fill="#09090b" stroke="#27272a" strokeWidth="2" />
                <circle cx="0" cy="0" r="10" fill="url(#rimChrome)" />
                <circle cx="0" cy="0" r="4" fill="#09090b" />
                <g style={{ transformOrigin: '0px 0px', animation: 'wheelSpin 0.3s linear infinite' }}>
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#d4d4d8" strokeWidth="1.5" />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#d4d4d8" strokeWidth="1.5" />
                </g>
              </g>

              {/* Wheel 3: Drive Axle Tandem */}
              <g transform="translate(216, 94)">
                <circle cx="0" cy="0" r="16" fill="#09090b" stroke="#27272a" strokeWidth="2" />
                <circle cx="0" cy="0" r="10" fill="url(#rimChrome)" />
                <circle cx="0" cy="0" r="4" fill="#09090b" />
                <g style={{ transformOrigin: '0px 0px', animation: 'wheelSpin 0.3s linear infinite' }}>
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#d4d4d8" strokeWidth="1.5" />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#d4d4d8" strokeWidth="1.5" />
                </g>
              </g>

              {/* Wheel 4: Front Steer Axle */}
              <g transform="translate(272, 94)">
                <circle cx="0" cy="0" r="16" fill="#09090b" stroke="#27272a" strokeWidth="2" />
                <circle cx="0" cy="0" r="10" fill="url(#rimChrome)" />
                <circle cx="0" cy="0" r="4" fill="#09090b" />
                <g style={{ transformOrigin: '0px 0px', animation: 'wheelSpin 0.3s linear infinite' }}>
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#d4d4d8" strokeWidth="1.5" />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#d4d4d8" strokeWidth="1.5" />
                </g>
              </g>

              {/* Front Wheel Mudguard Arch */}
              <path d="M254,92 A18,18 0 0,1 290,92" stroke="#71717a" strokeWidth="2.5" fill="none" />
              {/* Rear Trailer Mudguard Arch */}
              <path d="M34,92 A18,18 0 0,1 104,92" stroke="#52525b" strokeWidth="2.5" fill="none" />

            </svg>
          </div>
        </div>

        {/* Dynamic Road Shadow beneath the Truck */}
        <div className="absolute bottom-5 sm:bottom-6 z-14 w-60 sm:w-72 h-3 bg-black/80 rounded-full blur-md" />
      </div>

      {/* Bottom Status Banner */}
      <div className="py-2 px-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 font-mono text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>LR #{lrNo || 'ENTRY'}</span>
        </div>
        <div className="text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
          <span>DESTINATION EN ROUTE</span>
          <span className="animate-pulse">➔</span>
        </div>
      </div>

    </div>
  );
}
