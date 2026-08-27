import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlatformSettings } from '../../context/PlatformSettingsContext';
import { MarketTickerCarousel } from '../../components/common/MarketTickerCarousel';
import { LandingHero } from './landing/LandingHero';
import { LandingMarketPreview } from './landing/LandingMarketPreview';
import { LandingJourney } from './landing/LandingJourney';
import { LandingComparison } from './landing/LandingComparison';
import { LandingTechPillars } from './landing/LandingTechPillars';
import { LandingFaq } from './landing/LandingFaq';
import { LandingFooter } from './landing/LandingFooter';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterPlatform: () => void;
  onNavigateToAcademy?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterPlatform, onNavigateToAcademy }) => {
  const { user } = useAuth();
  const { settings } = usePlatformSettings();

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Hero Section */}
      <LandingHero
        user={user}
        onOpenAuth={onOpenAuth}
        onEnterPlatform={onEnterPlatform}
      />

      {/* 2. Live Ticker Slider Carousel */}
      <section className="space-y-3">
        <MarketTickerCarousel />
      </section>

      {/* 3. Live Market Preview & Interactive Chart */}
      <LandingMarketPreview />

      {/* 4. 3-Step Guided Journey */}
      {settings.show_journey_section && <LandingJourney />}

      {/* 4.5 Quant Academy Promo Banner */}
      {onNavigateToAcademy && (
        <section className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <span>⚡ QUANT & TRADING ACADEMY</span>
              <span>•</span>
              <span>12 MODULI DALLA A ALLA Z</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Impara a fare trading con la Masterclass Interattiva Gratuita
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Formazione a nodi stile Hack The Box: scopri la matematica del rischio, esegui nei laboratori sandbox live e sblocca il Diploma Istituzionale.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToAcademy}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:scale-105"
          >
            <span>Inizia la Masterclass Gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* 5. Comparison Matrix */}
      {settings.show_comparison_section && <LandingComparison />}

      {/* 6. Technical Pillars */}
      {settings.show_tech_pillars_section && <LandingTechPillars />}

      {/* 7. Interactive FAQ Accordion */}
      {settings.show_faq_section && <LandingFaq />}

      {/* 8. Final Conversion CTA Banner */}
      <section className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Pronto ad Accedere al Tuo Terminale Operativo?
          </h2>
          <p className="text-sm text-slate-300 font-normal">
            Unisciti all'infrastruttura di trading ApexTrader. Attivazione immediata e accesso completo ai mercati mondiali.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {user ? (
            <button
              type="button"
              onClick={onEnterPlatform}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono rounded-2xl shadow-xl shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Apri Terminale Operativo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono rounded-2xl shadow-xl shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              Attiva Conto Istituzionale
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* 9. Institutional Footer */}
      <LandingFooter />
    </div>
  );
};
