import { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../../lib/store';
import { IndianRupee, Calendar, Trash2 } from 'lucide-react';

export default function ExpenseHistory() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const now = new Date();
  const [filterMode, setFilterMode] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(now.getMonth() / 3)); // 0-3
  const [selectedHalf, setSelectedHalf] = useState(Math.floor(now.getMonth() / 6)); // 0-1
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getExpenses();
    // Sort descending by date
    setExpenses(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
      await loadData();
    }
  };

  // Filter logic
  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      if (filterMode === 'all') return true;

      const expDate = new Date(exp.date);
      const expMonth = expDate.getMonth();
      const expYear = expDate.getFullYear();

      if (expYear !== selectedYear) return false;

      if (filterMode === 'monthly') {
        return expMonth === selectedMonth;
      }
      if (filterMode === 'quarterly') {
        const expQuarter = Math.floor(expMonth / 3);
        return expQuarter === selectedQuarter;
      }
      if (filterMode === 'half_yearly') {
        const expHalf = Math.floor(expMonth / 6);
        return expHalf === selectedHalf;
      }
      if (filterMode === 'yearly') {
        return true;
      }
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // Calculate total for currently filtered expenses
  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  // Get unique years from expenses for the year dropdown
  const availableYears = [...new Set(expenses.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
  if (!availableYears.includes(now.getFullYear())) availableYears.unshift(now.getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const quarters = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];
  const halfYears = ['H1 (Jan-Jun)', 'H2 (Jul-Dec)'];

  const getFilterLabel = () => {
    if (filterMode === 'all') return "All Time";
    if (filterMode === 'yearly') return `${selectedYear}`;
    if (filterMode === 'half_yearly') return `${halfYears[selectedHalf]} ${selectedYear}`;
    if (filterMode === 'quarterly') return `${quarters[selectedQuarter].split(' ')[0]} ${selectedYear}`;
    if (filterMode === 'monthly') return `${months[selectedMonth]} ${selectedYear}`;
    return "Filtered";
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Expense History</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review all your recorded expenses</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          {/* Main Filter Mode Dropdown */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
            </div>
            <select 
              value={filterMode} 
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-4 py-2 outline-none text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half Yearly</option>
              <option value="yearly">Yearly</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Dynamic Sub-filters based on mode */}
          {filterMode !== 'all' && (
            <div className="flex items-center gap-2">
              {filterMode === 'monthly' && (
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-red-400">
                  {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              )}
              {filterMode === 'quarterly' && (
                <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(Number(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-red-400">
                  {quarters.map((q, i) => <option key={i} value={i}>{q}</option>)}
                </select>
              )}
              {filterMode === 'half_yearly' && (
                <select value={selectedHalf} onChange={(e) => setSelectedHalf(Number(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-red-400">
                  {halfYears.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              )}
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-red-400 font-medium">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {/* Dynamic Total Card */}
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-sm w-full sm:w-auto ml-auto">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">{getFilterLabel()} Expenses</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">₹{filteredTotal}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No expenses found for {getFilterLabel()}.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {new Date(e.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{e.description || '-'}</td>
                  <td className="p-4 font-bold text-red-600 dark:text-red-400 text-right">
                    <div className="flex items-center justify-end">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {e.amount}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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
