import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck
} from 'lucide-react';
import { 
  exportDatabaseToJson, 
  exportTripsToCsv, 
  restoreDatabaseFromJson 
} from '../db';

export default function DatabaseCenter({ trips = [], parties = [], onDatabaseRestored }) {
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setRestoreMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const result = await restoreDatabaseFromJson(text);
        if (result.success) {
          setRestoreMessage({
            type: 'success',
            text: `Backup restored successfully! Loaded ${result.count} trip entries.`
          });
          if (onDatabaseRestored) onDatabaseRestored();
        } else {
          setRestoreMessage({
            type: 'error',
            text: `Restore failed: ${result.error || 'Invalid file format'}`
          });
        }
      } catch (err) {
        setRestoreMessage({
          type: 'error',
          text: `Failed to open backup: ${err.message}`
        });
      } finally {
        setRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Backup & Data Protection
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Download offline backups of your accounts or restore previously saved records
        </p>
      </div>

      {/* Safety Notice Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-xs sm:text-sm">
            <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
              Your Data is Safely Saved on this Device
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed text-[11px] sm:text-xs">
              All truck records, freight accounts, and party ledgers are automatically saved locally on this browser. 
              Closing the window, restarting your device, or refreshing the page will <strong>never erase your data</strong>.
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 mt-2 text-[10px] sm:text-[11px]">
              Tip: Click <strong>Download Backup</strong> regularly to keep an offline file on your phone or laptop.
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* 1. Download Backup */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-2.5">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Download Backup</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Saves a complete backup file containing all truck records, parties, and accounts.
            </p>
          </div>
          <button
            onClick={exportDatabaseToJson}
            className="mt-4 w-full py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup File</span>
          </button>
        </div>

        {/* 2. Restore from Backup */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-2.5">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Restore from Backup</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Upload your previously saved backup file to restore records on any device.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
              className="mt-4 w-full py-2.5 sm:py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-sm sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>{restoring ? 'Restoring...' : 'Select Backup File'}</span>
            </button>
          </div>
        </div>

        {/* 3. Export to Excel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2.5 border border-emerald-200 dark:border-emerald-800/40">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Export to Excel</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Downloads logbook as a clean spreadsheet ready to open in Microsoft Excel or Google Sheets.
            </p>
          </div>
          <button
            onClick={exportTripsToCsv}
            className="mt-4 w-full py-2.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-200 dark:border-emerald-800/50 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel Sheet</span>
          </button>
        </div>

      </div>

      {/* Restore Feedback Message */}
      {restoreMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
          restoreMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300'
        }`}>
          {restoreMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{restoreMessage.text}</span>
        </div>
      )}

    </div>
  );
}
