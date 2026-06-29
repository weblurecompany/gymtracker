import React, { useState, useEffect, useCallback } from 'react';
import { User, WeightEntry } from '../data/types';
import { addWeightEntry, getWeightsForUser, deleteWeightEntry } from '../data/storage';
import { ArrowLeft, Save, Trash2, Clock, Loader2, Scale, TrendingDown, TrendingUp, CheckCircle, Minus, Target } from 'lucide-react';

interface Props {
  user: User;
  onBack: () => void;
}

export const WeightTracker: React.FC<Props> = ({ user, onBack }) => {
  const [weight, setWeight] = useState<number>(0);
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await getWeightsForUser(user);
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(entries);
    } catch (e) {
      console.error('Error cargando pesos:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleSave = async () => {
    if (weight <= 0) return;
    setSaving(true);
    try {
      const entry: WeightEntry = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        user,
        date: new Date().toISOString(),
        weight,
      };
      await addWeightEntry(entry);
      setSaved(true);
      await refreshHistory();
      setWeight(0);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Error guardando peso:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWeightEntry(id);
      await refreshHistory();
    } catch (e) {
      console.error('Error eliminando:', e);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const lastWeight = history.length > 0 ? history[0].weight : null;
  const prevWeight = history.length > 1 ? history[1].weight : null;
  const diff = lastWeight !== null && prevWeight !== null ? lastWeight - prevWeight : null;
  const minWeight = history.length > 0 ? Math.min(...history.map((h) => h.weight)) : null;
  const maxWeight = history.length > 0 ? Math.max(...history.map((h) => h.weight)) : null;
  const avgWeight = history.length > 0 ? (history.reduce((sum, h) => sum + h.weight, 0) / history.length).toFixed(1) : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 relative noise mesh-gradient">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-600/10 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-600/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in-up">
          <button onClick={onBack} className="group flex items-center gap-2 text-dark-400 hover:text-white transition-colors cursor-pointer">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center group-hover:border-white/10 transition-all hover-lift">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2.5 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">{user[0]}</div>
            <span className="font-semibold text-sm text-white">{user}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-5 mb-10 animate-fade-in-up stagger-1 opacity-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-40" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Scale size={28} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Peso Corporal</h2>
            <p className="text-dark-400 text-sm font-light mt-1.5">Registra y controla tu evolución</p>
          </div>
        </div>

        {/* Stats Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in-up stagger-2 opacity-0">
            <div className="rounded-2xl glass-card p-4 stat-card bg-gradient-to-br from-amber-500/10 to-orange-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Scale size={13} className="text-amber-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-dark-500">Último</span>
              </div>
              <p className="text-2xl font-black text-white">{lastWeight}<span className="text-sm text-dark-500 ml-1">kg</span></p>
              {diff !== null && diff !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${diff < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {diff < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                </div>
              )}
              {diff === 0 && <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-dark-500"><Minus size={11} /> Sin cambio</div>}
            </div>

            <div className="rounded-2xl glass-card p-4 stat-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={13} className="text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-dark-500">Mínimo</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">{minWeight}<span className="text-sm text-dark-500 ml-1">kg</span></p>
            </div>

            <div className="rounded-2xl glass-card p-4 stat-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} className="text-rose-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-dark-500">Máximo</span>
              </div>
              <p className="text-2xl font-black text-rose-400">{maxWeight}<span className="text-sm text-dark-500 ml-1">kg</span></p>
            </div>

            <div className="rounded-2xl glass-card p-4 stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Target size={13} className="text-indigo-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-dark-500">Media</span>
              </div>
              <p className="text-2xl font-black text-indigo-400">{avgWeight}<span className="text-sm text-dark-500 ml-1">kg</span></p>
            </div>
          </div>
        )}

        {/* Success toast */}
        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 animate-success-pop backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <span className="text-emerald-300 font-semibold text-sm">¡Peso registrado correctamente!</span>
          </div>
        )}

        {/* Input Card */}
        <div className="rounded-2xl glass-card overflow-hidden mb-10 animate-fade-in-up stagger-2 opacity-0">
          <div className="p-5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Scale size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Registrar Peso</h3>
                <p className="text-[11px] text-dark-500 mt-0.5 font-medium">Introduce tu peso actual en kilogramos</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={weight || ''}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  placeholder="75.0"
                  className="w-full rounded-2xl bg-white/[0.04] border-2 border-white/[0.06] px-5 py-4 text-white text-center text-2xl font-black
                             focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)]
                             transition-all placeholder:text-dark-600 placeholder:font-normal placeholder:text-xl"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-dark-500 font-bold text-sm">kg</span>
              </div>
              <button onClick={handleSave} disabled={saving || weight <= 0}
                className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4
                           bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm
                           hover:from-amber-400 hover:to-orange-400 transition-all
                           shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40
                           press-effect cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04]">
              <Clock size={16} className="text-dark-400" />
            </div>
            <h3 className="text-base font-bold text-white">Historial</h3>
            {history.length > 0 && <span className="text-[10px] font-bold text-dark-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.04]">{history.length}</span>}
          </div>

          {loading ? (
            <div className="rounded-2xl glass-card p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-amber-400" />
              <span className="text-dark-400 text-sm font-medium">Cargando historial...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl glass-card p-12 text-center">
              <div className="text-5xl mb-4 opacity-20">⚖️</div>
              <p className="text-dark-400 font-semibold text-sm">No hay registros todavía</p>
              <p className="text-dark-600 text-xs mt-1">Empieza a registrar tu peso para ver la evolución</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 20).map((entry, index) => {
                const prev = history[index + 1];
                const entryDiff = prev ? entry.weight - prev.weight : null;
                return (
                  <div key={entry.id} className="rounded-xl glass-card p-4 hover:border-white/[0.08] transition-all flex items-center justify-between animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 0.03}s` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 flex items-center justify-center border border-amber-500/10">
                        <span className="text-xl font-black text-amber-400">{entry.weight}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-dark-500 flex items-center gap-1.5">
                          <Clock size={11} className="text-dark-600" />{formatDate(entry.date)}
                        </span>
                        {entryDiff !== null && entryDiff !== 0 && (
                          <span className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${entryDiff < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {entryDiff < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                            {entryDiff > 0 ? '+' : ''}{entryDiff.toFixed(1)} kg
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(entry.id)} className="text-dark-600 hover:text-rose-400 transition-colors cursor-pointer p-2.5 rounded-xl hover:bg-rose-500/10">
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
