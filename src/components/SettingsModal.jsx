import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Trash2
} from 'lucide-react';
import DatabaseCenter from './DatabaseCenter';

export default function SettingsModal({ 
  company = {}, 
  onSaveCompany, 
  onResetData, 
  onClearAllData,
  onLock,
  trips = [],
  parties = [],
  onDatabaseRestored,
  dbMeta,
  isAdmin = false
}) {
  const [formData, setFormData] = useState({
    companyName: company.companyName || 'SAI TRANSPORT',
    tagline: company.tagline || 'Leading Fleet & All India Truck Transport Service',
    ownerName: company.ownerName || 'Sai Transport Services',
    phone: company.phone || '+91 98220 99887 / 94220 11223',
    email: company.email || 'saitransport.fleet@gmail.com',
    gstin: company.gstin || '27AAAAA0000A1Z5',
    address: company.address || 'Shop No. 12, New Transport Nagar, Nigdi, Pune, Maharashtra - 411044',
    terms: company.terms || '1. Goods carried strictly at owner\'s risk. 2. Demurrage charged after 24 hrs of arrival. 3. All disputes subject to local jurisdiction.',
    masterPassword: company.masterPassword || '000000',
    passwordHint: company.passwordHint || '000000'
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [statusMessage, setStatusMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleSaveCompanyProfile = (e) => {
    e.preventDefault();
    onSaveCompany(formData);
    setStatusMessage('Settings saved successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const ADMIN_MASTER_PASSWORD = '400242';

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    const activeUserPassword = formData.masterPassword || localStorage.getItem('sai_transport_active_password') || '000000';
    const entered = passwordState.currentPassword;

    // Current password must match either the active user password OR admin master password (400242)
    if (entered !== activeUserPassword && entered !== ADMIN_MASTER_PASSWORD) {
      setPasswordMessage({ type: 'error', text: 'Current passcode is incorrect.' });
      return;
    }

    if (!/^\d{6}$/.test(passwordState.newPassword)) {
      setPasswordMessage({ type: 'error', text: 'New passcode must be exactly 6 digits.' });
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passcode and confirmation do not match.' });
      return;
    }

    if (passwordState.newPassword === ADMIN_MASTER_PASSWORD) {
      setPasswordMessage({ type: 'error', text: '400242 is reserved as the Admin Master Password. Please choose a different 6-digit passcode.' });
      return;
    }

    const updated = {
      ...formData,
      masterPassword: passwordState.newPassword,
      passwordHint: passwordState.newPassword
    };

    setFormData(updated);
    onSaveCompany(updated);

    // Save newly updated active password in localStorage so previous password expires everywhere immediately
    localStorage.setItem('sai_transport_active_password', passwordState.newPassword);
    if (localStorage.getItem('sai_transport_saved_pin')) {
      localStorage.setItem('sai_transport_saved_pin', passwordState.newPassword);
    }

    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMessage({ type: 'success', text: '6-digit passcode updated successfully! Old passcode has been expired.' });
    setTimeout(() => setPasswordMessage(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Settings & Security
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Transport company profile, print receipt header, and 6-digit access code
        </p>
      </div>

      {/* Portal Lock Action Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">Portal Lock & Exit</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Lock the portal immediately. Requires your 6-digit PIN to re-enter.
          </p>
        </div>
        <button
          type="button"
          onClick={onLock}
          className="px-4 py-2.5 sm:py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-xl text-sm sm:text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 active:scale-95"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Portal</span>
        </button>
      </div>

      {/* 6-Digit Passcode Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm">
          <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <span>Change 6-Digit Passcode</span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md text-xs">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Current Passcode
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={passwordState.currentPassword}
              onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value.replace(/\D/g, '') })}
              placeholder="Enter current 6-digit PIN"
              required
              className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-sm sm:text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                New 6-Digit Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value.replace(/\D/g, '') })}
                placeholder="6 numbers"
                required
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-sm sm:text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value.replace(/\D/g, '') })}
                placeholder="Repeat code"
                required
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-sm sm:text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>
          </div>

          {passwordMessage && (
            <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300'
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300'
            }`}>
              {passwordMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition"
          >
            Update Passcode
          </button>
        </form>
      </div>

      {/* Company Profile Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm">
          <Building2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <span>Transport Profile (Printed on Bilty)</span>
        </div>

        <form onSubmit={handleSaveCompanyProfile} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Phone Numbers *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                GSTIN (Tax ID)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono uppercase text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Office Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Bilty Terms & Conditions
            </label>
            <textarea
              rows="3"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-3.5 py-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm sm:text-xs placeholder-zinc-400 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-colors box-border"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {statusMessage ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> {statusMessage}
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm sm:text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Backups & Data Protection Section */}
      <DatabaseCenter
        trips={trips}
        parties={parties}
        onDatabaseRestored={onDatabaseRestored}
        dbMeta={dbMeta}
        isAdmin={isAdmin}
      />

      {/* Database Management (Admin Only) */}
      {isAdmin && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mb-0.5">Database Management</h3>
          <p className="text-[11px] text-zinc-400 mb-2.5">
            Manage your cloud records stored on Supabase. You can wipe all recorded trips and parties to start fresh.
          </p>

          <div>
            <button
              onClick={onClearAllData}
              className="px-4 py-2.5 sm:py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-xl text-sm sm:text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-rose-200 dark:border-rose-800/40 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Wipe All Cloud Records</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
