import { Router } from 'express';
import {
  getTransactions,
  getSummary,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = Router();

router.route('/').get(getTransactions).post(createTransaction);

// Must be declared before "/:id" so "summary" is not treated as an ID
router.get('/summary', getSummary);

router
  .route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
