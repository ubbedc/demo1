import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminUserModal } from './AdminUserModal';
import { AdminCreateUserModal } from './AdminCreateUserModal';
import { generateStatementPDF } from '../../services/pdfGenerator';
import { UsersFilterBar } from './users/UsersFilterBar';
import { UsersTable } from './users/UsersTable';

interface AdminUsersPageProps {
  onRefreshStats: () => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onRefreshStats }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'ZERO' | 'POSITIVE'>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers({
        search,
        status: statusFilter,
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente l'utente "${userName}" e tutti i suoi dati contabili?`)) {
      return;
    }

    try {
      await api.deleteUserByAdmin(userId);
      await fetchUsers();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message || 'Impossibile eliminare l\'utente.');
    }
  };

  const handleQuickDownloadPDF = async (userId: string) => {
    setPdfLoadingId(userId);
    try {
      const detail = await api.getAdminUserDetail(userId);
      generateStatementPDF({
        user: {
          fullName: detail.user.full_name || detail.user.fullName,
          email: detail.user.email,
          accountNumber: detail.account?.account_number || detail.account?.accountNumber,
        },
        portfolio: {
          accountId: detail.account?.id || 'APX-ACC',
          currency: 'USD',
          cashBalance: Number(detail.balance?.cash_balance ?? detail.balance?.cashBalance ?? 0),
          freeBalance: Number(detail.balance?.cash_balance ?? detail.balance?.cashBalance ?? 0),
          reservedBalance: Number(detail.balance?.reserved_balance ?? detail.balance?.reservedBalance ?? 0),
          totalInvestedValue: 0,
          totalUnrealizedPnL: 0,
          equity: Number(detail.balance?.cash_balance ?? detail.balance?.cashBalance ?? 0),
          openPositionsCount: (detail.positions || []).length,
        },
        orders: detail.orders || [],
        transactions: detail.transactions || [],
      });
    } catch (err: any) {
      alert(err.message || 'Impossibile generare il PDF.');
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!users || users.length === 0) {
      alert('Nessun utente disponibile per l\'esportazione.');
      return;
    }

    const headers = ['ID Utente', 'Nome Completo', 'Email', 'Numero Conto', 'Saldo Cassa ($)', 'Posizioni Aperte', 'Stato Account', 'Ruolo', 'Data Registrazione'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${(u.full_name || u.fullName || '').replace(/"/g, '""')}"`,
      u.email,
      u.account_number || u.accountNumber || '-',
      Number(u.cash_balance || 0).toFixed(2),
      u.open_positions_count || 0,
      u.status || 'ACTIVE',
      u.role || 'CLIENT',
      new Date(u.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Anagrafica_Clienti_ApexTrader_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((u) => {
    if (balanceFilter === 'ZERO') return Number(u.cash_balance) === 0;
    if (balanceFilter === 'POSITIVE') return Number(u.cash_balance) > 0;
    return true;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 font-mono shadow-xl">
      {/* Search & Filter Header Bar */}
      <UsersFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        balanceFilter={balanceFilter}
        setBalanceFilter={setBalanceFilter}
        onOpenCreate={() => setIsCreateOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Users Data Grid Table */}
      <UsersTable
        users={filteredUsers}
        loading={loading}
        pdfLoadingId={pdfLoadingId}
        onSelectUser={(id) => setSelectedUserId(id)}
        onDownloadPdf={handleQuickDownloadPDF}
        onDeleteUser={handleDeleteUser}
      />

      {/* Create User Modal */}
      {isCreateOpen && (
        <AdminCreateUserModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            fetchUsers();
            onRefreshStats();
          }}
        />
      )}

      {/* 360 Full Inspection Modal */}
      {selectedUserId && (
        <AdminUserModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={() => {
            fetchUsers();
            onRefreshStats();
          }}
        />
      )}
    </div>
  );
};
