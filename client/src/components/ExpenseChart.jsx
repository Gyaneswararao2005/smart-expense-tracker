import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/format';

const ExpenseChart = ({ data = [], loading }) => {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="card">
      <h2 className="mb-4 text-lg font-semibold">Expense Breakdown</h2>

      {loading ? (
        <div className="mx-auto h-48 w-48 animate-pulse rounded-full bg-slate-200" />
      ) : data.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-4xl">📊</div>
          <p className="mt-3 font-medium text-slate-700">No expenses to show</p>
          <p className="mt-1 text-sm text-slate-500">Add an expense to see where your money goes.</p>
        </div>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 space-y-2">
            {data.map((entry) => (
              <li key={entry.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#94a3b8' }}
                  />
                  {entry.category}
                </span>
                <span className="text-slate-600">
                  {formatCurrency(entry.total)}{' '}
                  <span className="text-slate-400">({((entry.total / total) * 100).toFixed(0)}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ExpenseChart;
