import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Phone, MapPin, Utensils, IndianRupee, Share2, MessageCircle, Mail, Copy, X, Search, SlidersHorizontal, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Users, Calendar, Printer, MessageSquare, RefreshCw } from 'lucide-react';
import { deleteCustomer, getCustomers } from '../../lib/store';
import { apiSendDirectSms } from '../../lib/api';
import { useCustomers, PAGE_SIZE_OPTIONS } from '../../hooks/useCustomers';
import PrintableBill from '../../components/PrintableBill';

export default function Customers() {
  const navigate = useNavigate();
  // ── Paginated/filtered query hook ─────────────────────
  const {
    customers, total, totalPages, loading, error,
    search, setSearch,
    status: filterStatus, setStatus: setFilterStatus,
    plan: filterPlan, setPlan: setFilterPlan,
    serviceType: filterServiceType, setServiceType: setFilterServiceType,
    sortBy, sortDir, toggleSort,
    page, setPage,
    pageSize, setPageSize,
    reload,
  } = useCustomers(20);

  // ── Bulk list for share-all (always needs full active list) ─
  const [allActiveCustomers, setAllActiveCustomers] = useState([]);
  useEffect(() => {
    getCustomers().then(all => setAllActiveCustomers(all.filter(c => c.status !== 'paused')));
  }, [customers]); // refresh when page data changes

  const [showFilters, setShowFilters] = useState(false);
  const [printingCustomer, setPrintingCustomer] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
      await reload();
    }
  };

  const handlePrint = (c) => {
    setPrintingCustomer(c);
    setShareMenu(null);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // --- Share Bill ---
  const [shareMenu, setShareMenu] = useState(null); // customer id of open menu
  const shareRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) setShareMenu(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const generateBillMessage = (c) => {
    const planLabel = c.plan === 'lunch' ? 'Lunch Only (Morning)' :
      c.plan === 'dinner' ? 'Dinner Only (Evening)' : 'Both (Morning & Evening)';

    const serviceLabel = c.serviceType === 'weekly' ? 'Weekly' : c.serviceType === 'custom' ? 'Custom' : 'Monthly';

    const remaining = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
    
    let adjustmentText = '';
    if (c.skippedDays > 0 || c.adjustmentAmount !== 0) {
      adjustmentText = `
🗓 Last Month Skipped: ${c.skippedDays || 0} days
⚖️ Bill Adjustment: ₹${c.adjustmentAmount || 0}
`;
    }

    return (
      `🍱 *Shree Shyam Rasoi*
${serviceLabel} Bill - ${currentMonthName}

Dear *${c.name}*,

Your tiffin bill details:

📋 Plan: ${planLabel}
🔁 Service: ${serviceLabel}
💰 Tiffin Rate: ₹${c.tiffinRate || '-'} / day
📅 Base Amount: ₹${c.monthlyAmount || '-'}${adjustmentText}
🎁 Discount: ₹${c.discount || 0}
✅ *Total Payable: ₹${c.monthlyPrice || '-'}*

💸 Advance Paid: ₹${c.advance || 0}
🔴 *Remaining Due: ₹${remaining}*

📍 Address: ${c.address}

Please make payment at the earliest.
Thank you! 🙏`
    );
  };

  const handleShareWhatsApp = (c) => {
    const msg = generateBillMessage(c);
    const cleanPhone = c.phone.replace(/\D/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setShareMenu(null);
  };

  const handleDirectSmsBill = async (c) => {
    const remaining = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
    const msg = `Shree Shyam Rasoi: Namaste ${c.name} ji, ${currentMonthName} month tiffin bill is Rs.${c.monthlyPrice || 0}. Advance: Rs.${c.advance || 0}, Due: Rs.${remaining}. Kripya payment samay par karein. UPI: 9165360293. Dhanyawaad!`;
    setShareMenu(null);
    try {
      const res = await apiSendDirectSms(c.phone, msg);
      alert(`✅ ${res.message || 'Direct SMS sent successfully to customer!'}`);
    } catch (err) {
      alert(`❌ Failed to send SMS: ${err.message}\n\nPlease check your Fast2SMS API key in SMS Gateway Settings.`);
    }
  };

  const handleShareEmail = (c) => {
    const msg = generateBillMessage(c);
    const subject = `Shree Shyam Rasoi - Monthly Bill (${currentMonthName})`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setShareMenu(null);
  };

  const handleShareSMS = (c) => {
    const msg = generateBillMessage(c);
    const phone = c.phone.replace(/\D/g, '');
    const url = `sms:${phone}?body=${encodeURIComponent(msg)}`;
    window.open(url);
    setShareMenu(null);
  };

  const handleCopyBill = (c) => {
    navigator.clipboard.writeText(generateBillMessage(c));
    alert('Bill copied to clipboard!');
    setShareMenu(null);
  };

  // --- Bulk Share All Bills ---
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0); // current customer index in sequential WA send
  const [bulkSent, setBulkSent] = useState({}); // { customerId: true } for sent ones

  const activeCustomers = allActiveCustomers;

  const openBulkModal = () => {
    setBulkIndex(0);
    setBulkSent({});
    setBulkModal(true);
  };

  const handleBulkSendWhatsApp = (c, idx) => {
    handleShareWhatsApp(c);
    setBulkSent(prev => ({ ...prev, [c.id]: true }));
    if (idx + 1 < activeCustomers.length) setBulkIndex(idx + 1);
  };

  const handleCopyAllBills = () => {
    const allBills = activeCustomers
      .map((c, i) => `${'─'.repeat(40)}\n[${i + 1}] ${generateBillMessage(c)}`)
      .join('\n\n');
    navigator.clipboard.writeText(allBills);
    alert(`All ${activeCustomers.length} bills copied to clipboard!`);
  };

  // ── Sort column header helper ─────────────────────────
  const SortTh = ({ field, label }) => (
    <th
      className="p-4 font-semibold whitespace-nowrap cursor-pointer select-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortBy === field
          ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <span className="w-3 h-3 text-gray-300 dark:text-gray-600"><ChevronDown className="w-3 h-3" /></span>}
      </span>
    </th>
  );

  // ── Loading skeleton rows ─────────────────────────────
  const SkeletonRow = () => (
    <tr className="border-b border-gray-50 dark:border-gray-700/60 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );

  return (
    <>
      <PrintableBill customer={printingCustomer} />
      <div className="no-print">
        {/* ── Page Header ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Customers</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {loading ? 'Loading...' : `${total.toLocaleString()} subscriber${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={openBulkModal}
              disabled={allActiveCustomers.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share All Bills</span>
            </button>
            <button
              onClick={() => navigate('/customers/new')}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 via-orange-500 to-amber-500 hover:from-primary-700 hover:via-orange-600 hover:to-amber-600 active:scale-95 shadow-md hover:shadow-lg text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* ── Search + Filter Bar ───────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone, or address…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'border-primary-400 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-3 py-2.5 outline-none text-gray-600 dark:text-gray-200"
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-3 py-2 outline-none text-gray-600 dark:text-gray-200">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-3 py-2 outline-none text-gray-600 dark:text-gray-200">
                <option value="all">All Plans</option>
                <option value="lunch">Lunch Only</option>
                <option value="dinner">Dinner Only</option>
                <option value="both">Both</option>
              </select>
              <select value={filterServiceType} onChange={e => setFilterServiceType(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-3 py-2 outline-none text-gray-600 dark:text-gray-200">
                <option value="all">All Service Types</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              {(filterStatus !== 'all' || filterPlan !== 'all' || filterServiceType !== 'all' || search) && (
                <button
                  onClick={() => { setFilterStatus('all'); setFilterPlan('all'); setFilterServiceType('all'); setSearch(''); }}
                  className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 font-medium px-3 py-2 border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 rounded-lg"
                >Clear All</button>
              )}
            </div>
          )}
        </div>

        {/* ── Customer Table ────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
          {error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>
          ) : !loading && customers.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-gray-400 dark:text-gray-500 gap-3">
              <Users className="w-10 h-10" />
              <p className="font-medium">No customers found</p>
              <p className="text-sm">{search || filterStatus !== 'all' || filterPlan !== 'all' ? 'Try clearing filters' : "Click 'Add Customer' to get started"}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                  <SortTh field="name" label="Name" className='whitespace-nowrap' />
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Plan & Service</th>
                  <SortTh field="tiffinRate" label="Tiffin Rate" />
                  <SortTh field="monthlyPrice" label="Billing Amount" />
                  <SortTh field="advance" label="Advance" />
                  <th className="p-4 font-semibold">Remaining</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : customers.map((c) => {
                    const rem = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
                    return (
                      <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-primary-50/30 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                          <button onClick={() => navigate(`/customers/${c.id}`)} className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline text-left font-semibold transition-colors">
                            {c.name}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center"><Phone className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />{c.phone}</span>
                            <span className="flex items-center"><MapPin className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />{c.address}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`capitalize px-3 py-1.5 rounded-md text-xs font-bold w-fit shadow-sm border
                          ${c.plan === 'both' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                c.plan === 'lunch' ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' :
                                  'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                              {c.plan}
                            </span>
                            <span className="capitalize px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs font-medium w-fit flex items-center gap-1 shadow-sm">
                              <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              {c.serviceType || 'monthly'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Utensils className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500" /> ₹{c.tiffinRate || '-'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-800 dark:text-gray-100">₹{c.monthlyPrice || '-'}</td>
                        <td className="p-4 font-medium text-green-600 dark:text-green-400">₹{c.advance || 0}</td>
                        <td className="p-4">
                          <span className={`font-bold ${rem > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            ₹{rem}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-1 items-center relative" ref={shareMenu === c.id ? shareRef : null}>
                            {/* Share Bill Button */}
                            <button
                              onClick={() => setShareMenu(shareMenu === c.id ? null : c.id)}
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                              title="Share Bill"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            {/* Share Dropdown */}
                            {shareMenu === c.id && (
                              <div className="absolute right-10 top-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-52 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Share / Print Bill</p>
                                  <button onClick={() => setShareMenu(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <button onClick={() => handleShareWhatsApp(c)}
                                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors text-left">
                                  <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">WhatsApp</span>
                                </button>
                                <button onClick={() => handleDirectSmsBill(c)}
                                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left">
                                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Direct SMS (Fast2SMS)</span>
                                </button>
                                <button onClick={() => handleShareEmail(c)}
                                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left">
                                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</span>
                                </button>
                                <button onClick={() => handleShareSMS(c)}
                                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors text-left">
                                  <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">SMS / Number</span>
                                </button>
                                <button onClick={() => handleCopyBill(c)}
                                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700">
                                  <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Copy to Clipboard</span>
                                </button>
                                <button onClick={() => handlePrint(c)}
                                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700">
                                  <Printer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Print Bill</span>
                                </button>
                              </div>
                            )}

                            <button onClick={() => navigate(`/customers/${c.id}`)} className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-gray-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination Bar ───────────────────────────── */}
        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-semibold text-gray-700 dark:text-gray-200">{total.toLocaleString()}</span> customers
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >«</button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              ><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${p === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              ><ChevronRight className="w-4 h-4" /></button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >»</button>
            </div>
          </div>
        )}
      </div>



      {/* ======= BULK SHARE ALL BILLS MODAL ======= */}
      {bulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-green-50 dark:bg-green-900/20">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-green-600 dark:text-green-500" /> Share All Monthly Bills
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{currentMonthName} · {activeCustomers.length} active customers</p>
              </div>
              <button onClick={() => setBulkModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCopyAllBills}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Copy All Bills
              </button>
              <span className="text-gray-400 dark:text-gray-500 text-xs">or send one by one via WhatsApp ↓</span>
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50 custom-scrollbar">
              {activeCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500">No active customers.</div>
              ) : activeCustomers.map((c, idx) => {
                const rem = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
                const isSent = bulkSent[c.id];
                const isCurrent = idx === bulkIndex;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between px-6 py-4 transition-colors ${isCurrent ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : isSent ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSent ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {isSent ? '✓' : idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{c.phone} · ₹{c.monthlyPrice || '-'}/mo · Due: <span className={rem > 0 ? 'text-red-500 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-500'}>₹{rem}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkSendWhatsApp(c, idx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSent
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
                          : isCurrent
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200 dark:shadow-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {isSent ? 'Sent ✓' : isCurrent ? 'Send Now →' : 'WhatsApp'}
                      </button>
                      <button
                        onClick={() => handleCopyBill(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Copy this bill"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Object.keys(bulkSent).length} of {activeCustomers.length} sent
              </p>
              <button
                onClick={() => setBulkModal(false)}
                className="px-5 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
