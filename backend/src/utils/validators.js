export const EXPENSE_CATEGORIES = [
  'Food & Snacks',
  'Travel & Transport',
  'Shopping & Clothes',
  'Fun & Gaming',
  'Study & College',
  'Bills & Subscriptions',
  'Personal & Other'
];

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
];

export const EXPENSE_TYPES = ['need', 'want'];

export const INCOME_SOURCES = [
  'Pocket Money',
  'Salary',
  'Freelance',
  'Gift',
  'Scholarship',
  'Other'
];

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const isValidNumber = (val, { min = 0, max = Infinity, integer = false } = {}) => {
  const num = Number(val);
  if (isNaN(num)) return false;
  if (integer && !Number.isInteger(num)) return false;
  return num >= min && num <= max;
};

export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
};
