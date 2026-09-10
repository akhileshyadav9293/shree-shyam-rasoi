import { useState, useEffect } from 'react';
import { getCustomers, getPayments } from '../../lib/store';
import { IndianRupee, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

export default function MonthlyBilling() {
  const [stats, setStats] = useState({
    expected: 0,
    collected: 0,
    pending: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [custData, payData] = await Promise.all([getCustomers(), getPayments()]);
    
    // Calculate expected revenue from active customers
    const expected = custData
      .filter(c => c.status !== 'paused')
      .reduce((sum, c) => sum + Number(c.monthlyPrice || c.rate || 0), 0);

    // Calculate collected revenue for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
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
      pending: expected - collected > 0 ? expected - collected : 0
    });
  };

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Monthly Billing Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Billing summary for {currentMonthName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" /> {stats.expected}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collected</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" /> {stats.collected}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" /> {stats.pending}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Automated Billing Coming Soon</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          In the future, you'll be able to generate PDF invoices and send automated WhatsApp reminders directly from this page!
        </p>
        <button disabled className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium py-2 px-6 rounded-lg cursor-not-allowed">
          Generate Bills (Locked)
        </button>
      </div>
    </div>
  );
}
