/**
 * store.js — Data access layer.
 *
 * Previously used localforage (IndexedDB). Now delegates to the Node.js
 * REST API via src/lib/api.js. The public API surface is identical, so
 * no hooks or page components need any changes.
 */

import {
  apiGetCustomers,
  apiGetCustomerById,
  apiQueryCustomers,
  apiGetCustomerStats,
  apiAddCustomer,
  apiUpdateCustomer,
  apiDeleteCustomer,
  apiToggleCustomerStatus,
  apiGetDeliveriesByDate,
  apiSaveDeliveriesByDate,
  apiGetDeliveriesForMonth,
  apiGetExpenses,
  apiAddExpense,
  apiDeleteExpense,
  apiGetPayments,
  apiGetPaymentsByCustomer,
  apiAddPayment,
} from './api';

// ─── Customers ────────────────────────────────────────────────────────────────

/** Returns all customers (unfiltered, for dropdowns / daily tiffin). */
export const getCustomers = () => apiGetCustomers().then(res => res.data ?? res);

/** Returns a single customer by id, or null. */
export const getCustomerById = (id) =>
  apiGetCustomerById(id).catch(() => null);

/** Paginated + filtered customer query — mirrors the old queryCustomers() API. */
export const queryCustomers = (opts = {}) => apiQueryCustomers(opts);

/** Dashboard KPI aggregates. */
export const getCustomerStats = () => apiGetCustomerStats();

/** Create a new customer. Returns the created object (with id, createdAt). */
export const addCustomer = (customer) => apiAddCustomer(customer);

/** Update an existing customer. Returns the updated object. */
export const updateCustomer = (customer) => apiUpdateCustomer(customer);

/** Delete a customer by id. */
export const deleteCustomer = (id) => apiDeleteCustomer(id);

/** Toggle active ↔ paused status. */
export const toggleCustomerStatus = (id) => apiToggleCustomerStatus(id);

// ─── Deliveries ───────────────────────────────────────────────────────────────

/** Returns { customerId: { lunch, dinner } } map for a given date string. */
export const getDeliveriesByDate = (dateStr) => apiGetDeliveriesByDate(dateStr);

/** Persists the full delivery map for a date. */
export const saveDeliveriesByDate = (dateStr, deliveriesMap) =>
  apiSaveDeliveriesByDate(dateStr, deliveriesMap);

/** Returns { "YYYY-MM-DD": { customerId: { lunch, dinner } } } for a month. */
export const getDeliveriesForMonth = (monthPrefix) =>
  apiGetDeliveriesForMonth(monthPrefix);

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const getExpenses = () => apiGetExpenses();

export const addExpense = (expense) => apiAddExpense(expense);

export const deleteExpense = (id) => apiDeleteExpense(id);

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getPayments = () => apiGetPayments();

export const getPaymentsByCustomer = (customerId) => apiGetPaymentsByCustomer(customerId);

export const addPayment = (payment) => apiAddPayment(payment);

// ─── Legacy no-ops (kept for import compatibility) ────────────────────────────
// These were localforage store instances — no longer needed with the API.
export const customersStore   = null;
export const deliveriesStore  = null;
export const expensesStore    = null;
export const paymentsStore    = null;
export const saveCustomers    = null; // Not used directly by any page
export const saveExpenses     = null; // Not used directly by any page
export const savePayments     = null; // Not used directly by any page
