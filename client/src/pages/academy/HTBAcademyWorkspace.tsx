import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HTB_ACADEMY_MODULES, AcademyModule } from '../../constants/htbAcademyCurriculum';
import { HTBModuleReaderModal } from './HTBModuleReaderModal';
import { HTBCertificateModal } from './HTBCertificateModal';
import { triggerHaptic } from '../../utils/haptics';
import { InstitutionalFooter } from '../../components/common/InstitutionalFooter';
import { Button, Card, Badge, Tabs, BottomSheet, EmptyState } from '../../components/ui';
import {
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Play,
  FileDown,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  Filter,
  Grid,
  GitCommit,
  Clock,
  Compass,
  Check,
  ArrowRight,
  Map,
  GraduationCap,
} from 'lucide-react';

interface HTBAcademyWorkspaceProps {
  onNavigateToTrading: (symbol?: string) => void;
  initialModuleId?: string | null;
  onModuleSelect?: (moduleId: string | null) => void;
}

export const HTBAcademyWorkspace: React.FC<HTBAcademyWorkspaceProps> = ({
  onNavigateToTrading,
  initialModuleId,
  onModuleSelect,
}) => {
  const { user } = useAuth();

  // Load progress from localStorage
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_academy_completed_modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('apex_academy_total_xp');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [activeModule, setActiveModule] = useState<AcademyModule | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'roadmap'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  // Mobile-first: bottom sheet for module reader + mobile tab navigation
  const [isMobileReaderOpen, setIsMobileReaderOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'modules' | 'roadmap' | 'diploma'>('modules');

  // Auto-open module from Deep Link URL (?mod=MOD-XX)
  useEffect(() => {
    if (initialModuleId) {
      const target = HTB_ACADEMY_MODULES.find(
        (m) => m.id.toUpperCase() === initialModuleId.toUpperCase()
      );
      if (target) {
        setActiveModule(target);
      }
    }
  }, [initialModuleId]);

  const handleSelectModule = (mod: AcademyModule | null) => {
    setActiveModule(mod);
    onModuleSelect?.(mod ? mod.id : null);
    if (mod) setIsMobileReaderOpen(true);
    else setIsMobileReaderOpen(false);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apex_academy_completed_modules', JSON.stringify(completedModuleIds));
      localStorage.setItem('apex_academy_total_xp', totalXp.toString());
    } catch (e) {
      console.error(e);
    }
  }, [completedModuleIds, totalXp]);

  // Rank Calculation
  const getRank = (xp: number) => {
    if (xp >= 850) {
      return {
        title: 'Institutional Quant Master 👑',
        tierText: 'Tier 3 Mastery',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        nextRankXp: 1000,
        level: 4,
      };
    }
    if (xp >= 550) {
      return {
        title: 'Senior Risk Specialist 🛡️',
        tierText: 'Tier 2 Advanced',
        color: 'text-orange-400',
        badgeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
        nextRankXp: 850,
        level: 3,
      };
    }
    if (xp >= 250) {
      return {
        title: 'Desk Junior Operator 📈',
        tierText: 'Tier 1 Intermediate',
        color: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
        nextRankXp: 550,
        level: 2,
      };
    }
    return {
      title: 'Cadet Market Analyst 🟢',
      tierText: 'Tier 0 Foundations',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      nextRankXp: 250,
      level: 1,
    };
  };

  const rank = getRank(totalXp);
  const completionPercentage = Math.round((completedModuleIds.length / HTB_ACADEMY_MODULES.length) * 100);

  const handleCompleteModule = (moduleId: string, xpEarned: number) => {
    if (!completedModuleIds.includes(moduleId)) {
      const updated = [...completedModuleIds, moduleId];
      setCompletedModuleIds(updated);
      setTotalXp((prev) => prev + xpEarned);
    }
  };

  const handleSpawnLab = (symbol: string) => {
    handleSelectModule(null);
    onNavigateToTrading(symbol);
  };

  // Filter modules
  const filteredModules = HTB_ACADEMY_MODULES.filter((m) => {
    const matchesTier = selectedTier === 'ALL' || m.tier === selectedTier;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const activeIndex = activeModule ? HTB_ACADEMY_MODULES.findIndex((m) => m.id === activeModule.id) : -1;

  const handleNextModule = () => {
    if (activeIndex >= 0 && activeIndex < HTB_ACADEMY_MODULES.length - 1) {
      handleSelectModule(HTB_ACADEMY_MODULES[activeIndex + 1]);
    }
  };

  const handlePrevModule = () => {
    if (activeIndex > 0) {
      handleSelectModule(HTB_ACADEMY_MODULES[activeIndex - 1]);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Very Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Easy':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  const mobileNavOptions = [
    { id: 'modules' as const, label: 'Moduli', icon: <Grid className="w-4 h-4" />, badge: completedModuleIds.length > 0 ? `${completedModuleIds.length}/12` : undefined },
    { id: 'roadmap' as const, label: 'Percorso', icon: <Map className="w-4 h-4" /> },
    { id: 'diploma' as const, label: 'Diploma', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  // ── MOBILE VIEW (< lg) ───────────────────────────────────────────────────────
  const MobileAcademy = (
    <div className="lg:hidden space-y-3 pb-28 font-mono">
      {/* Mobile Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl p-4 border border-slate-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black tracking-wide flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3" />
                QUANT MASTERCLASS
              </span>
            </div>
            <h1 className="text-lg font-black text-white leading-tight">
              Trading Academy
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">12 moduli dal Tier 0 al Tier 3 Mastery</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Progressione</span>
            <span className="text-xl font-black text-white">{completionPercentage}%</span>
            <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rank & XP */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center border border-cyan-500/30">
              {user?.fullName?.charAt(0) || 'T'}
            </div>
            <span className={`text-xs font-black ${rank.color}`}>{rank.title}</span>
          </div>
          <Badge variant="warning" size="sm">{totalXp} XP</Badge>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <Tabs
        options={mobileNavOptions}
        activeId={mobileTab}
        onChange={(id) => setMobileTab(id as any)}
        size="md"
      />

      {/* Search Bar — shown on Modules tab */}
      {mobileTab === 'modules' && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca modulo..."
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono min-h-[48px]"
          />
        </div>
      )}

      {/* ── TAB: Modules grid mobile ── */}
      {mobileTab === 'modules' && (
        <div className="space-y-2.5">
          {filteredModules.length === 0 ? (
            <EmptyState
              icon={<Search className="w-6 h-6 text-slate-400" />}
              title="Nessun modulo trovato"
              description='Prova a modificare il testo di ricerca.'
            />
          ) : (
            filteredModules.map((mod) => {
              const isCompleted = completedModuleIds.includes(mod.id);
              const tierColors = ['text-emerald-400', 'text-cyan-400', 'text-amber-400', 'text-purple-400'];
              return (
                <Card
                  key={mod.id}
                  variant="interactive"
                  padding="md"
                  onClick={() => handleSelectModule(mod)}
                  className="active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon & Status */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                      isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/30'
                        : 'bg-slate-800 border-slate-700/60'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <span>{mod.icon}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-black font-mono ${tierColors[mod.tier]}`}>{mod.id}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500 font-mono">{mod.duration}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-amber-400 font-bold">+{mod.xp} XP</span>
                      </div>
                      <h3 className={`text-sm font-bold leading-snug line-clamp-1 ${
                        isCompleted ? 'text-emerald-300' : 'text-white'
                      }`}>
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{mod.summary}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB: Roadmap by tier mobile ── */}
      {mobileTab === 'roadmap' && (
        <div className="space-y-6">
          {[0, 1, 2, 3].map((tierNum) => {
            const tierModules = HTB_ACADEMY_MODULES.filter((m) => m.tier === tierNum);
            const tierNames = [
              'Tier 0: Fondamenti',
              'Tier 1: Esecuzione & WAP',
              'Tier 2: Leva & Rischio 1%',
              'Tier 3: Quant Mastery',
            ];
            const tierCompletedCount = tierModules.filter((m) => completedModuleIds.includes(m.id)).length;
            const isTierCompleted = tierCompletedCount === tierModules.length;
            const tierColors = ['border-emerald-500/40 text-emerald-400', 'border-cyan-500/40 text-cyan-400', 'border-amber-500/40 text-amber-400', 'border-purple-500/40 text-purple-400'];

            return (
              <div key={tierNum} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isTierCompleted ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-xs font-black text-white">{tierNames[tierNum]}</span>
                  </div>
                  <Badge variant={isTierCompleted ? 'success' : 'neutral'} size="sm">
                    {tierCompletedCount}/{tierModules.length}
                  </Badge>
                </div>

                <div className={`space-y-2 pl-3 border-l-2 ml-1.5 ${isTierCompleted ? 'border-emerald-500/40' : 'border-slate-800'}`}>
                  {tierModules.map((mod) => {
                    const isDone = completedModuleIds.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => { triggerHaptic('light'); handleSelectModule(mod); }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 min-h-[56px] active:scale-[0.99] ${
                          isDone
                            ? 'bg-slate-900/90 border-emerald-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isDone ? <Check className="w-3.5 h-3.5" /> : mod.id.replace('MOD-', '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold line-clamp-1 ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                            {mod.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{mod.duration} · +{mod.xp} XP</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: Diploma mobile ── */}
      {mobileTab === 'diploma' && (
        <div className="space-y-4">
          <Card variant="elevated" padding="lg">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Diploma Ufficiale</h2>
                <p className="text-xs text-slate-400 mt-1">Apex Quant Masterclass · {completedModuleIds.length}/12 Moduli Completati</p>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              {completedModuleIds.length >= 12 ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowCertificateModal(true)}
                  icon={<Award className="w-5 h-5 text-amber-300" />}
                  className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950"
                >
                  Scarica Diploma PDF 📜
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">
                    Completa ancora <strong className="text-white">{12 - completedModuleIds.length} moduli</strong> per sbloccare il diploma.
                  </p>
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => setMobileTab('modules')}
                  >
                    Vai ai Moduli
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wide">Il tuo Profilo Studente</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Rank Attuale</span>
                <span className={`text-xs font-black ${rank.color}`}>{rank.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Punti XP Totali</span>
                <Badge variant="warning" size="sm">{totalXp} XP</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Moduli Completati</span>
                <Badge variant={completedModuleIds.length > 0 ? 'success' : 'neutral'} size="sm">
                  {completedModuleIds.length}/12
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Module Reader BottomSheet (Mobile) */}
      <BottomSheet
        isOpen={isMobileReaderOpen && !!activeModule}
        onClose={() => { setIsMobileReaderOpen(false); handleSelectModule(null); }}
        maxHeight="max-h-[96vh]"
      >
        {activeModule && (
          <HTBModuleReaderModal
            module={activeModule}
            isCompleted={completedModuleIds.includes(activeModule.id)}
            onClose={() => { setIsMobileReaderOpen(false); handleSelectModule(null); }}
            onCompleteModule={handleCompleteModule}
            onSpawnLab={handleSpawnLab}
            onNextModule={activeIndex < HTB_ACADEMY_MODULES.length - 1 ? handleNextModule : undefined}
            onPrevModule={activeIndex > 0 ? handlePrevModule : undefined}
            userName={user?.fullName || user?.email || 'Trader Istituzionale'}
          />
        )}
      </BottomSheet>
    </div>
  );

  return (
    <>
      {/* ── MOBILE: Tab-based layout with BottomSheet ── */}
      {MobileAcademy}

      {/* ── DESKTOP: Original layout (lg+) ── */}
      <div className="hidden lg:block space-y-6 pb-16 font-sans animate-in fade-in duration-200">
        {/* ========================================================================= */}
        {/* 1. TOP HERO BANNER (Google Ads High-Conversion Style) */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          {/* Glow Spheres */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black tracking-wide flex items-center gap-1.5 font-mono shadow-sm">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                APEX QUANT MASTERCLASS
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                12 Moduli Istituzionali
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 hidden sm:inline">Laboratori Interattivi Live</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Diventa un Operatore di Trading Floor:{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Microstruttura, Rischio & Quant Strategy
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Il percorso operativo gamificato progettato per trader quantitativi: studia la meccanica del book ordini, sperimenta con simulatori matematici live e ottieni il tuo <strong className="text-amber-300">Diploma Ufficiale Certificato</strong>.
            </p>
          </div>

          {/* Right Card: User Progress & Certificate Badge */}
          <div className="w-full lg:w-84 bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl shrink-0 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-base flex items-center justify-center border border-cyan-500/30">
                  {user?.fullName?.charAt(0) || 'T'}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">Profilo Studente</span>
                  <span className={`text-xs font-black ${rank.color}`}>{rank.title}</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Punti XP</span>
                <span className="text-sm font-black text-amber-400">{totalXp} PTS</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Avanzamento Masterclass</span>
                <strong className="text-white">{completedModuleIds.length}/12 ({completionPercentage}%)</strong>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Certificate Unlock Action */}
            {completedModuleIds.length >= 12 ? (
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer font-mono hover:scale-105 active:scale-95"
              >
                <Award className="w-4 h-4" />
                <span>SCARICA DIPLOMA UFFICIALE 📜</span>
              </button>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-300 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800/90 font-mono">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Certificazione Ufficiale:</span>
                </span>
                <span className="text-slate-400 font-bold">{12 - completedModuleIds.length} rimanenti</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & VIEW MODE TOOLBAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-mono">
        {/* Tier Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1 text-xs">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTier('ALL');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tutti i Moduli ({HTB_ACADEMY_MODULES.length})
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTier(0);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 0
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 0: Fondamenti (3)
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTier(1);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 1
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 1: Esecuzione & WAP (3)
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTier(2);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 2
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 2: Leva & Rischio 1% (3)
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTier(3);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 3
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 3: Quant Mastery (3)
          </button>
        </div>

        {/* View Toggle & Search */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('grid');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Griglia</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('roadmap');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'roadmap' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Roadmap</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca argomento..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODULES CATALOG (GRID VIEW) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 animate-in fade-in duration-200">
          {filteredModules.map((mod) => {
            const isCompleted = completedModuleIds.includes(mod.id);

            return (
              <div
                key={mod.id}
                onClick={() => {
                  triggerHaptic('light');
                  handleSelectModule(mod);
                }}
                className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.02] shadow-xl backdrop-blur-md relative overflow-hidden ${
                  isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-500/5 hover:border-emerald-400/60'
                    : 'bg-slate-900/80 border-slate-800/90 hover:border-cyan-500/40'
                }`}
              >
                {/* Glow accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all ${
                  isCompleted ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-cyan-500/5 group-hover:bg-cyan-500/15'
                }`}></div>

                <div className="space-y-3.5 relative z-10">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shadow-inner">
                        {mod.icon}
                      </div>
                      <span className="font-mono font-black text-xs text-white tracking-wide">
                        {mod.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDifficultyBadge(mod.difficulty)}`}>
                        {mod.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black">
                        +{mod.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* Title & Description in Clean Sans-Serif */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed font-normal">
                      {mod.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs relative z-10">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mod.duration}</span>
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completato</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400 group-hover:text-cyan-300 font-bold transition-all">
                      <span>Inizia Modulo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ROADMAP / LEARNING PATH VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'roadmap' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {[0, 1, 2, 3].map((tierNum) => {
            const tierModules = filteredModules.filter((m) => m.tier === tierNum);
            if (tierModules.length === 0) return null;

            const tierNames = [
              'Tier 0: Fondamenti & Microstruttura dei Mercati',
              'Tier 1: Meccanica degli Ordini & Doppia Partita Contabile',
              'Tier 2: Gestione del Rischio Istituzionale & Leva',
              'Tier 3: Mastery Quantitativa, Psicologia & Trading Plan',
            ];

            const tierCompletedCount = tierModules.filter((m) => completedModuleIds.includes(m.id)).length;
            const isTierCompleted = tierCompletedCount === tierModules.length;

            return (
              <div key={tierNum} className="space-y-4">
                {/* Tier Title Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isTierCompleted ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
                    <h3 className="text-sm sm:text-base font-black text-white font-mono">
                      {tierNames[tierNum]}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Completati: <strong className="text-white">{tierCompletedCount}/{tierModules.length}</strong>
                  </span>
                </div>

                {/* Vertical Timeline / Steps */}
                <div className="space-y-3 pl-4 border-l-2 border-slate-800 ml-3">
                  {tierModules.map((mod) => {
                    const isDone = completedModuleIds.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          triggerHaptic('light');
                          handleSelectModule(mod);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-[1.01] ${
                          isDone
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {isDone ? <Check className="w-4 h-4" /> : mod.id.replace('MOD-', '')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-xs text-cyan-400 font-bold">{mod.id}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-[11px] text-slate-400">{mod.duration}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-[11px] text-amber-400">+{mod.xp} XP</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-0.5">
                              {mod.title}
                            </h4>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                          }`}
                        >
                          {isDone ? 'Revisiona Modulo' : 'Inizia Tappa ➔'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS (Desktop only — Mobile uses BottomSheet above) */}
      {/* ========================================================================= */}
      {/* Module Reader Modal */}
      {activeModule && (
        <HTBModuleReaderModal
          module={activeModule}
          isCompleted={completedModuleIds.includes(activeModule.id)}
          onClose={() => handleSelectModule(null)}
          onCompleteModule={handleCompleteModule}
          onSpawnLab={handleSpawnLab}
          onNextModule={activeIndex < HTB_ACADEMY_MODULES.length - 1 ? handleNextModule : undefined}
          onPrevModule={activeIndex > 0 ? handlePrevModule : undefined}
          userName={user?.fullName || user?.email || 'Trader Istituzionale'}
        />
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <HTBCertificateModal
          userName={user?.fullName || user?.email || 'Trader Istituzionale'}
          totalXp={totalXp}
          completedDate={new Date().toLocaleDateString('it-IT')}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Institutional Legal & Risk Disclaimer Footer */}
      <InstitutionalFooter className="mt-12" />
      </div>
    </>
  );
};
