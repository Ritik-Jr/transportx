import React from 'react';
import { Building2, CheckCircle2, FileText, MapPin, Phone, Hash, Truck } from 'lucide-react';

export default function ProfileSuccessAnimation({
  companyName = 'Sai Transport Services',
  gstin = '',
  phone = '',
  address = ''
}) {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl select-none text-left">
      {/* Dynamic Keyframes for Transport Office & Bilty Stamp */}
      <style>{`
        @keyframes stampDescent {
          0% {
            opacity: 0;
            transform: translateY(-45px) scale(1.25) rotate(-6deg);
          }
          65% {
            opacity: 1;
            transform: translateY(2px) scale(0.96) rotate(0deg);
          }
          80% {
            transform: translateY(-4px) scale(1.02) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes inkSealAppear {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            opacity: 0;
          }
          75% {
            opacity: 0.95;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes inkShockwave {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        @keyframes truckIdling {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }

        @keyframes depotLightPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.95; }
        }

        @keyframes roadDashMove {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
      `}</style>

      {/* Header Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <Building2 className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-xs font-bold text-zinc-200 tracking-wide uppercase">
            Transport Fleet Registry
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
          <CheckCircle2 className="w-3 h-3" />
          <span>BILTY HEADER SYNCED</span>
        </div>
      </div>

      {/* Visual Animation Stage - Transport Office & Stamp Scene */}
      <div className="relative w-full h-56 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 flex items-center justify-center overflow-hidden">
        
        {/* Background Depot Yard Scene */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="skyDepot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="officeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <linearGradient id="truckBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="goldSeal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Night Sky Backdrop */}
          <rect width="500" height="220" fill="url(#skyDepot)" />

          {/* Distant Logistics Warehouses Silhouette */}
          <path d="M0 130 L40 130 L40 110 L110 110 L110 130 L180 130 L180 100 L240 100 L240 130 L500 130 L500 220 L0 220 Z" fill="#18181b" opacity="0.6" />

          {/* Transport Fleet HQ Office (Right Side) */}
          <g transform="translate(320, 45)">
            {/* Main Building */}
            <rect x="0" y="20" width="150" height="110" rx="3" fill="url(#officeGrad)" stroke="#3f3f46" strokeWidth="1.5" />
            
            {/* Roof Billboard: "TRANSPORT FLEET HQ" */}
            <rect x="15" y="0" width="120" height="18" rx="2" fill="#09090b" stroke="#10b981" strokeWidth="1.2" />
            <text x="75" y="12" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              FLEET LOGISTICS HQ
            </text>

            {/* Lit Office Windows */}
            {[0, 1, 2].map(row => (
              <g key={row} transform={`translate(15, ${32 + row * 24})`}>
                <rect x="0" y="0" width="22" height="14" rx="1.5" fill="#fef08a" opacity="0.75" />
                <rect x="30" y="0" width="22" height="14" rx="1.5" fill="#fef08a" opacity="0.6" />
                <rect x="60" y="0" width="22" height="14" rx="1.5" fill="#6ee7b7" opacity="0.8" />
                <rect x="90" y="0" width="22" height="14" rx="1.5" fill="#fef08a" opacity="0.7" />
              </g>
            ))}

            {/* Warehouse Bay Entrance with illuminated sign */}
            <rect x="25" y="98" width="55" height="32" rx="1" fill="#09090b" stroke="#52525b" strokeWidth="1" />
            <text x="52" y="116" fill="#a1a1aa" fontSize="6.5" fontFamily="monospace" textAnchor="middle">BAY 01</text>
          </g>

          {/* Transport Asphalt Ground */}
          <rect x="0" y="150" width="500" height="70" fill="#18181b" />
          <line x1="0" y1="150" x2="500" y2="150" stroke="#3f3f46" strokeWidth="2" />
          {/* Yellow Road Divider Markings */}
          <line 
            x1="0" y1="185" x2="500" y2="185" 
            stroke="#eab308" strokeWidth="2" strokeDasharray="18 14" 
            style={{ animation: 'roadDashMove 3s linear infinite' }} 
          />

          {/* Parked Transport Truck (Left Side) */}
          <g transform="translate(30, 95)" style={{ animation: 'truckIdling 2.5s ease-in-out infinite' }}>
            {/* Headlight beam */}
            <polygon points="125,48 240,30 240,65 125,56" fill="#fef08a" opacity="0.12" style={{ animation: 'depotLightPulse 2s infinite' }} />

            {/* Heavy Container Body */}
            <rect x="0" y="10" width="85" height="42" rx="2" fill="url(#truckBody)" stroke="#047857" strokeWidth="1.2" />
            {/* Cargo Ribs */}
            {[18, 36, 54, 72].map(x => (
              <line key={x} x1={x} y1="12" x2={x} y2="50" stroke="#047857" strokeWidth="1.5" />
            ))}
            {/* Cabin */}
            <path d="M85 24 L108 24 L122 36 L124 52 L85 52 Z" fill="#065f46" stroke="#047857" strokeWidth="1.2" />
            {/* Windshield */}
            <path d="M92 27 L106 27 L117 36 L92 36 Z" fill="#e0f2fe" opacity="0.9" />
            {/* Headlight */}
            <rect x="122" y="47" width="3" height="4" rx="1" fill="#fef08a" />
            {/* Wheels with Hubs */}
            <circle cx="20" cy="54" r="8" fill="#09090b" stroke="#71717a" strokeWidth="2" />
            <circle cx="20" cy="54" r="3.5" fill="#27272a" />
            <circle cx="42" cy="54" r="8" fill="#09090b" stroke="#71717a" strokeWidth="2" />
            <circle cx="42" cy="54" r="3.5" fill="#27272a" />
            <circle cx="106" cy="54" r="8" fill="#09090b" stroke="#71717a" strokeWidth="2" />
            <circle cx="106" cy="54" r="3.5" fill="#27272a" />
          </g>

          {/* Central Clipboard / Consignment Document Platform */}
          <g transform="translate(180, 20)">
            {/* Clipboard Backing */}
            <rect x="0" y="0" width="140" height="155" rx="6" fill="#27272a" stroke="#52525b" strokeWidth="1.5" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))" />
            {/* Clip at top */}
            <rect x="45" y="-6" width="50" height="12" rx="3" fill="#71717a" stroke="#a1a1aa" strokeWidth="1" />
            <circle cx="70" cy="0" r="3" fill="#18181b" />

            {/* Official Transport Bilty Sheet (Paper) */}
            <rect x="8" y="10" width="124" height="136" rx="3" fill="#f8fafc" />

            {/* Document Header lines */}
            <rect x="16" y="18" width="60" height="4" rx="1" fill="#0f172a" />
            <rect x="16" y="25" width="45" height="2.5" rx="0.5" fill="#64748b" />
            <line x1="16" y1="32" x2="124" y2="32" stroke="#cbd5e1" strokeWidth="1" />

            {/* Form Table Grid lines representing Consignment details */}
            <rect x="16" y="37" width="108" height="22" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="48" y1="37" x2="48" y2="59" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="84" y1="37" x2="84" y2="59" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="20" y="42" width="22" height="2.5" rx="0.5" fill="#94a3b8" />
            <rect x="52" y="42" width="26" height="2.5" rx="0.5" fill="#94a3b8" />
            <rect x="88" y="42" width="22" height="2.5" rx="0.5" fill="#94a3b8" />

            <line x1="16" y1="65" x2="124" y2="65" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="16" y1="72" x2="105" y2="72" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="16" y1="79" x2="115" y2="79" stroke="#e2e8f0" strokeWidth="1" />

            {/* Shockwave ripple from Stamp impact */}
            <circle 
              cx="70" cy="105" r="32" 
              fill="none" stroke="#10b981" strokeWidth="2.5" 
              style={{ animation: 'inkShockwave 1.6s ease-out infinite 0.55s' }} 
            />

            {/* Official Transport Seal (Imprinted Ink Seal on Paper) */}
            <g transform="translate(70, 105)" style={{ animation: 'inkSealAppear 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              {/* Outer Seal Circle */}
              <circle cx="0" cy="0" r="28" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="0" cy="0" r="25" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
              
              {/* Star Ornaments */}
              <text x="0" y="-17" fill="#047857" fontSize="5" fontWeight="bold" textAnchor="middle">★ TRANSPORT SEAL ★</text>
              <text x="0" y="21" fill="#047857" fontSize="4.5" fontWeight="bold" textAnchor="middle">REGISTERED & VERIFIED</text>
              
              {/* Center Truck Silhouette inside Seal */}
              <g transform="translate(-12, -7)">
                <rect x="0" y="2" width="16" height="8" rx="0.5" fill="#059669" />
                <path d="M16 4 L21 4 L24 7 L24 10 L16 10 Z" fill="#047857" />
                <circle cx="4" cy="11" r="2" fill="#064e3b" />
                <circle cx="12" cy="11" r="2" fill="#064e3b" />
                <circle cx="20" cy="11" r="2" fill="#064e3b" />
              </g>

              {/* Bold Checkmark across stamp */}
              <circle cx="15" cy="-14" r="6" fill="#10b981" />
              <path d="M12.5 -14 L14.5 -12 L17.5 -16" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Stamping Tool (Lifting up after stamp impact) */}
            <g transform="translate(70, 72)" style={{ animation: 'stampDescent 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
              {/* Brass / Steel Stamp Handle */}
              <path d="M-6 -38 L6 -38 L8 -22 L-8 -22 Z" fill="#d97706" stroke="#b45309" strokeWidth="1" />
              <circle cx="0" cy="-42" r="7" fill="#b45309" />
              {/* Stamp Base Mount */}
              <rect x="-18" y="-22" width="36" height="8" rx="2" fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
              <rect x="-22" y="-14" width="44" height="6" rx="1.5" fill="#059669" />
            </g>
          </g>
        </svg>

        {/* Floating Seal Confirmation Banner on Scene */}
        <div 
          className="absolute bottom-3 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-emerald-500/50 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-semibold text-emerald-300"
          style={{ animation: 'stampDescent 0.6s ease-out forwards 0.3s' }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Official Transport Seal Applied & Synced</span>
        </div>
      </div>

      {/* Company Name & Bilty Readout */}
      <div className="p-4 sm:p-5 bg-zinc-950 text-center space-y-1 border-t border-zinc-800/80">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {companyName || 'Sai Transport Company'}
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Company details logged successfully. This header will be printed on all transport bilties, consignment notes, and invoices.
        </p>
      </div>

      {/* Snapshot Cards for Transport Credentials */}
      <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {gstin && (
          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
              <Hash className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">GSTIN</span>
              <span className="font-mono font-bold text-zinc-200 truncate block text-[11px]">{gstin}</span>
            </div>
          </div>
        )}

        {phone && (
          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Fleet Helpline</span>
              <span className="font-mono font-bold text-zinc-200 truncate block text-[11px]">{phone}</span>
            </div>
          </div>
        )}

        {address && (
          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
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
