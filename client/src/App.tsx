import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { PlatformSettingsProvider } from './context/PlatformSettingsContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { LandingPage } from './pages/public/LandingPage';
import { AuthModal } from './pages/public/AuthModal';
import { TradingTerminal } from './pages/client/TradingTerminal';
import { OrdersPage } from './pages/client/OrdersPage';
import { TransactionsPage } from './pages/client/TransactionsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HTBAcademyWorkspace } from './pages/academy/HTBAcademyWorkspace';
import { GoogleAdsLandingPage } from './pages/public/GoogleAdsLandingPage';
import { PortfolioSummary, Position } from './types';
import { api } from './services/api';
import { useMarket } from './context/MarketContext';
import { LineChart, Clock, Receipt } from 'lucide-react';

import { trackPageView, trackAction } from './services/telemetry';

function parseInitialRoute(): {
  view: 'landing' | 'trading' | 'orders' | 'transactions' | 'admin' | 'academy' | 'lp';
  mod: string | null;
} {
  try {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const modParam = params.get('mod') || params.get('module');
    const topicParam = params.get('topic') || params.get('lp');
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();

    if (path === 'lp' || path.startsWith('lp') || viewParam === 'lp' || topicParam) {
      return { view: 'lp', mod: topicParam || modParam };
    }
    if (path.startsWith('academy') || viewParam === 'academy' || modParam) {
      return { view: 'academy', mod: modParam };
    }
    if (path === 'trading' || viewParam === 'trading') return { view: 'trading', mod: null };
    if (path === 'orders' || viewParam === 'orders') return { view: 'orders', mod: null };
    if (path === 'transactions' || viewParam === 'transactions') return { view: 'transactions', mod: null };
    if (path.startsWith('admin') || viewParam === 'admin') return { view: 'admin', mod: null };
  } catch (_) {}
  return { view: 'landing', mod: null };
}

function MainApp() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const { setSelectedSymbol } = useMarket();

  const initialRoute = useRef(parseInitialRoute()).current;
  const [activeView, setActiveView] = useState<'landing' | 'trading' | 'orders' | 'transactions' | 'admin' | 'academy' | 'lp'>(initialRoute.view);
  const [academyModuleId, setAcademyModuleId] = useState<string | null>(initialRoute.mod);

  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  const prevPortfolioRef = useRef<PortfolioSummary | null>(null);
  const prevPositionsCountRef = useRef<number | null>(null);

  // Sync browser URL whenever view or deep-linked module changes
  const updateUrl = (view: string, modId?: string | null) => {
    try {
      const url = new URL(window.location.href);
      if (view === 'landing') {
        url.pathname = '/';
        url.search = '';
      } else if (view === 'lp') {
        url.pathname = '/lp';
        if (modId) {
          url.searchParams.set('topic', modId);
        } else {
          url.search = '';
        }
      } else if (view === 'academy') {
        url.pathname = '/academy';
        if (modId) {
          url.searchParams.set('mod', modId);
        } else {
          url.searchParams.delete('mod');
          url.searchParams.delete('module');
        }
      } else {
        url.pathname = '/' + view;
        url.search = '';
      }
      if (window.location.pathname !== url.pathname || window.location.search !== url.search) {
        window.history.pushState({ view, modId }, '', url.toString());
      }
    } catch (_) {}
  };

  const handleNavigate = (view: 'landing' | 'trading' | 'orders' | 'transactions' | 'admin' | 'academy' | 'lp', modId?: string | null) => {
    setActiveView(view);
    if (view === 'academy' || view === 'lp') {
      setAcademyModuleId(modId !== undefined ? modId : null);
    }
    updateUrl(view, modId);
  };

  // Browser Back/Forward navigation listener (popstate)
  useEffect(() => {
    const onPopState = () => {
      const route = parseInitialRoute();
      setActiveView(route.view);
      setAcademyModuleId(route.mod);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Track page views automatically
  useEffect(() => {
    trackPageView(activeView === 'landing' ? '/' : '/' + activeView);
  }, [activeView]);

  // Automatically switch view if user logs in or out with strict role gatekeeping
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        if (activeView === 'landing') {
          handleNavigate('admin');
        }
      } else {
        // Standard Client is always restricted to client views (trading/orders/transactions)
        if (activeView === 'landing' || activeView === 'admin') {
          handleNavigate('trading');
        }
      }
    } else {
      // Guest users can browse landing or academy without being kicked out
      if (activeView !== 'academy' && activeView !== 'landing') {
        handleNavigate('landing');
      }
    }
  }, [user]);

  // Strict role security gate: prevent normal clients from ever viewing the admin console
  useEffect(() => {
    if (activeView === 'admin' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      handleNavigate(user ? 'trading' : 'landing');
    }
  }, [activeView, user]);

  // Periodic polling with Real-Time Sensory Feedback (Toasts + Chimes)
  const refreshUserData = async () => {
    if (!user || !user.accountId) return;
    try {
      const [port, pos] = await Promise.all([
        api.getPortfolio(),
        api.getPositions(),
      ]);

      // Detect Live Events on Client
      if (prevPortfolioRef.current) {
        const prevCash = prevPortfolioRef.current.cashBalance;
        const delta = port.cashBalance - prevCash;

        if (delta > 0 && pos.length === (prevPositionsCountRef.current || 0)) {
          notify(
            'funds',
            'Accredito Fondi Istituzionali',
            `Ricevuto accredito di +$${delta.toLocaleString(undefined, { minimumFractionDigits: 2 })} di capitale operativo dal Desk!`
          );
        } else if (delta < 0 && pos.length === (prevPositionsCountRef.current || 0)) {
          notify(
            'funds',
            'Rettifica Fondi Desk',
            `Rettifica amministrativa di -$${Math.abs(delta).toLocaleString(undefined, { minimumFractionDigits: 2 })} eseguita dal Risk Desk.`
          );
        }
      }

      if (prevPositionsCountRef.current !== null) {
        if (pos.length > prevPositionsCountRef.current) {
          const newest = pos[0];
          notify(
            newest?.side === 'LONG' ? 'trade_buy' : 'trade_sell',
            'Nuova Operazione a Mercato',
            `Il Desk ha aperto: ${newest?.side} ${newest?.quantity} ${newest?.assetSymbol} @ $${newest?.averageEntryPrice.toLocaleString()}`
          );
        } else if (pos.length < prevPositionsCountRef.current) {
          notify(
            'trade_close',
            'Operazione Chiusa a Mercato',
            'Un\'operazione è stata liquidata a mercato e il profitto/perdita è stato accreditato sul tuo saldo.'
          );
        }
      }

      prevPortfolioRef.current = port;
      prevPositionsCountRef.current = pos.length;

      setPortfolio(port);
      setPositions(pos);
    } catch (err) {
      console.warn('Failed to poll user portfolio:', err);
    }
  };

  useEffect(() => {
    refreshUserData();
    const interval = setInterval(refreshUserData, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const handleResetDemo = async () => {
    if (!confirm('Vuoi richiedere una ricarica di $10,000.00 di soldi demo per continuare la simulazione?')) return;
    try {
      await api.resetDemoBalance();
      refreshUserData();
      notify('funds', 'Ricarica Demo Eseguita', 'Saldo demo ricaricato con successo!');
    } catch (err: any) {
      alert(err.message || 'Errore durante la ricarica demo.');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    trackAction('AUTH_MODAL_OPEN', { mode });
    setAuthModal({ isOpen: true, mode });
  };

  // Dedicated Google Ads Landing Page View (Zero-Leakage & High Conversion)
  if (activeView === 'lp') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
        <GoogleAdsLandingPage
          initialTopic={academyModuleId}
          onNavigateToTrading={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            trackAction('LP_CONVERT_TRADING', { symbol });
            handleNavigate('trading');
          }}
          onNavigateToAcademy={(modId) => {
            trackAction('LP_CONVERT_ACADEMY', { modId });
            handleNavigate('academy', modId);
          }}
          onNavigateToHome={() => handleNavigate('landing')}
          onOpenAuth={handleOpenAuth}
        />
        {authModal.isOpen && (
          <AuthModal
            initialMode={authModal.mode}
            onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
            onSuccess={() => {
              setAuthModal({ isOpen: false, mode: 'login' });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Navbar
        portfolio={portfolio}
        activeView={activeView}
        setActiveView={(v: any) => handleNavigate(v)}
        onResetDemo={handleResetDemo}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-36 sm:pb-28 md:pb-8">
        {activeView === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onEnterPlatform={() => {
              trackAction('CTA_ENTER_PLATFORM');
              handleNavigate('trading');
            }}
            onNavigateToAcademy={() => {
              trackAction('CTA_OPEN_ACADEMY');
              handleNavigate('academy');
            }}
          />
        )}

        {/* Quant Academy Workspace */}
        {activeView === 'academy' && (
          <HTBAcademyWorkspace
            initialModuleId={academyModuleId}
            onModuleSelect={(modId) => {
              setAcademyModuleId(modId);
              updateUrl('academy', modId);
            }}
            onNavigateToTrading={(symbol) => {
              if (symbol) setSelectedSymbol(symbol);
              trackAction('ACADEMY_SPAWN_LAB', { symbol });
              handleNavigate('trading');
            }}
          />
        )}

        {activeView !== 'landing' && activeView !== 'admin' && activeView !== 'academy' && (
          <div className="space-y-4">
            {/* Client Views */}
            {activeView === 'trading' && (
              <TradingTerminal
                portfolio={portfolio}
                positions={positions}
                onRefreshData={refreshUserData}
              />
            )}

            {activeView === 'orders' && <OrdersPage />}

            {activeView === 'transactions' && <TransactionsPage />}
          </div>
        )}

        {/* Admin CRM Console */}
        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Mobile Sticky Bottom Tab Bar (WhatsApp / iOS Style) */}
      <BottomNav
        activeView={activeView}
        setActiveView={(v: any) => handleNavigate(v)}
        openPositionsCount={positions.length}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      {/* Auth Modal */}
      {authModal.isOpen && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          onSuccess={() => {
            setAuthModal({ isOpen: false, mode: 'login' });
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlatformSettingsProvider>
      <AuthProvider>
        <MarketProvider>
          <NotificationProvider>
            <MainApp />
          </NotificationProvider>
        </MarketProvider>
      </AuthProvider>
    </PlatformSettingsProvider>
  );
}
