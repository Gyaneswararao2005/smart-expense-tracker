import { CATEGORIES } from '../utils/constants';

const TYPE_OPTIONS = ['All', 'Income', 'Expense'];

const FilterBar = ({ filters, onChange, onReset }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const hasFilters =
    filters.type !== 'All' || filters.category !== 'All' || filters.month || filters.search;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasFilters && (
          <button onClick={onReset} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Reset
          </button>
        )}
      </div>

      <input
        type="search"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        placeholder="Search by title..."
        className="input"
      />

      <div className="inline-flex w-full rounded-lg bg-slate-100 p-1">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => set('type', t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filters.type === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
          <select value={filters.category} onChange={(e) => set('category', e.target.value)} className="input">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Month</label>
          <input
            type="month"
            value={filters.month}
            onChange={(e) => set('month', e.target.value)}
            className="input"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
