import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4000/api/v1';

test('E2E Flow: Health Check', async () => {
  const res = await fetch('http://localhost:4000/api/health');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.status, 'ONLINE');
});

test('E2E Flow: Full Managed Account Workflow (Client Live Viewer & Admin CRM Operation)', async () => {
  const uniqueEmail = `managed_user_${Date.now()}@apextrader.demo`;

  // 1. User Registers as Client
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'Password123!',
      fullName: 'Cliente Gestito Demo',
    }),
  });

  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  const userToken = regData.data.token;
  const newUserId = regData.data.user.id;

  // 2. User checks portfolio (Initially $0.00, no trades)
  const portRes1 = await fetch(`${BASE_URL}/client/portfolio`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const portData1 = await portRes1.json();
  assert.equal(portData1.data.cashBalance, 0.0);

  // 3. Admin Logs In
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'prova@gmail.com',
      password: 'prova123',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.data.token;

  // 4. Admin Allocates $50,000.00 Demo Funds via CRM
  const fundRes = await fetch(`${BASE_URL}/admin/users/${newUserId}/funds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 50000.0,
      type: 'ADD',
      reason: 'Allocazione Fondi Capitale Gestito',
    }),
  });
  assert.equal(fundRes.status, 200);

  // 5. Admin Executes Trade for User: BUY 0.25 BTC/USD
  const tradeRes = await fetch(`${BASE_URL}/admin/users/${newUserId}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbol: 'BTC/USD',
      side: 'BUY',
      quantity: 0.25,
    }),
  });
  assert.equal(tradeRes.status, 201);
  const tradeData = await tradeRes.json();
  assert.equal(tradeData.data.status, 'FILLED');
  assert.equal(tradeData.data.symbol, 'BTC/USD');
  const positionId = tradeData.data.positionId;

  // 6. User Views Live Portfolio (Sees the position opened by CRM with live balance)
  const posRes = await fetch(`${BASE_URL}/client/positions`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const posData = await posRes.json();
  assert.equal(posData.data.length, 1);
  assert.equal(posData.data[0].assetSymbol, 'BTC/USD');
  assert.equal(posData.data[0].quantity, 0.25);

  // 7. Admin Closes Position for User from CRM
  const closeRes = await fetch(`${BASE_URL}/admin/users/${newUserId}/positions/${positionId}/close`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(closeRes.status, 200);
  const closeData = await closeRes.json();
  assert.equal(closeData.data.status, 'CLOSED');

  // 8. User checks transactions statement (Ledger shows Welcome allocation + Trade + Position settlement)
  const txRes = await fetch(`${BASE_URL}/client/transactions`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const txData = await txRes.json();
  assert.ok(txData.data.length >= 3);

  // 9. Clean up test user to keep CRM database clean
  const cleanupRes = await fetch(`${BASE_URL}/admin/users/${newUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  // If endpoint exists or direct DB cleanup
});
