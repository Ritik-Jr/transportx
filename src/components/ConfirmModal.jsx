import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Record',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  itemDetails = '',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-5 sm:p-6 shadow-xl relative text-left transition-colors duration-150 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 sm:p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition cursor-pointer active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 ${
          isDestructive 
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
        }`}>
          {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        {/* Title & Message */}
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h3>
        
        <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
          {message}
        </p>

        {/* Optional Item Details Badge */}
        {itemDetails && (
          <div className="mt-3 p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {itemDetails}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 rounded-xl text-sm sm:text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-95"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 sm:py-2 rounded-xl text-sm sm:text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
