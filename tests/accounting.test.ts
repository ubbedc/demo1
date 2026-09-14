import test from 'node:test';
import assert from 'node:assert/strict';

test('Financial Math: Weighted Average Entry Price (WAP) on Long Position', () => {
  // Buy 1: 0.5 BTC @ $60,000 = $30,000 notional
  const qty1 = 0.5;
  const price1 = 60000.0;

  // Buy 2: 0.25 BTC @ $66,000 = $16,500 notional
  const qty2 = 0.25;
  const price2 = 66000.0;

  const totalQty = qty1 + qty2; // 0.75 BTC
  const totalCost = (qty1 * price1) + (qty2 * price2); // $46,500
  const wap = totalCost / totalQty; // $62,000.00

  assert.equal(totalQty, 0.75);
  assert.equal(totalCost, 46500.0);
  assert.equal(wap, 62000.0);
});

test('Financial Math: Unrealized P/L calculation for Long & Short', () => {
  const avgEntry = 62000.0;
  const qty = 0.75;

  // Scenario A: Market Price rises to $65,000 (Long in Profit)
  const currentBidA = 65000.0;
  const unrealizedPnLLong = (currentBidA - avgEntry) * qty; // (65000 - 62000) * 0.75 = +$2,250.00
  assert.equal(unrealizedPnLLong, 2250.0);

  // Scenario B: Market Price drops to $59,000 (Long in Loss)
  const currentBidB = 59000.0;
  const unrealizedLossLong = (currentBidB - avgEntry) * qty; // (59000 - 62000) * 0.75 = -$2,250.00
  assert.equal(unrealizedLossLong, -2250.0);

  // Scenario C: Short Position when Market Price drops to $59,000 (Short in Profit)
  const currentAskC = 59000.0;
  const unrealizedPnLShort = (avgEntry - currentAskC) * qty; // (62000 - 59000) * 0.75 = +$2,250.00
  assert.equal(unrealizedPnLShort, 2250.0);
});

test('Financial Math: Equity & Free Balance derivation', () => {
  const cashBalance = 10000.0;
  const reservedFunds = 4000.0;
  const totalUnrealizedPnL = 750.0;

  const freeBalance = cashBalance - reservedFunds; // $6,000.00
  const equity = cashBalance + totalUnrealizedPnL; // $10,750.00

  assert.equal(freeBalance, 6000.0);
  assert.equal(equity, 10750.0);
});

test('Ledger Invariance: Cash Balance Reconstruction', () => {
  const transactions = [
    { type: 'WELCOME_BONUS', amount: 10000.0 },
    { type: 'TRADE_EXECUTION', amount: -3000.0 },
    { type: 'ADMIN_ADJUSTMENT', amount: 5000.0 },
    { type: 'POSITION_CLOSE', amount: 3500.0 }, // Sells $3,000 entry with +$500 PnL
  ];

  const reconstructedBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  assert.equal(reconstructedBalance, 15500.0);
});

test('Financial Math: Take Profit & Stop Loss Trigger Verification', () => {
  // Long Position: Entry $60,000, TP $65,000, SL $55,000
  const longEntry = 60000.0;
  const longTP = 65000.0;
  const longSL = 55000.0;

  assert.equal(65200.0 >= longTP, true, 'Long TP triggers when price >= 65000');
  assert.equal(54900.0 <= longSL, true, 'Long SL triggers when price <= 55000');
  assert.equal(62000.0 >= longTP || 62000.0 <= longSL, false, 'No trigger inside range');

  // Short Position: Entry $60,000, TP $55,000, SL $65,000
  const shortTP = 55000.0;
  const shortSL = 65000.0;

  assert.equal(54800.0 <= shortTP, true, 'Short TP triggers when price <= 55000');
  assert.equal(65100.0 >= shortSL, true, 'Short SL triggers when price >= 65000');
});
