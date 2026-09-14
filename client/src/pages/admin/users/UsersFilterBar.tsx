import React from 'react';
import { Search, UserPlus, Download } from 'lucide-react';

interface UsersFilterBarProps {
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  balanceFilter: 'ALL' | 'ZERO' | 'POSITIVE';
  setBalanceFilter: (b: 'ALL' | 'ZERO' | 'POSITIVE') => void;
  onOpenCreate: () => void;
  onExportCSV: () => void;
}

export const UsersFilterBar: React.FC<UsersFilterBarProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  balanceFilter,
  setBalanceFilter,
  onOpenCreate,
  onExportCSV,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per email, nome, conto APX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtra utenti per stato"
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">Tutti gli Stati</option>
          <option value="ACTIVE">Solo Attivi</option>
          <option value="SUSPENDED">Solo Sospesi</option>
        </select>

        {/* Balance Filter Chips */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setBalanceFilter('ALL')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              balanceFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            TUTTI
          </button>
          <button
            type="button"
            onClick={() => setBalanceFilter('POSITIVE')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              balanceFilter === 'POSITIVE' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            CON SALDO
          </button>
          <button
            type="button"
            onClick={() => setBalanceFilter('ZERO')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              balanceFilter === 'ZERO' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            SALDO $0
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExportCSV}
          className="px-3.5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
          title="Esporta Lista Clienti in CSV / Excel"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Esporta Excel / CSV</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          + Nuovo Cliente Demo
        </button>
      </div>
    </div>
  );
};
