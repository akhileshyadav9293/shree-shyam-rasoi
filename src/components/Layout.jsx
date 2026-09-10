import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, CheckSquare, IndianRupee, Wallet, FileText, ChevronDown, LogOut, User, Menu, X, Moon, Sun, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getThemeConfig, saveThemeConfig } from '../lib/themeStore';
import SmsSettingsModal from './SmsSettingsModal';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [openSections, setOpenSections] = useState({
    tiffin: true,
    payments: true,
    expenses: true,
    reports: true
  });

  useEffect(() => {
    const savedName = localStorage.getItem('app_username');
    if (savedName) setUsername(savedName);
    
    getThemeConfig().then(config => {
      setThemeMode(config.mode || 'light');
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleThemeMode = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    
    if (newMode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    saveThemeConfig({ mode: newMode });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('is_authenticated');
    sessionStorage.removeItem('is_authenticated');
    window.location.href = '/';
  };

  const NavItem = ({ to, icon, label, indent = false }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`group relative flex items-center justify-between py-2.5 rounded-xl transition-colors duration-150 ${indent ? 'pl-9 pr-3' : 'px-3.5'} ${
          isActive
            ? 'bg-gradient-to-r from-primary-600 to-orange-500 text-white font-extrabold shadow-md shadow-primary-600/25'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <span className={`transition-colors duration-150 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
              {icon}
            </span>
          )}
          <span className="text-sm tracking-tight">{label}</span>
        </div>
        {isActive && (
          <span className="w-2 h-2 rounded-full bg-white shadow-xs animate-pulse" />
        )}
      </Link>
    );
  };

  const Section = ({ id, label, icon, children }) => {
    const isOpen = !!openSections[id];
    return (
      <div className="mb-1">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white rounded-xl group transition-colors duration-150"
        >
          <div className="flex items-center space-x-3">
            <span className={`transition-colors duration-150 ${isOpen ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
              {icon}
            </span>
            <span className="text-sm font-semibold tracking-tight">{label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-600 dark:text-primary-400' : ''}`} />
        </button>
        
        {/* Smooth GPU-Accelerated Accordion Grid Slide */}
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
          <div className="overflow-hidden space-y-1">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden no-print"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} no-print`}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md ring-1 ring-primary-200 dark:ring-gray-600 flex-shrink-0">
              <img
                src="/shree-shyam-rasoi-logo.svg"
                alt="Shree Shyam Rasoi Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-tight">Shree Shyam Rasoi</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wide">TIFFIN MANAGEMENT</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto sidebar-scrollbar">
          <div className="mb-4">
            <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Dashboard" />
            <NavItem to="/customers" icon={<Users className="w-5 h-5" />} label="Customers" />
          </div>

          <Section id="tiffin" label="Tiffin Management" icon={<CheckSquare className="w-5 h-5" />}>
            <NavItem to="/tiffin/daily" label="Daily Tiffin" indent />
            <NavItem to="/tiffin/monthly" label="Monthly Plan" indent />
            <NavItem to="/tiffin/status" label="Pause / Resume" indent />
          </Section>

          <Section id="payments" label="Payments" icon={<IndianRupee className="w-5 h-5" />}>
            <NavItem to="/payments/history" label="Payment History" indent />
            <NavItem to="/payments/pending" label="Pending Payments" indent />
            <NavItem to="/payments/billing" label="Monthly Billing" indent />
          </Section>

          <Section id="expenses" label="Expenses" icon={<Wallet className="w-5 h-5" />}>
            <NavItem to="/expenses/add" label="Add Expense" indent />
            <NavItem to="/expenses/history" label="Expense History" indent />
          </Section>

          <Section id="reports" label="Reports" icon={<FileText className="w-5 h-5" />}>
            <NavItem to="/reports/daily" label="Daily Report" indent />
            <NavItem to="/reports/monthly" label="Monthly Report" indent />
            <NavItem to="/reports/profit-loss" label="Profit / Loss" indent />
          </Section>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 z-10 bg-white dark:bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col h-screen w-full relative">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-8 py-4 sticky top-0 z-10 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 dark:text-gray-400 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/').filter(Boolean).join(' > ')}
            </h2>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* SMS Gateway Settings Button */}
            <button
              onClick={() => setSmsModalOpen(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              title="SMS Settings (Fast2SMS)"
            >
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span className="hidden lg:inline text-xs font-bold text-blue-600 dark:text-blue-400">SMS Gateway</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {themeMode === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative border-l border-gray-200 dark:border-gray-700 pl-3 sm:pl-4" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2.5 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors focus:outline-none group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700 flex items-center justify-center shrink-0 text-primary-600 dark:text-primary-400 shadow-sm font-bold text-base">
                  {username ? username.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu Popup */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/50 border border-primary-200 dark:border-primary-700 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg shadow-sm shrink-0">
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{username}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mt-0.5">
                        Admin Profile
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        toggleThemeMode();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        {themeMode === 'light' ? <Moon className="w-4 h-4 text-gray-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
                        <span>{themeMode === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md capitalize">
                        {themeMode}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setSmsModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span>SMS Gateway (Fast2SMS)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (confirm('Switch profile? You will need to re-enter your PIN.')) {
                          localStorage.removeItem('is_authenticated');
                          sessionStorage.removeItem('is_authenticated');
                          window.location.href = '/';
                        }
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Switch User</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="mt-auto py-6 px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 no-print">
          <p>© {new Date().getFullYear()} Shree Shyam Rasoi. All rights reserved.</p>
          <p className="text-xs mt-1 opacity-75">Tiffin Service Management System</p>
        </footer>

        {/* SMS Settings Modal */}
        <SmsSettingsModal isOpen={smsModalOpen} onClose={() => setSmsModalOpen(false)} />
      </main>
    </div>
  );
}
