import { z } from 'zod';
import {
  PAYMENT_METHODS,
  EXPENSE_TYPES,
  INCOME_SOURCES,
  SUPPORTED_CURRENCIES
} from '../utils/validators.js';

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: error.errors[0].message
      });
    }
    next(error);
  }
};

export const validateRegister = validate(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
      email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters long'),
      confirmPassword: z.string(),
      age: z.coerce
        .number()
        .int()
        .min(10, 'Age must be a valid number between 10 and 100')
        .max(100, 'Age must be a valid number between 10 and 100'),
      monthly_income: z.coerce
        .number()
        .min(0, 'Monthly pocket money / income must be 0 or greater')
        .optional()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Password confirmation does not match',
      path: ['confirmPassword']
    })
);

export const validateLogin = validate(
  z.object({
    email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
  })
);

export const validateExpense = validate(
  z.object({
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    category: z.string().trim().min(1, 'Category or product name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    expense_date: z
      .string()
      .refine((val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      }, 'Please enter a valid expense date')
      .optional()
      .nullable(),
    payment_method: z
      .string()
      .refine(
        (val) => PAYMENT_METHODS.includes(val),
        `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`
      ),
    expense_type: z
      .string()
      .optional()
      .default('want')
      .transform((val) => val.toLowerCase())
      .refine((val) => EXPENSE_TYPES.includes(val), "Expense type must be either 'need' or 'want'"),
    notes: z.string().optional().nullable()
  })
);

export const validateIncome = validate(
  z.object({
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    source: z
      .string()
      .refine(
        (val) => INCOME_SOURCES.includes(val),
        `Income source must be one of: ${INCOME_SOURCES.join(', ')}`
      ),
    income_date: z
      .string()
      .refine((val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      }, 'Please provide a valid income date')
      .optional()
      .nullable()
  })
);

export const validateBudget = validate(
  z.object({
    category: z.string().trim().min(1, 'Item or category name is required'),
    amount: z.coerce.number().min(0.01, 'Budget amount must be greater than 0'),
    month: z.coerce
      .number()
      .int()
      .min(1, 'Month must be an integer between 1 and 12')
      .max(12, 'Month must be an integer between 1 and 12'),
    year: z.coerce.number().int().min(2020, 'Year must be 2020 or later')
  })
);

export const validateGoal = validate(
  z.object({
    name: z.string().trim().min(1, 'Goal name is required'),
    target_amount: z.coerce.number().min(0.01, 'Target amount must be greater than 0'),
    current_amount: z.coerce
      .number()
      .min(0, 'Current amount must be 0 or greater')
      .optional()
      .default(0),
    deadline: z
      .string()
      .refine((val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      }, 'Please enter a valid deadline date')
      .optional()
      .nullable()
  })
);

export const validateProfile = validate(
  z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long').optional(),
    age: z.coerce
      .number()
      .int()
      .min(10, 'Age must be between 10 and 100')
      .max(100, 'Age must be between 10 and 100')
      .optional(),
    monthly_income: z.coerce.number().min(0, 'Monthly income must be 0 or greater').optional(),
    currency: z
      .string()
      .refine(
        (val) => SUPPORTED_CURRENCIES.includes(val),
        `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`
      )
      .optional()
  })
);
