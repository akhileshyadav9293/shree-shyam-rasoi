import { useState, useEffect } from 'react';
import { getCustomers, toggleCustomerStatus } from '../../lib/store';
import { PauseCircle, PlayCircle, Search } from 'lucide-react';

export default function TiffinStatus() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const handleToggle = async (id) => {
    await toggleCustomerStatus(id);
    await loadCustomers();
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pause / Resume Tiffin</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage active and paused subscriptions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No customers found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{c.name}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{c.phone}</td>
                  <td className="p-4">
                    <span className="capitalize text-sm text-gray-600 dark:text-gray-300">{c.plan}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      c.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}>
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleToggle(c.id)}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        c.status === 'active' 
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60' 
                          : 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60'
                      }`}
                    >
                      {c.status === 'active' ? (
                        <><PauseCircle className="w-4 h-4" /> <span>Pause Tiffin</span></>
                      ) : (
                        <><PlayCircle className="w-4 h-4" /> <span>Resume Tiffin</span></>
                      )}
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
