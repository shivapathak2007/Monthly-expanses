import AnalyticsService from '../services/analyticsService.js';
import RecommendationService from '../services/recommendationService.js';

export class DashboardController {
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      // Parallel retrieval of metrics & recommendations
      const [analyticsData, recommendations] = await Promise.all([
        AnalyticsService.getDashboardData(userId),
        RecommendationService.generateRecommendations(userId)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          ...analyticsData,
          recommendations
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const days = req.query.days ? parseInt(req.query.days, 10) : 30;

      const advancedData = await AnalyticsService.getAdvancedAnalytics(userId, days);

      return res.status(200).json({
        success: true,
        message: 'Advanced analytics retrieved',
        data: advancedData
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRecommendations(req, res, next) {
    try {
      const userId = req.user.id;
      const recommendations = await RecommendationService.generateRecommendations(userId);

      return res.status(200).json({
        success: true,
        message: 'Recommendations generated',
        data: recommendations
      });
    } catch (err) {
      next(err);
    }
  }
}

export default DashboardController;
