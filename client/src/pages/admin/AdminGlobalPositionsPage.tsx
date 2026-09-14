import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Activity, TrendingUp, TrendingDown, XCircle, Search, RefreshCw, Layers, ShieldAlert } from 'lucide-react';

export const AdminGlobalPositionsPage: React.FC = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [symbolFilter, setSymbolFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminGlobalPositions();
      setPositions(data);
    } catch (err) {
      console.error('Failed to fetch global positions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = async (userId: string, positionId: string) => {
    if (!confirm('Sei sicuro di voler liquidare forzatamente questa posizione a mercato per il cliente?')) {
      return;
    }

    setActionLoadingId(positionId);
    try {
      await api.closePositionForUser(userId, positionId);
      await fetchPositions();
    } catch (err: any) {
      alert(err.message || 'Impossibile liquidare la posizione.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = positions.filter((p) => {
    const matchesSearch = 
      p.user_name.toLowerCase().includes(search.toLowerCase()) ||
      p.user_email.toLowerCase().includes(search.toLowerCase()) ||
      p.account_number.toLowerCase().includes(search.toLowerCase());
    const matchesSymbol = symbolFilter === 'ALL' || p.asset_symbol === symbolFilter;
    return matchesSearch && matchesSymbol;
  });

  const totalNotional = positions.reduce((acc, p) => acc + p.quantity * p.average_entry_price, 0);
  const totalUnrealizedPnL = positions.reduce((acc, p) => acc + (p.unrealizedPnL || 0), 0);
  const distinctSymbols = Array.from(new Set(positions.map((p) => p.asset_symbol)));

  return (
    <div className="space-y-6 font-mono">
      {/* 3 Executive Exposure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Posizioni Attive a Mercato</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white">{positions.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Su tutti i conti gestiti</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Controvalore Notionale Aperto</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white">${totalNotional.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Esposizione lorda piattaforma</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">P/L Non Realizzato Piattaforma</span>
            {totalUnrealizedPnL >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
          </div>
          <span className={`text-2xl font-black ${totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Rischio live aggregato</span>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca cliente, email o conto APX..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-white text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Symbol Filter */}
          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            aria-label="Filtra posizioni per asset"
            className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tutti gli Asset ({distinctSymbols.length})</option>
            {distinctSymbols.map((sym) => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={fetchPositions}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna Live
        </button>
      </div>

      {/* Global Positions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Cliente / Conto</th>
                <th className="py-3 px-4">Asset & Direzione</th>
                <th className="py-3 px-4">Quantità</th>
                <th className="py-3 px-4">Prezzo Entrata</th>
                <th className="py-3 px-4">Prezzo Live</th>
                <th className="py-3 px-4 text-right">P/L Live ($)</th>
                <th className="py-3 px-4 text-right">Azione Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading && positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Caricamento posizioni globali in corso...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nessuna posizione aperta trovata sui conti dei clienti.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLong = p.side === 'LONG';
                  const isProfit = (p.unrealizedPnL || 0) >= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{p.user_name}</span>
                        <span className="text-[10px] text-slate-500 block">{p.account_number} • {p.user_email}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-white">{p.asset_symbol}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                            isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {p.side}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        {p.quantity}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        ${p.average_entry_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 font-bold text-cyan-300">
                        ${(p.currentPrice || p.average_entry_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right font-black">
                        <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isProfit ? '+' : ''}${(p.unrealizedPnL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleClosePosition(p.user_id, p.id)}
                          disabled={actionLoadingId === p.id}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {actionLoadingId === p.id ? 'Liquidazione...' : 'Liquida a Mercato'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
