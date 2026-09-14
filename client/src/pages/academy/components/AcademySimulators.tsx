import React, { useState } from 'react';
import { triggerHaptic } from '../../../utils/haptics';
import { trackSimulatorInteraction } from '../../../services/marketingTracker';
import {
  Sliders,
  Calculator,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Activity,
  Layers,
  Brain,
  Scale,
} from 'lucide-react';

interface AcademySimulatorsProps {
  moduleId: string;
}

export const AcademySimulators: React.FC<AcademySimulatorsProps> = ({ moduleId }) => {
  // --- STATE FOR MOD-01: Market Cap ---
  const [sharesCount, setSharesCount] = useState<number>(5000000);
  const [sharePrice, setSharePrice] = useState<number>(25);

  // --- STATE FOR MOD-02: Spread & Order Book ---
  const [bidPrice, setBidPrice] = useState<number>(64200);
  const [spreadPips, setSpreadPips] = useState<number>(5);

  // --- STATE FOR MOD-03: Pip Value & Tick Movements ---
  const [mod3LotSize, setMod3LotSize] = useState<number>(0.1); // 0.01 micro, 0.1 mini, 1.0 standard
  const [mod3Pips, setMod3Pips] = useState<number>(45);

  // --- STATE FOR MOD-04: Order Types (Market vs Limit) ---
  const [mod4OrderType, setMod4OrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [mod4LimitOffset, setMod4LimitOffset] = useState<number>(-15); // $ below ask

  // --- STATE FOR MOD-05: Slippage & Order Book Depth ---
  const [mod5OrderSizeBtc, setMod5OrderSizeBtc] = useState<number>(5.0);

  // --- STATE FOR MOD-06: WAP (Weighted Average Price) ---
  const [qty1, setQty1] = useState<number>(0.5);
  const [price1, setPrice1] = useState<number>(60000);
  const [qty2, setQty2] = useState<number>(0.25);
  const [price2, setPrice2] = useState<number>(66000);

  // --- STATE FOR MOD-07: Leverage & Liquidation ---
  const [leverage, setLeverage] = useState<number>(10);
  const [entryPrice, setEntryPrice] = useState<number>(64000);
  const [tradeSide, setTradeSide] = useState<'LONG' | 'SHORT'>('LONG');

  // --- STATE FOR MOD-08: Position Sizing (1% Rule) ---
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1);
  const [stopLossDistance, setStopLossDistance] = useState<number>(1200); // in $

  // --- STATE FOR MOD-09: Risk-Reward & Expectancy ---
  const [winRate, setWinRate] = useState<number>(55); // %
  const [rewardRatio, setRewardRatio] = useState<number>(2.0); // 1:2 R:R

  // --- STATE FOR MOD-10: Drawdown Geometry ---
  const [lossPct, setLossPct] = useState<number>(20);

  // --- STATE FOR MOD-11: Cognitive Bias Diagnostic ---
  const [mod11Bias, setMod11Bias] = useState<'REVENGE' | 'FOMO' | 'DISPOSITION' | 'GAMBLER'>('REVENGE');

  // --- STATE FOR MOD-12: Probability of Ruin & Preservation ---
  const [mod12RiskPerTrade, setMod12RiskPerTrade] = useState<number>(2); // %
  const [mod12WinRate, setMod12WinRate] = useState<number>(50); // %

  // =========================================================================
  // RENDER SPECIFIC SIMULATOR BASED ON MODULE ID
  // =========================================================================

  // 1. MOD-01: Market Capitalization Simulator
  if (moduleId === 'MOD-01') {
    const marketCap = (sharesCount * sharePrice) / 1000000;
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Calculator className="w-4 h-4" />
            Simulatore Interattivo: Calcolo Market Cap
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
            LIVE LAB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Prezzo per Azione / Token ($):</span>
              <strong className="text-white">${sharePrice}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              value={sharePrice}
              onChange={(e) => {
                setSharePrice(Number(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Unità Circolanti (Milioni):</span>
              <strong className="text-white">{(sharesCount / 1000000).toFixed(1)}M</strong>
            </div>
            <input
              type="range"
              min="1000000"
              max="50000000"
              step="500000"
              value={sharesCount}
              onChange={(e) => {
                setSharesCount(Number(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Capitalizzazione Risultante</span>
            <span className="text-lg font-black text-cyan-300">${marketCap.toFixed(2)} Milioni USD</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sharesCount.toLocaleString()} × ${sharePrice}
          </span>
        </div>
      </div>
    );
  }

  // 2. MOD-02: Live Spread & Order Book Dynamics
  if (moduleId === 'MOD-02') {
    const askPrice = bidPrice + spreadPips;
    const spreadPercentage = ((spreadPips / bidPrice) * 100).toFixed(3);
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Sliders className="w-4 h-4" />
            Simulatore Microstruttura: Bid, Ask & Spread Live
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
            ORDER BOOK
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Ampiezza dello Spread:</span>
              <strong className="text-emerald-400">${spreadPips}.00 ({spreadPercentage}%)</strong>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={spreadPips}
              onChange={(e) => {
                setSpreadPips(Number(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase">Miglior BID (Denaro)</span>
              <span className="text-base font-black text-white">${bidPrice.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Prezzo a cui VENDI</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-[10px] text-rose-400 block font-bold uppercase">Miglior ASK (Lettera)</span>
              <span className="text-base font-black text-white">${askPrice.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Prezzo a cui COMPRI</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            💡 Se apri e chiudi istantaneamente una posizione di 1 BTC a mercato, il costo implicito dovuto allo spread è esattamente di <strong className="text-white">${spreadPips}.00</strong>.
          </p>
        </div>
      </div>
    );
  }

  // 3. MOD-03: Pip Value & Tick Movement Calculator
  if (moduleId === 'MOD-03') {
    const pipValuePerUnit = mod3LotSize * 10; // in USD per pip
    const totalPnl = mod3Pips * pipValuePerUnit;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Calculator className="w-4 h-4" />
            Calcolatore Dinamico: Valore del Pip & Dimensione Posizione
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20">
            FX & COMMODITY
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <span className="text-slate-400 block mb-1.5">Dimensione del Lotto Operativo:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Micro (0.01)', val: 0.01, units: '1.000 Unità' },
                { label: 'Mini (0.10)', val: 0.1, units: '10.000 Unità' },
                { label: 'Standard (1.00)', val: 1.0, units: '100.000 Unità' },
              ].map((tier) => (
                <button
                  key={tier.val}
                  type="button"
                  onClick={() => {
                    setMod3LotSize(tier.val);
                    triggerHaptic('light');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    mod3LotSize === tier.val
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold text-xs">{tier.label}</span>
                  <span className="text-[10px] text-slate-500 block">{tier.units}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Movimento di Mercato in Pips:</span>
              <strong className="text-teal-400 font-bold font-mono">+{mod3Pips} Pips</strong>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={mod3Pips}
              onChange={(e) => {
                setMod3Pips(Number(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Valore per Singolo Pip</span>
              <span className="text-base font-black text-white font-mono">${pipValuePerUnit.toFixed(2)} USD</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40">
              <span className="text-[10px] text-teal-400 block uppercase font-bold">PnL Totale Risultante</span>
              <span className="text-base font-black text-emerald-300 font-mono">+${totalPnl.toFixed(2)} USD</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            💡 Con un lotto Standard (1.00), ogni singolo pip di escursione sposta il controvalore di ben <strong className="text-white">$10.00 USD</strong>.
          </p>
        </div>
      </div>
    );
  }

  // 4. MOD-04: Order Types & Execution Dynamics (Market vs Limit)
  if (moduleId === 'MOD-04') {
    const bestAsk = 65000;
    const limitPrice = bestAsk + mod4LimitOffset;
    const takerFee = bestAsk * 0.0004; // 0.04%
    const makerFee = limitPrice * 0.0001; // 0.01%
    const savedOnPrice = mod4OrderType === 'LIMIT' ? Math.max(0, bestAsk - limitPrice) : 0;
    const totalAdvantage = savedOnPrice + (takerFee - makerFee);

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Layers className="w-4 h-4" />
            Simulatore Meccanica Ordini: Market vs Limit Order
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
            ORDER EXECUTION
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Tipo di Ordine Eseguito:</span>
            <button
              type="button"
              onClick={() => {
                setMod4OrderType('MARKET');
                triggerHaptic('light');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mod4OrderType === 'MARKET' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              MARKET (A Mercato)
            </button>
            <button
              type="button"
              onClick={() => {
                setMod4OrderType('LIMIT');
                triggerHaptic('light');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mod4OrderType === 'LIMIT' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              LIMIT (Prezzo Limite)
            </button>
          </div>

          {mod4OrderType === 'LIMIT' && (
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Prezzo Limite di Inserimento a Book:</span>
                <strong className="text-cyan-400 font-bold font-mono">
                  ${limitPrice.toLocaleString()} ({mod4LimitOffset >= 0 ? '+' : ''}${mod4LimitOffset} vs Ask)
                </strong>
              </div>
              <input
                type="range"
                min="-50"
                max="0"
                step="5"
                value={mod4LimitOffset}
                onChange={(e) => {
                  setMod4LimitOffset(Number(e.target.value));
                  triggerHaptic('light');
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Ruolo & Velocità di Fill</span>
              <span className="text-white font-bold block">
                {mod4OrderType === 'MARKET' ? '⚡ TAKER: Esecuzione Istantanea' : '⏳ MAKER: In coda nel Book (Resting)'}
              </span>
              <span className="text-slate-400 text-[11px] block">
                Commissione di Borsa: <strong className="text-white font-mono">${(mod4OrderType === 'MARKET' ? takerFee : makerFee).toFixed(2)}</strong>
              </span>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              mod4OrderType === 'LIMIT' ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Prezzo di Acquisto Finale</span>
              <span className="text-base font-black font-mono">
                ${(mod4OrderType === 'MARKET' ? bestAsk : limitPrice).toLocaleString()}
              </span>
              <span className="text-[10px] block">
                {mod4OrderType === 'LIMIT'
                  ? `✅ Risparmio complessivo rispetto al Market: +$${totalAdvantage.toFixed(2)} USD`
                  : 'Soggetto a potenziale slippage in caso di alta volatilità'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. MOD-05: Slippage & Order Book Depth Simulator
  if (moduleId === 'MOD-05') {
    const l1Qty = 1.0;
    const l1Price = 65000;
    const l2Qty = 3.0;
    const l2Price = 65020;
    const l3Qty = 8.0;
    const l3Price = 65060;
    const l4Qty = 15.0;
    const l4Price = 65120;

    const fillL1 = Math.min(mod5OrderSizeBtc, l1Qty);
    const rem1 = Math.max(0, mod5OrderSizeBtc - fillL1);
    const fillL2 = Math.min(rem1, l2Qty);
    const rem2 = Math.max(0, rem1 - fillL2);
    const fillL3 = Math.min(rem2, l3Qty);
    const rem3 = Math.max(0, rem2 - fillL3);
    const fillL4 = Math.min(rem3, l4Qty);

    const totalCost = fillL1 * l1Price + fillL2 * l2Price + fillL3 * l3Price + fillL4 * l4Price;
    const effectiveWap = totalCost / mod5OrderSizeBtc;
    const slippageDollarsPerBtc = effectiveWap - l1Price;
    const totalSlippageCost = slippageDollarsPerBtc * mod5OrderSizeBtc;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Simulatore Slippage & Impatto sulla Profondità del Book
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-bold border border-rose-500/20">
            LIQUIDITY IMPACT
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Dimensione Ordine a Mercato (Size):</span>
              <strong className="text-rose-400 font-black font-mono">
                {mod5OrderSizeBtc} BTC (${(mod5OrderSizeBtc * 65000).toLocaleString()})
              </strong>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={mod5OrderSizeBtc}
              onChange={(e) => {
                setMod5OrderSizeBtc(Number(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Assorbimento Livelli di Prezzo (Book Consumption)</span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className={`p-1.5 rounded ${fillL1 > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-950 text-slate-600'}`}>
                <span>L1: $65.000</span>
                <strong className="block font-bold">{fillL1.toFixed(1)}/{l1Qty} BTC</strong>
              </div>
              <div className={`p-1.5 rounded ${fillL2 > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-950 text-slate-600'}`}>
                <span>L2: $65.020</span>
                <strong className="block font-bold">{fillL2.toFixed(1)}/{l2Qty} BTC</strong>
              </div>
              <div className={`p-1.5 rounded ${fillL3 > 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-950 text-slate-600'}`}>
                <span>L3: $65.060</span>
                <strong className="block font-bold">{fillL3.toFixed(1)}/{l3Qty} BTC</strong>
              </div>
              <div className={`p-1.5 rounded ${fillL4 > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-950 text-slate-600'}`}>
                <span>L4: $65.120</span>
                <strong className="block font-bold">{fillL4.toFixed(1)}/{l4Qty} BTC</strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Prezzo Effettivo di Riempimento (WAP)</span>
              <span className="text-lg font-black text-rose-300 font-mono">${effectiveWap.toFixed(2)}</span>
            </div>
            <div className="text-right text-[11px] text-slate-300 font-mono">
              <span>Slippage Medio: <strong className="text-rose-400">+${slippageDollarsPerBtc.toFixed(2)}/BTC</strong></span>
              <span className="block">Costo Implicito di Liquidità: <strong className="text-white font-bold">${totalSlippageCost.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. MOD-06: Double-Entry WAP (Weighted Average Price)
  if (moduleId === 'MOD-06') {
    const totalQty = qty1 + qty2;
    const totalCost = qty1 * price1 + qty2 * price2;
    const wap = totalQty > 0 ? totalCost / totalQty : 0;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Calcolatore WAP: Prezzo Medio Ponderato di Carico
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
            DOPPIA PARTITA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-300 font-bold block">Tranche Acquisto #1</span>
            <div className="flex justify-between text-slate-400">
              <span>Quantità: {qty1} BTC</span>
              <span>Prezzo: ${price1.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="70000"
              step="500"
              value={price1}
              onChange={(e) => setPrice1(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-300 font-bold block">Tranche Acquisto #2</span>
            <div className="flex justify-between text-slate-400">
              <span>Quantità: {qty2} BTC</span>
              <span>Prezzo: ${price2.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="70000"
              step="500"
              value={price2}
              onChange={(e) => setPrice2(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold">WAP Finale di Portafoglio</span>
            <span className="text-lg font-black text-cyan-300">${wap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span>Quantità Totale: <strong className="text-white">{totalQty} BTC</strong></span>
            <span className="block">Controvalore: <strong className="text-white">${totalCost.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // 4. MOD-07: Leverage & Liquidation Distance Simulator
  if (moduleId === 'MOD-07') {
    const marginRequiredPct = 100 / leverage;
    const liquidationDistancePct = 100 / leverage;
    const liquidationPrice =
      tradeSide === 'LONG'
        ? entryPrice * (1 - liquidationDistancePct / 100)
        : entryPrice * (1 + liquidationDistancePct / 100);

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" />
            Simulatore Dinamico: Leva Finanziaria & Rischio Liquidazione
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
            MARGIN CALL
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Side Picker */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Direzione Posizione:</span>
            <button
              type="button"
              onClick={() => setTradeSide('LONG')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                tradeSide === 'LONG' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              LONG (Acquisto)
            </button>
            <button
              type="button"
              onClick={() => setTradeSide('SHORT')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                tradeSide === 'SHORT' ? 'bg-rose-500 text-white font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              SHORT (Vendita)
            </button>
          </div>

          {/* Leverage Slider */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Leva Impostata:</span>
              <strong className="text-amber-400 font-black text-sm">{leverage}x (Margine: {marginRequiredPct.toFixed(1)}%)</strong>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={leverage}
              onChange={(e) => {
                setLeverage(Number(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>1x (Spot 100% Cassa)</span>
              <span>10x (10% Margine)</span>
              <span>50x (2% Margine)</span>
            </div>
          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Prezzo Entrata</span>
              <span className="text-sm font-bold text-white">${entryPrice.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
              <span className="text-[10px] text-rose-400 block font-bold uppercase">Prezzo di Liquidazione</span>
              <span className="text-sm font-black text-rose-300">${liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-[10px] text-rose-400 block mt-0.5">Distanza: -{liquidationDistancePct.toFixed(1)}%</span>
            </div>
          </div>

          {/* Visual Buffer Bar */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block">Margine di Tolleranza Fluttuazione di Mercato:</span>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  liquidationDistancePct > 20
                    ? 'bg-emerald-500'
                    : liquidationDistancePct > 5
                    ? 'bg-amber-500'
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${Math.min(100, liquidationDistancePct * 2)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. MOD-08: Universal 1% Position Sizing Calculator
  if (moduleId === 'MOD-08') {
    const maxRiskDollars = (accountBalance * riskPct) / 100;
    const calculatedUnits = stopLossDistance > 0 ? maxRiskDollars / stopLossDistance : 0;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Calculator className="w-4 h-4" />
            Calcolatore Professionale: Regola dell'1% di Rischio
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
            RISK MANAGEMENT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Capitale sul Conto:</span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-bold text-white">
              ${accountBalance.toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Rischio Massimo:</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-bold text-emerald-300 flex justify-between">
              <span>{riskPct}%</span>
              <span>${maxRiskDollars} USD</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Distanza Stop Loss:</span>
              <strong className="text-rose-400">${stopLossDistance}</strong>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={stopLossDistance}
              onChange={(e) => setStopLossDistance(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Size Massima da Acquistare</span>
            <span className="text-xl font-black text-emerald-300">{calculatedUnits.toFixed(3)} Unità / BTC</span>
          </div>
          <span className="text-[11px] text-slate-300 sm:text-right">
            Se il prezzo tocca lo Stop Loss a -$ {stopLossDistance}, perdi esattamente <strong className="text-rose-400">${maxRiskDollars}</strong> (l'1% del tuo conto).
          </span>
        </div>
      </div>
    );
  }

  // 6. MOD-09: Mathematical Expectancy & R:R Ratio
  if (moduleId === 'MOD-09') {
    const lossRate = 100 - winRate;
    const avgWin = rewardRatio; // in R units
    const avgLoss = 1.0; // in R units
    const expectedValueR = ((winRate / 100) * avgWin - (lossRate / 100) * avgLoss).toFixed(2);
    const isProfitable = Number(expectedValueR) > 0;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Activity className="w-4 h-4" />
            Simulatore Aspettativa Matematica (Expected Value)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
            QUANT FORMULA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Win Rate (Percentuale Trade Vincenti):</span>
              <strong className="text-white">{winRate}%</strong>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={winRate}
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Rapporto Rischio / Rendimento (R:R):</span>
              <strong className="text-white">1:{rewardRatio.toFixed(1)}</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={rewardRatio}
              onChange={(e) => setRewardRatio(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
          isProfitable ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Aspettativa Matematica per Trade</span>
            <span className="text-lg font-black">{isProfitable ? '+' : ''}{expectedValueR} R</span>
          </div>
          <span className="text-xs font-bold">
            {isProfitable ? '✅ Strategia con Edge Istituzionale Positivo' : '⚠️ Strategia Matematica a Perdita Sistematica'}
          </span>
        </div>
      </div>
    );
  }

  // 7. MOD-10: Drawdown Geometry & Recovery
  if (moduleId === 'MOD-10') {
    const recoveryNeeded = lossPct < 100 ? (lossPct / (100 - lossPct)) * 100 : 0;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Geometria del Drawdown: Il Rendimento di Recupero Asimmetrico
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-bold border border-rose-500/20">
            PRESERVATION
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Perdita Subita sul Conto:</span>
              <strong className="text-rose-400 font-black">-{lossPct}%</strong>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={lossPct}
              onChange={(e) => setLossPct(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rendimento Necessario per Pareggiare (Break-Even)</span>
              <span className="text-xl font-black text-rose-300">+{recoveryNeeded.toFixed(1)}%</span>
            </div>
            <span className="text-[11px] text-slate-300 max-w-xs text-right">
              {lossPct >= 50
                ? '⚠️ Attenzione: Per recuperare una perdita del 50% devi raddoppiare il conto (+100%)!'
                : 'La perdita è recuperabile con una rigorosa disciplina di risk management.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 11. MOD-11: Cognitive Bias & Tilt Diagnostic Tool
  if (moduleId === 'MOD-11') {
    const biases = {
      REVENGE: {
        name: 'Revenge Trading (Trading di Vendetta)',
        scenario: 'Hai appena subito una perdita del 2% su uno stop loss legittimo. Vuoi rientrare subito a mercato con size raddoppiata per recuperare.',
        tiltLevel: 95,
        tiltColor: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
        quantRule: 'Hard Rule: Lock out temporale immediato. Minimo 2 ore di distacco dallo schermo. Il mercato non ha memoria del tuo trade precedente.',
      },
      FOMO: {
        name: 'FOMO (Fear Of Missing Out)',
        scenario: 'Il prezzo fa un breakout con candela verde impulsiva del +4%. Non hai pianificato l\'ingresso ma compri a mercato per non perdere il treno.',
        tiltLevel: 85,
        tiltColor: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
        quantRule: 'Hard Rule: Non inseguire mai il prezzo. Se perdi il setup d\'entrata al livello limite pianificato, il trade non esiste più.',
      },
      DISPOSITION: {
        name: 'Disposition Effect (Asimmetria Emozionale)',
        scenario: 'Chiudi subito il trade in gain a +1% per incassare la vincita, mentre lasci correre il trade in perdita a -5% sperando nel pareggio.',
        tiltLevel: 90,
        tiltColor: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
        quantRule: 'Hard Rule: Lascia correre i profitti secondo il target R:R pianificato e taglia le perdite meccanicamente al prezzo di Stop Loss.',
      },
      GAMBLER: {
        name: 'Gambler\'s Fallacy (Fallacia dello Scommettitore)',
        scenario: 'Hai preso 4 stop loss consecutivi: ritieni che statisticamente il prossimo trade DEVE per forza essere vincente, quindi rischi il 5%.',
        tiltLevel: 80,
        tiltColor: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
        quantRule: 'Hard Rule: Ogni trade è un evento probabilistico stocastico indipendente. Una serie negativa non aumenta le chance del trade successivo.',
      },
    } as const;

    const currentBias = biases[mod11Bias];

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Brain className="w-4 h-4" />
            Tool Diagnostico: Bias Cognitivi & Controllo del Tilt
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
            DESK PSYCHOLOGY
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(biases) as (keyof typeof biases)[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMod11Bias(key);
                  triggerHaptic('light');
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  mod11Bias === key
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">{currentBias.name}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border font-mono ${currentBias.tiltColor}`}>
                Indice di Tilt: {currentBias.tiltLevel}/100
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic">
              "{currentBias.scenario}"
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wide block">
              🛡️ Protocollo Istituzionale Anti-Tilt:
            </span>
            <p className="text-slate-200 text-xs font-medium leading-relaxed">
              {currentBias.quantRule}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 12. MOD-12: Probability of Ruin & Capital Preservation Matrix
  if (moduleId === 'MOD-12') {
    const lossFactor = 1 - mod12RiskPerTrade / 100;
    const remainingAfter6 = Math.pow(lossFactor, 6) * 100;
    const drawdownAfter6 = 100 - remainingAfter6;

    const isDangerous = mod12RiskPerTrade >= 5;
    const survivalRate = Math.max(5, Math.min(99, Math.round(100 - Math.pow(mod12RiskPerTrade * 1.8, 1.35) * (1 - mod12WinRate / 100) * 2.5)));

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Scale className="w-4 h-4" />
            Matrice di Sopravvivenza & Rischio di Rovina Statistica
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
            CAPITAL PRESERVATION
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Rischio per Singola Operazione:</span>
                <strong className={`font-black font-mono ${isDangerous ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {mod12RiskPerTrade}% del Capitale
                </strong>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={mod12RiskPerTrade}
                onChange={(e) => {
                  setMod12RiskPerTrade(Number(e.target.value));
                  triggerHaptic('light');
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Win Rate Stimato del Modello:</span>
                <strong className="text-white font-bold font-mono">{mod12WinRate}%</strong>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                step="5"
                value={mod12WinRate}
                onChange={(e) => {
                  setMod12WinRate(Number(e.target.value));
                  triggerHaptic('light');
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Drawdown dopo 6 Stop Consecutivi</span>
              <span className={`text-base font-black font-mono ${isDangerous ? 'text-rose-400' : 'text-emerald-400'}`}>
                -{drawdownAfter6.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block">Capitale residuo: {remainingAfter6.toFixed(1)}%</span>
            </div>

            <div className={`p-3 rounded-xl border ${
              isDangerous ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            }`}>
              <span className="text-[10px] uppercase font-bold block">Indice di Sopravvivenza a Lungo Termine</span>
              <span className="text-base font-black font-mono">{survivalRate}%</span>
              <span className="text-[10px] block">
                {isDangerous ? '⚠️ Rischio Rovina Elevato' : '✅ Longevità Istituzionale'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            💡 Con un rischio dell'1% per trade, anche una serie statistica avversa di 6 perdite lascia intatto oltre il <strong className="text-white">94%</strong> del capitale, consentendo la prosecuzione dell'attività senza alterare il modello quantitativo.
          </p>
        </div>
      </div>
    );
  }

  // Generic Fallback Interactive Formula Box
  return (
    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
      <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
      <div className="text-xs text-slate-300">
        <span className="font-bold text-white block">Formula Istituzionale Pronta:</span>
        Esamina la formulazione teorica e il caso pratico per risolvere la challenge e guadagnare punti XP.
      </div>
    </div>
  );
};
