import IncomeModel from '../models/incomeModel.js';

export class IncomeController {
  static async createIncome(req, res, next) {
    try {
      const { amount, source, description, income_date } = req.body;
      const userId = req.user.id;

      const income = await IncomeModel.create({
        userId,
        amount,
        source,
        description,
        income_date
      });

      return res.status(201).json({
        success: true,
        message: 'Income added successfully',
        data: income
      });
    } catch (err) {
      next(err);
    }
  }

  static async getIncome(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;

      const result = await IncomeModel.findAll({
        userId,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        message: 'Income records retrieved',
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getIncomeById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const income = await IncomeModel.findById(id, userId);
      if (!income) {
        return res.status(404).json({
          success: false,
          message: 'Income record not found',
          error: 'Record does not exist or does not belong to you'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Income details retrieved',
        data: income
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateIncome(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await IncomeModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Income record not found',
          error: 'Record does not exist or does not belong to you'
        });
      }

      const updated = await IncomeModel.update(id, userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Income updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteIncome(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await IncomeModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Income record not found',
          error: 'Record does not exist or does not belong to you'
        });
      }

      await IncomeModel.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Income deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default IncomeController;
