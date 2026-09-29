import ExpenseModel from '../models/expenseModel.js';
import IncomeModel from '../models/incomeModel.js';
import BudgetModel from '../models/budgetModel.js';

export class AnalyticsService {
  /**
   * Get full dashboard metrics and charts for a user
   */
  static async getDashboardData(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // First day and last day of current month
    const startOfCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const endOfCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // Fetch all user expenses and incomes
    const [allExpensesRes, allIncomeRes, currentBudgets] = await Promise.all([
      ExpenseModel.findAll({ userId, page: 1, limit: 1000 }),
      IncomeModel.findAll({ userId, page: 1, limit: 1000 }),
      BudgetModel.findAll(userId, currentMonth, currentYear)
    ]);

    const expenses = allExpensesRes.data;
    const incomes = allIncomeRes.data;

    // Totals (All Time)
    const totalIncomeAllTime = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpensesAllTime = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalBalance = Math.max(0, totalIncomeAllTime - totalExpensesAllTime);

    // Current Month Totals
    const currentMonthExpenses = expenses.filter(e => {
      return e.expense_date >= startOfCurrentMonth && e.expense_date <= endOfCurrentMonth;
    });

    const currentMonthIncomes = incomes.filter(i => {
      return i.income_date >= startOfCurrentMonth && i.income_date <= endOfCurrentMonth;
    });

    const thisMonthSpending = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonthIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const thisMonthSavings = Math.max(0, thisMonthIncome - thisMonthSpending);
    const savingsRate = thisMonthIncome > 0 
      ? Number(((thisMonthSavings / thisMonthIncome) * 100).toFixed(1))
      : 0;

    // Expense by Category (Current month or all-time if month empty)
    const categorySource = currentMonthExpenses.length > 0 ? currentMonthExpenses : expenses;
    const categoryTotals = {};
    let categorySum = 0;

    for (const exp of categorySource) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      categorySum += exp.amount;
    }

    const expenseByCategory = Object.keys(categoryTotals).map(category => {
      const amount = categoryTotals[category];
      const percentage = categorySum > 0 ? Number(((amount / categorySum) * 100).toFixed(1)) : 0;
      return { category, amount, percentage };
    }).sort((a, b) => b.amount - a.amount);

    // Needs vs Wants
    let needsTotal = 0;
    let wantsTotal = 0;
    for (const exp of categorySource) {
      if (exp.expense_type === 'need') {
        needsTotal += exp.amount;
      } else {
        wantsTotal += exp.amount;
      }
    }
    const totalNeedsWants = needsTotal + wantsTotal;
    const needsVsWants = {
      needsAmount: needsTotal,
      wantsAmount: wantsTotal,
      needsPercentage: totalNeedsWants > 0 ? Number(((needsTotal / totalNeedsWants) * 100).toFixed(1)) : 0,
      wantsPercentage: totalNeedsWants > 0 ? Number(((wantsTotal / totalNeedsWants) * 100).toFixed(1)) : 0
    };

    // Monthly Expenses (Last 6 calendar months)
    const monthlyExpenses = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthPrefix = `${y}-${String(m).padStart(2, '0')}`;

      const monthExps = expenses.filter(e => e.expense_date.startsWith(monthPrefix));
      const monthIncs = incomes.filter(inc => inc.income_date.startsWith(monthPrefix));

      const expTotal = monthExps.reduce((acc, curr) => acc + curr.amount, 0);
      const incTotal = monthIncs.reduce((acc, curr) => acc + curr.amount, 0);

      monthlyExpenses.push({
        monthName: monthNames[d.getMonth()],
        fullName: `${monthNames[d.getMonth()]} ${y}`,
        month: m,
        year: y,
        expenses: expTotal,
        income: incTotal
      });
    }

    // Spending Trend (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const trendExpenses = expenses.filter(e => e.expense_date >= thirtyDaysAgoStr);
    const trendMap = {};

    for (let i = 0; i < 30; i++) {
      const day = new Date(thirtyDaysAgo);
      day.setDate(day.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      const label = `${day.getDate()} ${monthNames[day.getMonth()]}`;
      trendMap[dateStr] = { date: dateStr, label, amount: 0 };
    }

    for (const exp of trendExpenses) {
      if (trendMap[exp.expense_date]) {
        trendMap[exp.expense_date].amount += exp.amount;
      }
    }
    const spendingTrend = Object.values(trendMap);

    // Budgets with Spent & Status
    const budgetsWithProgress = currentBudgets.map(b => {
      const catLower = (b.category || '').toLowerCase().trim();
      let spent = 0;
      for (const exp of currentMonthExpenses) {
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
        budget: b.amount,
        spent,
        remaining,
        percentageUsed,
        isExceeded
      };
    });

    // Recent Transactions (Combined expenses and incomes sorted by date)
    const recentExpenses = expenses.slice(0, 10).map(e => ({
      id: e.id,
      type: 'expense',
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: e.expense_date,
      paymentMethod: e.payment_method,
      expenseType: e.expense_type
    }));

    const recentIncome = incomes.slice(0, 5).map(i => ({
      id: i.id,
      type: 'income',
      category: i.source,
      description: i.description || i.source,
      amount: i.amount,
      date: i.income_date,
      paymentMethod: 'Deposit'
    }));

    const recentTransactions = [...recentExpenses, ...recentIncome]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    // Calculate Transparent Spending Health Score (0 - 100)
    const healthScoreData = this.calculateHealthScore({
      budgets: budgetsWithProgress,
      income: thisMonthIncome || totalIncomeAllTime,
      expenses: thisMonthSpending,
      needsPercentage: needsVsWants.needsPercentage,
      monthlyExpenses
    });

    return {
      balance: totalBalance,
      income: totalIncomeAllTime,
      expenses: totalExpensesAllTime,
      thisMonthSpending,
      thisMonthIncome,
      thisMonthSavings,
      savingsRate,
      expenseByCategory,
      needsVsWants,
      monthlyExpenses,
      spendingTrend,
      budgets: budgetsWithProgress,
      recentTransactions,
      healthScore: healthScoreData
    };
  }

  /**
   * Transparent Spending Health Score Calculation (0 - 100)
   */
  static calculateHealthScore({ budgets, income, expenses, needsPercentage, monthlyExpenses }) {
    // 1. Budget discipline (Weight: 25%)
    let budgetScore = 80;
    if (budgets && budgets.length > 0) {
      const exceededCount = budgets.filter(b => b.isExceeded).length;
      const adherence = (budgets.length - exceededCount) / budgets.length;
      budgetScore = Math.round(adherence * 100);
    }

    // 2. Savings rate factor (Weight: 25%)
    let savingsScore = 50;
    if (income > 0) {
      const rate = ((income - expenses) / income) * 100;
      if (rate >= 25) savingsScore = 100;
      else if (rate >= 15) savingsScore = 85;
      else if (rate >= 5) savingsScore = 70;
      else if (rate >= 0) savingsScore = 55;
      else savingsScore = 25;
    }

    // 3. Needs vs Wants factor (Weight: 25%) - ideal teen target: 60-70% needs
    let needsScore = 75;
    if (needsPercentage > 0) {
      if (needsPercentage >= 55 && needsPercentage <= 75) needsScore = 95;
      else if (needsPercentage >= 45) needsScore = 80;
      else if (needsPercentage >= 35) needsScore = 65;
      else needsScore = 45;
    }

    // 4. Spending trend (Weight: 25%) - Month-over-month stability
    let trendScore = 80;
    if (monthlyExpenses && monthlyExpenses.length >= 2) {
      const curr = monthlyExpenses[monthlyExpenses.length - 1]?.expenses || 0;
      const prev = monthlyExpenses[monthlyExpenses.length - 2]?.expenses || 0;
      if (prev > 0) {
        if (curr <= prev) trendScore = 95; // Spent same or less
        else if (curr <= prev * 1.1) trendScore = 80; // Within 10%
        else if (curr <= prev * 1.25) trendScore = 65; // Within 25%
        else trendScore = 50;
      }
    }

    const overallScore = Math.round(
      (budgetScore * 0.25) +
      (savingsScore * 0.25) +
      (needsScore * 0.25) +
      (trendScore * 0.25)
    );

    let status = 'Good';
    if (overallScore >= 85) status = 'Excellent';
    else if (overallScore >= 70) status = 'Good';
    else if (overallScore >= 55) status = 'Fair';
    else status = 'Needs Attention';

    return {
      score: overallScore,
      status,
      factors: {
        budgetDiscipline: budgetScore,
        savingsRate: savingsScore,
        needsVsWants: needsScore,
        spendingTrend: trendScore
      }
    };
  }

  /**
   * Dedicated in-depth analytics calculation for Analytics Page
   */
  static async getAdvancedAnalytics(userId, rangeDays = 30) {
    const allExpenses = await ExpenseModel.findAll({ userId, page: 1, limit: 1000 });
    const expenses = allExpenses.data;

    const allIncome = await IncomeModel.findAll({ userId, page: 1, limit: 1000 });
    const incomes = allIncome.data;

    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    // Days covered
    const days = Math.max(1, rangeDays);
    const averageDailySpending = Number((totalSpending / days).toFixed(2));
    const averageWeeklySpending = Number((averageDailySpending * 7).toFixed(2));
    const averageMonthlySpending = Number((averageDailySpending * 30).toFixed(2));

    // Highest single expense
    let highestSingleExpense = null;
    for (const exp of expenses) {
      if (!highestSingleExpense || exp.amount > highestSingleExpense.amount) {
        highestSingleExpense = exp;
      }
    }

    // Category distribution
    const categoryMap = {};
    for (const exp of expenses) {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    }

    let highestCategory = null;
    let highestCategoryAmount = 0;
    for (const [cat, amt] of Object.entries(categoryMap)) {
      if (amt > highestCategoryAmount) {
        highestCategory = cat;
        highestCategoryAmount = amt;
      }
    }

    // Day of the week breakdown & Most expensive day
    const dayTotals = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dateSpendMap = {};

    for (const exp of expenses) {
      const d = new Date(exp.expense_date);
      const dayName = dayNames[d.getDay()];
      if (dayTotals[dayName] !== undefined) {
        dayTotals[dayName] += exp.amount;
      }
      dateSpendMap[exp.expense_date] = (dateSpendMap[exp.expense_date] || 0) + exp.amount;
    }

    let mostExpensiveDate = null;
    let mostExpensiveDateAmount = 0;
    for (const [dateStr, amt] of Object.entries(dateSpendMap)) {
      if (amt > mostExpensiveDateAmount) {
        mostExpensiveDate = dateStr;
        mostExpensiveDateAmount = amt;
      }
    }

    // Payment method distribution
    const paymentMethodMap = {};
    for (const exp of expenses) {
      paymentMethodMap[exp.payment_method] = (paymentMethodMap[exp.payment_method] || 0) + exp.amount;
    }
    const paymentMethodDistribution = Object.keys(paymentMethodMap).map(method => ({
      method,
      amount: paymentMethodMap[method],
      percentage: totalSpending > 0 ? Number(((paymentMethodMap[method] / totalSpending) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Month-over-month comparison
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth() + 1;
    const prevMonthDate = new Date(currYear, currMonth - 2, 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();

    const currPrefix = `${currYear}-${String(currMonth).padStart(2, '0')}`;
    const prevPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const currMonthSpending = expenses
      .filter(e => e.expense_date.startsWith(currPrefix))
      .reduce((sum, e) => sum + e.amount, 0);

    const prevMonthSpending = expenses
      .filter(e => e.expense_date.startsWith(prevPrefix))
      .reduce((sum, e) => sum + e.amount, 0);

    const spendDifference = currMonthSpending - prevMonthSpending;
    const spendDifferenceAbs = Math.abs(spendDifference);
    const monthComparison = {
      currentMonthSpending: currMonthSpending,
      previousMonthSpending: prevMonthSpending,
      difference: spendDifference,
      isLower: spendDifference < 0,
      summary: prevMonthSpending > 0
        ? (spendDifference < 0 
            ? `You spent ₹${spendDifferenceAbs.toLocaleString('en-IN')} less this month!` 
            : `You spent ₹${spendDifferenceAbs.toLocaleString('en-IN')} more than last month.`)
        : `Recorded ₹${currMonthSpending.toLocaleString('en-IN')} in spending for this month.`
    };

    return {
      totalSpending,
      totalIncome,
      averageDailySpending,
      averageWeeklySpending,
      averageMonthlySpending,
      highestSpendingCategory: highestCategory ? { category: highestCategory, amount: highestCategoryAmount } : null,
      highestSingleExpense,
      mostExpensiveDay: mostExpensiveDate ? { date: mostExpensiveDate, amount: mostExpensiveDateAmount } : null,
      dayOfWeekDistribution: Object.keys(dayTotals).map(day => ({ day, amount: dayTotals[day] })),
      paymentMethodDistribution,
      monthComparison
    };
  }
}

export default AnalyticsService;
