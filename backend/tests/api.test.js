import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('Kharcha Backend API Tests', () => {
  let authToken = '';
  let expenseId1 = '';
  let expenseId2 = '';
  const testEmail = `user_${Date.now()}@test.com`;

  test('GET /api/health should return 200 OK with Kharcha message', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Kharcha API is healthy and operational');
  });

  test('POST /api/auth/register should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Aarav Sharma',
        email: testEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        age: 26,
        monthly_income: 45000,
        currency: 'INR'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.password_hash, undefined, 'Password hash must never be returned');
    authToken = res.body.data.token;
  });

  test('POST /api/auth/login should authenticate user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'securePassword123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.password_hash, undefined);
  });

  test('POST /api/auth/login should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'wrongPassword!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/expenses should create first expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 350,
        category: 'Food',
        description: 'Team lunch pizza',
        payment_method: 'UPI',
        expense_type: 'need',
        expense_date: '2026-09-20'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 350);
    assert.equal(res.body.data.category, 'Food');
    expenseId1 = res.body.data.id;
  });

  test('POST /api/expenses should create second expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 800,
        category: 'Shopping',
        description: 'New wireless mouse',
        payment_method: 'Card',
        expense_type: 'want',
        expense_date: '2026-09-21'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    expenseId2 = res.body.data.id;
  });

  test('GET /api/expenses should retrieve user expenses with pagination', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);
  });

  test('POST /api/income should record user income', async () => {
    const res = await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 45000,
        source: 'Salary',
        description: 'Monthly salary credit'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 45000);
  });

  test('POST /api/budgets should set a category budget', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        category: 'Food',
        amount: 8000,
        month: 9,
        year: 2026
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.category, 'Food');
    assert.equal(res.body.data.amount, 8000);
  });

  test('GET /api/data/export/preview should generate structured preview data', async () => {
    const res = await request(app)
      .get('/api/data/export/preview')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.summary);
    assert.ok(res.body.data.summary.totalIncome >= 45000);
    assert.ok(Array.isArray(res.body.data.expenses));
  });

  test('GET /api/data/export/download should download authentic Excel workbook', async () => {
    const res = await request(app)
      .get('/api/data/export/download')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(
      res.headers['content-type'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    assert.ok(res.body.length > 0 || res.headers['content-length'] > 0);
  });

  test('POST /api/expenses/bulk-delete should bulk delete selected expenses', async () => {
    const res = await request(app)
      .post('/api/expenses/bulk-delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ids: [expenseId1, expenseId2] });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.count, 2);
  });

  test('DELETE /api/account should permanently delete user account and associated data', async () => {
    const res = await request(app)
      .delete('/api/account')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
