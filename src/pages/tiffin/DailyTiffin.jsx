import { useState, useEffect } from 'react';
import { getCustomers, getDeliveriesByDate, saveDeliveriesByDate } from '../../lib/store';
import { Check } from 'lucide-react';

export default function DailyTiffin() {
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    const allCustomers = await getCustomers();
    // Only show active customers for daily tiffin
    setActiveCustomers(allCustomers.filter(c => c.status !== 'paused'));
    
    const todayDeliveries = await getDeliveriesByDate(selectedDate);
    setDeliveries(todayDeliveries);
  };

  const handleToggleDelivery = async (customerId, mealType) => {
    const updatedDeliveries = { ...deliveries };
    if (!updatedDeliveries[customerId]) {
      updatedDeliveries[customerId] = { lunch: false, dinner: false };
    }
    
    updatedDeliveries[customerId][mealType] = !updatedDeliveries[customerId][mealType];
    
    setDeliveries(updatedDeliveries);
    await saveDeliveriesByDate(selectedDate, updatedDeliveries);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Daily Tiffin Checklist</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Mark deliveries for active customers</p>
        </div>
        <div>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {activeCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No active customers to deliver to today.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold text-center">Lunch Delivery</th>
                <th className="p-4 font-semibold text-center">Dinner Delivery</th>
              </tr>
            </thead>
            <tbody>
              {activeCustomers.map((c) => {
                const deliveryStatus = deliveries[c.id] || { lunch: false, dinner: false };
                
                return (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                      {c.name}
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1">Plan: <span className="capitalize">{c.plan}</span></div>
                    </td>
                    <td className="p-4 text-center">
                      {(c.plan === 'lunch' || c.plan === 'both') ? (
                        <button
                          onClick={() => handleToggleDelivery(c.id, 'lunch')}
                          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-colors ${
                            deliveryStatus.lunch 
                              ? 'bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-300' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {(c.plan === 'dinner' || c.plan === 'both') ? (
                        <button
                          onClick={() => handleToggleDelivery(c.id, 'dinner')}
                          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-colors ${
                            deliveryStatus.dinner 
                              ? 'bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-300' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
