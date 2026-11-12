import { formatCurrency } from '../utils/format';

const Card = ({ label, value, loading, accent, icon }) => (
  <div className="card flex items-center justify-between">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-32 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className={`mt-1 truncate text-2xl font-bold sm:text-3xl ${accent}`}>
          {formatCurrency(value)}
        </p>
      )}
    </div>
    <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
      {icon}
    </div>
  </div>
);

const BalanceSummary = ({ summary, loading }) => {
  const { balance = 0, totalIncome = 0, totalExpense = 0 } = summary || {};

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card
        label="Total Balance"
        value={balance}
        loading={loading}
        accent={balance < 0 ? 'text-rose-600' : 'text-slate-900'}
        icon="💰"
      />
      <Card label="Total Income" value={totalIncome} loading={loading} accent="text-emerald-600" icon="📈" />
      <Card label="Total Expenses" value={totalExpense} loading={loading} accent="text-rose-600" icon="📉" />
    </section>
  );
};

export default BalanceSummary;
