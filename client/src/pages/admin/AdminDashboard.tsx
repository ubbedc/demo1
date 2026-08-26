import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminDashboardMetrics, AuditLog } from '../../types';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminGlobalPositionsPage } from './AdminGlobalPositionsPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  ShieldAlert, 
  Globe, 
  TrendingUp,
  Sliders
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'positions' | 'audit' | 'settings'>('users');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [m, a] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminAuditLogs(50),
      ]);
      setMetrics(m);
      setAuditLogs(a);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/20 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h1 className="text-xl font-black text-white tracking-tight">Admin CRM & Operations Command Desk</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervisione multi-account in tempo reale, allocazione fondi virtuali, liquidazione posizioni e audit trail crittografico.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizza Dati
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Clienti Gestiti</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xl font-black text-white">{metrics?.totalUsers ?? '...'}</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">{metrics?.activeUsers ?? 0} attivi</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Fondi Assegnati</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-black text-emerald-400">
            ${((metrics?.totalAllocatedDemoFunds || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Capitale cassa demo</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Posizioni Aperte</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-black text-white">{metrics?.totalPositions ?? '...'}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Attualmente a mercato</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Ordini Eseguiti</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xl font-black text-white">{metrics?.totalOrders ?? '...'}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Completati a mercato</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold">Volume Notionale</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl font-black text-white">
            ${((metrics?.totalVolume || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Scambiato da desk</span>
        </div>
      </div>

      {/* 3 Main CRM Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Anagrafica & Gestione Clienti
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'positions'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Desk Rischio & Posizioni Globali ({metrics?.totalPositions ?? 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Registro Audit Immutabile ({auditLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Personalizzazione & CMS
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <AdminUsersPage onRefreshStats={fetchStats} />
      )}

      {activeTab === 'positions' && (
        <AdminGlobalPositionsPage />
      )}

      {activeTab === 'settings' && (
        <AdminSettingsPage />
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Registro Audit di Sistema (Immutabile)
              </h2>
              <p className="text-xs text-slate-400">Tutte le azioni di mutazione eseguite dagli operatori backoffice con indirizzo IP</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Data / Ora</th>
                  <th className="py-3 px-4">Operatore</th>
                  <th className="py-3 px-4">Azione Audit</th>
                  <th className="py-3 px-4">Entità Target</th>
                  <th className="py-3 px-4">Dettaglio / Modifica</th>
                  <th className="py-3 px-4 text-right">Indirizzo IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Nessun record di audit presente.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        {log.actor_email || 'System'} <span className="text-[10px] text-slate-500">({log.actor_role})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-300">{log.target_entity} #{log.target_id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{log.state_after || '-'}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{log.ip_address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
