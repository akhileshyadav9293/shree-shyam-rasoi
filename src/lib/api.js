/**
 * api.js — Central HTTP client for the Shree Shyam Rasoi backend.
 *
 * All fetch calls go through here. The base URL is /api (Vite proxies
 * this to http://localhost:3001 in development).
 *
 * This module mirrors the store.js public API 1-to-1 so that store.js
 * only needs to swap its implementations — no other files change.
 */

const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const get  = (path)        => request('GET', path);
const post = (path, body)  => request('POST', path, body);
const put  = (path, body)  => request('PUT', path, body);
const patch = (path, body) => request('PATCH', path, body);
const del  = (path)        => request('DELETE', path);

// ─── Customers ────────────────────────────────────────────────────────────────

export const apiGetCustomers         = ()        => get('/customers?pageSize=1000');
export const apiGetCustomerById      = (id)      => get(`/customers/${id}`);
export const apiQueryCustomers       = (params)  => get(`/customers?${new URLSearchParams(params)}`);
export const apiGetCustomerStats     = ()        => get('/customers/stats');
export const apiAddCustomer          = (data)    => post('/customers', data);
export const apiUpdateCustomer       = (data)    => put(`/customers/${data.id}`, data);
export const apiDeleteCustomer       = (id)      => del(`/customers/${id}`);
export const apiToggleCustomerStatus = (id)      => patch(`/customers/${id}/toggle-status`);

// ─── Deliveries ───────────────────────────────────────────────────────────────

export const apiGetDeliveriesByDate      = (date)        => get(`/deliveries/${date}`);
export const apiSaveDeliveriesByDate     = (date, map)   => put(`/deliveries/${date}`, map);
export const apiGetDeliveriesForMonth    = (prefix)      => get(`/deliveries/month/${prefix}`);

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const apiGetExpenses    = ()      => get('/expenses');
export const apiAddExpense     = (data)  => post('/expenses', data);
export const apiDeleteExpense  = (id)    => del(`/expenses/${id}`);

// ─── Payments ─────────────────────────────────────────────────────────────────

export const apiGetPayments           = ()           => get('/payments');
export const apiGetPaymentsByCustomer = (customerId) => get(`/payments/customer/${customerId}`);
export const apiAddPayment            = (data)       => post('/payments', data);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const apiGetAuthStatus = ()             => get('/auth/status');
export const apiSetupAuth     = (username, pin) => post('/auth/setup', { username, pin });
export const apiLoginAuth     = (pin)           => post('/auth/login', { pin });
export const apiResetAuth     = ()             => post('/auth/reset', {});

// ─── SMS (Fast2SMS) ───────────────────────────────────────────────────────────

export const apiGetSmsConfig   = ()               => get('/sms/config');
export const apiSaveSmsConfig  = (apiKey)         => post('/sms/config', { apiKey });
export const apiSendDirectSms  = (phone, message) => post('/sms/send', { phone, message });


