import { useState, useEffect } from 'react';
import { getCustomers, getPayments, addPayment } from '../../lib/store';
import { IndianRupee, CheckCircle2 } from 'lucide-react';

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

  // Basic logic to determine if paid this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const pendingList = customers.filter(c => {
    // Check if there is a payment in the current month for this customer
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : pendingList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-12 h-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
            <p>All customers are paid up for this month!</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Amount Due</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{c.name}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{c.plan}</td>
                  <td className="p-4 font-bold text-primary-600 dark:text-primary-400">₹{c.monthlyPrice}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleMarkPaid(c.id, c.monthlyPrice)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/60 rounded-lg text-sm font-medium transition-colors"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>Mark Paid</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
