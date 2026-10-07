import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export const PERIOD_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_28_days', label: 'Last 28 Days' },
  { id: 'last_3_months', label: 'Last 3 Months' },
  { id: 'last_6_months', label: 'Last 6 Months' },
  { id: '1_year', label: '1 Year' },
  { id: 'all_time', label: 'All Time' },
];

export default function PeriodDropdown({ period = 'today', onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = PERIOD_OPTIONS.find(p => p.id === period) || PERIOD_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-95"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-30 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Time Range
          </div>
          {PERIOD_OPTIONS.map((item) => {
            const isSelected = item.id === period;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:py-2 text-left font-medium transition cursor-pointer active:bg-zinc-100 ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isSelected && <Check className="w-4 h-4 text-zinc-900 dark:text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
