import React, { useState, useRef, useEffect } from 'react';
import { Truck, ShieldCheck, Sun, Moon, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AuthGate({ 
  onAuthenticated, 
  onResetUserPassword,
  masterPassword = '000000', 
  theme = 'light', 
  onToggleTheme 
}) {
  const ADMIN_MASTER_PASSWORD = '400242';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isMasked, setIsMasked] = useState(true); // default masked for privacy & security
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetState, setResetState] = useState({
    adminPasscode: '',
    newPasscode: '',
    confirmPasscode: '',
    error: '',
    success: ''
  });
  const inputRefs = useRef([]);

  // Only retrieve saved passcode if it matches the current active password or admin password
  const [savedPasscode, setSavedPasscode] = useState(() => {
    try {
      const isDeviceLoggedIn = localStorage.getItem('sai_transport_device_logged_in') === 'true';
      const storedPin = localStorage.getItem('sai_transport_saved_pin');
      const active = masterPassword || localStorage.getItem('sai_transport_active_password') || '000000';
      if (isDeviceLoggedIn && storedPin && (storedPin === active || storedPin === ADMIN_MASTER_PASSWORD)) {
        return storedPin;
      }
      return null;
    } catch (_) {
      return null;
    }
  });

  // Purge any stale stored PIN if masterPassword changed
  useEffect(() => {
    const active = masterPassword || localStorage.getItem('sai_transport_active_password') || '000000';
    if (savedPasscode && savedPasscode !== active && savedPasscode !== ADMIN_MASTER_PASSWORD) {
      localStorage.removeItem('sai_transport_saved_pin');
      setSavedPasscode(null);
    }
  }, [masterPassword, savedPasscode]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    // Handle case where user or password manager autofills multiple digits into one box
    if (cleanVal.length > 1) {
      const newDigits = [...digits];
      const chars = cleanVal.slice(0, 6).split('');
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setDigits(newDigits);
      setError('');
      const nextFocus = Math.min(index + chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      const joined = newDigits.join('');
      if (joined.length === 6) {
        verifyPasscode(joined);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal ? cleanVal.slice(-1) : '';
    setDigits(newDigits);
    setError('');

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = newDigits.join('');
    if (joined.length === 6) {
      verifyPasscode(joined);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError('');

    if (pasted.length === 6) {
      verifyPasscode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyPasscode = (code) => {
    const activeUserPassword = masterPassword || localStorage.getItem('sai_transport_active_password') || '000000';
    // Only the admin master password (400242) and the current active user-set password are valid
    if (code === ADMIN_MASTER_PASSWORD || code === activeUserPassword) {
      const isAdmin = code === ADMIN_MASTER_PASSWORD;
      try {
        // Record that this device has successfully authenticated
        localStorage.setItem('sai_transport_device_logged_in', 'true');
        localStorage.setItem('sai_transport_is_admin', isAdmin ? 'true' : 'false');
        sessionStorage.setItem('sai_transport_is_admin', isAdmin ? 'true' : 'false');

        if (rememberMe) {
          localStorage.setItem('sai_transport_auth', 'true');
          localStorage.setItem('sai_transport_saved_pin', code);
          setSavedPasscode(code);
        } else {
          sessionStorage.setItem('sai_transport_auth', 'true');
          localStorage.removeItem('sai_transport_saved_pin');
          setSavedPasscode(null);
        }
      } catch (_) {}

      onAuthenticated(isAdmin);
    } else {
      setError('Incorrect passcode. Please try again.');
      setTimeout(() => {
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 400);
    }
  };

  const handleAutofillSaved = () => {
    if (!savedPasscode) return;
    const splitted = savedPasscode.split('').slice(0, 6);
    setDigits(splitted);
    setError('');
    setTimeout(() => {
      verifyPasscode(savedPasscode);
    }, 150);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyPasscode(digits.join(''));
  };

  const handleAdminResetSubmit = async (e) => {
    e.preventDefault();
    if (resetState.adminPasscode !== ADMIN_MASTER_PASSWORD) {
      setResetState(prev => ({ ...prev, error: 'Admin Master Code is incorrect.' }));
      return;
    }
    if (!/^\d{6}$/.test(resetState.newPasscode)) {
      setResetState(prev => ({ ...prev, error: 'New user passcode must be exactly 6 digits.' }));
      return;
    }
    if (resetState.newPasscode !== resetState.confirmPasscode) {
      setResetState(prev => ({ ...prev, error: 'New passcode and confirmation do not match.' }));
      return;
    }
    if (resetState.newPasscode === ADMIN_MASTER_PASSWORD) {
      setResetState(prev => ({ ...prev, error: 'This passcode is reserved for Admin. Choose a different 6-digit code for users.' }));
      return;
    }

    try {
      if (onResetUserPassword) {
        await onResetUserPassword(resetState.newPasscode);
      }
      localStorage.setItem('sai_transport_active_password', resetState.newPasscode);
      setResetState(prev => ({
        ...prev,
        error: '',
        success: `User passcode reset to ${resetState.newPasscode}! Admin Master Password remains unchanged.`
      }));

      // Pre-fill digits on unlock screen so user can unlock immediately
      const splitted = resetState.newPasscode.split('');
      setDigits(splitted);

      setTimeout(() => {
        setIsResetModalOpen(false);
      }, 2000);
    } catch (err) {
      setResetState(prev => ({ ...prev, error: 'Reset failed: ' + (err?.message || 'Error') }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative transition-colors duration-150">
      
      {/* Theme Toggle in top-right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-xs transition cursor-pointer active:scale-95"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
        </button>
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        
        {/* Pure Neutral Minimalist Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl p-6 sm:p-8 text-center">
          
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 mb-4 shadow-sm overflow-hidden">
            <img 
              src="/transportx/apple-touch-icon.png" 
              alt="TransportX" 
              className="w-full h-full object-cover" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            TRANSPORTX
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
            Enter 6-Digit Passcode to Unlock Portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 6 Boxes */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Passcode
                </span>
                <button
                  type="button"
                  onClick={() => setIsMasked(!isMasked)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                >
                  {isMasked ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show digits</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Mask digits</span>
                    </>
                  )}
                </button>
              </div>

              {/* Six Distinct Empty Boxes */}
              <div 
                className="flex items-center justify-between gap-1.5 sm:gap-2.5"
                onPaste={handlePaste}
              >
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type={isMasked ? 'password' : 'text'}
                    inputMode="numeric"
                    maxLength={1}
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border transition-all duration-150 outline-none ${
                      error
                        ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                        : digit
                        ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-zinc-900 dark:focus:border-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-center gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Remember Me and Passcode Helper */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white w-3.5 h-3.5 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              {savedPasscode && (
                <button
                  type="button"
                  onClick={handleAutofillSaved}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
                  title="Autofill passcode saved on this device"
                >
                  <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Autofill saved PIN</span>
                </button>
              )}
            </div>

            {/* Unlock Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer active:scale-[0.98]"
            >
              <span>Unlock Transport Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Forgot Passcode Link */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setResetState({ adminPasscode: '', newPasscode: '', confirmPasscode: '', error: '', success: '' });
                  setIsResetModalOpen(true);
                }}
                className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer underline"
              >
                Forgot passcode? Reset with Admin Master Code
              </button>
            </div>
          </form>

          {/* Simple footer */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Passcode Protected • Safe Local Storage</span>
          </div>

        </div>
      </div>

      {/* Forgot Passcode / Admin Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Reset User Passcode
                </h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3.5 leading-relaxed">
              If the user forgot their passcode, enter the <strong>Admin Master Passcode</strong> to set a new 6-digit user passcode.
            </p>

            <form onSubmit={handleAdminResetSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Admin Master Code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetState.adminPasscode}
                  onChange={(e) => setResetState(prev => ({ ...prev, adminPasscode: e.target.value.replace(/\D/g, ''), error: '' }))}
                  placeholder="Enter Admin Master Passcode"
                  required
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  New 6-Digit User Passcode
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetState.newPasscode}
                  onChange={(e) => setResetState(prev => ({ ...prev, newPasscode: e.target.value.replace(/\D/g, ''), error: '' }))}
                  placeholder="6 numbers"
                  required
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Confirm User Passcode
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetState.confirmPasscode}
                  onChange={(e) => setResetState(prev => ({ ...prev, confirmPasscode: e.target.value.replace(/\D/g, ''), error: '' }))}
                  placeholder="Repeat 6 numbers"
                  required
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white box-border"
                />
              </div>

              {resetState.error && (
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{resetState.error}</span>
                </div>
              )}

              {resetState.success && (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 font-medium">
                  <span>✓ {resetState.success}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 cursor-pointer shadow-xs"
                >
                  Reset Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
