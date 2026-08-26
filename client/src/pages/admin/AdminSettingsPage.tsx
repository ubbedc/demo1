import React, { useState, useEffect } from 'react';
import { usePlatformSettings } from '../../context/PlatformSettingsContext';
import { applyCustomThemeColor } from '../../utils/themeColors';
import { 
  Building2, 
  Megaphone, 
  Layers, 
  Sliders, 
  UserCheck, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Globe2, 
  Mail, 
  Send,
  Palette 
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = usePlatformSettings();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(formData);
      await refreshSettings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio delle impostazioni.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-mono">
      {/* Top Header Bar with Live Status & Save Button */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Gestione Piattaforma & Headless CMS
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                White-Label Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalizza branding, testi, annunci in tempo reale e sezioni visibili senza riavviare il server.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            savedSuccess
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 hover:scale-105'
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Modifiche Applicate Live!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Salvataggio...' : 'Salva Impostazioni Piattaforma'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Brand & Identità Istituzionale */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              1. Brand & Identità Visiva
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Nome Piattaforma / Marchio</label>
              <input
                type="text"
                value={formData.platform_name}
                onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                placeholder="Es. ApexTrader, ProCapital Desk..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Tagline Istituzionale</label>
              <input
                type="text"
                value={formData.platform_tagline}
                onChange={(e) => setFormData({ ...formData, platform_tagline: e.target.value })}
                placeholder="Es. Institutional Platform, Prime Brokerage..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-400 block mb-1 font-bold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  Email Supporto
                </label>
                <input
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold flex items-center gap-1">
                  <Send className="w-3 h-3 text-slate-500" />
                  Canale / Desk Telegram
                </label>
                <input
                  type="text"
                  value={formData.support_telegram}
                  onChange={(e) => setFormData({ ...formData, support_telegram: e.target.value })}
                  placeholder="@TuoDesk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Theme Color Customizer */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-400 block mb-2 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  Colore Primario Piattaforma (White-Label Theme)
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">Selettore Libero Infinito</span>
              </label>

              {/* 5 Preset Fast Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                {[
                  { id: 'cyan', name: 'Ciano Cyber', hex: '#06b6d4', desc: 'Default' },
                  { id: 'amber', name: 'Oro Prime', hex: '#f59e0b', desc: 'Luxury Gold' },
                  { id: 'emerald', name: 'Smeraldo', hex: '#10b981', desc: 'Wall Street' },
                  { id: 'blue', name: 'Blu Royal', hex: '#3b82f6', desc: 'Hedge Fund' },
                  { id: 'purple', name: 'Viola Quant', hex: '#a855f7', desc: 'Algoritmico' },
                ].map((color) => {
                  const isSelected = formData.theme_color_primary === color.id || formData.theme_color_primary === color.hex;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, theme_color_primary: color.id });
                        applyCustomThemeColor(color.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-white bg-slate-800/90 shadow-md ring-2 ring-white/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span 
                          className="w-4 h-4 rounded-full shadow-sm border border-black/30"
                          style={{ backgroundColor: color.hex }}
                        ></span>
                        {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                      </div>
                      <div>
                        <span className="font-bold text-white text-[11px] block">{color.name}</span>
                        <span className="text-[9px] text-slate-500 block">{color.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Dropper & Direct HEX Input */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={
                        formData.theme_color_primary?.startsWith('#') 
                          ? formData.theme_color_primary 
                          : (
                            formData.theme_color_primary === 'amber' ? '#f59e0b' :
                            formData.theme_color_primary === 'emerald' ? '#10b981' :
                            formData.theme_color_primary === 'blue' ? '#3b82f6' :
                            formData.theme_color_primary === 'purple' ? '#a855f7' : '#06b6d4'
                          )
                      }
                      onChange={(e) => {
                        const newColor = e.target.value;
                        setFormData({ ...formData, theme_color_primary: newColor });
                        applyCustomThemeColor(newColor);
                      }}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer overflow-hidden p-0"
                      title="Scegli qualsiasi colore dallo spettro cromatico"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-white block">Spettro Cromatico Libero</span>
                    <span className="text-[9px] text-slate-500 block">Scegli qualsiasi sfumatura o inserisci il codice HEX</span>
                  </div>
                </div>

                {/* Direct Hex Input Box */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">HEX:</span>
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="#06b6d4"
                    value={formData.theme_color_primary || '#06b6d4'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, theme_color_primary: val });
                      if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
                        applyCustomThemeColor(val);
                      }
                    }}
                    className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold uppercase focus:outline-none focus:border-cyan-500 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Banner di Annuncio Globale (Live Broadcast) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                2. Banner Annunci Live (Broadcast)
              </h3>
            </div>
            
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcement_banner_enabled}
                onChange={(e) => setFormData({ ...formData, announcement_banner_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-2 text-[11px] font-bold text-slate-300">
                {formData.announcement_banner_enabled ? 'ATTIVO' : 'DISATTIVO'}
              </span>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">
                Testo dell'Annuncio (Visibile in cima a tutte le pagine)
              </label>
              <input
                type="text"
                value={formData.announcement_banner_text}
                onChange={(e) => setFormData({ ...formData, announcement_banner_text: e.target.value })}
                placeholder="Es. 🔥 APEX ENGINE 2.0 • FEED GLOBALE SUB-MILLISECONDO ATTIVO"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Live Preview Box */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <span className="text-[10px] text-amber-400/80 uppercase font-black block mb-1">
                Anteprima Broadcast Live:
              </span>
              <div className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                {formData.announcement_banner_text || 'Nessun testo specificato.'}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Contenuti Hero Landing Page (Headless CMS) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              3. Testi Principali Landing Page
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Titolo Principale (Hero Headline)</label>
              <input
                type="text"
                value={formData.hero_headline}
                onChange={(e) => setFormData({ ...formData, hero_headline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Sottotitolo Descrittivo</label>
              <textarea
                rows={3}
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Modular Section Switcher & Registrazioni */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              4. Sezioni Visibili & Controllo Accessi
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Toggle Registrazioni */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Apertura Nuove Registrazioni</span>
                <span className="text-[10px] text-slate-500">Se disattivato, il form accetta solo login esistenti</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.registrations_enabled}
                  onChange={(e) => setFormData({ ...formData, registrations_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Toggle Sezioni */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-[11px] text-slate-300 font-bold">Tabella Confronto</span>
                <input
                  type="checkbox"
                  checked={formData.show_comparison_section}
                  onChange={(e) => setFormData({ ...formData, show_comparison_section: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-[11px] text-slate-300 font-bold">Domande FAQ</span>
                <input
                  type="checkbox"
                  checked={formData.show_faq_section}
                  onChange={(e) => setFormData({ ...formData, show_faq_section: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-[11px] text-slate-300 font-bold">Flusso in 3 Passi</span>
                <input
                  type="checkbox"
                  checked={formData.show_journey_section}
                  onChange={(e) => setFormData({ ...formData, show_journey_section: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-[11px] text-slate-300 font-bold">Pilastri Tech</span>
                <input
                  type="checkbox"
                  checked={formData.show_tech_pillars_section}
                  onChange={(e) => setFormData({ ...formData, show_tech_pillars_section: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
