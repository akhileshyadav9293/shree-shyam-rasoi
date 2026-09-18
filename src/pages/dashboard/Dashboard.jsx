import {
  Users, Truck, CheckSquare, IndianRupee, UserCheck, UserX,
  Bell, AlertCircle, Phone, Clock, ArrowRight, Sun, Moon,
  Utensils, Calendar, ShieldCheck, Sparkles, TrendingUp,
  ChevronLeft, ChevronRight, Pause, Play
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCustomers, getPayments } from '../../lib/store';
import { Link } from 'react-router-dom';
import { usePaymentAlerts } from '../../hooks/usePaymentAlerts';

/* ─────────────────────────────────────────────────────────────────
   Animated counter hook — counts from 0 → target on mount
   ───────────────────────────────────────────────────────────────── */
function useCounter(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─────────────────────────────────────────────────────────────────
   KPI Metric Card
   ───────────────────────────────────────────────────────────────── */
function MetricCard({ icon, iconBg, badge, badgeStyle, label, value, subContent, stagger }) {
  const count = useCounter(typeof value === 'number' ? value : 0, 1000);
  return (
    <div
      className={`group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between animate-card-in stagger-${stagger}`}
    >
      {/* Subtle decorative orb behind card */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.07] blur-2xl pointer-events-none animate-float-orb" style={{ background: iconBg }} />

      <div className="flex items-start justify-between">
        <div className={`p-3.5 rounded-2xl ring-1 group-hover:scale-110 transition-transform`} style={{ background: `${iconBg}22`, color: iconBg, ringColor: `${iconBg}33` }}>
          {icon}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
          {badge}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 animate-number-pop" style={{ animationDelay: `${stagger * 0.07 + 0.2}s` }}>
          {typeof value === 'number' ? count.toLocaleString() : value}
        </h3>
        {subContent}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Banner Slider
   ───────────────────────────────────────────────────────────────── */
function BannerSlider({ activeCount, totalDeliveries, lunchCount, dinnerCount, collectedRevenue, expectedRevenue, collectionPct, currentDateStr, onSimulateOrder }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState('right'); // 'right' | 'left'
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  const slides = [
    {
      id: 'welcome',
      gradient: 'from-gray-900/95 via-gray-900/80 to-transparent',
      accentFrom: 'from-amber-400',
      accentTo: 'to-primary-700',
      orbColor: 'bg-primary-500/20',
      badge: { icon: '🍛', text: "Today's Tiffin" },
      headline: (<>Ghar Jaisa Khana,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-primary-400">Har Roz Delivery</span></>),
      sub: 'Track deliveries, manage subscriptions & collect payments — all in one place.',
      actions: (
        <>
          <button
            onClick={onSimulateOrder}
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
        </>
      ),
      bgStyle: { filter: 'brightness(0.65) saturate(1.2)' },
    },
    {
      id: 'revenue',
      gradient: 'from-indigo-900/95 via-indigo-900/80 to-transparent',
      accentFrom: 'from-indigo-400',
      accentTo: 'to-purple-600',
      orbColor: 'bg-indigo-500/20',
      badge: { icon: '💰', text: 'Monthly Revenue' },
      headline: (<>Revenue at<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">{collectionPct}% of Target</span></>),
      sub: `Collected ₹${collectedRevenue.toLocaleString()} out of ₹${expectedRevenue.toLocaleString()} this month.`,
      actions: (
        <>
          <Link
            to="/payments/pending"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <IndianRupee className="w-4 h-4" />
            <span>Collect Dues</span>
          </Link>
          <Link
            to="/payments/billing"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold text-sm backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105"
          >
            <TrendingUp className="w-4 h-4 text-indigo-300" />
            <span>Monthly Billing</span>
          </Link>
        </>
      ),
      bgStyle: { filter: 'brightness(0.5) saturate(0.8) hue-rotate(200deg)' },
    },
    {
      id: 'deliveries',
      gradient: 'from-emerald-900/95 via-emerald-900/80 to-transparent',
      accentFrom: 'from-emerald-400',
      accentTo: 'to-teal-600',
      orbColor: 'bg-emerald-500/20',
      badge: { icon: '🚚', text: "Today's Delivery" },
      headline: (<>{totalDeliveries} Tiffins<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400">Going Out Today</span></>),
      sub: `${lunchCount} morning lunches + ${dinnerCount} evening dinners for ${activeCount} active subscribers.`,
      actions: (
        <>
          <Link
            to="/tiffin/daily"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Truck className="w-4 h-4" />
            <span>Mark Delivered</span>
          </Link>
          <Link
            to="/tiffin/status"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold text-sm backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105"
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Pause / Resume</span>
          </Link>
        </>
      ),
      bgStyle: { filter: 'brightness(0.55) saturate(0.9) hue-rotate(120deg)' },
    },
  ];

  const goTo = useCallback((idx, dir = 'right') => {
    setDirection(dir);
    setCurrent(idx);
    setAnimKey(k => k + 1);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 'right');
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'left');
  }, [current, slides.length, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const pauseTimer = () => clearInterval(timerRef.current);
  const resumeTimer = () => { timerRef.current = setInterval(next, 5000); };

  const slide = slides[current];
  const animClass = direction === 'right' ? 'animate-slide-from-right' : 'animate-slide-from-left';

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl"
      style={{ minHeight: '240px' }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      {/* Background image (shared across slides) */}
      <div className="absolute inset-0">
        <img
          src="/banner.jpg"
          alt="Shree Shyam Rasoi"
          className="w-full h-full object-cover object-center animate-banner-pan"
          style={slide.bgStyle}
        />
      </div>

      {/* Gradient overlay */}
      <div key={`grad-${animKey}`} className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

      {/* Brand accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${slide.accentFrom} ${slide.accentTo} rounded-l-3xl`} />

      {/* Dot grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Animated glowing orbs */}
      <div key={`orb1-${animKey}`} className={`absolute -top-12 left-1/3 w-56 h-56 rounded-full ${slide.orbColor} blur-3xl pointer-events-none animate-float-orb`} />
      <div key={`orb2-${animKey}`} className={`absolute -bottom-10 left-1/4 w-40 h-40 rounded-full ${slide.orbColor} blur-2xl pointer-events-none animate-float-orb-slow`} />

      {/* Decorative spinning rings */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-4 border-white/10 hidden xl:block pointer-events-none animate-spin-slow" />
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-white/5 hidden xl:block pointer-events-none animate-spin-slow-reverse" />

      {/* Floating badge */}
      <div className="absolute top-5 right-16 hidden sm:flex items-center gap-1.5 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider animate-float-badge">
        <span>{slide.badge.icon}</span>
        <span>{slide.badge.text}</span>
      </div>

      {/* ── Slide Content ── */}
      <div key={animKey} className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 lg:p-9 text-white ${animClass}`}>
        {/* Left: Text Block */}
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 animate-hero-text" style={{ animationDelay: '0.05s' }}>
            <div className="w-6 h-6 rounded-lg overflow-hidden shadow-md flex-shrink-0">
              <img src="/shree-shyam-rasoi-logo.svg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.15em]">Shree Shyam Rasoi</span>
          </div>

          <div className="animate-hero-text" style={{ animationDelay: '0.12s' }}>
            <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black leading-tight tracking-tight text-white drop-shadow-xl">
              {slide.headline}
            </h1>
          </div>

          <p className="text-gray-300 text-sm max-w-sm leading-relaxed animate-hero-text" style={{ animationDelay: '0.2s' }}>
            {slide.sub}
          </p>

          <div className="flex items-center gap-3 pt-1 animate-hero-text" style={{ animationDelay: '0.27s' }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white/80 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentDateStr}</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[80px]" />
          </div>
        </div>

        {/* Right: CTA Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 animate-hero-text" style={{ animationDelay: '0.3s' }}>
          {slide.actions}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="relative z-10 flex items-center gap-4 px-7 sm:px-9 py-3 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-xs text-white/70">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="font-semibold text-white">Live</span>
          <span>Dashboard</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <div className="text-xs text-white/60 font-medium">Tiffin Service Management</div>

        {/* Dot indicators */}
        <div className="ml-auto flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i, i > current ? 'right' : 'left')}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-amber-400 animate-dot-active'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Dashboard
   ───────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);

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
  const lunchCount  = activeCustomers.filter(c => c.plan === 'lunch'  || c.plan === 'both').length;
  const dinnerCount = activeCustomers.filter(c => c.plan === 'dinner' || c.plan === 'both').length;
  const totalTodayDeliveries = lunchCount + dinnerCount;

  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

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

  const { alerts: overdueAlerts, notifPermission, requestNotifPermission } = usePaymentAlerts();

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
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
    const randomName  = names[Math.floor(Math.random() * names.length)];
    if (Notification.permission === 'granted') {
      new Notification(`New Order: ${randomName}`, { body: `Order Details: ${randomOrder}`, icon: '/vite.svg' });
    } else {
      alert(`🔔 New Order Received!\n\n${randomName} ordered: ${randomOrder}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton banner */}
        <div className="h-60 rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── 1. Animated Banner Slider ─────────────────────────── */}
      <BannerSlider
        activeCount={activeCustomers.length}
        totalDeliveries={totalTodayDeliveries}
        lunchCount={lunchCount}
        dinnerCount={dinnerCount}
        collectedRevenue={collectedMonthlyRevenue}
        expectedRevenue={expectedMonthlyRevenue}
        collectionPct={collectionPercentage}
        currentDateStr={currentDateStr}
        onSimulateOrder={handleSimulateOrder}
      />

      {/* ── 2. KPI Metric Cards with staggered entrance ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Active Subscribers */}
        <div className={`group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between animate-card-in stagger-1`}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none animate-float-orb" />
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
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 animate-number-pop stagger-1">{activeCustomers.length}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Subscribed & Active Today</p>
          </div>
        </div>

        {/* Today's Deliveries */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between animate-card-in stagger-2">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary-400/10 blur-2xl pointer-events-none animate-float-orb-slow" />
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
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 animate-number-pop stagger-2">{totalTodayDeliveries}</h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden flex animate-shimmer">
              <div className="bg-amber-500 h-full transition-all duration-700" style={{ width: `${totalTodayDeliveries > 0 ? (lunchCount / totalTodayDeliveries) * 100 : 50}%` }} title={`Morning: ${lunchCount}`} />
              <div className="bg-indigo-500 h-full transition-all duration-700" style={{ width: `${totalTodayDeliveries > 0 ? (dinnerCount / totalTodayDeliveries) * 100 : 50}%` }} title={`Evening: ${dinnerCount}`} />
            </div>
            <div className="flex justify-between text-[11px] mt-1.5 font-medium">
              <span className="text-amber-600 dark:text-amber-400 font-bold">☀ Morning {lunchCount}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">🌙 Evening {dinnerCount}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between animate-card-in stagger-3">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none animate-float-orb" />
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
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 animate-number-pop stagger-3">₹{collectedMonthlyRevenue.toLocaleString()}</h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden animate-shimmer">
              <div className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-700" style={{ width: `${collectionPercentage}%` }} />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              Target: <span className="font-bold text-gray-700 dark:text-gray-300">₹{expectedMonthlyRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Overdue Alerts */}
        <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between animate-card-in stagger-4">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-rose-400/10 blur-2xl pointer-events-none animate-float-orb-slow" />
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
            <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 animate-number-pop stagger-4">
              ₹{overdueAlerts.reduce((s, c) => s + c.remaining, 0).toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {overdueAlerts.length > 0 ? 'Requires immediate action' : 'No overdue payments'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Payment Dues Alert ──────────────────────────────── */}
      {overdueAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-950/40 dark:to-gray-800 border border-rose-200/80 dark:border-rose-900/60 rounded-3xl overflow-hidden shadow-sm animate-card-in stagger-5">
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

      {/* ── 4. Active vs Paused Subscriber Tables ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscribers */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/80 overflow-hidden flex flex-col animate-card-in stagger-5">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent dark:from-emerald-950/20">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-pulse inline-block" />
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
            ) : activeCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-emerald-50/30 dark:hover:bg-gray-700/40 transition-colors animate-card-in" style={{ animationDelay: `${i * 0.04}s` }}>
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
                    ${c.plan === 'both'   ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                      c.plan === 'lunch'  ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' :
                      'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                    {c.plan === 'lunch' ? 'Morning' : c.plan === 'dinner' ? 'Evening' : 'Both'}
                  </span>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">₹{c.monthlyPrice || '-'}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paused Subscribers */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/80 overflow-hidden flex flex-col animate-card-in stagger-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-slate-500/5 to-transparent dark:from-slate-900/20">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
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
            ) : pausedCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors animate-card-in" style={{ animationDelay: `${i * 0.04}s` }}>
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

      {/* ── 5. Service Action Hub ──────────────────────────────── */}
      <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/80 overflow-hidden animate-card-in stagger-6">
        {/* Decorative background orbs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary-500/5 blur-3xl pointer-events-none animate-float-orb" />
        <div className="absolute -bottom-8 left-1/4 w-36 h-36 rounded-full bg-amber-400/5 blur-2xl pointer-events-none animate-float-orb-slow" />

        <div className="relative flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Service Action Hub</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Quick access to frequent operations</p>
          </div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-900/50">
            Shree Shyam Rasoi
          </span>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/customers',          color: 'blue',    icon: <Users className="w-6 h-6" />,       label: 'Add Customer',    sub: 'Register subscriber',  delay: '0.05s' },
            { to: '/tiffin/daily',       color: 'amber',   icon: <CheckSquare className="w-6 h-6" />, label: 'Daily Checklist', sub: "Mark today's meals",  delay: '0.10s' },
            { to: '/payments/pending',   color: 'rose',    icon: <IndianRupee className="w-6 h-6" />, label: 'Collect Dues',    sub: 'Pending payments',     delay: '0.15s' },
            { to: '/reports/profit-loss',color: 'emerald', icon: <TrendingUp className="w-6 h-6" />,  label: 'Financials',      sub: 'Profit & Loss summary',delay: '0.20s' },
          ].map(({ to, color, icon, label, sub, delay }) => (
            <Link
              key={to}
              to={to}
              style={{ animationDelay: delay }}
              className={`group flex flex-col items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 hover:border-${color}-400 dark:hover:border-${color}-500 bg-gradient-to-b from-transparent to-${color}-50/40 dark:to-${color}-950/30 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 text-center animate-card-in`}
            >
              <div className={`w-13 h-13 rounded-2xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-${color}-500/20`}>
                {icon}
              </div>
              <span className={`text-sm font-extrabold text-gray-800 dark:text-gray-100 group-hover:text-${color}-600 dark:group-hover:text-${color}-400`}>{label}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
