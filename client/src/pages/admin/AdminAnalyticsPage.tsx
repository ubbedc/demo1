import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Activity, 
  Users, 
  Eye, 
  Smartphone, 
  Monitor, 
  MousePointerClick, 
  RefreshCw, 
  Globe, 
  TrendingUp,
  Clock,
  Radio,
  Trash2
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAdminAnalytics();
      setData(res);
    } catch (err) {
      console.warn('Errore caricamento statistiche:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Sei sicuro di voler azzerare i contatori di visita e i dati di telemetria di test?')) {
      return;
    }
    try {
      await api.resetAdminAnalytics();
      await fetchAnalytics();
    } catch (err) {
      alert('Errore durante l\'azzeramento dei dati');
    }
  };

  useEffect(() => {
    fetchAnalytics();
    if (!autoRefresh) return;
    const timer = setInterval(fetchAnalytics, 10000); // 10s live pulse
    return () => clearInterval(timer);
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        Caricamento telemetria e visitatori in tempo reale...
      </div>
    );
  }

  const {
    activeVisitorsNow = 0,
    todayVisits = 0,
    todayUniqueVisitors = 0,
    uniqueVisitors7Days = 0,
    uniqueVisitors30Days = 0,
    deviceBreakdown = { mobile: 50, desktop: 50, mobileCount: 0, desktopCount: 0 },
    topPages = [],
    conversions = [],
    recentActivity = [],
  } = data || {};

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Control Desk: Analytics & Visite Live
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Solo Clienti & Ospiti
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Telemetria reale — Il traffico degli amministratori è escluso automaticamente per dati puri al 100%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              autoRefresh 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
            {autoRefresh ? 'Auto-Live Attivo' : 'In Pausa'}
          </button>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Aggiorna Dati Adesso"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
            title="Azzera Dati di Test"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Live Radar Pulse Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 p-5 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
            <Users className="w-7 h-7 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block">
              Radar Visitatori in Tempo Reale
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                {activeVisitorsNow}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {activeVisitorsNow === 1 ? 'visitatore attivo online ORA' : 'visitatori attivi online ORA'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Oggi: <strong className="text-white font-bold">{todayVisits} visite</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Unici Oggi: <strong className="text-white font-bold">{todayUniqueVisitors}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics 4-Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Visitatori (Ultimi 7 Giorni)</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-2xl font-black text-white">{uniqueVisitors7Days}</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">Utenti unici rilevati questa settimana</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Visitatori (Ultimi 30 Giorni)</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-2xl font-black text-cyan-400">{uniqueVisitors30Days}</span>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">Copertura globale mensile</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Dispositivi (Mobile vs Desktop)</span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-slate-300">
              <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Mobile {deviceBreakdown.mobile}%</span>
              <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5 text-amber-400" /> Desktop {deviceBreakdown.desktop}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-cyan-400 h-full" style={{ width: `${deviceBreakdown.mobile}%` }}></div>
              <div className="bg-amber-400 h-full" style={{ width: `${deviceBreakdown.desktop}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Azioni & Clic Totali</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-2xl font-black text-amber-400">
              {conversions.reduce((acc: number, c: any) => acc + c.count, 0)}
            </span>
            <MousePointerClick className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">Interazioni su pulsanti e CTA registrate</span>
        </div>
      </div>

      {/* 3. Top Pages & Key Actions Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Pagine Più Visualizzate
          </h3>

          {topPages.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">Nessuna visualizzazione registrata ancora.</div>
          ) : (
            <div className="space-y-2">
              {topPages.map((page: any, idx: number) => {
                const maxViews = topPages[0]?.views || 1;
                const percentage = Math.round((page.views / maxViews) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span className="font-mono text-cyan-300">{page.page_path}</span>
                      <span className="text-slate-400">{page.views} visite</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Key Actions & Clicks */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-amber-400" />
            Azioni e Clic più Frequenti
          </h3>

          {conversions.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">Nessun clic registrato ancora.</div>
          ) : (
            <div className="space-y-2">
              {conversions.map((conv: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                  <span className="font-bold text-amber-300">{conv.event_type}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black">
                    {conv.count} clic
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Activity Stream Table */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Live Activity Stream (Ultime Azioni in Tempo Reale)
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">AGGIORNATO LIVE</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">Nessuna attività recente registrata.</div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Data / Ora</th>
                  <th className="py-2.5 px-3">Tipo Evento</th>
                  <th className="py-2.5 px-3">Pagina</th>
                  <th className="py-2.5 px-3">Dispositivo</th>
                  <th className="py-2.5 px-3 text-right">ID Sessione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentActivity.map((event: any) => {
                  const isPageView = event.event_type === 'PAGE_VIEW';
                  const isMobile = event.device_type === 'MOBILE';

                  return (
                    <tr key={event.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400">{formatDateTime(event.created_at)}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isPageView 
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {event.event_type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-white">{event.page_path}</td>
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          {isMobile ? <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> : <Monitor className="w-3.5 h-3.5 text-amber-400" />}
                          {event.device_type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500 text-[10px]">
                        {event.session_id.slice(0, 10)}...
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
