import React from 'react';
import { Play, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { User } from '../../../types';
import { usePlatformSettings } from '../../../context/PlatformSettingsContext';

interface LandingHeroProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterPlatform: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  user,
  onOpenAuth,
  onEnterPlatform,
}) => {
  const { settings } = usePlatformSettings();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-8 sm:p-14 shadow-2xl">
      {/* Glowing Background Orbs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl space-y-6">
        {/* Engine Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold tracking-wide shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          {settings.platform_name ? `${settings.platform_name.toUpperCase()} ENGINE 2.0 • INFRASTRUTTURA LIVE` : 'APEX ENGINE 2.0 • INFRASTRUTTURA AD ALTA FREQUENZA'}
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          {settings.hero_headline || 'Trading Istituzionale. Esecuzione & Capitale Protetto.'}
        </h1>

        {/* Subtitle Description */}
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          {settings.hero_subtitle || 'Infrastruttura finanziaria avanzata per il monitoraggio di strategie quantitative, rendicontazione a doppia partita contabile e trading gestito da Desk centrale, con feed mondiali in streaming continuo ed estratti conto certificati.'}
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {user ? (
            <button
              type="button"
              onClick={onEnterPlatform}
              className="px-7 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono rounded-2xl shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Accedi al Tuo Terminale Operativo
            </button>
          ) : (
            <>
              {settings.registrations_enabled ? (
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-7 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono rounded-2xl shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  Attiva Conto Istituzionale
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-7 py-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black font-mono rounded-2xl shadow-xl transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105"
                >
                  <Lock className="w-4 h-4" />
                  Accesso Clienti (Registrazioni Chiuse)
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-7 py-4 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer hover:border-cyan-500/40"
              >
                Area Riservata Clienti
              </button>
            </>
          )}
        </div>

        {/* 4 Quick Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 font-mono text-xs text-slate-400">
          <div>
            <span className="text-white font-black text-lg block">$0.00</span>
            <span className="text-slate-400 text-[11px]">Rischio Iniziale Controllato</span>
          </div>
          <div>
            <span className="text-cyan-400 font-black text-lg block">&lt; 5ms</span>
            <span className="text-slate-400 text-[11px]">Latenza di Esecuzione</span>
          </div>
          <div>
            <span className="text-emerald-400 font-black text-lg block">SHA-256</span>
            <span className="text-slate-400 text-[11px]">Ledger Immutabile</span>
          </div>
          <div>
            <span className="text-amber-400 font-black text-lg block">100% PDF</span>
            <span className="text-slate-400 text-[11px]">Rendiconti Certificati</span>
          </div>
        </div>
      </div>
    </section>
  );
};
