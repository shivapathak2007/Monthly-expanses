import ExcelJS from 'exceljs';
import { db } from '../config/db.js';

export class ExportService {
  /**
   * Fetch all user data strictly isolated by authenticated userId
   */
  static async getExportData(userId) {
    // 1. Fetch user profile
    const { data: user } = await db
      .from('users')
      .select('name, email, currency, monthly_income, created_at')
      .eq('id', userId)
      .single();

    // 2. Fetch expenses
    const { data: expenses } = await db
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });

    // 3. Fetch income
    const { data: income } = await db
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: false });

    // 4. Fetch budgets
    const { data: budgets } = await db
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false });

    // 5. Fetch goals
    const { data: goals } = await db
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const safeExpenses = expenses || [];
    const safeIncome = income || [];
    const safeBudgets = budgets || [];
    const safeGoals = goals || [];

    // Calculate Summary Stats
    const totalExpenses = safeExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalIncome = safeIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalSavings = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

    // Enrich budgets with actual spent amounts
    const enrichedBudgets = safeBudgets.map((b) => {
      const spent = safeExpenses
        .filter((exp) => {
          const expDate = new Date(exp.expense_date);
          const expMonth = expDate.getMonth() + 1;
          const expYear = expDate.getFullYear();
          const categoryMatch = exp.category?.toLowerCase() === b.category?.toLowerCase() ||
            (exp.description && exp.description.toLowerCase().includes(b.category?.toLowerCase()));
          return categoryMatch && expMonth === b.month && expYear === b.year;
        })
        .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

      const budgetAmount = Number(b.amount || 0);
      const remaining = budgetAmount - spent;
      const percentageUsed = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      return {
        ...b,
        amountSpent: spent,
        remaining,
        percentageUsed
      };
    });

    // Enrich goals with progress
    const enrichedGoals = safeGoals.map((g) => {
      const target = Number(g.target_amount || 0);
      const current = Number(g.current_amount || 0);
      const remaining = Math.max(0, target - current);
      const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      return {
        ...g,
        remaining,
        progressPct
      };
    });

    return {
      exportDate: new Date().toISOString(),
      user: {
        name: user?.name || 'Kharcha User',
        email: user?.email || '',
        currency: user?.currency || 'INR'
      },
      summary: {
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate,
        expenseCount: safeExpenses.length,
        incomeCount: safeIncome.length,
        budgetCount: safeBudgets.length,
        goalCount: safeGoals.length
      },
      expenses: safeExpenses,
      income: safeIncome,
      budgets: enrichedBudgets,
      goals: enrichedGoals
    };
  }

  /**
   * Generate genuine .xlsx Excel workbook using ExcelJS
   */
  static async generateWorkbook(exportData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Kharcha - Personal Expense Tracker';
    workbook.lastModifiedBy = 'Kharcha';
    workbook.created = new Date();
    workbook.modified = new Date();

    const currencySymbol = exportData.user?.currency === 'INR' ? '₹' : '$';

    // Helper for header styling
    const applyHeaderStyle = (row, bgColor = '4338CA') => {
      row.height = 26;
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'medium', color: { argb: 'FF1E1B4B' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    };

    // Helper for data row styling
    const applyDataRowStyle = (row, index) => {
      row.height = 20;
      const isEven = index % 2 === 0;
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle' };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
        };
      });
    };

    // ==========================================
    // SHEET 1: Summary
    // ==========================================
    const summarySheet = workbook.addWorksheet('Summary', {
      views: [{ showGridLines: true }]
    });

    summarySheet.columns = [
      { width: 5 },
      { width: 32 },
      { width: 28 },
      { width: 15 }
    ];

    // Title
    summarySheet.mergeCells('B2:C2');
    const titleCell = summarySheet.getCell('B2');
    titleCell.value = 'KHARCHA — FINANCIAL SUMMARY REPORT';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF4338CA' } };
    titleCell.alignment = { vertical: 'middle' };
    summarySheet.getRow(2).height = 30;

    // Subtitle
    summarySheet.getCell('B3').value = `Generated for: ${exportData.user.name} (${exportData.user.email})`;
    summarySheet.getCell('B3').font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };
    summarySheet.getCell('B4').value = `Export Date: ${new Date(exportData.exportDate).toLocaleDateString()} | Currency: ${exportData.user.currency}`;
    summarySheet.getCell('B4').font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };

    // Metric Table Header
    summarySheet.getRow(6).values = ['', 'Financial Metric', 'Value'];
    applyHeaderStyle(summarySheet.getRow(6), '4338CA');

    const summaryRows = [
      ['Total Recorded Income', `${currencySymbol} ${exportData.summary.totalIncome.toLocaleString('en-IN')}`],
      ['Total Recorded Expenses', `${currencySymbol} ${exportData.summary.totalExpenses.toLocaleString('en-IN')}`],
      ['Net Savings', `${currencySymbol} ${exportData.summary.totalSavings.toLocaleString('en-IN')}`],
      ['Savings Rate', `${exportData.summary.savingsRate}%`],
      ['Total Expense Transactions', exportData.summary.expenseCount],
      ['Total Income Entries', exportData.summary.incomeCount],
      ['Active Budgets Tracked', exportData.summary.budgetCount],
      ['Financial Goals', exportData.summary.goalCount]
    ];

    summaryRows.forEach((r, idx) => {
      const row = summarySheet.getRow(7 + idx);
      row.values = ['', r[0], r[1]];
      applyDataRowStyle(row, idx);
      row.getCell(2).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
    });

    // ==========================================
    // SHEET 2: Expenses
    // ==========================================
    const expensesSheet = workbook.addWorksheet('Expenses', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
    });

    expensesSheet.columns = [
      { header: 'Expense ID', key: 'id', width: 20 },
      { header: 'Date', key: 'date', width: 14 },
      { header: `Amount (${currencySymbol})`, key: 'amount', width: 16 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Payment Method', key: 'payment_method', width: 18 },
      { header: 'Need / Want', key: 'expense_type', width: 14 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'created_at', width: 22 }
    ];

    applyHeaderStyle(expensesSheet.getRow(1), '4338CA');

    exportData.expenses.forEach((exp, idx) => {
      const row = expensesSheet.addRow({
        id: exp.id,
        date: exp.expense_date,
        amount: Number(exp.amount),
        category: exp.category,
        description: exp.description,
        payment_method: exp.payment_method,
        expense_type: (exp.expense_type || 'want').toUpperCase(),
        notes: exp.notes || '',
        created_at: exp.created_at ? new Date(exp.created_at).toLocaleString() : ''
      });
      applyDataRowStyle(row, idx);
      row.getCell('amount').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('amount').alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell('date').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('expense_type').alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Total row
    if (exportData.expenses.length > 0) {
      const totalRow = expensesSheet.addRow({
        id: 'TOTAL',
        description: `Total ${exportData.expenses.length} Expenses`,
        amount: exportData.summary.totalExpenses
      });
      totalRow.height = 24;
      totalRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E1B4B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };
      });
      totalRow.getCell('amount').numFmt = `"${currencySymbol} "#,##0.00`;
    }

    expensesSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 9 }
    };

    // ==========================================
    // SHEET 3: Income
    // ==========================================
    const incomeSheet = workbook.addWorksheet('Income', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
    });

    incomeSheet.columns = [
      { header: 'Income ID', key: 'id', width: 20 },
      { header: 'Date', key: 'date', width: 14 },
      { header: `Amount (${currencySymbol})`, key: 'amount', width: 16 },
      { header: 'Source', key: 'source', width: 22 },
      { header: 'Description', key: 'description', width: 32 },
      { header: 'Created At', key: 'created_at', width: 22 }
    ];

    applyHeaderStyle(incomeSheet.getRow(1), '059669');

    exportData.income.forEach((inc, idx) => {
      const row = incomeSheet.addRow({
        id: inc.id,
        date: inc.income_date,
        amount: Number(inc.amount),
        source: inc.source,
        description: inc.description || '',
        created_at: inc.created_at ? new Date(inc.created_at).toLocaleString() : ''
      });
      applyDataRowStyle(row, idx);
      row.getCell('amount').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('amount').alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell('date').alignment = { vertical: 'middle', horizontal: 'center' };
    });

    if (exportData.income.length > 0) {
      const totalRow = incomeSheet.addRow({
        id: 'TOTAL',
        description: `Total ${exportData.income.length} Income Entries`,
        amount: exportData.summary.totalIncome
      });
      totalRow.height = 24;
      totalRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF064E3B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      });
      totalRow.getCell('amount').numFmt = `"${currencySymbol} "#,##0.00`;
    }

    incomeSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 6 }
    };

    // ==========================================
    // SHEET 4: Budgets
    // ==========================================
    const budgetsSheet = workbook.addWorksheet('Budgets', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
    });

    budgetsSheet.columns = [
      { header: 'Category / Item', key: 'category', width: 24 },
      { header: `Budget Amount (${currencySymbol})`, key: 'amount', width: 20 },
      { header: 'Month', key: 'month', width: 12 },
      { header: 'Year', key: 'year', width: 12 },
      { header: `Amount Spent (${currencySymbol})`, key: 'amountSpent', width: 20 },
      { header: `Remaining (${currencySymbol})`, key: 'remaining', width: 18 },
      { header: 'Percentage Used', key: 'percentageUsed', width: 18 }
    ];

    applyHeaderStyle(budgetsSheet.getRow(1), '4338CA');

    exportData.budgets.forEach((b, idx) => {
      const row = budgetsSheet.addRow({
        category: b.category,
        amount: Number(b.amount),
        month: b.month,
        year: b.year,
        amountSpent: Number(b.amountSpent),
        remaining: Number(b.remaining),
        percentageUsed: `${b.percentageUsed}%`
      });
      applyDataRowStyle(row, idx);
      row.getCell('amount').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('amountSpent').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('remaining').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('percentageUsed').alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // ==========================================
    // SHEET 5: Goals
    // ==========================================
    const goalsSheet = workbook.addWorksheet('Goals', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
    });

    goalsSheet.columns = [
      { header: 'Goal Name', key: 'name', width: 26 },
      { header: `Target Amount (${currencySymbol})`, key: 'target_amount', width: 20 },
      { header: `Current Amount (${currencySymbol})`, key: 'current_amount', width: 20 },
      { header: `Remaining (${currencySymbol})`, key: 'remaining', width: 18 },
      { header: 'Deadline', key: 'deadline', width: 16 },
      { header: 'Progress %', key: 'progressPct', width: 16 }
    ];

    applyHeaderStyle(goalsSheet.getRow(1), '4338CA');

    exportData.goals.forEach((g, idx) => {
      const row = goalsSheet.addRow({
        name: g.name,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        remaining: Number(g.remaining),
        deadline: g.deadline || 'No deadline',
        progressPct: `${g.progressPct}%`
      });
      applyDataRowStyle(row, idx);
      row.getCell('target_amount').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('current_amount').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('remaining').numFmt = `"${currencySymbol} "#,##0.00`;
      row.getCell('progressPct').alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

export default ExportService;
