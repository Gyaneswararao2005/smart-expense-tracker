import 'dotenv/config';
import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';

const d = (monthsAgo, day) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, day));
};

const sample = [
  { title: 'Monthly Salary', amount: 4500, type: 'Income', category: 'Salary', date: d(0, 1) },
  { title: 'Apartment Rent', amount: 1400, type: 'Expense', category: 'Rent', date: d(0, 2) },
  { title: 'Groceries', amount: 220.5, type: 'Expense', category: 'Food', date: d(0, 5) },
  { title: 'Electricity Bill', amount: 95, type: 'Expense', category: 'Utilities', date: d(0, 7) },
  { title: 'Movie Night', amount: 35, type: 'Expense', category: 'Entertainment', date: d(0, 9) },
  { title: 'Freelance Gig', amount: 600, type: 'Income', category: 'Other', date: d(0, 12) },
  { title: 'Monthly Salary', amount: 4500, type: 'Income', category: 'Salary', date: d(1, 1) },
  { title: 'Apartment Rent', amount: 1400, type: 'Expense', category: 'Rent', date: d(1, 2) },
  { title: 'Restaurant', amount: 80, type: 'Expense', category: 'Food', date: d(1, 14) },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Transaction.deleteMany();
  await Transaction.insertMany(sample);
  console.log(`Seeded ${sample.length} transactions`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
