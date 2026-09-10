import { useState, useEffect } from 'react';
import { getPayments, getExpenses } from '../../lib/store';
import { IndianRupee, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function ProfitLoss() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [payData, expData] = await Promise.all([getPayments(), getExpenses()]);
    
    // Sum all payments
    const totalIncome = payData.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    // Sum all expenses
    const totalExpenses = expData.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    setStats({
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses
    });
  };

  const isProfitable = stats.profit >= 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profit & Loss</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overall business financial health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" /> {stats.totalIncome}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" /> {stats.totalExpenses}
            </h3>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border ${isProfitable ? 'border-green-100 dark:border-green-900/50' : 'border-red-100 dark:border-red-900/50'} flex items-center space-x-4`}>
          <div className={`p-4 rounded-full ${isProfitable ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
            {isProfitable ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit / Loss</p>
            <h3 className={`text-2xl font-bold flex items-center ${isProfitable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-400'}`}>
              <IndianRupee className="w-5 h-5 mr-1" /> {Math.abs(stats.profit)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
