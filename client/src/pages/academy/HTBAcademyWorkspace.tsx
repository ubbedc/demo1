import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HTB_ACADEMY_MODULES, AcademyModule } from '../../constants/htbAcademyCurriculum';
import { HTBModuleReaderModal } from './HTBModuleReaderModal';
import { HTBCertificateModal } from './HTBCertificateModal';
import { triggerHaptic } from '../../utils/haptics';
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
} from 'lucide-react';

interface HTBAcademyWorkspaceProps {
  onNavigateToTrading: (symbol?: string) => void;
}

export const HTBAcademyWorkspace: React.FC<HTBAcademyWorkspaceProps> = ({ onNavigateToTrading }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

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
    setActiveModule(null);
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
      setActiveModule(HTB_ACADEMY_MODULES[activeIndex + 1]);
    }
  };

  const handlePrevModule = () => {
    if (activeIndex > 0) {
      setActiveModule(HTB_ACADEMY_MODULES[activeIndex - 1]);
    }
  };

  return (
    <div className="space-y-6 font-mono pb-12 animate-in fade-in duration-200">
      {/* Top Banner: Quant Desk HTB Profile */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Neon Ambient Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                QUANT & TRADING ACADEMY
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-bold">12 Moduli Istituzionali</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Impara la Finanza Reale{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                dalla A alla Z
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Il percorso operativo gamificato stile <span className="text-emerald-400 font-bold">Hack The Box</span>:
              studia la microstruttura, sperimenta nei laboratori live sandbox e accumula punti XP per sbloccare il Diploma Istituzionale.
            </p>
          </div>

          {/* Right Card: User XP & Rank Progression */}
          <div className="w-full lg:w-80 bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Grado Attuale</span>
                <span className={`text-xs font-black ${rank.color}`}>{rank.title}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Punti XP</span>
                <span className="text-sm font-black text-amber-400">{totalXp} PTS</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Progresso Masterclass</span>
                <span className="font-bold text-white">{completedModuleIds.length}/12 ({completionPercentage}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Certificate Unlock Action */}
            {completedModuleIds.length >= 12 ? (
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <Award className="w-4 h-4" />
                <span>Scarica Diploma Ufficiale 📜</span>
              </button>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span>📜 Diploma Finale:</span>
                <span className="text-slate-500 font-bold">Completa 12/12</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tier Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none w-full md:w-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedTier('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tutti i Moduli ({HTB_ACADEMY_MODULES.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier(0)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 0
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 0: Fondamenti
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier(1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 1
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 1: Ordini & Ledger
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier(2)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 2
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 2: Rischio & Leva
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier(3)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTier === 3
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tier 3: Mastery
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca argomento o ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Grid of HTB Cubes / Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((mod) => {
          const isCompleted = completedModuleIds.includes(mod.id);

          const getDifficultyColor = (diff: string) => {
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

          return (
            <div
              key={mod.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveModule(mod);
              }}
              className={`bg-slate-900/90 rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.02] ${
                isCompleted
                  ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mod.icon}</span>
                    <span className="font-bold text-xs text-white">{mod.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDifficultyColor(
                        mod.difficulty
                      )}`}
                    >
                      {mod.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black">
                      +{mod.xp} XP
                    </span>
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {mod.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold">⏱️ {mod.duration}</span>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completato</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-400 group-hover:underline font-bold">
                    <span>Inizia Modulo</span>
                    <span>➔</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Reader Modal */}
      {activeModule && (
        <HTBModuleReaderModal
          module={activeModule}
          isCompleted={completedModuleIds.includes(activeModule.id)}
          onClose={() => setActiveModule(null)}
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
    </div>
  );
};
