import GoalModel from '../models/goalModel.js';

export class GoalController {
  static async createGoal(req, res, next) {
    try {
      const { name, target_amount, current_amount, deadline } = req.body;
      const userId = req.user.id;

      const goal = await GoalModel.create({
        userId,
        name,
        target_amount,
        current_amount,
        deadline
      });

      return res.status(201).json({
        success: true,
        message: 'Financial goal created',
        data: goal
      });
    } catch (err) {
      next(err);
    }
  }

  static async getGoals(req, res, next) {
    try {
      const userId = req.user.id;
      const goals = await GoalModel.findAll(userId);

      const enrichedGoals = goals.map(g => {
        const remaining = Math.max(0, g.target_amount - g.current_amount);
        const progressPercentage = Number(((g.current_amount / g.target_amount) * 100).toFixed(1));
        const isAchieved = g.current_amount >= g.target_amount;
        return {
          ...g,
          remaining,
          progressPercentage,
          isAchieved
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Goals retrieved',
        data: enrichedGoals
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateGoal(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await GoalModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
          error: 'Goal does not exist or does not belong to you'
        });
      }

      const updated = await GoalModel.update(id, userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteGoal(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await GoalModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
          error: 'Goal does not exist or does not belong to you'
        });
      }

      await GoalModel.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default GoalController;
