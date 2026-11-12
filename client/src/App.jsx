import { useCallback, useEffect, useState } from 'react';
import BalanceSummary from './components/BalanceSummary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FilterBar from './components/FilterBar';
import ExpenseChart from './components/ExpenseChart';
import {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getErrorMessage,
} from './services/api';

const DEFAULT_FILTERS = { type: 'All', category: 'All', month: '', search: '' };

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(id);
  }, [filters.search]);

  const loadTransactions = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getTransactions({
        type: filters.type,
        category: filters.category,
        month: filters.month,
        search: debouncedSearch,
      });
      setTransactions(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  }, [filters.type, filters.category, filters.month, debouncedSearch]);

  // Totals and chart follow the selected month only (not type/category/search)
  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      setSummary(await getSummary({ month: filters.month }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingSummary(false);
    }
  }, [filters.month]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateTransaction(editing._id, payload);
        setEditing(null);
      } else {
        await createTransaction(payload);
      }
      setError('');
      await Promise.all([loadTransactions(), loadSummary()]);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Delete "${transaction.title}"? This cannot be undone.`)) return;
    setDeletingId(transaction._id);
    try {
      await deleteTransaction(transaction._id);
      if (editing?._id === transaction._id) setEditing(null);
      setError('');
      await Promise.all([loadTransactions(), loadSummary()]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (transaction) => {
    setEditing(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters =
    filters.type !== 'All' || filters.category !== 'All' || Boolean(filters.month) || Boolean(filters.search);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
            💸
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight sm:text-xl">Smart Expense Tracker</h1>
            <p className="text-xs text-slate-500">
              {filters.month ? `Showing totals for ${filters.month}` : 'Showing all-time totals'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-semibold hover:text-rose-900" aria-label="Dismiss">
              ✕
            </button>
          </div>
        )}

        <BalanceSummary summary={summary} loading={loadingSummary} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <TransactionForm
              editing={editing}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
              submitting={submitting}
            />
            <ExpenseChart data={summary?.expenseByCategory} loading={loadingSummary} />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
            <TransactionList
              transactions={transactions}
              loading={loadingList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
              hasFilters={hasFilters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
