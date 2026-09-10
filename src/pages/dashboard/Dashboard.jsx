import { Users, Truck, CheckSquare, IndianRupee, UserCheck, UserX, Bell, AlertCircle, Phone, Clock, ArrowRight, Sun, Moon, Utensils, Calendar, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCustomers, getPayments } from '../../lib/store';
import { Link } from 'react-router-dom';
import { usePaymentAlerts } from '../../hooks/usePaymentAlerts';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [custData, payData] = await Promise.all([getCustomers(), getPayments()]);
      setCustomers(custData);
      setPayments(payData);
      setLoading(false);
    }
    loadData();
  }, []);

  const activeCustomers  = customers.filter(c => c.status !== 'paused');
  const pausedCustomers  = customers.filter(c => c.status === 'paused');
  const lunchCount  = activeCustomers.filter(c => c.plan === 'lunch' || c.plan === 'both').length;
  const dinnerCount = activeCustomers.filter(c => c.plan === 'dinner' || c.plan === 'both').length;
  const totalTodayDeliveries = lunchCount + dinnerCount;

  // Monthly Revenue Calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const expectedMonthlyRevenue = activeCustomers.reduce((sum, c) => sum + Number(c.monthlyPrice || 0), 0);
  const collectedMonthlyRevenue = payments.reduce((sum, p) => {
    const pDate = new Date(p.date);
    if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
      return sum + Number(p.amount || 0);
    }
    return sum;
  }, 0);

  const collectionPercentage = expectedMonthlyRevenue > 0 
    ? Math.min(100, Math.round((collectedMonthlyRevenue / expectedMonthlyRevenue) * 100)) 
    : 0;

  // Payment alerts
  const { alerts: overdueAlerts, notifPermission, requestNotifPermission } = usePaymentAlerts();

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleSimulateOrder = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') triggerDummyOrder();
      });
    } else {
      triggerDummyOrder();
    }
  };

  const triggerDummyOrder = () => {
    const orderTypes = ['1 Lunch Tiffin', '2 Dinner Tiffins', '1 Monthly Lunch Plan', 'Custom Order'];
    const names = ['Rajat Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Gupta'];
    
    const randomOrder = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    if (Notification.permission === 'granted') {
      new Notification(`New Order: ${randomName}`, {
        body: `Order Details: ${randomOrder}`,
        icon: '/vite.svg',
      });
    } else {
      alert(`🔔 New Order Received!\n\n${randomName} ordered: ${randomOrder}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Graphic Designer-Style Hero Banner ─────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ minHeight: '220px' }}>

        {/* === BASE: Real Food Photo fills right portion === */}
        <div className="absolute inset-0">
          <img
            src="/banner.jpg"
            alt="Shree Shyam Rasoi"
            className="w-full h-full object-cover object-center animate-banner-pan"
            style={{ filter: 'brightness(0.65) saturate(1.2)' }}
          />
        </div>

        {/* === LAYER 1: Left heavy gradient for text zone === */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent" />
        {/* === LAYER 2: Bottom fade for depth === */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

        {/* === LAYER 3: Brand color accent stripe (left edge) === */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-primary-500 to-primary-700 rounded-l-3xl" />

        {/* === LAYER 4: Decorative SVG dot grid pattern === */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* === LAYER 5: Decorative glowing circles === */}
        <div className="absolute -top-12 left-1/3 w-56 h-56 rounded-full bg-primary-500/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full bg-amber-400/15 blur-2xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

        {/* === LAYER 6: Decorative right-side circular frame around food === */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-4 border-white/10 hidden xl:block pointer-events-none animate-spin-slow" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-white/5 hidden xl:block pointer-events-none animate-spin-slow-reverse" />

        {/* === LAYER 7: Floating "Today's Special" badge === */}
        <div className="absolute top-5 right-6 hidden sm:flex items-center gap-1.5 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider animate-float-badge">
          <span>🍛</span>
          <span>Today's Tiffin</span>
        </div>

        {/* === MAIN CONTENT === */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 lg:p-9 text-white">
          {/* Left: Text Block */}
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                <img src="/shree-shyam-rasoi-logo.svg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.15em]">Shree Shyam Rasoi</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black leading-tight tracking-tight text-white drop-shadow-xl">
                Ghar Jaisa Khana,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-primary-400">
                  Har Roz Delivery
                </span>
              </h1>
            </div>

            {/* Sub-description */}
            <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
              Track deliveries, manage subscriptions & collect payments — all in one place.
            </p>

            {/* Date chip + divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white/80 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentDateStr}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[80px]" />
            </div>
          </div>

          {/* Right: CTA Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={handleSimulateOrder}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-primary-500 hover:from-amber-500 hover:to-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary-900/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Simulate Order</span>
            </button>
            <Link
              to="/tiffin/daily"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold text-sm backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105"
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Daily Checklist</span>
            </Link>
          </div>
        </div>

        {/* === Bottom bar: quick stats strip === */}
        <div className="relative z-10 flex items-center gap-6 px-7 sm:px-9 py-3 border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            <span className="font-semibold text-white">Live</span>
            <span>Dashboard</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="text-xs text-white/60 font-medium">Tiffin Service Management System</div>
          <div className="ml-auto text-xs text-amber-400 font-bold hidden sm:block">v1.0</div>
        </div>
      </div>


      {/* ── 2. Unique KPI Metric Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Subscribers Card */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Customers</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1">{activeCustomers.length}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
              <span>Subscribed & Active Today</span>
            </p>
          </div>
        </div>

        {/* Deliveries Metric Card */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900/50">
              Today
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Today's Deliveries</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1">{totalTodayDeliveries}</h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden flex">
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${totalTodayDeliveries > 0 ? (lunchCount / totalTodayDeliveries) * 100 : 50}%` }}
                title={`Morning: ${lunchCount}`}
              />
              <div
                className="bg-indigo-500 h-full"
                style={{ width: `${totalTodayDeliveries > 0 ? (dinnerCount / totalTodayDeliveries) * 100 : 50}%` }}
                title={`Evening: ${dinnerCount}`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              <span className="text-amber-600 dark:text-amber-400 font-bold">☀ Morning {lunchCount}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">🌙 Evening {dinnerCount}</span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue & Collection Card */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
              {collectionPercentage}% Paid
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Collected Revenue</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1">₹{collectedMonthlyRevenue.toLocaleString()}</h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${collectionPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              Target: <span className="font-bold text-gray-700 dark:text-gray-300">₹{expectedMonthlyRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Pending Dues Alert Card */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              overdueAlerts.length > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            }`}>
              {overdueAlerts.length} Overdue
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overdue Alerts</p>
            <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">₹{overdueAlerts.reduce((s, c) => s + c.remaining, 0).toLocaleString()}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {overdueAlerts.length > 0 ? 'Requires immediate action' : 'No overdue payments'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Payment Dues Alert Highlight Banner ────────────────────── */}
      {overdueAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-950/40 dark:to-gray-800 border border-rose-200/80 dark:border-rose-900/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Pending Payment Reminders</h3>
                  <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {overdueAlerts.length} Subscribers
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click any customer to issue bill reminders</p>
              </div>
            </div>
            {notifPermission !== 'granted' ? (
              <button
                onClick={requestNotifPermission}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-300 hover:text-rose-800 font-semibold border border-rose-200 dark:border-rose-800 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-all shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                Enable Alerts
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <Bell className="w-3.5 h-3.5" /> Alerts Active
              </span>
            )}
          </div>
          <div className="divide-y divide-rose-100/60 dark:divide-rose-900/30 max-h-64 overflow-y-auto custom-scrollbar">
            {overdueAlerts.map(c => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-rose-100/30 dark:hover:bg-rose-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center flex-shrink-0 font-bold text-rose-600 dark:text-rose-300 text-sm border border-rose-200 dark:border-rose-800">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />{c.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">₹{c.remaining} due</p>
                  <p className="text-xs text-rose-400 dark:text-rose-300 flex items-center justify-end gap-1 font-medium mt-0.5">
                    <Clock className="w-3 h-3" />
                    {c.daysOverdue === 0 ? 'Due today' : `${c.daysOverdue}d overdue`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-rose-100/30 dark:bg-rose-950/60 flex items-center justify-between border-t border-rose-100 dark:border-rose-900/40">
            <p className="text-xs text-rose-700 dark:text-rose-300 font-bold">
              Total Dues: ₹{overdueAlerts.reduce((s, c) => s + c.remaining, 0).toLocaleString()}
            </p>
            <Link to="/payments/pending" className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1">
              Collect Payments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── 4. Active vs Paused Subscriber Tables ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscribers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/80 overflow-hidden flex flex-col">
          <div className="px-6 py-4.5 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent dark:from-emerald-950/20">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-pulse inline-block"></span>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Active Subscribers</h3>
              <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {activeCustomers.length}
              </span>
            </div>
            <Link to="/customers" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-bold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/60 max-h-80 overflow-y-auto custom-scrollbar flex-1">
            {activeCustomers.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-12">No active customers yet.</p>
            ) : activeCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-emerald-50/30 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shadow-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize shadow-sm border
                    ${c.plan === 'both' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                      c.plan === 'lunch' ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' :
                      'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                    {c.plan === 'lunch' ? 'Morning' : c.plan === 'dinner' ? 'Evening' : 'Both'}
                  </span>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">₹{c.monthlyPrice || '-'}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paused Subscribers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/80 overflow-hidden flex flex-col">
          <div className="px-6 py-4.5 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-slate-500/5 to-transparent dark:from-slate-900/20">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Paused Subscriptions</h3>
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {pausedCustomers.length}
              </span>
            </div>
            <Link to="/tiffin/status" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-bold flex items-center gap-1">
              Manage Status <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/60 max-h-80 overflow-y-auto custom-scrollbar flex-1">
            {pausedCustomers.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-12">No paused customers.</p>
            ) : pausedCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                    Paused
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">₹{c.monthlyPrice || '-'}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Unique Service Quick Action Hub ────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Service Action Hub</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Quick access to frequent operations</p>
          </div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-900/50">
            Shree Shyam Rasoi
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/customers"
            className="group flex flex-col items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-b from-transparent to-blue-50/40 dark:to-blue-950/30 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Add Customer</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Register subscriber</span>
          </Link>

          <Link
            to="/tiffin/daily"
            className="group flex flex-col items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 hover:border-amber-400 dark:hover:border-amber-500 bg-gradient-to-b from-transparent to-amber-50/40 dark:to-amber-950/30 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-amber-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">Daily Checklist</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Mark today's meals</span>
          </Link>

          <Link
            to="/payments/pending"
            className="group flex flex-col items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 hover:border-rose-400 dark:hover:border-rose-500 bg-gradient-to-b from-transparent to-rose-50/40 dark:to-rose-950/30 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="w-13 h-13 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-rose-500/20">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">Collect Dues</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Pending payments</span>
          </Link>

          <Link
            to="/reports/profit-loss"
            className="group flex flex-col items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 bg-gradient-to-b from-transparent to-emerald-50/40 dark:to-emerald-950/30 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Financials</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Profit & Loss summary</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
