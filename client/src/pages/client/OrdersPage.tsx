import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Storico Ordini</h2>
          <p className="text-xs text-slate-400 font-mono">Registro completo delle esecuzioni a mercato simulate</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          Aggiorna
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs">Caricamento ordini...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs">Nessun ordine presente nello storico.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5">Data / Ora</th>
                <th className="py-2.5">Asset</th>
                <th className="py-2.5">Side</th>
                <th className="py-2.5">Tipo</th>
                <th className="py-2.5 text-right">Quantità</th>
                <th className="py-2.5 text-right">Prezzo Eseguito</th>
                <th className="py-2.5 text-right">Controvalore</th>
                <th className="py-2.5 text-center">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 text-slate-400">{new Date(ord.created_at).toLocaleString()}</td>
                  <td className="py-3 font-bold text-white">{ord.asset_symbol}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.side === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {ord.side}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{ord.type}</td>
                  <td className="py-3 text-right text-slate-200">{ord.quantity}</td>
                  <td className="py-3 text-right text-slate-200">${ord.executed_price.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold text-white">${ord.notional_value.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
