import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('SpendWise Backend API Tests', () => {
  let authToken = '';
  let expenseId = '';
  const testEmail = `teen_${Date.now()}@test.com`;

  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'SpendWise API is healthy and operational');
  });

  test('POST /api/auth/register should register a new teenager user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Aarav Sharma',
        email: testEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        age: 17,
        monthly_income: 8000,
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

  test('GET /api/auth/me should return current user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testEmail);
  });

  test('GET /api/expenses without token should reject with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/expenses');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/expenses should create an expense with valid fields', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 250,
        category: 'Food',
        description: 'Burger and fries after school',
        expense_date: '2026-09-29',
        payment_method: 'UPI',
        expense_type: 'want',
        notes: 'Hangout'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.amount, 250);
    assert.equal(res.body.data.category, 'Food');
    expenseId = res.body.data.id;
  });

  test('POST /api/expenses should fail validation if amount is negative', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: -50,
        category: 'Food',
        description: 'Negative test',
        payment_method: 'Cash',
        expense_type: 'need'
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  test('GET /api/expenses should return filtered and paginated expenses', async () => {
    const res = await request(app)
      .get('/api/expenses?category=Food&page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
    assert.equal(res.body.data.length >= 1, true);
  });

  test('PUT /api/expenses/:id should update expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 280,
        notes: 'Added extra drink'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 280);
    assert.equal(res.body.data.notes, 'Added extra drink');
  });

  test('POST /api/income should add income record', async () => {
    const res = await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 5000,
        source: 'Pocket Money',
        description: 'September pocket money'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 5000);
  });

  test('POST /api/budgets should set a category budget', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        category: 'Food',
        amount: 2000,
        month: 9,
        year: 2026
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.category, 'Food');
    assert.equal(res.body.data.amount, 2000);
  });

  test('GET /api/dashboard should return complete calculated metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.balance !== undefined);
    assert.ok(res.body.data.income !== undefined);
    assert.ok(res.body.data.expenses !== undefined);
    assert.ok(Array.isArray(res.body.data.expenseByCategory));
    assert.ok(Array.isArray(res.body.data.monthlyExpenses));
    assert.ok(Array.isArray(res.body.data.recommendations));
    assert.ok(res.body.data.healthScore);
    assert.ok(res.body.data.healthScore.score >= 0 && res.body.data.healthScore.score <= 100);
  });

  test('DELETE /api/expenses/:id should remove the expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
