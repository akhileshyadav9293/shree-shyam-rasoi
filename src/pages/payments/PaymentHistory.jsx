import { useState, useEffect } from 'react';
import { getCustomers, getPayments } from '../../lib/store';
import { IndianRupee, Calendar } from 'lucide-react';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [custData, payData] = await Promise.all([getCustomers(), getPayments()]);
    setCustomers(custData);
    
    // Sort payments by date descending (newest first)
    const sortedPayments = payData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPayments(sortedPayments);
  };

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payment History</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Record of all received payments</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No payment history available.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer Name</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {new Date(p.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{getCustomerName(p.customerId)}</td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{p.description || 'Monthly Subscription Payment'}</td>
                  <td className="p-4 font-bold text-green-600 dark:text-green-400 text-right">
                    <div className="flex items-center justify-end">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {p.amount}
                    </div>
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
