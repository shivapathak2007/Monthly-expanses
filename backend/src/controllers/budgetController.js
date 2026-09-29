import BudgetModel from '../models/budgetModel.js';
import ExpenseModel from '../models/expenseModel.js';

export class BudgetController {
  static async createBudget(req, res, next) {
    try {
      const { category, amount, month, year } = req.body;
      const userId = req.user.id;

      // Check if user already has a budget for this category/month/year
      const existing = await BudgetModel.findByCategory(userId, category, month, year);
      if (existing) {
        // Update the existing budget
        const updated = await BudgetModel.update(existing.id, userId, { amount });
        return res.status(200).json({
          success: true,
          message: `Updated existing budget for ${category}`,
          data: updated
        });
      }

      const budget = await BudgetModel.create({
        userId,
        category,
        amount,
        month,
        year
      });

      return res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBudgets(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const month = req.query.month ? Number(req.query.month) : (now.getMonth() + 1);
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();

      const budgets = await BudgetModel.findAll(userId, month, year);

      // Calculate spent amount for each budget based on expenses in this month/year
      const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const expensesRes = await ExpenseModel.findAll({
        userId,
        startDate: startOfMonth,
        endDate: endOfMonth,
        limit: 1000
      });

      const enrichedBudgets = budgets.map(b => {
        const catLower = (b.category || '').toLowerCase().trim();
        let spent = 0;
        for (const exp of expensesRes.data) {
          const expCatLower = (exp.category || '').toLowerCase().trim();
          const expDescLower = (exp.description || '').toLowerCase().trim();
          if (expCatLower === catLower || expDescLower.includes(catLower)) {
            spent += exp.amount;
          }
        }
        const remaining = Math.max(0, b.amount - spent);
        const percentageUsed = Number(((spent / b.amount) * 100).toFixed(1));
        const isExceeded = spent > b.amount;
        return {
          id: b.id,
          category: b.category,
          amount: b.amount,
          month: b.month,
          year: b.year,
          spent,
          remaining,
          percentageUsed,
          isExceeded,
          created_at: b.created_at
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Budgets retrieved',
        data: enrichedBudgets
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateBudget(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await BudgetModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
          error: 'Budget does not exist or does not belong to you'
        });
      }

      const updated = await BudgetModel.update(id, userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteBudget(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await BudgetModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
          error: 'Budget does not exist or does not belong to you'
        });
      }

      await BudgetModel.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default BudgetController;
