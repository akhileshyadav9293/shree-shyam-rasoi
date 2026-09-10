import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../lib/store';
import { User, Clock, AlertCircle, Utensils, BadgeCheck, Phone, CheckCircle2, Coffee, ChefHat } from 'lucide-react';

export default function MonthlyPlan() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data.filter(c => c.status !== 'paused'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Subscription Cards</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Manage all active Tiffin Memberships</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customers.map(c => {
          const joinedDateObj = new Date(c.createdAt || Date.now());
          const joinDate = joinedDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });
          
          // Calculate expiration based on service type
          let expiresDateObj = new Date(joinedDateObj);
          if (c.serviceType === 'weekly') {
            expiresDateObj.setDate(expiresDateObj.getDate() + 7);
          } else {
            // Monthly or Custom default to 1 month
            expiresDateObj.setMonth(expiresDateObj.getMonth() + 1);
          }
          
          const isExpired = expiresDateObj < new Date();
          const serviceType = c.serviceType || 'monthly';
          const validThru = expiresDateObj.toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' });
          const planTitle = c.plan === 'both' ? 'Lunch & Dinner' : `${c.plan} Only`;

          return (
            <div
              key={c.id}
              onClick={() => navigate(`/customers/${c.id}`)}
              className="group relative w-full rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 cursor-pointer flex flex-col"
            >
              
              {/* ── TOP SECTION (Card Theme) ── */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-red-950/40 p-5 pb-6 relative overflow-hidden">
                
                {/* Background Watermark Icons */}
                <div className="absolute -right-10 -bottom-10 opacity-20 dark:opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none flex gap-4 rotate-12">
                  <Utensils className="w-16 h-16 text-orange-600" />
                  <Coffee className="w-12 h-12 text-orange-700 -translate-y-4" />
                  <ChefHat className="w-16 h-16 text-red-600" />
                </div>

                {/* Header (Logo & Badge) */}
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 ring-4 ring-white/50 dark:ring-black/20">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center">
                        <span className="font-black text-lg">
                          {c.name ? c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'S'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400 leading-tight">Shree Shyam</p>
                      <p className="text-[10px] font-bold text-gray-500 tracking-wider">MEMBER CARD</p>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 dark:border-gray-700/50 flex items-center gap-2 shadow-sm">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isExpired ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">{serviceType}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase line-clamp-1">{c.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 bg-white/50 dark:bg-black/30 px-2 py-1 rounded-md">
                      <Utensils className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      <span className="capitalize">{planTitle}</span>
                    </p>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 bg-white/50 dark:bg-black/30 px-2 py-1 rounded-md">
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Verified
                    </p>
                  </div>
                </div>
              </div>

              {/* ── TEAR-OFF DIVIDER ── */}
              <div className="relative flex justify-between items-center bg-white dark:bg-gray-900 px-6 h-0 z-20">
                <div className="w-5 h-5 rounded-full bg-gray-50 dark:bg-gray-950 absolute -left-2.5 top-[-10px] shadow-inner border-r border-gray-200 dark:border-gray-800"></div>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700 mt-[-1px]"></div>
                <div className="w-5 h-5 rounded-full bg-gray-50 dark:bg-gray-950 absolute -right-2.5 top-[-10px] shadow-inner border-l border-gray-200 dark:border-gray-800"></div>
              </div>

              {/* ── BOTTOM SECTION (Receipt/Validity) ── */}
              <div className="p-4 px-5 bg-white dark:bg-gray-900 flex-1 flex flex-col justify-between relative">
                {/* Contact quick info */}
                <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                  <div className="w-6 h-6 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    <Phone className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-semibold font-mono tracking-wider">{c.phone}</span>
                </div>

                {/* Expiry Dates (Credit card style) */}
                <div className="flex justify-between items-end mt-auto">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">Member Since</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 font-mono tracking-wider">{joinDate}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] uppercase font-black tracking-widest mb-1 flex items-center justify-end gap-1 ${isExpired ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                      {isExpired ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isExpired ? 'Expired' : 'Valid Thru'}
                    </p>
                    <p className={`text-xl font-black font-mono tracking-widest ${isExpired ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {validThru}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
        {customers.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Utensils className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">No active memberships found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
