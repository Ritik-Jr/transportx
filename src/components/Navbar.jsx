import React from 'react';
import { 
  Truck, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  Sun, 
  Moon, 
  BarChart3
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onNewTrip, 
  onLock, 
  tripCount = 0,
  partyCount = 0,
  theme = 'light',
  onToggleTheme 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips', icon: ClipboardList, badge: tripCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'parties', label: 'Parties', icon: Users, badge: partyCount },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-150 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Brand Logo & Name (Clean text only, no truck icon) */}
            <div className="leading-tight">
              <span className="font-extrabold text-zinc-900 dark:text-white text-base sm:text-lg tracking-tight block font-heading">
                TRANSPORTX
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium hidden sm:block">
                Fleet Accounts
              </span>
            </div>

            {/* Desktop Navigation Tabs (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive 
                          ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300' 
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Actions: New Trip, Theme Toggle (Lock button moved to Settings) */}
            <div className="flex items-center gap-2">
              
              {/* New Trip Button */}
              <button
                onClick={onNewTrip}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-3.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">New Trip</span>
                <span className="sm:hidden font-bold">New</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                className="p-2.5 sm:p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-5 h-5 sm:w-4 sm:h-4 text-zinc-700" />}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Larger touch targets and icons) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-150 no-print pb-safe">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'text-zinc-900 dark:text-white font-bold' 
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                aria-label={item.label}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-zinc-100 dark:bg-zinc-800/80' : ''}`}>
                  <Icon className={`w-5.5 h-5.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
                <span className="text-[11px] font-semibold tracking-tight leading-none mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
