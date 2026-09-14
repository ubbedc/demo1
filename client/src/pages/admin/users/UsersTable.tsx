import React from 'react';
import { Eye, Trash2, Download } from 'lucide-react';

interface UsersTableProps {
  users: any[];
  loading: boolean;
  pdfLoadingId: string | null;
  onSelectUser: (id: string) => void;
  onDownloadPdf: (id: string) => void;
  onDeleteUser: (id: string, name: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  pdfLoadingId,
  onSelectUser,
  onDownloadPdf,
  onDeleteUser,
}) => {
  if (loading && users.length === 0) {
    return <div className="py-12 text-center text-slate-500 text-xs">Caricamento anagrafica utenti...</div>;
  }

  if (users.length === 0) {
    return <div className="py-12 text-center text-slate-500 text-xs">Nessun utente trovato con i filtri attuali.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
            <th className="py-3 px-4">Cliente / Nominativo</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Conto Demo</th>
            <th className="py-3 px-4 text-right">Saldo Cassa</th>
            <th className="py-3 px-4 text-center">Ruolo</th>
            <th className="py-3 px-4 text-center">Stato</th>
            <th className="py-3 px-4 text-right">Azioni Rapide Desk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {users.map((u) => {
            const isAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';

            return (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-white">{u.full_name}</td>
                <td className="py-3 px-4 text-slate-400">{u.email}</td>
                <td className="py-3 px-4 text-cyan-400 font-bold">{u.account_number || '-'}</td>
                <td className="py-3 px-4 text-right font-black text-white">
                  ${Number(u.cash_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Quick 1-Click PDF */}
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(u.id)}
                      disabled={pdfLoadingId === u.id}
                      title="Scarica Estratto Conto PDF Diretto"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all cursor-pointer hover:border-cyan-500/40 disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${pdfLoadingId === u.id ? 'animate-bounce' : ''}`} />
                    </button>

                    {/* 360 Full Inspection */}
                    <button
                      type="button"
                      onClick={() => onSelectUser(u.id)}
                      className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      360° Desk
                    </button>

                    {/* Delete User (Non-admins only) */}
                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id, u.full_name)}
                        title="Elimina Utente Definitivamente"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
