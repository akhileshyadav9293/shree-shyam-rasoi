import { useState } from 'react';
import { addExpense } from '../../lib/store';
import { Wallet, Tag, FileText, Calendar } from 'lucide-react';

export default function AddExpense() {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'groceries',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExpense(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setFormData({ amount: '', category: 'groceries', description: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add Expense</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Record your daily business expenses</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg flex items-center">
          Expense recorded successfully!
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <Wallet className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" /> Amount (₹)
              </label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" /> Date
              </label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <Tag className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" /> Category
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="groceries">Groceries (Oil, Rice, Dal, Flours etc.)</option>
              <option value="vegetables">Vegetables (Sabzi)</option>
              <option value="dairy">Dairy & Milk</option>
              <option value="packaging">Packaging Materials</option>
              <option value="gas">Gas</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" /> Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="e.g. Bought tomatoes and onions from local market"
            ></textarea>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary-600 via-orange-500 to-amber-500 hover:from-primary-700 hover:via-orange-600 hover:to-amber-600 active:scale-98 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
