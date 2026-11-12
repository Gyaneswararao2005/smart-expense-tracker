import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

/** Build a Mongo date range from a "YYYY-MM" string. Returns null if invalid. */
const getMonthRange = (month) => {
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [year, mon] = month.split('-').map(Number);
  return {
    $gte: new Date(Date.UTC(year, mon - 1, 1)),
    $lt: new Date(Date.UTC(year, mon, 1)),
  };
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const httpError = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const ensureValidId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    httpError(res, 400, 'Invalid transaction ID');
  }
};

// Only allow known fields from the request body
const pickFields = (body) => {
  const { title, amount, type, category, date } = body;
  const data = { title, amount, type, category, date };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  return data;
};

// @desc   Get transactions (filter by type, category, month, search)
// @route  GET /api/transactions?type=&category=&month=YYYY-MM&search=
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, month, search } = req.query;
    const filter = {};

    if (type && type !== 'All') filter.type = type;
    if (category && category !== 'All') filter.category = category;

    if (month) {
      const range = getMonthRange(month);
      if (!range) httpError(res, 400, 'Month must be in YYYY-MM format');
      filter.date = range;
    }

    if (search && search.trim()) {
      filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    const transactions = await Transaction.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc   Totals (income, expense, balance) + expense breakdown by category
// @route  GET /api/transactions/summary?month=YYYY-MM
export const getSummary = async (req, res, next) => {
  try {
    const { month } = req.query;
    const match = {};

    if (month) {
      const range = getMonthRange(month);
      if (!range) httpError(res, 400, 'Month must be in YYYY-MM format');
      match.date = range;
    }

    const grouped = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = [];

    grouped.forEach(({ _id, total }) => {
      if (_id.type === 'Income') {
        totalIncome += total;
      } else {
        totalExpense += total;
        expenseByCategory.push({ category: _id.category, total });
      }
    });

    expenseByCategory.sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        expenseByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single transaction
// @route  GET /api/transactions/:id
export const getTransactionById = async (req, res, next) => {
  try {
    ensureValidId(req.params.id, res);
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) httpError(res, 404, 'Transaction not found');
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc   Create transaction
// @route  POST /api/transactions
export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create(pickFields(req.body));
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc   Update transaction
// @route  PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
  try {
    ensureValidId(req.params.id, res);
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      pickFields(req.body),
      { new: true, runValidators: true }
    );
    if (!transaction) httpError(res, 404, 'Transaction not found');
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete transaction
// @route  DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    ensureValidId(req.params.id, res);
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) httpError(res, 404, 'Transaction not found');
    res.json({ success: true, message: 'Transaction deleted', data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};
