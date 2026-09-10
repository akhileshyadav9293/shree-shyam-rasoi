/**
 * usePaymentAlerts — Tracks customers with outstanding balances.
 *
 * Logic:
 * - A customer is "overdue" if their remaining amount > 0
 *   AND their advance "coverage" window has elapsed.
 * - Advance covers (advance ÷ dailyRate) days from their cycle start.
 * - Also fires a browser Notification if the user has granted permission.
 */
import { useState, useEffect, useCallback } from 'react';
import { getCustomers } from '../lib/store';

function daysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function usePaymentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [notifPermission, setNotifPermission] = useState('default');
  const days = daysInCurrentMonth();

  const computeAlerts = useCallback(async () => {
    const customers = await getCustomers();
    const now = new Date();

    const overdue = customers
      .filter(c => c.status !== 'paused')
      .map(c => {
        const remaining = Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0));
        const dailyRate = (Number(c.monthlyPrice) || 0) / days;

        // How many days does the advance cover?
        const advanceDaysCovered = dailyRate > 0
          ? Math.floor((Number(c.advance) || 0) / dailyRate)
          : 0;

        // Cycle start = beginning of current month
        const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const advancedUntil = new Date(cycleStart);
        advancedUntil.setDate(advancedUntil.getDate() + advanceDaysCovered);

        const isOverdue = remaining > 0 && advancedUntil <= now;
        const daysOverdue = isOverdue
          ? Math.floor((now - advancedUntil) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          ...c,
          remaining,
          advancedUntil,
          advanceDaysCovered,
          isOverdue,
          daysOverdue,
        };
      })
      .filter(c => c.isOverdue)
      .sort((a, b) => b.daysOverdue - a.daysOverdue); // Most overdue first

    setAlerts(overdue);
    return overdue;
  }, [days]);

  // Request browser notification permission
  const requestNotifPermission = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    return perm;
  };

  // Fire browser notifications for overdue customers
  const fireNotifications = useCallback(async (overdueList) => {
    if (!('Notification' in window)) return;
    const perm = Notification.permission;
    setNotifPermission(perm);
    if (perm !== 'granted') return;

    overdueList.slice(0, 5).forEach((c, i) => {
      setTimeout(() => {
        new Notification(`💰 Payment Due: ${c.name}`, {
          body: `₹${c.remaining} remaining • ${c.daysOverdue} day${c.daysOverdue !== 1 ? 's' : ''} overdue`,
          icon: '/vite.svg',
          tag: `payment-due-${c.id}`,
        });
      }, i * 800);
    });
  }, []);

  useEffect(() => {
    computeAlerts().then(overdueList => {
      if (overdueList.length > 0) {
        fireNotifications(overdueList);
      }
    });
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      computeAlerts().then(fireNotifications);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [computeAlerts, fireNotifications]);

  return { alerts, notifPermission, requestNotifPermission, reload: computeAlerts };
}
