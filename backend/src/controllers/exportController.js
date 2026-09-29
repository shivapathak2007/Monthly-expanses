import ExportService from '../services/exportService.js';

export class ExportController {
  /**
   * Preview structured financial data prior to download
   */
  static async getPreview(req, res, next) {
    try {
      const userId = req.user.id;
      const exportData = await ExportService.getExportData(userId);

      return res.status(200).json({
        success: true,
        message: 'Export preview data retrieved successfully',
        data: exportData
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Download authentic .xlsx Excel file generated with ExcelJS
   */
  static async downloadExcel(req, res, next) {
    try {
      const userId = req.user.id;
      const exportData = await ExportService.getExportData(userId);
      const buffer = await ExportService.generateWorkbook(exportData);

      const today = new Date().toISOString().split('T')[0];
      const filename = `Kharcha_Export_${today}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.byteLength || buffer.length);

      return res.status(200).send(Buffer.from(buffer));
    } catch (err) {
      next(err);
    }
  }

  /**
   * User export history summary
   */
  static async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const exportData = await ExportService.getExportData(userId);
      const today = new Date().toISOString().split('T')[0];

      // Provide history record reflecting current financial snapshot
      const history = [
        {
          id: `export-${today}`,
          exportDate: new Date().toISOString(),
          format: 'XLSX',
          fileName: `Kharcha_Export_${today}.xlsx`,
          summary: {
            expenses: exportData.summary.expenseCount,
            income: exportData.summary.incomeCount,
            totalOutflow: exportData.summary.totalExpenses,
            totalInflow: exportData.summary.totalIncome
          }
        }
      ];

      return res.status(200).json({
        success: true,
        message: 'Export history retrieved',
        data: history
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ExportController;
