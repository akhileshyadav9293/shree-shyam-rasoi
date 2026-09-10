import { useState, useEffect } from 'react';
import { getCustomers, getPayments } from '../../lib/store';
import { IndianRupee, PieChart, TrendingUp, AlertCircle, MessageCircle, Share2, Copy, Printer, Check, Search, Phone } from 'lucide-react';
import PrintableBill from '../../components/PrintableBill';

export default function MonthlyBilling() {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [printingCustomer, setPrintingCustomer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [stats, setStats] = useState({
    expected: 0,
    collected: 0,
    pending: 0,
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [custData, payData] = await Promise.all([getCustomers(), getPayments()]);
    setCustomers(custData);
    setPayments(payData);

    const activeList = custData.filter(c => c.status !== 'paused');
    const expected = activeList.reduce((sum, c) => sum + Number(c.monthlyPrice || 0), 0);

    const collected = payData.reduce((sum, p) => {
      const pDate = new Date(p.date);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        return sum + Number(p.amount || 0);
      }
      return sum;
    }, 0);

    setStats({
      expected,
      collected,
      pending: Math.max(0, expected - collected),
    });
    setLoading(false);
  };

  const generateBillText = (c) => {
    const shiftText = c.plan === 'lunch' ? 'Lunch Only (Morning)' :
      c.plan === 'dinner' ? 'Dinner Only (Evening)' : 'Both (Morning & Evening)';
    const serviceText = c.serviceType === 'weekly' ? 'Weekly' : c.serviceType === 'custom' ? 'Custom' : 'Monthly';
    const rem = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));

    let adjustmentText = '';
    if (c.skippedDays > 0 || Number(c.adjustmentAmount) > 0) {
      adjustmentText = `\n🗓 Skipped Days: ${c.skippedDays || 0} days\n⚖️ Adjustment: - ₹${c.adjustmentAmount || 0}`;
    }

    return (
`🍱 *SHREE SHYAM RASOI* — Monthly Bill
📅 *Month:* ${currentMonthName}

Namaste *${c.name}* ji! 🙏
Aapke tiffin subscription ka is mahine ka bill:

📋 Plan: ${shiftText}
🔁 Service: ${serviceText}
💰 Daily Rate: ₹${c.tiffinRate || 0} / tiffin
📅 Base Amount: ₹${c.monthlyAmount || 0}${adjustmentText}
🎁 Discount: ₹${c.discount || 0}
✅ *Total Payable: ₹${c.monthlyPrice || 0}*

💸 Advance Paid: ₹${c.advance || 0}
🔴 *Balance Due: ₹${rem}*

📍 Delivery: ${c.address}

Kripya payment samay par karein.
UPI / Cash accept kiya jata hai.
📞 Contact: +91 9165360293
Dhanyawaad! 🙏`
    );
  };

  const handleSendWhatsApp = (c) => {
    const text = generateBillText(c);
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async (c) => {
    const text = generateBillText(c);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shree Shyam Rasoi - Bill for ${c.name}`,
          text: text,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    handleSendWhatsApp(c);
  };

  const handleCopyBill = (c) => {
    const text = generateBillText(c);
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = (c) => {
    setPrintingCustomer(c);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PrintableBill customer={printingCustomer} />

      <div className="no-print">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Monthly Billing &amp; Invoices</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Billing summary and 1-click WhatsApp bill dispatch for {currentMonthName}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Expected Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center mt-0.5">
                <IndianRupee className="w-5 h-5 mr-0.5" /> {stats.expected.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Collected This Month</p>
              <h3 className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center mt-0.5">
                <IndianRupee className="w-5 h-5 mr-0.5" /> {stats.collected.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pending Balance</p>
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400 flex items-center mt-0.5">
                <IndianRupee className="w-5 h-5 mr-0.5" /> {stats.pending.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        {/* Customer Bills Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customers to send bill..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">
              {filteredCustomers.length} Subscribers
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading bills...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Total Bill</th>
                    <th className="p-4">Advance Paid</th>
                    <th className="p-4">Balance Due</th>
                    <th className="p-4 text-right">Send Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {filteredCustomers.map(c => {
                    const rem = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
                    const isCopied = copiedId === c.id;

                    return (
                      <tr key={c.id} className="hover:bg-primary-50/20 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {c.phone}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-xs font-bold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                            {c.plan}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-800 dark:text-gray-200 text-sm">
                          ₹{c.monthlyPrice || 0}
                        </td>
                        <td className="p-4 font-semibold text-green-600 dark:text-green-400 text-sm">
                          ₹{c.advance || 0}
                        </td>
                        <td className="p-4">
                          <span className={`font-black text-sm ${rem > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {rem > 0 ? `₹${rem}` : 'Paid ✓'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp Send Button */}
                            <button
                              onClick={() => handleSendWhatsApp(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                              title="Send Bill on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>

                            {/* Native Share / App */}
                            <button
                              onClick={() => handleNativeShare(c)}
                              className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-xs transition-colors"
                              title="Share via Any App / SMS"
                            >
                              <Share2 className="w-3.5 h-3.5 text-blue-500" />
                            </button>

                            {/* Copy Bill Text */}
                            <button
                              onClick={() => handleCopyBill(c)}
                              className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-xs transition-colors"
                              title="Copy Bill Message"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {/* Print Bill */}
                            <button
                              onClick={() => handlePrint(c)}
                              className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-xs transition-colors"
                              title="Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
