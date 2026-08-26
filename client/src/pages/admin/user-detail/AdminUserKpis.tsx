import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

interface AdminUserKpisProps {
  balance: {
    cashBalance: number;
    freeBalance: number;
    reservedBalance: number;
  } | null;
  portfolio: {
    equity: number;
  } | null;
  positionsCount: number;
}

export const AdminUserKpis: React.FC<AdminUserKpisProps> = ({ balance, portfolio, positionsCount }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-slate-500 block text-[10px] uppercase font-bold">Saldo Cassa</span>
        <span className="text-lg font-black text-white">
          {formatCurrency(balance?.cashBalance)}
        </span>
      </div>

      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-slate-500 block text-[10px] uppercase font-bold">Liquidità Svincolata</span>
        <span className="text-lg font-black text-cyan-400">
          {formatCurrency(balance?.freeBalance)}
        </span>
      </div>

      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-slate-500 block text-[10px] uppercase font-bold">Equity Totale</span>
        <span className="text-lg font-black text-white">
          {formatCurrency(portfolio?.equity ?? balance?.cashBalance)}
        </span>
      </div>

      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-slate-500 block text-[10px] uppercase font-bold">Posizioni Aperte</span>
        <span className="text-lg font-black text-amber-400">{positionsCount}</span>
      </div>
    </div>
  );
};
