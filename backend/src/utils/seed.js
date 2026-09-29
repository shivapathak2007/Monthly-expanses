import UserModel from '../models/userModel.js';
import ExpenseModel from '../models/expenseModel.js';
import IncomeModel from '../models/incomeModel.js';
import BudgetModel from '../models/budgetModel.js';
import GoalModel from '../models/goalModel.js';
import { hashPassword } from './passwordUtils.js';

async function seedData() {
  console.log('🌱 Starting SpendWise database seed...\n');

  const demoEmail = 'shiva@example.com';
  let user = await UserModel.findByEmail(demoEmail);

  if (!user) {
    console.log('👤 Creating demo teenager user...');
    const password_hash = await hashPassword('password123');
    user = await UserModel.create({
      name: 'Shiva Pathak',
      email: demoEmail,
      password_hash,
      age: 18,
      monthly_income: 15000,
      currency: 'INR'
    });
    console.log(`✅ Demo user created: ${user.name} (${user.email})`);
  } else {
    console.log(`ℹ️  Demo user already exists: ${user.name} (${user.email})`);
  }

  const userId = user.id;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Add Income
  console.log('💰 Adding realistic income entries...');
  const incomeRecords = [
    {
      userId,
      amount: 10000,
      source: 'Pocket Money',
      description: 'Monthly pocket money from parents',
      income_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    },
    {
      userId,
      amount: 3500,
      source: 'Freelance',
      description: 'Web development mini project for neighbor',
      income_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`
    },
    {
      userId,
      amount: 1500,
      source: 'Gift',
      description: 'Birthday gift from grandparents',
      income_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`
    }
  ];

  for (const inc of incomeRecords) {
    await IncomeModel.create(inc);
  }

  // Add Budgets
  console.log('🎯 Setting category budgets...');
  const budgetList = [
    { userId, category: 'Food', amount: 2500, month: currentMonth, year: currentYear },
    { userId, category: 'Travel', amount: 1500, month: currentMonth, year: currentYear },
    { userId, category: 'Shopping', amount: 2000, month: currentMonth, year: currentYear },
    { userId, category: 'Entertainment', amount: 1200, month: currentMonth, year: currentYear },
    { userId, category: 'Education', amount: 1500, month: currentMonth, year: currentYear },
    { userId, category: 'Gaming', amount: 800, month: currentMonth, year: currentYear }
  ];

  for (const b of budgetList) {
    const existing = await BudgetModel.findByCategory(userId, b.category, b.month, b.year);
    if (!existing) {
      await BudgetModel.create(b);
    }
  }

  // Add Expenses with various dates, categories, payment methods, needs/wants
  console.log('💸 Adding realistic expenses across this month and previous months...');
  const sampleExpenses = [
    {
      amount: 350,
      category: 'Food',
      description: "Domino's pizza with study group",
      payment_method: 'UPI',
      expense_type: 'want',
      notes: 'Weekend chill',
      offsetDays: 0
    },
    {
      amount: 220,
      category: 'Travel',
      description: 'Metro card recharge for college commute',
      payment_method: 'UPI',
      expense_type: 'need',
      notes: 'Weekly transport',
      offsetDays: 1
    },
    {
      amount: 500,
      category: 'Gaming',
      description: 'Steam summer game pass',
      payment_method: 'Debit Card',
      expense_type: 'want',
      notes: 'Discount deal',
      offsetDays: 2
    },
    {
      amount: 450,
      category: 'Education',
      description: 'Python Data Structures textbook & notebook',
      payment_method: 'Cash',
      expense_type: 'need',
      notes: 'College syllabus requirement',
      offsetDays: 4
    },
    {
      amount: 180,
      category: 'Food',
      description: 'College canteen lunch & fruit juice',
      payment_method: 'UPI',
      expense_type: 'need',
      notes: 'Campus food',
      offsetDays: 5
    },
    {
      amount: 1199,
      category: 'Shopping',
      description: 'Sneakers on Amazon flash sale',
      payment_method: 'Debit Card',
      expense_type: 'want',
      notes: 'Footwear replacement',
      offsetDays: 7
    },
    {
      amount: 199,
      category: 'Subscriptions',
      description: 'Spotify Student Premium subscription',
      payment_method: 'Credit Card',
      expense_type: 'want',
      notes: 'Monthly music',
      offsetDays: 9
    },
    {
      amount: 320,
      category: 'Entertainment',
      description: 'Movie ticket with friends (Inception re-release)',
      payment_method: 'UPI',
      expense_type: 'want',
      notes: 'Cinema',
      offsetDays: 11
    },
    {
      amount: 260,
      category: 'Food',
      description: 'Café coffee and croissant during exam study',
      payment_method: 'Cash',
      expense_type: 'want',
      notes: 'Exam prep',
      offsetDays: 14
    },
    {
      amount: 600,
      category: 'Education',
      description: 'Scientific calculator for physics',
      payment_method: 'UPI',
      expense_type: 'need',
      notes: 'Required for semester lab',
      offsetDays: 16
    },
    {
      amount: 350,
      category: 'Personal Care',
      description: 'Haircut and grooming',
      payment_method: 'Cash',
      expense_type: 'need',
      notes: 'Monthly routine',
      offsetDays: 18
    },
    {
      amount: 150,
      category: 'Travel',
      description: 'Auto rickshaw back in rain',
      payment_method: 'UPI',
      expense_type: 'need',
      notes: 'Bad weather',
      offsetDays: 20
    }
  ];

  for (const item of sampleExpenses) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() - item.offsetDays);
    const dateStr = expDate.toISOString().split('T')[0];

    await ExpenseModel.create({
      userId,
      amount: item.amount,
      category: item.category,
      description: item.description,
      expense_date: dateStr,
      payment_method: item.payment_method,
      expense_type: item.expense_type,
      notes: item.notes
    });
  }

  // Financial Goals
  console.log('🏆 Setting financial savings goals...');
  const goalsList = [
    {
      userId,
      name: 'Sony Noise-Canceling Headphones',
      target_amount: 5000,
      current_amount: 2800,
      deadline: `${currentYear}-12-31`
    },
    {
      userId,
      name: 'College Tech Fest Trip Fund',
      target_amount: 3500,
      current_amount: 1500,
      deadline: `${currentYear + 1}-02-28`
    },
    {
      userId,
      name: 'Emergency Savings Cushion',
      target_amount: 10000,
      current_amount: 4500,
      deadline: `${currentYear + 1}-06-30`
    }
  ];

  for (const g of goalsList) {
    await GoalModel.create(g);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('------------------------------------------------------');
  console.log('Demo Credentials for Testing:');
  console.log('Email:    shiva@example.com');
  console.log('Password: password123');
  console.log('------------------------------------------------------\n');
}

seedData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
