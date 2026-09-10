import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, RefreshCw, Clock, CreditCard,
  User, Phone, MapPin, Utensils, Calendar, TrendingDown,
  TrendingUp, CheckCircle2, AlertCircle, ReceiptText, CalendarDays,
  MessageCircle, Share2, Copy, Printer, X, Check, Sparkles, MessageSquare
} from 'lucide-react';
import {
  getCustomerById, addCustomer, updateCustomer,
  getDeliveriesForMonth, getPaymentsByCustomer
} from '../../lib/store';
import { apiSendDirectSms } from '../../lib/api';
import PrintableBill from '../../components/PrintableBill';
import SmsSettingsModal from '../../components/SmsSettingsModal';

const EMPTY_FORM = {
  name: '',
  phone: '',
  address: '',
  plan: 'both',
  serviceType: 'monthly',
  tiffinRate: '',
  monthlyAmount: '',
  discount: '',
  advance: '',
  skippedDays: 0,
  adjustmentAmount: 0,
};

function daysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function daysInPrevMonth() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function membershipDuration(createdAt) {
  if (!createdAt) return 'N/A';
  const start = new Date(createdAt);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  if (months >= 1) return `${months} month${months > 1 ? 's' : ''} ${days % 30}d`;
  return `${days} day${days !== 1 ? 's' : ''}`;
}

function getCurrentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonthPrefix() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Small stat card ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'primary', large = false }) {
  const colors = {
    primary: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    gray: 'bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
      <p className={`font-bold text-gray-800 dark:text-gray-100 leading-tight ${large ? 'text-2xl' : 'text-lg'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

// ── Row item for billing breakdown ───────────────────────────────────────────
function BillRow({ label, value, highlight, sub }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${highlight ? 'font-bold' : ''}`}>
      <div>
        <p className={`text-sm ${highlight ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm font-semibold ${highlight ? 'text-green-600 dark:text-green-400 text-base' : 'text-gray-700 dark:text-gray-300'}`}>{value}</p>
    </div>
  );
}

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!!id);
  const [isCalculatingSkipped, setIsCalculatingSkipped] = useState(false);
  const [activeTab, setActiveTab] = useState(id ? 'overview' : 'edit');
  const [paymentsHistory, setPaymentsHistory] = useState([]);

  // Modal and messaging state for newly registered customer
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);
  const [printingCustomer, setPrintingCustomer] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [directSmsSending, setDirectSmsSending] = useState(false);
  const [directSmsStatus, setDirectSmsStatus] = useState(null);
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  // Derived stats for overview
  const [currentMonthTiffins, setCurrentMonthTiffins] = useState(0);
  const [prevMonthSkipped, setPrevMonthSkipped] = useState(null); // null = not yet fetched

  const days = daysInCurrentMonth();
  const prevDays = daysInPrevMonth();

  useEffect(() => {
    if (id) {
      getCustomerById(id).then(customer => {
        if (customer) setFormData({ ...EMPTY_FORM, ...customer });
        setLoading(false);
      });
      getPaymentsByCustomer(id).then(setPaymentsHistory);
    }
  }, [id]);

  // Auto-load current month deliveries for overview
  useEffect(() => {
    if (!id || !formData.plan) return;
    const prefix = getCurrentMonthPrefix();
    getDeliveriesForMonth(prefix).then(map => {
      let count = 0;
      const plan = formData.plan;
      Object.values(map).forEach(dayData => {
        const cd = dayData[id];
        if (cd) {
          if ((plan === 'lunch' || plan === 'both') && cd.lunch) count++;
          if ((plan === 'dinner' || plan === 'both') && cd.dinner) count++;
        }
      });
      const mealsPerDay = plan === 'both' ? 2 : 1;
      setCurrentMonthTiffins(Math.round(count / mealsPerDay));
    });
  }, [id, formData.plan]);

  // Auto-load prev month skipped from deliveries
  useEffect(() => {
    if (!id || !formData.plan) return;
    const prefix = getPrevMonthPrefix();
    getDeliveriesForMonth(prefix).then(map => {
      const plan = formData.plan;
      const mealsPerDay = plan === 'both' ? 2 : 1;
      
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const prevMonthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const prevMonthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const joinedDate = formData.createdAt ? new Date(formData.createdAt) : prevMonthStart;
      let expectedDays = 0;
      if (joinedDate <= prevMonthEnd) {
        const start = joinedDate > prevMonthStart ? joinedDate : prevMonthStart;
        expectedDays = Math.floor((prevMonthEnd - start) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      const expected = expectedDays * mealsPerDay;
      let delivered = 0;
      Object.values(map).forEach(dayData => {
        const cd = dayData[id];
        if (cd) {
          if ((plan === 'lunch' || plan === 'both') && cd.lunch) delivered++;
          if ((plan === 'dinner' || plan === 'both') && cd.dinner) delivered++;
        }
      });
      const skippedMeals = Math.max(0, expected - delivered);
      setPrevMonthSkipped(Number((skippedMeals / mealsPerDay).toFixed(1)));
    });
  }, [id, formData.plan, formData.createdAt]);

  // Final price = monthlyAmount - discount - adjustmentAmount (always deducted)
  const discountAmt = Math.min(Number(formData.discount) || 0, Number(formData.monthlyAmount) || 0);
  const adjustmentAmt = Math.max(0, Number(formData.adjustmentAmount) || 0); // always positive
  const finalMonthly = Math.max(0, (Number(formData.monthlyAmount) || 0) - discountAmt - adjustmentAmt);

  // Remaining = finalMonthly - advance
  const remaining = Math.max(0, finalMonthly - (Number(formData.advance) || 0));

  const prevMonthBill = Number(formData.monthlyPrice) || finalMonthly;

  const handleRateChange = (e) => {
    const rate = Number(e.target.value) || 0;
    const skipped = Number(formData.skippedDays) || 0;
    setFormData(prev => ({
      ...prev,
      tiffinRate: e.target.value,
      monthlyAmount: rate ? String(rate * days) : '',
      adjustmentAmount: Math.round(skipped * rate)
    }));
  };

  const handleSkippedDaysChange = (e) => {
    const skipped = Number(e.target.value) || 0;
    const rate = Number(formData.tiffinRate) || 0;
    setFormData(prev => ({
      ...prev,
      skippedDays: e.target.value,
      adjustmentAmount: Math.round(skipped * rate)
    }));
  };

  const handleAutoCalculateSkippedDays = async () => {
    if (!id) return;
    setIsCalculatingSkipped(true);
    try {
      const prefix = getPrevMonthPrefix();
      const map = await getDeliveriesForMonth(prefix);
      const plan = formData.plan || 'both';
      const mealsPerDay = plan === 'both' ? 2 : 1;
      
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const prevMonthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const prevMonthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const joinedDate = formData.createdAt ? new Date(formData.createdAt) : prevMonthStart;
      let expectedDays = 0;
      if (joinedDate <= prevMonthEnd) {
        const start = joinedDate > prevMonthStart ? joinedDate : prevMonthStart;
        expectedDays = Math.floor((prevMonthEnd - start) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      const expected = expectedDays * mealsPerDay;
      let delivered = 0;
      Object.values(map).forEach(dayData => {
        const cd = dayData[id];
        if (cd) {
          if ((plan === 'lunch' || plan === 'both') && cd.lunch) delivered++;
          if ((plan === 'dinner' || plan === 'both') && cd.dinner) delivered++;
        }
      });
      const skippedMeals = Math.max(0, expected - delivered);
      const skippedDays = Number((skippedMeals / mealsPerDay).toFixed(1));
      // Positive value — will be subtracted from bill
      const calcAdj = Math.round(skippedDays * (Number(formData.tiffinRate) || 0));
      setFormData(prev => ({ ...prev, skippedDays, adjustmentAmount: calcAdj }));
    } catch (err) {
      console.error(err);
      alert('Error calculating skipped days.');
    } finally {
      setIsCalculatingSkipped(false);
    }
  };

  const buildWelcomeMessage = (c) => {
    const shiftText = c.plan === 'lunch' ? 'Lunch Only (Morning)' :
      c.plan === 'dinner' ? 'Dinner Only (Evening)' : 'Both (Morning & Evening)';
    const serviceText = c.serviceType === 'weekly' ? 'Weekly' : c.serviceType === 'custom' ? 'Custom' : 'Monthly';
    const rem = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));

    return (
`🍱 *SHREE SHYAM RASOI* — Welcome! 🙏

Namaste *${c.name}* ji,
Aapka tiffin subscription Shree Shyam Rasoi mein safalta-purvak shuru ho gaya hai.

📋 *Subscription Vivran (Details):*
• Shift / Plan: ${shiftText}
• Service Type: ${serviceText}
• Tiffin Rate: ₹${c.tiffinRate || 0} / tiffin
• Monthly Bill: ₹${c.monthlyPrice || 0}
• Advance Jama: ₹${c.advance || 0}
• Remaining Due: ₹${rem}

📍 Delivery Pata: ${c.address}

Ghar jaisa shuddh, swachh aur paushtik khana! 🍛
Kisi bhi jaankari ya badlav ke liye sampark karein:
📞 +91 9165360293

Dhanyawaad! 🙏`
    );
  };

  const handleWhatsAppSend = (c) => {
    const msg = buildWelcomeMessage(c);
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async (c) => {
    const msg = buildWelcomeMessage(c);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shree Shyam Rasoi - Welcome ${c.name}`,
          text: msg,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    handleWhatsAppSend(c);
  };

  const handleSMSSend = (c) => {
    const msg = buildWelcomeMessage(c);
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    window.open(`sms:${cleanPhone}?body=${encodeURIComponent(msg)}`);
  };

  const handleCopyMessage = (c) => {
    const msg = buildWelcomeMessage(c);
    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleDirectSmsSend = async (c) => {
    setDirectSmsSending(true);
    setDirectSmsStatus(null);
    try {
      const msg = buildWelcomeMessage(c);
      const res = await apiSendDirectSms(c.phone, msg);
      setDirectSmsStatus({ success: res.message || 'SMS sent successfully!' });
    } catch (err) {
      setDirectSmsStatus({
        error: err.message,
        needsConfig: err.message.toLowerCase().includes('not configured') || err.message.includes('needsConfig')
      });
    } finally {
      setDirectSmsSending(false);
    }
  };

  const handlePrintReceipt = (c) => {
    setPrintingCustomer(c);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, monthlyPrice: finalMonthly, remaining };
    if (id) {
      await updateCustomer(dataToSave);
      navigate('/customers');
    } else {
      const saved = await addCustomer(dataToSave);
      const custObj = saved || { ...dataToSave, id: Date.now().toString() };
      setCreatedCustomer(custObj);
      setShowSuccessModal(true);
    }
  };

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading customer...</p>
      </div>
    );
  }

  const TABS = id
    ? [
        { key: 'overview', label: 'Overview', icon: User },
        { key: 'edit', label: 'Edit Details', icon: ReceiptText },
        { key: 'track_record', label: 'Track Record', icon: Clock },
      ]
    : [];

  const planLabel = { lunch: 'Lunch Only', dinner: 'Dinner Only', both: 'Lunch & Dinner' };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {id ? formData.name || 'Customer Profile' : 'Add New Customer'}
          </h2>
          {id && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> {formData.phone}
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Utensils className="w-3.5 h-3.5" /> {planLabel[formData.plan] || formData.plan}
            </p>
          )}
        </div>
      </div>

      {/* ── Tabs (only for existing customers) ──────────────────────── */}
      {id && (
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl mb-6 w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && id && (
        <div className="space-y-6">

          {/* ── Hero identity card ── */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Customer Since</p>
                <p className="text-white font-semibold">
                  {formData.createdAt
                    ? new Date(formData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm font-medium mb-1">Membership</p>
                <p className="text-white font-bold text-lg">{membershipDuration(formData.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-200" />
                <p className="text-orange-100 text-sm line-clamp-1">{formData.address || '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Current Month</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={CalendarDays} label="Tiffins Taken (This Month)" value={currentMonthTiffins} sub={`of ${days * (formData.plan === 'both' ? 2 : 1)} expected`} color="primary" />
              <StatCard icon={IndianRupee} label="Advance Paid" value={`₹${Number(formData.advance) || 0}`} color="green" />
              <StatCard icon={TrendingDown} label="Adjustment Amount" value={adjustmentAmt > 0 ? `- ₹${adjustmentAmt}` : '—'} sub={adjustmentAmt > 0 ? 'Deducted from bill' : 'No adjustment'} color={adjustmentAmt > 0 ? 'amber' : 'gray'} />
              <StatCard icon={AlertCircle} label="Remaining Due" value={remaining > 0 ? `₹${remaining}` : 'Paid ✓'} color={remaining > 0 ? 'red' : 'green'} />
            </div>
          </div>

          {/* ── Previous Month block ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Previous Month</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard icon={ReceiptText} label="Prev Month Bill" value={`₹${prevMonthBill}`} color="blue" />
              <StatCard
                icon={TrendingDown}
                label="Tiffins Skipped"
                value={prevMonthSkipped !== null ? `${prevMonthSkipped} days` : 'Loading...'}
                sub={prevMonthSkipped > 0 ? 'Credit carried forward' : 'No skips 🎉'}
                color={prevMonthSkipped > 0 ? 'amber' : 'green'}
              />
              <StatCard
                icon={CheckCircle2}
                label="Adjust Days (This Month)"
                value={Number(formData.skippedDays) > 0 ? `${formData.skippedDays} days` : '—'}
                sub={adjustmentAmt > 0 ? `₹${adjustmentAmt} deducted from bill` : 'No carry forward'}
                color={Number(formData.skippedDays) > 0 ? 'amber' : 'gray'}
              />
            </div>
          </div>

          {/* ── Current bill breakdown ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Current Month Bill Breakdown</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <BillRow
                label="Base Billing Amount"
                value={`₹${Number(formData.monthlyAmount) || 0}`}
                sub={`Rate ₹${formData.tiffinRate || 0}/day × ${days} days`}
              />
              {Number(formData.skippedDays) > 0 && (
                <BillRow
                  label="Adjust Days (from prev month)"
                  value={`${formData.skippedDays} days`}
                  sub="Skipped tiffins carried forward"
                />
              )}
              {adjustmentAmt > 0 && (
                <BillRow
                  label="Adjustment Amount"
                  value={`- ₹${adjustmentAmt}`}
                  sub="Deducted from this month's bill"
                />
              )}
              {discountAmt > 0 && (
                <BillRow label="Discount" value={`- ₹${discountAmt}`} />
              )}
              <div className="mt-3 pt-3 border-t-2 border-dashed border-orange-200 dark:border-orange-800/50 flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-100">Final Bill This Month</p>
                  <p className="text-xs text-gray-400 mt-0.5">After all adjustments</p>
                </div>
                <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">₹{finalMonthly}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-center">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Advance Paid</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">₹{Number(formData.advance) || 0}</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${remaining > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <p className={`text-xs font-medium mb-1 ${remaining > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {remaining > 0 ? 'Amount Remaining' : 'Status'}
                  </p>
                  <p className={`text-lg font-bold ${remaining > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                    {remaining > 0 ? `₹${remaining}` : 'Paid ✓'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Edit button */}
          <button
            onClick={() => setActiveTab('edit')}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-700 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            Edit Customer Details
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: EDIT DETAILS (+ Add New Customer form)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'edit' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

            {/* Basic Info */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Basic Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={set('name')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={set('phone')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    placeholder="e.g. 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiffin Shift</label>
                  <select value={formData.plan} onChange={set('plan')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm">
                    <option value="lunch">Lunch Only (Morning)</option>
                    <option value="dinner">Dinner Only (Evening)</option>
                    <option value="both">Both (Morning &amp; Evening)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                <select value={formData.serviceType || 'monthly'} onChange={set('serviceType')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Pricing &amp; Billing</h3>
              <div className="rounded-xl border border-primary-100 dark:border-primary-900/30 bg-primary-50/40 dark:bg-primary-900/10 p-5 space-y-6">
                <p className="text-sm font-semibold text-primary-700 dark:text-primary-400 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Pricing Details
                  <span className="ml-auto text-xs font-normal text-gray-500 dark:text-gray-400">
                    Current month: <strong>{days} days</strong>
                  </span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rate per Tiffin (₹) <span className="text-xs text-gray-400 font-normal">per day</span>
                    </label>
                    <input type="number" value={formData.tiffinRate} onChange={handleRateChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      placeholder="e.g. 60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Base Billing Amount (₹) <span className="text-xs text-gray-400 font-normal">auto or manual</span>
                    </label>
                    <input type="number" required value={formData.monthlyAmount} onChange={set('monthlyAmount')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      placeholder="e.g. 1860" />
                  </div>
                </div>

                {/* Skipped Days + Adjustment — ONLY for existing customers */}
                {id && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                        Adjust Days (from prev month)
                        <button type="button" onClick={handleAutoCalculateSkippedDays} disabled={isCalculatingSkipped}
                          className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-amber-200 transition-colors ml-auto">
                          <RefreshCw className={`w-3 h-3 ${isCalculatingSkipped ? 'animate-spin' : ''}`} /> Auto
                        </button>
                      </label>
                      <input type="number" step="0.5" value={formData.skippedDays} onChange={handleSkippedDaysChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        placeholder="e.g. 4" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adjustment Amount (₹) <span className="text-xs text-amber-600 dark:text-amber-400 font-normal">subtracted from bill</span>
                      </label>
                      <input type="number" min="0" value={formData.adjustmentAmount} onChange={set('adjustmentAmount')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        placeholder="e.g. 240" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount (₹) <span className="text-xs text-gray-400 font-normal">on base amount</span>
                    </label>
                    <input type="number" min="0" value={formData.discount} onChange={set('discount')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      placeholder="e.g. 200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Final Billing Price (₹) <span className="text-xs text-green-600 dark:text-green-400 font-normal">auto-calculated</span>
                    </label>
                    <input readOnly value={formData.monthlyAmount ? `₹ ${finalMonthly}` : ''}
                      className="w-full px-4 py-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-bold rounded-xl outline-none cursor-not-allowed shadow-sm"
                      placeholder="—" />
                  </div>
                </div>

                {/* Breakdown strip */}
                {formData.monthlyAmount && (discountAmt > 0 || adjustmentAmt !== 0) && (
                  <div className="text-sm bg-white dark:bg-gray-800 rounded-xl px-5 py-4 border border-dashed border-primary-200 dark:border-primary-800 space-y-2 shadow-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Base Amount</span><span className="font-semibold">₹{formData.monthlyAmount}</span>
                    </div>
                    {Number(formData.skippedDays) > 0 && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-500">
                        <span>Adjust Days (prev month)</span><span>{formData.skippedDays} days</span>
                      </div>
                    )}
                    {adjustmentAmt > 0 && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Adjustment</span>
                        <span className="text-red-500 font-medium">- ₹{adjustmentAmt}</span>
                      </div>
                    )}
                    {discountAmt > 0 && (
                      <div className="flex justify-between text-red-500 dark:text-red-400">
                        <span>Discount</span><span>- ₹{discountAmt}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-green-700 dark:text-green-400 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <span className="text-base">Final Price</span>
                      <span className="text-base">₹{finalMonthly}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance Paid (₹)</label>
                    <input type="number" value={formData.advance} onChange={set('advance')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      placeholder="e.g. 1000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remaining (₹) <span className="text-xs text-green-600 dark:text-green-400 font-normal">auto-calculated</span>
                    </label>
                    <input readOnly value={`₹ ${remaining}`}
                      className={`w-full px-4 py-3 border rounded-xl font-bold outline-none cursor-not-allowed shadow-sm ${
                        remaining > 0
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Location</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Address</label>
                <textarea required rows="3" value={formData.address} onChange={set('address')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none shadow-sm"
                  placeholder="Enter complete delivery address..." />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button type="button" onClick={() => navigate('/customers')}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-center">
                Cancel
              </button>
              <button type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-700 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-center">
                {id ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: TRACK RECORD — Payment History
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'track_record' && id && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-500" /> Payment History
          </h3>
          {paymentsHistory.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No past payments recorded for this customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">#</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {paymentsHistory.map((payment, i) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-xs text-gray-400">{i + 1}</td>
                      <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {new Date(payment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{payment.description || 'Monthly Payment'}</td>
                      <td className="p-4 text-sm font-bold text-green-600 dark:text-green-400 text-right">₹{payment.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800/80">
                  <tr>
                    <td colSpan="3" className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Total Paid</td>
                    <td className="p-4 text-base font-extrabold text-green-700 dark:text-green-300 text-right">
                      ₹{paymentsHistory.reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUCCESS POPUP MODAL (After Customer Registration)
      ══════════════════════════════════════════════════════════════ */}
      {showSuccessModal && createdCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">

            {/* Header Banner */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white relative">
              <button
                onClick={() => { setShowSuccessModal(false); navigate('/customers'); }}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black">Customer Added Successfully! 🎉</h3>
              <p className="text-emerald-100 text-xs mt-1">New subscriber registered in Shree Shyam Rasoi</p>
            </div>

            {/* Details Card */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">{createdCustomer.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {createdCustomer.phone}
                    </p>
                  </div>
                  <span className="capitalize px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    {createdCustomer.plan === 'both' ? 'Morning & Evening' : createdCustomer.plan === 'lunch' ? 'Morning Only' : 'Evening Only'}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-600/60 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                    <span className="text-gray-400 block font-medium">Monthly Bill</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">₹{createdCustomer.monthlyPrice || 0}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                    <span className="text-gray-400 block font-medium">Advance</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-sm">₹{createdCustomer.advance || 0}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                    <span className="text-gray-400 block font-medium">Due</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-sm">₹{createdCustomer.remaining || 0}</span>
                  </div>
                </div>

                {createdCustomer.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1 pt-1">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate">{createdCustomer.address}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Direct Background SMS Button (No WhatsApp needed) */}
                <button
                  type="button"
                  onClick={() => handleDirectSmsSend(createdCustomer)}
                  disabled={directSmsSending}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-60 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
                >
                  {directSmsSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Direct SMS to Mobile...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5 text-amber-300" />
                      <span>Direct SMS (Bina WhatsApp Khole Bhejein)</span>
                    </>
                  )}
                </button>

                {/* Direct SMS Feedback */}
                {directSmsStatus && directSmsStatus.success && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span>{directSmsStatus.success}</span>
                  </div>
                )}

                {directSmsStatus && directSmsStatus.error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold space-y-1.5">
                    <p className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{directSmsStatus.error}</span>
                    </p>
                    {directSmsStatus.needsConfig && (
                      <button
                        type="button"
                        onClick={() => setSmsModalOpen(true)}
                        className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors inline-block"
                      >
                        Fast2SMS API Key Configure Karein →
                      </button>
                    )}
                  </div>
                )}

                {/* 2. WhatsApp Welcome & Bill */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppSend(createdCustomer)}
                  className="w-full flex items-center justify-center gap-2.5 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 active:scale-98 text-white rounded-2xl font-bold shadow-md shadow-green-600/20 transition-all text-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Welcome &amp; Bill</span>
                </button>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNativeShare(createdCustomer)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>Share App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSMSSend(createdCustomer)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4 text-purple-500" />
                    <span>Native SMS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyMessage(createdCustomer)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    {copiedMessage ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    <span>{copiedMessage ? 'Copied!' : 'Copy Bill'}</span>
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(createdCustomer)}
                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-gray-500" />
                    <span>Print Bill Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSuccessModal(false); navigate('/customers'); }}
                    className="flex-1 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 rounded-xl text-xs font-bold transition-opacity"
                  >
                    Done (View Customers)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Printable Bill for print receipt */}
      <PrintableBill customer={printingCustomer} />
    </div>
  );
}
