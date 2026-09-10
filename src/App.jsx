import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Customers from './pages/customers/Customers';
import CustomerForm from './pages/customers/CustomerForm';
import TiffinStatus from './pages/tiffin/TiffinStatus';
import DailyTiffin from './pages/tiffin/DailyTiffin';
import MonthlyPlan from './pages/tiffin/MonthlyPlan';
import PendingPayments from './pages/payments/PendingPayments';
import PaymentHistory from './pages/payments/PaymentHistory';
import MonthlyBilling from './pages/payments/MonthlyBilling';
import AddExpense from './pages/expenses/AddExpense';
import ExpenseHistory from './pages/expenses/ExpenseHistory';
import ReportsDaily from './pages/reports/ReportsDaily';
import ReportsMonthly from './pages/reports/ReportsMonthly';
import ProfitLoss from './pages/reports/ProfitLoss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has already logged in during this session
    const authStatus = sessionStorage.getItem('is_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Apply theme
    import('./lib/themeStore').then(({ getThemeConfig }) => {
      getThemeConfig().then(config => {
        if (config.mode === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      });
    });
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('is_authenticated', 'true');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerForm />} />
          
          {/* Tiffin Management */}
          <Route path="tiffin/daily" element={<DailyTiffin />} />
          <Route path="tiffin/monthly" element={<MonthlyPlan />} />
          <Route path="tiffin/status" element={<TiffinStatus />} />
          
          {/* Payments */}
          <Route path="payments/history" element={<PaymentHistory />} />
          <Route path="payments/pending" element={<PendingPayments />} />
          <Route path="payments/billing" element={<MonthlyBilling />} />

          {/* Expenses */}
          <Route path="expenses/add" element={<AddExpense />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />

          {/* Reports */}
          <Route path="reports/daily" element={<ReportsDaily />} />
          <Route path="reports/monthly" element={<ReportsMonthly />} />
          <Route path="reports/profit-loss" element={<ProfitLoss />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
