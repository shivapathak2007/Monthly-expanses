import ExpenseModel from '../models/expenseModel.js';
import IncomeModel from '../models/incomeModel.js';
import BudgetModel from '../models/budgetModel.js';

export const THRESHOLDS = {
  HIGH_CATEGORY_RATIO: 0.30,        // Category is > 30% of total spending
  HIGH_WANTS_RATIO: 0.50,           // Wants > Needs
  EXPENSE_TO_INCOME_CAUTION: 0.80,  // Expenses > 80% of income
  OVERSPENDING_RATIO: 1.00,         // Expenses > 100% of income
  HEALTHY_SAVINGS_RATE: 20.0,       // Savings rate >= 20%
  BUDGET_WARNING_RATIO: 0.85        // Spent >= 85% of budget
};

export class RecommendationService {
  /**
   * Analyze user expenses and generate smart, educational recommendations
   * @param {string} userId - Authenticated user ID
   * @returns {Promise<Array>} List of recommendation objects
   */
  static async generateRecommendations(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const startOfCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const endOfCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // Previous month range
    const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const startOfPrevMonth = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const endOfPrevMonth = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

    const [allExpensesRes, allIncomesRes, budgets] = await Promise.all([
      ExpenseModel.findAll({ userId, page: 1, limit: 1000 }),
      IncomeModel.findAll({ userId, page: 1, limit: 1000 }),
      BudgetModel.findAll(userId, currentMonth, currentYear)
    ]);

    const expenses = allExpensesRes.data;
    const incomes = allIncomesRes.data;

    const currentMonthExpenses = expenses.filter(e => e.expense_date >= startOfCurrentMonth && e.expense_date <= endOfCurrentMonth);
    const prevMonthExpenses = expenses.filter(e => e.expense_date >= startOfPrevMonth && e.expense_date <= endOfPrevMonth);
    const currentMonthIncomes = incomes.filter(i => i.income_date >= startOfCurrentMonth && i.income_date <= endOfCurrentMonth);

    const thisMonthSpending = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonthIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const prevMonthSpending = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const recommendations = [];

    // If no transactions yet
    if (expenses.length === 0) {
      return [
        {
          id: 'welcome-tip',
          type: 'tip',
          icon: '💡',
          title: 'Welcome to SpendWise!',
          message: 'Start by tracking your first daily expense or pocket money deposit to receive personalized financial insights.',
          actionText: 'Add an Expense',
          actionLink: '/expenses/add',
          severity: 'info'
        }
      ];
    }

    // 1. Budget Warnings & Alerts
    const categorySpendMap = {};
    for (const exp of currentMonthExpenses) {
      categorySpendMap[exp.category] = (categorySpendMap[exp.category] || 0) + exp.amount;
    }

    for (const budget of budgets) {
      const spent = categorySpendMap[budget.category] || 0;
      if (spent > budget.amount) {
        recommendations.push({
          id: `budget-exceeded-${budget.category}`,
          type: 'alert',
          icon: '⚠️',
          title: `${budget.category} Budget Exceeded`,
          message: `Based on your recorded spending, you have spent ₹${spent.toLocaleString('en-IN')} on ${budget.category}, exceeding your ₹${budget.amount.toLocaleString('en-IN')} limit. Try pausing non-essential purchases in this category for the rest of the month.`,
          severity: 'danger'
        });
      } else if (spent >= budget.amount * THRESHOLDS.BUDGET_WARNING_RATIO) {
        const remaining = budget.amount - spent;
        const percent = Math.round((spent / budget.amount) * 100);
        recommendations.push({
          id: `budget-warning-${budget.category}`,
          type: 'caution',
          icon: '⏳',
          title: `${budget.category} Approaching Budget Limit`,
          message: `You've used ${percent}% of your ${budget.category} budget (₹${remaining.toLocaleString('en-IN')} remaining). Keep an eye on expenses here to finish the month smoothly.`,
          severity: 'warning'
        });
      }
    }

    // 2. High Category Spending Analysis (> 30% of total spending)
    const activeExpenses = currentMonthExpenses.length > 0 ? currentMonthExpenses : expenses;
    const activeTotal = thisMonthSpending > 0 ? thisMonthSpending : expenses.reduce((s, e) => s + e.amount, 0);

    const categoryIcons = {
      Food: '🍔',
      Travel: '🚕',
      Entertainment: '🎮',
      Shopping: '🛍️',
      Gaming: '👾',
      Subscriptions: '📱',
      Clothing: '👟',
      Education: '📚'
    };

    if (activeTotal > 0) {
      for (const [category, amount] of Object.entries(categorySpendMap)) {
        const ratio = amount / activeTotal;
        if (ratio >= THRESHOLDS.HIGH_CATEGORY_RATIO) {
          const pct = Math.round(ratio * 100);
          const icon = categoryIcons[category] || '📊';
          const suggestedBudget = Math.round(amount * 0.75);

          recommendations.push({
            id: `high-category-${category}`,
            type: 'insight',
            icon,
            title: `${category} Spending is High`,
            message: `You spent ₹${amount.toLocaleString('en-IN')} on ${category} this month, which is ${pct}% of your total spending. Consider setting a ${category} budget of around ₹${suggestedBudget.toLocaleString('en-IN')} to increase your savings.`,
            severity: 'warning'
          });
        }
      }
    }

    // 3. Needs vs Wants Ratio (Impulse Spending Analysis)
    let needsTotal = 0;
    let wantsTotal = 0;
    for (const exp of activeExpenses) {
      if (exp.expense_type === 'need') needsTotal += exp.amount;
      else wantsTotal += exp.amount;
    }
    const totalNeedsWants = needsTotal + wantsTotal;

    if (totalNeedsWants > 0 && wantsTotal > needsTotal) {
      const wantsPct = Math.round((wantsTotal / totalNeedsWants) * 100);
      recommendations.push({
        id: 'high-wants-insight',
        type: 'habit',
        icon: '💡',
        title: 'Spending Insight: The 24-Hour Rule',
        message: `Your "Want" expenses represent ${wantsPct}% of your spending, higher than your "Needs". Before your next impulse purchase, try waiting 24 hours. If you still want it tomorrow, it may be worth it!`,
        severity: 'info'
      });
    }

    // 4. Overspending vs Income Check
    if (thisMonthIncome > 0) {
      if (thisMonthSpending > thisMonthIncome) {
        const deficit = thisMonthSpending - thisMonthIncome;
        recommendations.push({
          id: 'overspending-danger',
          type: 'danger',
          icon: '🚨',
          title: 'Expenses Exceed Monthly Income',
          message: `Based on your recorded records, you've spent ₹${deficit.toLocaleString('en-IN')} more than your recorded income this month. Look over your subscriptions and discretionary "Want" purchases to balance the scales.`,
          severity: 'danger'
        });
      } else if (thisMonthSpending >= thisMonthIncome * THRESHOLDS.EXPENSE_TO_INCOME_CAUTION) {
        recommendations.push({
          id: 'caution-income-ratio',
          type: 'caution',
          icon: '⚠️',
          title: 'High Spending Relative to Income',
          message: `You have spent over 80% of your recorded income for this month. Slowing down non-essential expenses for the remaining days will keep you in the green!`,
          severity: 'warning'
        });
      }
    }

    // 5. Positive Reinforcement (Savings Rate >= 20%)
    if (thisMonthIncome > 0 && thisMonthSpending < thisMonthIncome) {
      const savings = thisMonthIncome - thisMonthSpending;
      const rate = (savings / thisMonthIncome) * 100;
      if (rate >= THRESHOLDS.HEALTHY_SAVINGS_RATE) {
        recommendations.push({
          id: 'positive-savings-habit',
          type: 'celebration',
          icon: '🌟',
          title: 'Outstanding Saving Habit!',
          message: `You saved ₹${savings.toLocaleString('en-IN')} this month (a ${rate.toFixed(1)}% savings rate). You're mastering smart money habits early!`,
          severity: 'success'
        });
      }
    }

    // 6. Month-over-Month Progress
    if (prevMonthSpending > 0 && thisMonthSpending > 0) {
      if (thisMonthSpending < prevMonthSpending) {
        const savedAmount = prevMonthSpending - thisMonthSpending;
        const percentLower = Math.round((savedAmount / prevMonthSpending) * 100);
        if (percentLower >= 5) {
          recommendations.push({
            id: 'spending-progress-celebration',
            type: 'celebration',
            icon: '🔥',
            title: 'Great Progress!',
            message: `Your spending is ${percentLower}% lower than last month (saved ₹${savedAmount.toLocaleString('en-IN')}). You are building a sustainable financial future!`,
            severity: 'success'
          });
        }
      }
    }

    // 7. General Student/Teenager Money Rule of Thumb (if few recommendations)
    if (recommendations.length < 2) {
      recommendations.push({
        id: 'teen-50-30-20-rule',
        type: 'education',
        icon: '🎯',
        title: 'The Teenager 50/30/20 Rule',
        message: 'A great guideline for students: aim for 50% on essentials (lunch, transport, study material), 30% for fun, and 20% directly into your savings or future goals.',
        severity: 'info'
      });
    }

    return recommendations;
  }
}

export default RecommendationService;
