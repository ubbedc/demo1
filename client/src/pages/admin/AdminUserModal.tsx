import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useMarket } from '../../context/MarketContext';
import { StatementExportModal } from '../../components/common/StatementExportModal';
import { generateStatementPDF } from '../../services/pdfGenerator';
import { AdminUserKpis } from './user-detail/AdminUserKpis';
import { AdminTradeDesk } from './user-detail/AdminTradeDesk';
import { AdminFundsDesk } from './user-detail/AdminFundsDesk';
import { AdminHistoryTabs } from './user-detail/AdminHistoryTabs';
import { X, RefreshCw, AlertCircle, Download, Eye } from 'lucide-react';

interface AdminUserModalProps {
  userId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({ userId, onClose, onRefresh }) => {
  const { quotes } = useMarket();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminUserDetail(userId);
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch user detail:', err);
      setError(err.message || 'Impossibile caricare i dati dell\'utente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const handleDirectDownloadPDF = () => {
    if (!data) return;
    generateStatementPDF({
      user: {
        fullName: data.user.full_name,
        email: data.user.email,
        accountNumber: data.account?.account_number || data.user.id,
      },
      portfolio: data.portfolio,
      orders: data.orders || [],
      transactions: data.transactions || [],
    });
  };

  // 1. Loading State Screen
  if (loading && !data) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl font-mono text-xs text-slate-300 flex items-center gap-3 shadow-2xl">
          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
          <span>Caricamento scheda utente 360°...</span>
        </div>
      </div>
    );
  }

  // 2. Error State Screen
  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-800 p-6 rounded-2xl font-mono text-xs text-rose-300 max-w-md w-full shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Errore di Caricamento</span>
          </div>
          <p className="text-slate-300">{error || 'Impossibile trovare la scheda di questo utente.'}</p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold transition-all cursor-pointer"
            >
              Chiudi
            </button>
            <button
              type="button"
              onClick={fetchUserDetail}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all cursor-pointer"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, account, balance, portfolio, positions, orders, transactions } = data;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden font-mono">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.full_name}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user.email} • Conto: <span className="text-cyan-400 font-bold">{account?.account_number || '-'}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDirectDownloadPDF}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Scarica PDF (.pdf)
            </button>

            <button
              type="button"
              onClick={() => setIsStatementOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Anteprima
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Clean Modular Subcomponents */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* 1. KPI Financial Cards */}
          <AdminUserKpis
            balance={balance}
            portfolio={portfolio}
            positionsCount={positions.length}
          />

          {/* 2. Trade Execution Desk */}
          <AdminTradeDesk
            userId={userId}
            freeBalance={balance?.freeBalance || 0}
            quotes={quotes}
            onSuccess={() => {
              fetchUserDetail();
              onRefresh();
            }}
          />

          {/* 3. Funds Adjustment & Moderation */}
          <AdminFundsDesk
            userId={userId}
            userStatus={user.status}
            onSuccess={() => {
              fetchUserDetail();
              onRefresh();
            }}
          />

          {/* 4. History Tabs (Positions, Orders, Ledger) */}
          <AdminHistoryTabs
            userId={userId}
            positions={positions}
            orders={orders}
            transactions={transactions}
            onRefresh={() => {
              fetchUserDetail();
              onRefresh();
            }}
          />
        </div>
      </div>

      {/* Statement Export Modal */}
      {isStatementOpen && (
        <StatementExportModal
          user={{
            fullName: user.full_name,
            email: user.email,
            accountNumber: account?.account_number,
          }}
          portfolio={portfolio}
          orders={orders}
          transactions={transactions}
          onClose={() => setIsStatementOpen(false)}
        />
      )}
    </div>
  );
};
