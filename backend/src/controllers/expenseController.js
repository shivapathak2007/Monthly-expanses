import ExpenseModel from '../models/expenseModel.js';

export class ExpenseController {
  static async createExpense(req, res, next) {
    try {
      const { amount, category, description, expense_date, payment_method, expense_type, notes } = req.body;
      const userId = req.user.id;

      const expense = await ExpenseModel.create({
        userId,
        amount,
        category,
        description,
        expense_date,
        payment_method,
        expense_type,
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Expense created successfully 🎉',
        data: expense
      });
    } catch (err) {
      next(err);
    }
  }

  static async getExpenses(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        category,
        payment_method,
        expense_type,
        start_date,
        end_date,
        min_amount,
        max_amount,
        search,
        sort,
        page,
        limit
      } = req.query;

      const result = await ExpenseModel.findAll({
        userId,
        category,
        paymentMethod: payment_method,
        expenseType: expense_type,
        startDate: start_date,
        endDate: end_date,
        minAmount: min_amount,
        maxAmount: max_amount,
        search,
        sortBy: sort,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getExpenseById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const expense = await ExpenseModel.findById(id, userId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
          error: 'Expense record does not exist or does not belong to you'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Expense details retrieved',
        data: expense
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await ExpenseModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
          error: 'Expense record does not exist or does not belong to you'
        });
      }

      const updated = await ExpenseModel.update(id, userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await ExpenseModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
          error: 'Expense record does not exist or does not belong to you'
        });
      }

      await ExpenseModel.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ExpenseController;
