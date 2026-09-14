import React, { useState } from 'react';
import { PortfolioSummary, Position } from '../../../types';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Wallet, 
  Lock, 
  Sparkles, 
  FileDown 
} from 'lucide-react';

interface ClientPortfolioCardProps {
  portfolio: PortfolioSummary | null;
  positions: Position[];
  accountNumber?: string;
  onOpenStatement?: () => void;
}

export const ClientPortfolioCard: React.FC<ClientPortfolioCardProps> = ({
  portfolio,
  positions,
  accountNumber,
  onOpenStatement,
}) => {
  const [isMasked, setIsMasked] = useState(false);

  const equity = Number(portfolio?.equity ?? 0);
  const freeBalance = Number(portfolio?.freeBalance ?? 0);
  const reservedBalance = Number(portfolio?.reservedBalance ?? 0);
  const totalPnL = Number(portfolio?.totalUnrealizedPnL ?? 0);

  const isProfit = totalPnL >= 0;
  const pnlPercent = equity > 0 && Math.abs(equity - totalPnL) > 0
    ? (totalPnL / Math.max(1, equity - totalPnL)) * 100
    : 0;

  // Percentage of allocated vs free capital
  const totalAssets = freeBalance + reservedBalance;
  const freePercent = totalAssets > 0 ? Math.min(100, Math.max(0, (freeBalance / totalAssets) * 100)) : 100;
  const reservedPercent = 100 - freePercent;

  const maskValue = (val: string) => (isMasked ? '••••••••' : val);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 p-5 sm:p-7 shadow-2xl transition-all font-mono">
      {/* Subtle Glow Orb Behind Performance */}
      <div 
        className={`absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity ${
          isProfit ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`}
      ></div>

      <div className="relative z-10 space-y-5">
        {/* Top Card Header: Account Number & Privacy Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300">
              CONTO: <strong className="text-white font-black">{accountNumber || 'APX-PORTFOLIO'}</strong>
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">
              GESTITO DA RISK DESK
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Privacy Mask Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              title={isMasked ? 'Mostra Cifre Saldo' : 'Nascondi Cifre per Privacy'}
              className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
            >
              {isMasked ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[10px]">{isMasked ? 'Mostra' : 'Nascondi'}</span>
            </button>

            {/* Quick PDF Statement Export */}
            {onOpenStatement && (
              <button
                type="button"
                onClick={onOpenStatement}
                title="Genera Estratto Conto Ufficiale PDF"
                className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[10px]">PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Executive Balance Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              VALORE PATRIMONIALE COMPLESSIVO (NAV)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ${maskValue(equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase">USD</span>
            </div>
          </div>

          {/* Floating Neon Performance Pill */}
          <div className="flex items-center">
            <div 
              className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2 shadow-lg transition-all ${
                isProfit
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/10'
              }`}
            >
              {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              <div>
                <span className="text-[10px] text-slate-400 uppercase block leading-none">P/L Non Realizzato</span>
                <span className="text-xs font-black">
                  {isProfit ? '+' : ''}${maskValue(totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 }))}{' '}
                  <span className="text-[10px] font-normal">({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Capital Allocation Visual Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Allocazione Liquidità</span>
            <span>{freePercent.toFixed(0)}% Libera • {reservedPercent.toFixed(0)}% In Posizione</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800/80">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
              style={{ width: `${freePercent}%` }}
              title={`Liquidità Disponibile: ${freePercent.toFixed(1)}%`}
            ></div>
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" 
              style={{ width: `${reservedPercent}%` }}
              title={`Margine Impegnato: ${reservedPercent.toFixed(1)}%`}
            ></div>
          </div>
        </div>

        {/* Sub-Metrics Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
          {/* Box 1: Saldo Disponibile */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold flex items-center gap-1">
              <Wallet className="w-3 h-3 text-cyan-400" />
              Liquidità Libera
            </span>
            <span className="font-bold text-white text-sm block mt-0.5">
              ${maskValue(freeBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
            </span>
          </div>

          {/* Box 2: Margine Impegnato */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              Margine Impegnato
            </span>
            <span className="font-bold text-amber-300 text-sm block mt-0.5">
              ${maskValue(reservedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
            </span>
          </div>

          {/* Box 3: Posizioni Attive */}
          <div className="col-span-2 sm:col-span-1 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Posizioni Aperte</span>
              <span className="font-black text-white text-sm block mt-0.5">
                {positions.length} {positions.length === 1 ? 'Contratto' : 'Contratti'}
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              Live Tick Feed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
