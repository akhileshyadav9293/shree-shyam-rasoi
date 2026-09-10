import { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [step, setStep] = useState(0); // 0: Enter Name, 1: Enter new PIN, 2: Confirm new PIN

  useEffect(() => {
    const savedPin = localStorage.getItem('app_pin');
    const savedName = localStorage.getItem('app_username');
    if (!savedPin || !savedName) {
      setIsSetup(true);
      setStep(0); // Start at name setup
    } else {
      setUsername(savedName);
    }
  }, []);

  const handleKeyPress = (num) => {
    if (error) setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (error) setError('');
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  const handlePinSubmit = () => {
    if (isSetup) {
      if (step === 1) {
        setSetupPin(pin);
        setPin('');
        setStep(2);
      } else if (step === 2) {
        if (pin === setupPin) {
          localStorage.setItem('app_pin', pin);
          localStorage.setItem('app_username', username);
          onLogin(true);
        } else {
          setError('PINs do not match. Try again.');
          setPin('');
          setSetupPin('');
          setStep(1);
        }
      }
    } else {
      const savedPin = localStorage.getItem('app_pin');
      if (pin === savedPin) {
        onLogin(true);
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 transition-colors flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-6">
          {isSetup ? <Unlock className="w-8 h-8 text-primary-600 dark:text-primary-400" /> : <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />}
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
          {isSetup
            ? (step === 0 ? 'Welcome to Rasoi' : step === 1 ? `Hello ${username}, Set PIN` : 'Confirm PIN')
            :
            `Welcome Back, ${username}`}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
          {isSetup
            ? (step === 0 ? 'Please enter your name to continue' : step === 1 ? 'Create a 4-digit PIN to secure your app' : 'Please re-enter your 4-digit PIN')
            : 'Enter your 4-digit PIN to access your dashboard'}
        </p>

        {isSetup && step === 0 ? (
          <div className="w-full flex flex-col items-center">
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-center font-medium text-lg mb-6"
            />
            <button
              onClick={() => { if (username.trim()) setStep(1); }}
              disabled={!username.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 via-orange-500 to-amber-500 hover:from-primary-700 hover:via-orange-600 hover:to-amber-600 active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            {/* PIN Dots */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-colors ${pin.length > idx ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm font-medium mb-4">{error}</p>}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-14 rounded-xl text-2xl font-semibold dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors active:bg-primary-100 dark:active:bg-primary-900/60"
                >
                  {num}
                </button>
              ))}
              <div className="col-start-2">
                <button
                  onClick={() => handleKeyPress('0')}
                  className="w-full h-14 rounded-xl text-2xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors active:bg-primary-100 dark:active:bg-primary-900/60"
                >
                  0
                </button>
              </div>
              <div>
                <button
                  onClick={handleDelete}
                  disabled={pin.length === 0}
                  className="w-full h-14 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
                </button>
              </div>
            </div>

            {/* Reset App Option */}
            {!isSetup && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset the user profile? This will not delete your data, just your PIN and name.')) {
                    localStorage.removeItem('app_pin');
                    localStorage.removeItem('app_username');
                    window.location.reload();
                  }
                }}
                className="mt-6 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Login as different user
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
