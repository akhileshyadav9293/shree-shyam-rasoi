import { useState, useEffect } from 'react';
import { MessageSquare, Key, IndianRupee, Send, CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw, X, ExternalLink } from 'lucide-react';
import { apiGetSmsConfig, apiSaveSmsConfig, apiSendDirectSms } from '../lib/api';

export default function SmsSettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ hasKey: false, maskedKey: '', walletBalance: null });
  const [testPhone, setTestPhone] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await apiGetSmsConfig();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load SMS config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setSaving(true);
    setSaveSuccess(false);
    setTestResult(null);
    try {
      await apiSaveSmsConfig(apiKey.trim());
      setSaveSuccess(true);
      setApiKey('');
      await loadConfig();
    } catch (err) {
      setTestResult({ error: err.message || 'Failed to save API key' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || testPhone.replace(/\D/g, '').length < 10) {
      setTestResult({ error: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiSendDirectSms(
        testPhone,
        'Shree Shyam Rasoi: Test SMS successful! Aapka Fast2SMS direct messaging setup activate ho gaya hai. Dhanyawaad! 🙏'
      );
      setTestResult({ success: res.message || 'Test SMS sent successfully!' });
      await loadConfig(); // refresh balance
    } catch (err) {
      setTestResult({ error: err.message || 'Failed to send test SMS' });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-up">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-black">Direct SMS Settings (Fast2SMS)</h3>
          <p className="text-blue-100 text-xs mt-1">Send bills &amp; alerts directly to mobile numbers without opening WhatsApp</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Status Card */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gateway Status</p>
              <div className="flex items-center gap-2 mt-1">
                {status.hasKey ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activated ({status.maskedKey})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" /> Not Configured
                  </span>
                )}
              </div>
            </div>

            {status.walletBalance !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Wallet Balance</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  ₹{Number(status.walletBalance).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Form to enter API Key */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Fast2SMS Authorization / API Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={status.hasKey ? 'Paste new API key to update...' : 'Enter your Fast2SMS authorization key...'}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save API Key'}</span>
            </button>
          </form>

          {saveSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold rounded-xl text-center">
              ✓ Fast2SMS API Key saved and verified!
            </div>
          )}

          {/* Test SMS Section */}
          {status.hasKey && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Send Test SMS
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={testing || !testPhone.trim()}
                  className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 hover:opacity-90 active:scale-95 disabled:opacity-40 text-white dark:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{testing ? 'Sending...' : 'Send Test'}</span>
                </button>
              </div>

              {testResult && testResult.success && (
                <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold rounded-xl">
                  {testResult.success}
                </div>
              )}

              {testResult && testResult.error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                  {testResult.error}
                </div>
              )}
            </div>
          )}

          {/* Quick Guide */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-2">
            <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <span>💡</span> Kaise praapt karein Fast2SMS API Key?
            </p>
            <ol className="text-[11px] text-blue-800/80 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>Visit karein <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" className="underline font-bold text-blue-600 dark:text-blue-300 inline-flex items-center gap-0.5">fast2sms.com <ExternalLink className="w-2.5 h-2.5" /></a> aur sign up karein (Free ₹50 credits milenge).</li>
              <li>Dashboard me <strong>Dev API</strong> menu par click karein.</li>
              <li>Wahan se apna <strong>Authorization Key</strong> copy karke upar paste karein aur Save daba dein.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
