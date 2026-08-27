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
import { PortfolioSummary, Position } from './types';
import { api } from './services/api';
import { LineChart, Clock, Receipt } from 'lucide-react';

import { trackPageView, trackAction } from './services/telemetry';

function MainApp() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [activeView, setActiveView] = useState<'landing' | 'trading' | 'orders' | 'transactions' | 'admin'>('landing');
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  const prevPortfolioRef = useRef<PortfolioSummary | null>(null);
  const prevPositionsCountRef = useRef<number | null>(null);

  // Track page views automatically
  useEffect(() => {
    trackPageView(activeView === 'landing' ? '/' : '/' + activeView);
  }, [activeView]);

  // Automatically switch view if user logs in or out with strict role gatekeeping
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        if (activeView === 'landing') {
          setActiveView('admin');
        }
      } else {
        // Standard Client is always restricted to client views (trading/orders/transactions)
        if (activeView === 'landing' || activeView === 'admin') {
          setActiveView('trading');
        }
      }
    } else {
      setActiveView('landing');
    }
  }, [user]);

  // Strict role security gate: prevent normal clients from ever viewing the admin console
  useEffect(() => {
    if (activeView === 'admin' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      setActiveView(user ? 'trading' : 'landing');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Navbar
        portfolio={portfolio}
        activeView={activeView}
        setActiveView={(v: any) => setActiveView(v)}
        onResetDemo={handleResetDemo}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-6">
        {activeView === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onEnterPlatform={() => {
              trackAction('CTA_ENTER_PLATFORM');
              setActiveView('trading');
            }}
          />
        )}

        {activeView !== 'landing' && activeView !== 'admin' && (
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
        setActiveView={(v: any) => setActiveView(v)}
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
