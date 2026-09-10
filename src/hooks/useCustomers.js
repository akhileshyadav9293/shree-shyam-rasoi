/**
 * useCustomers — Enterprise-grade data hook.
 *
 * Provides:
 *  - Debounced full-text search (name, phone, address)
 *  - Multi-field filters: status, plan, serviceType
 *  - Sort by any field (asc/desc)
 *  - Pagination
 *  - Loading & error states
 *
 * Cloud-migration note:
 *   When you move to Supabase/Firebase, only the `loadPage` function body
 *   needs to change. The hook API remains identical for every page that uses it.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { queryCustomers } from '../lib/store';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function useCustomers(initialPageSize = 20) {
  // ── Query state ────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [plan, setPlan] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // ── Result state ───────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search value
  const debounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [status, plan, serviceType, sortBy, sortDir, pageSize]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryCustomers({
        search: debouncedSearch,
        status,
        plan,
        serviceType,
        sortBy,
        sortDir,
        page,
        pageSize,
      });
      setCustomers(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Failed to load customers. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, plan, serviceType, sortBy, sortDir, page, pageSize]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  return {
    // data
    customers, total, totalPages, loading, error,
    // query controls
    search, setSearch,
    status, setStatus,
    plan, setPlan,
    serviceType, setServiceType,
    sortBy, sortDir, toggleSort,
    page, setPage,
    pageSize, setPageSize,
    // actions
    reload: loadPage,
  };
}
