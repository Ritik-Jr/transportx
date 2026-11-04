import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Cloud,
  Database,
  Code2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  ArrowRight
} from 'lucide-react';
import { 
  exportDatabaseToJson, 
  exportTripsToCsv, 
  restoreDatabaseFromJson 
} from '../db';
import { SUPABASE_SCHEMA_SQL } from '../utils/supabase';
import {
  getGoogleSheetsUrl,
  setGoogleSheetsUrl,
  getGoogleSheetLink,
  setGoogleSheetLink,
  getDbProvider,
  setDbProvider,
  testGoogleSheetsConnection,
  syncAllToGoogleSheets,
  extractSpreadsheetId,
  GOOGLE_APPS_SCRIPT_TEMPLATE
} from '../utils/googleSheets';

export default function DatabaseCenter({ 
  trips = [], 
  parties = [], 
  onDatabaseRestored, 
  dbMeta = {}, 
  isAdmin = false 
}) {
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const fileInputRef = useRef(null);

  // Google Sheets state
  const [dbProvider, setDbProviderState] = useState(() => getDbProvider());
  const [scriptUrlInput, setScriptUrlInput] = useState(() => getGoogleSheetsUrl());
  const [sheetLinkInput, setSheetLinkInput] = useState(() => getGoogleSheetLink());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // Local admin unlock state (allows user in settings to unlock technical database settings by entering 400242)
  const [localAdminUnlocked, setLocalAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const effectiveAdmin = isAdmin || localAdminUnlocked;

  useEffect(() => {
    setDbProviderState(getDbProvider());
    setScriptUrlInput(getGoogleSheetsUrl());
    setSheetLinkInput(getGoogleSheetLink());
  }, []);

  const handleAdminUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '400242') {
      setLocalAdminUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2500);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard?.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyScript = () => {
    navigator.clipboard?.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Test connection to Google Sheets Web App
  const handleTestConnection = async () => {
    const targetUrl = scriptUrlInput.trim();
    if (!targetUrl) {
      setTestResult({
        success: false,
        error: 'Please enter a Google Sheets Web App URL or spreadsheet link.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // If user entered a spreadsheet link directly
    if (targetUrl.includes('docs.google.com/spreadsheets')) {
      const sheetId = extractSpreadsheetId(targetUrl);
      if (!sheetLinkInput) {
        setSheetLinkInput(targetUrl);
        setGoogleSheetLink(targetUrl);
      }
      setIsTesting(false);
      setTestResult({
        success: false,
        isSpreadsheetUrl: true,
        spreadsheetId: sheetId,
        error: 'You entered a Google Spreadsheet link. To use it as a real-time database, click "Setup Guide & Script" below to copy the 1-click Apps Script and get your Web App URL.'
      });
      return;
    }

    const res = await testGoogleSheetsConnection(targetUrl);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      setGoogleSheetsUrl(targetUrl);
      setDbProvider('google_sheets');
      setDbProviderState('google_sheets');
      if (res.spreadsheetUrl && !sheetLinkInput) {
        setSheetLinkInput(res.spreadsheetUrl);
        setGoogleSheetLink(res.spreadsheetUrl);
      }
    }
  };

  // Save Google Sheets configuration & switch active engine
  const handleSaveAndActivate = async () => {
    const cleanScriptUrl = scriptUrlInput.trim();
    const cleanSheetLink = sheetLinkInput.trim();

    if (!cleanScriptUrl) {
      alert('Please enter your Google Sheets Web App URL first.');
      return;
    }

    setGoogleSheetsUrl(cleanScriptUrl);
    if (cleanSheetLink) {
      setGoogleSheetLink(cleanSheetLink);
    }
    setDbProvider('google_sheets');
    setDbProviderState('google_sheets');

    setTestResult({
      success: true,
      message: 'Google Sheets is now your active database! Reloading data...'
    });

    if (onDatabaseRestored) {
      setTimeout(() => onDatabaseRestored(), 500);
    }
  };

  // Switch database provider
  const handleSwitchProvider = (provider) => {
    setDbProvider(provider);
    setDbProviderState(provider);
    if (onDatabaseRestored) {
      onDatabaseRestored();
    }
  };

  // Push all existing in-memory trips, parties, and settings to the Google Sheet
  const handleSyncExistingToSheet = async () => {
    const url = scriptUrlInput.trim() || getGoogleSheetsUrl();
    if (!url) {
      alert('Please configure your Google Sheets Web App URL first.');
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await syncAllToGoogleSheets(
        {
          trips,
          parties,
          settings: {
            syncedAt: new Date().toISOString()
          }
        },
        url
      );

      setIsSyncing(false);
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          text: `Synced ${trips.length} trips and ${parties.length} parties directly into your Google Sheet!`
        });
        setTimeout(() => setSyncFeedback(null), 5000);
      } else {
        setSyncFeedback({
          type: 'error',
          text: `Sync failed: ${res.error || 'Unknown error'}`
        });
      }
    } catch (err) {
      setIsSyncing(false);
      setSyncFeedback({
        type: 'error',
        text: `Sync error: ${err.message}`
      });
    }
  };

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
            text: `Backup restored successfully! Loaded ${result.count} trip entries into your active database.`
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

  const detectedSheetId = extractSpreadsheetId(sheetLinkInput || scriptUrlInput);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Database & Cloud Storage
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Connect your private Google Sheet as the live database, manage cloud sync, and export backups
        </p>
      </div>

      {/* Admin Unlock Prompt (if not logged in with 400242) */}
      {!effectiveAdmin && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  Google Sheets & Cloud Database Settings
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 text-[11px] sm:text-xs">
                  Enter Admin Passcode (<code>400242</code>) to configure your private Google Sheet or switch database engines.
                </p>
              </div>
            </div>
            <form onSubmit={handleAdminUnlock} className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit Admin Code"
                className={`w-36 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white ${
                  pinError ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Technical Database Controls (Unlocked for Admin) */}
      {effectiveAdmin && (
        <div className="space-y-4">
          
          {/* Active Database Engine Switcher */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                    Active Database Engine
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Choose which cloud storage system powers TransportX in real time
                  </p>
                </div>
              </div>

              {/* Provider Radio Pills */}
              <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSwitchProvider('google_sheets')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    dbProvider === 'google_sheets'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Google Sheets</span>
                  {dbProvider === 'google_sheets' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchProvider('supabase')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    dbProvider === 'supabase'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Supabase Cloud</span>
                  {dbProvider === 'supabase' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Current Active Engine Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">Current Status:</span>
                {dbProvider === 'google_sheets' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Google Sheets is Active Database {getGoogleSheetsUrl() ? '• Live Connected' : '• Setup Needed'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold text-[11px]">
                    <Cloud className="w-3 h-3 text-blue-600" />
                    Supabase Cloud Database Active (znczyfkpcpkmhutlmenh)
                  </span>
                )}
              </div>

              {dbProvider === 'google_sheets' && sheetLinkInput && (
                <a
                  href={sheetLinkInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Open Connected Google Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Google Sheets Configuration Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <span>Google Sheets Database Link</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      Private Cloud
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Your personal spreadsheet in Google Drive functions as the real-time cloud database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowScriptModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Setup Guide &amp; Script</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              
              {/* Web App URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Google Sheets Web App URL (Private Database Link) *
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ends in /exec
                  </span>
                </div>
                <input
                  type="text"
                  value={scriptUrlInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScriptUrlInput(val);
                    if (val.includes('docs.google.com/spreadsheets') && !sheetLinkInput) {
                      setSheetLinkInput(val);
                    }
                  }}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 box-border"
                />
                <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1">
                  Obtained from Google Sheets: <em>Extensions &gt; Apps Script &gt; Deploy as Web App</em>.
                </p>
              </div>

              {/* Direct Sheet URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Google Spreadsheet Direct Link (Optional)
                  </label>
                  {detectedSheetId && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Sheet ID: {detectedSheetId.slice(0, 8)}...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sheetLinkInput}
                    onChange={(e) => setSheetLinkInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                    className="flex-1 px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 box-border"
                  />
                  {sheetLinkInput && (
                    <a
                      href={sheetLinkInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition shrink-0"
                      title="Open Google Sheet in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open Sheet</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndActivate}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save &amp; Set Active</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncExistingToSheet}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition disabled:opacity-60"
                  title="Upload all current trips and parties into the Google Sheet"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isSyncing ? 'Syncing to Sheet...' : 'Sync Current Trips to Sheet'}</span>
                </button>
              </div>

              {/* Feedback Alert */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{testResult.message || testResult.error}</p>
                    {testResult.spreadsheetName && (
                      <p className="text-[11px] opacity-90">
                        Spreadsheet Title: <strong>{testResult.spreadsheetName}</strong>
                      </p>
                    )}
                    {testResult.isSpreadsheetUrl && (
                      <button
                        type="button"
                        onClick={() => setShowScriptModal(true)}
                        className="mt-1 px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 hover:bg-rose-700 cursor-pointer"
                      >
                        <span>Open Setup Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {syncFeedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  syncFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{syncFeedback.text}</span>
                </div>
              )}

            </div>
          </div>

          {/* Supabase Technical Card (Reference & Secondary Engine) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                      Supabase Cloud Database
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      Secondary Engine
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[11px] sm:text-xs">
                    Connected to cloud PostgreSQL (<code>znczyfkpcpkmhutlmenh.supabase.co</code>). Can be toggled as the active engine at any time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Supabase SQL Setup</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Action Cards (Download JSON, Restore JSON, Export Excel) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* 1. Download Backup */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-2.5">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Download Backup</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Saves a complete JSON backup file containing all truck records, parties, and accounts.
            </p>
          </div>
          <button
            onClick={() => exportDatabaseToJson(trips, parties)}
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
              Upload your previously saved backup file to restore records directly to your active database.
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
            onClick={() => exportTripsToCsv(trips)}
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

      {/* Google Apps Script 1-Click Setup Guide Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                  Connect Google Sheets Database (3-Step Setup)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-semibold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Steps instructions */}
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>Open your Google Sheet</span>
                </p>
                <p className="text-[11px] text-zinc-500 pl-5">
                  Open your private Google Sheet (or create one instantly at{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
                  >
                    sheets.new
                  </a>
                  ). In the top menu, click <strong>Extensions &gt; Apps Script</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>Paste the Database Bridge Script</span>
                </p>
                <p className="text-[11px] text-zinc-500 pl-5">
                  Delete any existing sample code in the script editor. Click <strong>Copy Script Code</strong> below, paste it into the editor, and press <strong>Ctrl+S (Save)</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">3</span>
                  <span>Deploy as Web App &amp; Paste Link</span>
                </p>
                <p className="text-[11px] text-zinc-500 pl-5">
                  Click <strong>Deploy &gt; New deployment</strong>. Select type <strong>Web app</strong>. Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>. Click <strong>Deploy</strong>, copy the generated <strong>Web app URL</strong>, and paste it into TransportX Settings!
                </p>
              </div>
            </div>

            {/* Script Code Box */}
            <div className="relative flex-1 min-h-[140px] max-h-[220px]">
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded-xl text-[11px] font-mono h-full overflow-y-auto leading-relaxed border border-zinc-800 select-all">
                {GOOGLE_APPS_SCRIPT_TEMPLATE}
              </pre>
              <button
                type="button"
                onClick={handleCopyScript}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Script Code'}</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400">
                100% Free &amp; Private in your personal Google Drive
              </span>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase SQL Setup Modal */}
      {effectiveAdmin && showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                  Supabase Database Schema Setup
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-semibold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Run this script once in your Supabase SQL Editor (
              <a
                href="https://supabase.com/dashboard/project/znczyfkpcpkmhutlmenh/sql/new"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-medium inline-flex items-center gap-0.5"
              >
                Open SQL Editor <ExternalLink className="w-3 h-3" />
              </a>
              ) to initialize <code>trips</code>, <code>parties</code>, and <code>settings</code> tables with public read/write policies.
            </p>
            <div className="relative flex-1 min-h-0">
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded-xl text-[11px] font-mono h-64 overflow-y-auto leading-relaxed border border-zinc-800 select-all">
                {SUPABASE_SCHEMA_SQL}
              </pre>
              <button
                onClick={handleCopySql}
                className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400">
                Project: <code>znczyfkpcpkmhutlmenh.supabase.co</code>
              </span>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
