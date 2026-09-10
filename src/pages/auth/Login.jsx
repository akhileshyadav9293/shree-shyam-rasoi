import { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, RefreshCw, KeyRound, User } from 'lucide-react';
import { apiGetAuthStatus, apiSetupAuth, apiLoginAuth, apiResetAuth } from '../../lib/api';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [step, setStep] = useState(0); // 0: Enter Name, 1: Enter new PIN, 2: Confirm new PIN
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check auth setup status on mount (from backend, fallback to localStorage)
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await apiGetAuthStatus();
        if (res.isSetup) {
          setIsSetup(false);
          setUsername(res.username || localStorage.getItem('app_username') || 'Admin');
          localStorage.setItem('app_username', res.username || 'Admin');
        } else {
          // Check local fallback
          const localPin = localStorage.getItem('app_pin');
          const localName = localStorage.getItem('app_username');
          if (localPin && localName) {
            setIsSetup(false);
            setUsername(localName);
            // Sync to backend silently
            apiSetupAuth(localName, localPin).catch(() => {});
          } else {
            setIsSetup(true);
            setStep(0);
          }
        }
      } catch {
        // Offline or backend unreachable, check localStorage
        const localPin = localStorage.getItem('app_pin');
        const localName = localStorage.getItem('app_username');
        if (localPin && localName) {
          setIsSetup(false);
          setUsername(localName);
        } else {
          setIsSetup(true);
          setStep(0);
        }
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const handleKeyPress = useCallback((num) => {
    setError('');
    setPin(prev => {
      if (prev.length < 4) return prev + num;
      return prev;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setError('');
    setPin(prev => prev.slice(0, -1));
  }, []);

  // Keyboard support: listen to 0-9, Backspace, Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSetup && step === 0) {
        if (e.key === 'Enter' && username.trim()) {
          setStep(1);
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSetup, step, username, handleKeyPress, handleDelete]);

  // Execute pin verification when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const handlePinSubmit = async (currentPin) => {
    if (isSetup) {
      if (step === 1) {
        setSetupPin(currentPin);
        setPin('');
        setStep(2);
      } else if (step === 2) {
        if (currentPin === setupPin) {
          setSubmitting(true);
          try {
            await apiSetupAuth(username.trim(), currentPin);
          } catch {
            // fallback to local if backend error
          }
          localStorage.setItem('app_pin', currentPin);
          localStorage.setItem('app_username', username.trim());
          localStorage.setItem('is_authenticated', 'true');
          sessionStorage.setItem('is_authenticated', 'true');
          setSubmitting(false);
          onLogin(true);
        } else {
          setError('PINs do not match. Please try again.');
          setPin('');
          setSetupPin('');
          setStep(1);
        }
      }
    } else {
      setSubmitting(true);
      try {
        await apiLoginAuth(currentPin);
        localStorage.setItem('app_pin', currentPin);
        localStorage.setItem('app_username', username);
        localStorage.setItem('is_authenticated', 'true');
        sessionStorage.setItem('is_authenticated', 'true');
        onLogin(true);
      } catch (err) {
        // Check local fallback
        const savedPin = localStorage.getItem('app_pin');
        if (savedPin && currentPin === savedPin) {
          localStorage.setItem('is_authenticated', 'true');
          sessionStorage.setItem('is_authenticated', 'true');
          onLogin(true);
        } else {
          setError(err.message || 'Incorrect PIN. Please try again.');
          setPin('');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResetProfile = async () => {
    if (confirm('Are you sure you want to reset your PIN and profile? This will not delete customer or business data, only your login credentials.')) {
      try {
        await apiResetAuth();
      } catch {}
      localStorage.removeItem('app_pin');
      localStorage.removeItem('app_username');
      localStorage.removeItem('is_authenticated');
      sessionStorage.removeItem('is_authenticated');
      setIsSetup(true);
      setUsername('');
      setPin('');
      setSetupPin('');
      setStep(0);
      setError('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading Shree Shyam Rasoi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-7 sm:p-9 border border-gray-100 dark:border-gray-700/80 flex flex-col items-center relative overflow-hidden">

        {/* Top Decorative Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-18 h-18 bg-gradient-to-tr from-primary-600 via-orange-500 to-amber-400 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary-500/30 ring-4 ring-primary-100 dark:ring-primary-950/60">
          {isSetup ? (
            <Unlock className="w-9 h-9 text-white" />
          ) : (
            <Lock className="w-9 h-9 text-white" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 text-center mb-1 tracking-tight">
          {isSetup
            ? (step === 0 ? 'Create Admin Profile' : step === 1 ? `Namaste ${username}!` : 'Confirm 4-Digit PIN')
            : `Welcome Back, ${username}!`}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-center text-xs sm:text-sm mb-6 max-w-xs font-medium">
          {isSetup
            ? (step === 0 ? 'Enter your name to set up Shree Shyam Rasoi' : step === 1 ? 'Create a 4-digit PIN to secure your app' : 'Re-enter your 4-digit PIN to confirm')
            : 'Enter your 4-digit PIN (use keyboard or keypad below)'}
        </p>

        {isSetup && step === 0 ? (
          /* Step 0: Name Input */
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="w-full relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && username.trim()) setStep(1); }}
                placeholder="Enter your name (e.g. Akhilesh)"
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-semibold text-base transition-all"
              />
            </div>
            <button
              onClick={() => { if (username.trim()) setStep(1); }}
              disabled={!username.trim()}
              className="w-full py-4 bg-gradient-to-r from-primary-600 via-orange-500 to-amber-500 hover:from-primary-700 hover:via-orange-600 hover:to-amber-600 active:scale-98 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/25 transition-all text-base cursor-pointer disabled:cursor-not-allowed"
            >
              Continue to Set PIN →
            </button>
          </div>
        ) : (
          /* Step 1/2 or Login: 4-digit PIN Keypad */
          <div className="w-full flex flex-col items-center">
            
            {/* PIN Dots Display with Eye Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center text-xs font-black ${
                      pin.length > idx
                        ? 'bg-primary-600 text-white scale-110 shadow-sm shadow-primary-500/50'
                        : 'bg-gray-200 dark:bg-gray-700 scale-100'
                    }`}
                  >
                    {showPin && pin.length > idx ? pin[idx] : ''}
                  </div>
                ))}
              </div>

              {/* Show/Hide PIN toggle */}
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-shake">
                {error}
              </div>
            )}

            {/* Submitting Indicator */}
            {submitting && (
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-xs font-bold mb-3">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying PIN...
              </div>
            )}

            {/* On-Screen Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num.toString())}
                  disabled={submitting}
                  className="h-14 rounded-2xl text-2xl font-bold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/60 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 active:scale-95 transition-all border border-gray-100 dark:border-gray-700 shadow-xs"
                >
                  {num}
                </button>
              ))}

              {/* Reset/Cancel button if in setup step 1 or 2 */}
              <div className="flex items-center justify-center">
                {isSetup && step > 0 ? (
                  <button
                    type="button"
                    onClick={() => { setStep(0); setPin(''); setSetupPin(''); setError(''); }}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors"
                    title="Reset PIN"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* 0 button */}
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                disabled={submitting}
                className="h-14 rounded-2xl text-2xl font-bold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/60 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 active:scale-95 transition-all border border-gray-100 dark:border-gray-700 shadow-xs"
              >
                0
              </button>

              {/* Backspace button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={pin.length === 0 || submitting}
                className="h-14 flex items-center justify-center rounded-2xl text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100 dark:border-gray-700"
                title="Backspace"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-5">
              Tip: You can also use your keyboard numpad
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
