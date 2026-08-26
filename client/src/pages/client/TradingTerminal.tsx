import React, { useState, useEffect } from 'react';
import { PortfolioSummary, Position, Order, Transaction } from '../../types';
import { DesktopTradingWorkspace } from './DesktopTradingWorkspace';
import { MobileTradingWorkspace } from './MobileTradingWorkspace';
import { api } from '../../services/api';

interface TradingTerminalProps {
  portfolio: PortfolioSummary | null;
  positions: Position[];
  onRefreshData: () => void;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  portfolio,
  positions,
  onRefreshData,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [ord, tx] = await Promise.all([
          api.getOrders(),
          api.getTransactions(),
        ]);
        setOrders(ord);
        setTransactions(tx);
      } catch (err) {
        console.warn('Failed to fetch orders/tx for desktop terminal:', err);
      }
    };
    fetchAdditionalData();
  }, [positions]);

  return (
    <div>
      {/* 1. Desktop Professional Trading Station (Visible on Lg+ screens) */}
      <div className="hidden lg:block">
        <DesktopTradingWorkspace
          portfolio={portfolio}
          positions={positions}
          orders={orders}
          transactions={transactions}
          onRefreshData={onRefreshData}
        />
      </div>

      {/* 2. Mobile Touch-First Trading App (Visible on Mobile / Tablets) */}
      <div className="block lg:hidden">
        <MobileTradingWorkspace
          portfolio={portfolio}
          positions={positions}
          onRefreshData={onRefreshData}
        />
      </div>
    </div>
  );
};
