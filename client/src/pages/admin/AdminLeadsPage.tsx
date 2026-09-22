import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LeadRecord, LeadMetrics } from '../../types';
import {
  Users,
  Phone,
  Mail,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  PhoneCall,
  Save,
} from 'lucide-react';

export const AdminLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [metrics, setMetrics] = useState<LeadMetrics | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminLeads({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: 50,
      });
      setLeads(data.leads);
      setTotal(data.total);
      setMetrics(data.metrics);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      await api.updateAdminLead(leadId, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l))
      );
      if (metrics) {
        // Refetch metrics in background
        const data = await api.getAdminLeads({ limit: 1 });
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNote = async (leadId: string) => {
    try {
      await api.updateAdminLead(leadId, { notes: noteDraft });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, notes: noteDraft } : l))
      );
      setEditingNotesId(null);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleDelete = async (leadId: string, name: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il contatto di "${name}"?`)) {
      return;
    }
    try {
      await api.deleteAdminLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const formatWhatsAppUrl = (phone: string, name: string, topic?: string | null) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Ciao ${name}, sono il tutor di ApexTrader Quant Academy. Ho visto che hai scaricato il dossier didattico su ${topic || 'Trading & Rischio'}. Sei riuscito ad aprire la Sandbox da $10.000 virtuali o hai dubbi sulle formule?`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Metrics Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Totale Leads</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {metrics ? metrics.totalLeads : '--'}
          </div>
          <span className="text-[11px] text-slate-500 block">Acquisiti da campagne paid</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
            <span>Nuovi da Contattare</span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {metrics ? metrics.newLeads : '--'}
          </div>
          <span className="text-[11px] text-slate-400 block">Lead caldi in attesa di follow-up</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
            <span>Con WhatsApp / Telefono</span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {metrics ? metrics.phoneCapturedCount : '--'}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {metrics ? `${metrics.phoneCaptureRate}% del totale contatti` : '--'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
            <span>Clienti Convertiti</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300">
            {metrics ? metrics.convertedLeads : '--'}
          </div>
          <span className="text-[11px] text-slate-400 block">Contratti / Corsi perfezionati</span>
        </div>
      </div>

      {/* 2. Control Bar: Search & Status Filter */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, email, cellulare o argomento..."
            className="w-full pl-9 pr-24 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all"
          >
            Cerca
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'ALL', label: 'Tutti' },
            { id: 'NEW', label: 'Nuovi' },
            { id: 'CONTACTED', label: 'Contattati' },
            { id: 'QUALIFIED', label: 'Qualificati' },
            { id: 'CONVERTED', label: 'Convertiti' },
            { id: 'LOST', label: 'Persi' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchLeads}
            title="Ricarica"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Leads Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rubrica Lead Generation & Trattative Commerciali ({total})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            💡 Clicca su WhatsApp per avviare la conversazione con messaggio preimpostato
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">Data / Ora</th>
                <th className="py-3 px-4 font-bold">Contatto</th>
                <th className="py-3 px-4 font-bold">Telefono / WhatsApp</th>
                <th className="py-3 px-4 font-bold">Profilo & Modulo</th>
                <th className="py-3 px-4 font-bold">Stato Commerciale</th>
                <th className="py-3 px-4 font-bold">Note Trattativa</th>
                <th className="py-3 px-4 text-right font-bold">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    <span>Caricamento rubrica contatti in tempo reale...</span>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nessun lead trovato con i filtri attuali.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const hasPhone = Boolean(lead.phone && lead.phone.trim().length >= 6);
                  const isNew = lead.status === 'NEW';

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isNew ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* 1. Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{new Date(lead.created_at).toLocaleDateString('it-IT')}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(lead.created_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 2. Contact Identity */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{lead.full_name}</span>
                          {isNew && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase">
                              NUOVO
                            </span>
                          )}
                        </div>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{lead.email}</span>
                        </a>
                      </td>

                      {/* 3. Phone & Direct WhatsApp Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {hasPhone ? (
                          <div className="space-y-1">
                            <div className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={formatWhatsAppUrl(lead.phone!, lead.full_name, lead.module_title)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Chiama</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px]">
                            Solo Email (Passo 2)
                          </span>
                        )}
                      </td>

                      {/* 4. Experience Level & Module */}
                      <td className="py-3 px-4">
                        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-1">
                          {lead.experience_level === 'BEGINNER'
                            ? 'Principiante'
                            : lead.experience_level === 'INTERMEDIATE'
                            ? 'Intermedio'
                            : lead.experience_level === 'ADVANCED'
                            ? 'Avanzato / Quant'
                            : lead.experience_level}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {lead.module_title || lead.module_id || 'Generale Masterclass'}
                        </div>
                      </td>

                      {/* 5. Status Dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`px-2 py-1 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                            lead.status === 'NEW'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : lead.status === 'CONTACTED'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                              : lead.status === 'QUALIFIED'
                              ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
                              : lead.status === 'CONVERTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          <option value="NEW">🟡 Nuovo</option>
                          <option value="CONTACTED">🔵 Contattato</option>
                          <option value="QUALIFIED">🟢 Qualificato</option>
                          <option value="CONVERTED">👑 Convertito</option>
                          <option value="LOST">🔴 Perso</option>
                        </select>
                      </td>

                      {/* 6. Notes */}
                      <td className="py-3 px-4">
                        {editingNotesId === lead.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Scrivi nota follow-up..."
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500 w-36 sm:w-44"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveNote(lead.id)}
                              className="p-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNotesId(null)}
                              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setNoteDraft(lead.notes || '');
                            }}
                            className="cursor-pointer text-[11px] text-slate-400 hover:text-cyan-300 line-clamp-1 border-b border-dotted border-slate-700 hover:border-cyan-400 py-0.5"
                            title="Clicca per modificare la nota"
                          >
                            {lead.notes || '+ Aggiungi nota'}
                          </div>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id, lead.full_name)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 text-slate-500 transition-all cursor-pointer"
                          title="Elimina Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
