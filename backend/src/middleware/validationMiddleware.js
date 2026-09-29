import {
  isValidEmail,
  isValidPassword,
  isValidNumber,
  isValidDate,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  EXPENSE_TYPES,
  INCOME_SOURCES,
  SUPPORTED_CURRENCIES
} from '../utils/validators.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword, age, monthly_income } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Name must be at least 2 characters long'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Please provide a valid email address'
    });
  }

  if (!isValidPassword(password)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Password must be at least 6 characters long'
    });
  }

  if (password !== confirmPassword) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Password confirmation does not match'
    });
  }

  if (!isValidNumber(age, { min: 10, max: 100, integer: true })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Age must be a valid number between 10 and 100'
    });
  }

  if (monthly_income !== undefined && !isValidNumber(monthly_income, { min: 0 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Monthly pocket money / income must be 0 or greater'
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Please enter a valid email address'
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Password is required'
    });
  }

  next();
};

export const validateExpense = (req, res, next) => {
  const { amount, category, description, expense_date, payment_method, expense_type } = req.body;

  if (!isValidNumber(amount, { min: 0.01 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Amount must be greater than 0'
    });
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Category or product name is required'
    });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Description is required'
    });
  }

  if (expense_date && !isValidDate(expense_date)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Please enter a valid expense date'
    });
  }

  if (!payment_method || !PAYMENT_METHODS.includes(payment_method)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`
    });
  }

  const normalizedType = (expense_type || 'want').toLowerCase();
  if (!EXPENSE_TYPES.includes(normalizedType)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: "Expense type must be either 'need' or 'want'"
    });
  }
  req.body.expense_type = normalizedType;

  next();
};

export const validateIncome = (req, res, next) => {
  const { amount, source, income_date } = req.body;

  if (!isValidNumber(amount, { min: 0.01 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Amount must be greater than 0'
    });
  }

  if (!source || !INCOME_SOURCES.includes(source)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: `Income source must be one of: ${INCOME_SOURCES.join(', ')}`
    });
  }

  if (income_date && !isValidDate(income_date)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Please provide a valid income date'
    });
  }

  next();
};

export const validateBudget = (req, res, next) => {
  const { category, amount, month, year } = req.body;

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Item or category name is required'
    });
  }

  if (!isValidNumber(amount, { min: 0.01 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Budget amount must be greater than 0'
    });
  }

  if (!isValidNumber(month, { min: 1, max: 12, integer: true })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Month must be an integer between 1 and 12'
    });
  }

  if (!isValidNumber(year, { min: 2020, integer: true })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Year must be 2020 or later'
    });
  }

  next();
};

export const validateGoal = (req, res, next) => {
  const { name, target_amount, current_amount, deadline } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Goal name is required'
    });
  }

  if (!isValidNumber(target_amount, { min: 0.01 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Target amount must be greater than 0'
    });
  }

  if (current_amount !== undefined && !isValidNumber(current_amount, { min: 0 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Current amount must be 0 or greater'
    });
  }

  if (deadline && !isValidDate(deadline)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Please enter a valid deadline date'
    });
  }

  next();
};

export const validateProfile = (req, res, next) => {
  const { name, age, monthly_income, currency } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Name must be at least 2 characters long'
    });
  }

  if (age !== undefined && !isValidNumber(age, { min: 10, max: 100, integer: true })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Age must be between 10 and 100'
    });
  }

  if (monthly_income !== undefined && !isValidNumber(monthly_income, { min: 0 })) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: 'Monthly income must be 0 or greater'
    });
  }

  if (currency !== undefined && !SUPPORTED_CURRENCIES.includes(currency)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`
    });
  }

  next();
};
