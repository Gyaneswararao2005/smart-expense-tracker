import { formatCurrency, formatDate } from '../utils/format';
import { CATEGORY_COLORS } from '../utils/constants';

const SkeletonRow = () => (
  <div className="flex items-center justify-between py-4">
    <div className="space-y-2">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
    </div>
    <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
  </div>
);

const TransactionList = ({ transactions, loading, onEdit, onDelete, deletingId, hasFilters }) => (
  <div className="card">
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Transactions</h2>
      {!loading && <span className="text-sm text-slate-500">{transactions.length} found</span>}
    </div>

    {loading ? (
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    ) : transactions.length === 0 ? (
      <div className="py-12 text-center">
        <div className="text-4xl">🧾</div>
        <p className="mt-3 font-medium text-slate-700">
          {hasFilters ? 'No transactions match your filters' : 'No transactions yet'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {hasFilters ? 'Try adjusting or resetting the filters.' : 'Add your first income or expense using the form.'}
        </p>
      </div>
    ) : (
      <ul className="divide-y divide-slate-100">
        {transactions.map((t) => {
          const isIncome = t.type === 'Income';
          return (
            <li key={t._id} className="flex items-center justify-between gap-3 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-10 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#94a3b8' }}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {t.category} · {formatDate(t.date)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className={`text-sm font-semibold sm:text-base ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(t)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                    aria-label={`Edit ${t.title}`}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    disabled={deletingId === t._id}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    aria-label={`Delete ${t.title}`}
                    title="Delete"
                  >
                    {deletingId === t._id ? '…' : '🗑️'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default TransactionList;
