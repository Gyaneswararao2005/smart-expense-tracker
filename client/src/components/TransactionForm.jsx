import { useEffect, useState } from 'react';
import { CATEGORIES, TYPES } from '../utils/constants';
import { toInputDate, todayInput } from '../utils/format';

const emptyForm = () => ({
  title: '',
  amount: '',
  type: 'Expense',
  category: 'Food',
  date: todayInput(),
});

const validate = (form) => {
  const errors = {};
  const title = form.title.trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length < 2) errors.title = 'Title must be at least 2 characters';
  else if (title.length > 100) errors.title = 'Title cannot exceed 100 characters';

  const amount = Number(form.amount);
  if (form.amount === '') errors.amount = 'Amount is required';
  else if (Number.isNaN(amount) || amount <= 0) errors.amount = 'Amount must be greater than 0';

  if (!form.date) errors.date = 'Date is required';
  if (!TYPES.includes(form.type)) errors.type = 'Select a valid type';
  if (!CATEGORIES.includes(form.category)) errors.category = 'Select a valid category';

  return errors;
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

const TransactionForm = ({ editing, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  // Populate the form when a transaction is selected for editing
  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        amount: String(editing.amount),
        type: editing.type,
        category: editing.category,
        date: toInputDate(editing.date),
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const ok = await onSubmit({
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
    });

    if (ok && !editing) setForm(emptyForm());
  };

  const inputClass = (name) => `input ${errors[name] ? 'input-error' : ''}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
        {editing && (
          <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        )}
      </div>

      <Field label="Title" error={errors.title}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Groceries"
          className={inputClass('title')}
          maxLength={100}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount" error={errors.amount}>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            className={inputClass('amount')}
          />
        </Field>
        <Field label="Date" error={errors.date}>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass('date')}
          />
        </Field>
      </div>

      <Field label="Type" error={errors.type}>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: t }))}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                form.type === t
                  ? t === 'Income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-slate-300 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Category" error={errors.category}>
        <select name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <button type="submit" disabled={submitting} className="btn btn-primary w-full">
        {submitting ? 'Saving...' : editing ? 'Update Transaction' : 'Add Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;
