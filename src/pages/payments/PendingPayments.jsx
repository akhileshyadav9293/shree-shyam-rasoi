import { useState, useEffect } from 'react';
import { getCustomers, getPayments, addPayment } from '../../lib/store';
import { IndianRupee, CheckCircle2, MessageCircle, Phone, Share2 } from 'lucide-react';

export default function PendingPayments() {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [custData, payData] = await Promise.all([getCustomers(), getPayments()]);
    setCustomers(custData);
    setPayments(payData);
    setLoading(false);
  };

  const handleMarkPaid = async (customerId, amount) => {
    if (confirm(`Mark ₹${amount} as paid for this month?`)) {
      await addPayment({
        customerId,
        amount,
        date: new Date().toISOString(),
        description: 'Monthly Subscription Payment'
      });
      await loadData();
    }
  };

  const handleSendReminder = (c) => {
    const remaining = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
    const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const msg = 
`🍱 *SHREE SHYAM RASOI* — Payment Reminder 🙏
📅 *Month:* ${currentMonthName}

Namaste *${c.name}* ji,
Aapka tiffin subscription ka is mahine ka bill pending hai:

💰 Total Amount: ₹${c.monthlyPrice || 0}
💸 Advance Paid: ₹${c.advance || 0}
🔴 *Total Due: ₹${remaining}*

Kripya payment samay par karein.
UPI / Cash accept kiya jata hai.
Google Pay / PhonePe: +91 9165360293

Dhanyawaad! 🙏`;

    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Basic logic to determine if paid this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const pendingList = customers.filter(c => {
    const hasPaid = payments.some(p => {
      if (p.customerId !== c.id) return false;
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });
    return !hasPaid;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pending Payments</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Customers who haven't paid for the current month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : pendingList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-14 h-14 text-green-400 dark:text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">All Caught Up!</h3>
            <p className="text-sm mt-1">All customers have cleared their dues for this month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount Due</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                {pendingList.map((c) => {
                  const rem = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{c.plan}</td>
                      <td className="p-4 font-black text-red-600 dark:text-red-400 text-base">₹{rem || c.monthlyPrice}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendReminder(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Remind on WhatsApp</span>
                          </button>

                          <button 
                            onClick={() => handleMarkPaid(c.id, rem || c.monthlyPrice)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800"
                          >
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
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
  );
}
