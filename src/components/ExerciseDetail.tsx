import React, { useState, useEffect, useCallback } from 'react';
import { SessionDay, User, Exercise, WorkoutEntry, SetRecord } from '../data/types';
import { addWorkoutEntry, getWorkoutsForExercise, deleteWorkoutEntry } from '../data/storage';
import { ArrowLeft, Plus, Trash2, Save, CheckCircle, Clock, X, Loader2, Zap } from 'lucide-react';

interface Props {
  user: User;
  session: SessionDay;
  exercise: Exercise;
  onBack: () => void;
}

interface SetRow {
  quantity: number;
  reps: number;
  weight: number;
}

const sessionStyles: Record<string, { gradient: string; glow: string }> = {
  'biceps-triceps': { gradient: 'from-orange-500 to-rose-500', glow: 'shadow-orange-500/20' },
  'espalda-hombro': { gradient: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/20' },
  'pecho': { gradient: 'from-violet-500 to-fuchsia-500', glow: 'shadow-violet-500/20' },
  'pierna': { gradient: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/20' },
};

export const ExerciseDetail: React.FC<Props> = ({ user, session, exercise, onBack }) => {
  const [rows, setRows] = useState<SetRow[]>([{ quantity: 1, reps: 0, weight: 0 }]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await getWorkoutsForExercise(user, exercise.id);
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(entries);
    } catch (e) {
      console.error('Error cargando historial:', e);
    } finally {
      setLoading(false);
    }
  }, [user, exercise.id]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const addRow = () => setRows([...rows, { quantity: 1, reps: 0, weight: 0 }]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: 'quantity' | 'reps' | 'weight', value: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleSave = async () => {
    const validRows = rows.filter((r) => (r.reps > 0 || r.weight > 0) && r.quantity > 0);
    if (validRows.length === 0) return;

    setSaving(true);
    try {
      const sets: SetRecord[] = [];
      let setCounter = 1;
      validRows.forEach((row) => {
        const qty = Math.max(1, row.quantity);
        for (let i = 0; i < qty; i++) {
          sets.push({ setNumber: setCounter, reps: row.reps, weight: row.weight });
          setCounter++;
        }
      });

      const entry: WorkoutEntry = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        odnerUser: user,
        date: new Date().toISOString(),
        sessionType: session.id,
        exerciseId: exercise.id,
        sets,
      };

      await addWorkoutEntry(entry);
      setSaved(true);
      await refreshHistory();
      setTimeout(() => setSaved(false), 2500);
      setRows([{ quantity: 1, reps: 0, weight: 0 }]);
    } catch (e) {
      console.error('Error guardando:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkoutEntry(id);
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

  const style = sessionStyles[session.id] || sessionStyles['pecho'];

  return (
    <div className="min-h-screen p-4 sm:p-6 relative noise mesh-gradient">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <button onClick={onBack} className="group flex items-center gap-2 text-dark-400 hover:text-white transition-colors cursor-pointer">
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center group-hover:border-white/10 transition-all hover-lift">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Ejercicios</span>
          </button>

          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2.5 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">{user[0]}</div>
            <span className="font-semibold text-sm text-white">{user}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-4 mb-4 animate-fade-in-up stagger-1 opacity-0">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-2xl blur-xl opacity-40`} />
            <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-2xl shadow-lg ${style.glow}`}>
              {session.icon}
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{exercise.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-dark-500 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.04]">{exercise.muscleGroup}</span>
              <span className="text-dark-600">·</span>
              <span className="text-dark-500 text-xs font-medium">{session.name}</span>
            </div>
          </div>
        </div>

        {/* Success toast */}
        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 animate-success-pop backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <span className="text-emerald-300 font-semibold text-sm">¡Registro guardado correctamente!</span>
          </div>
        )}

        {/* Set Entry Card */}
        <div className="rounded-2xl glass-card overflow-hidden animate-fade-in-up stagger-2 opacity-0 mb-10">
          {/* Card header */}
          <div className="p-5 border-b border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} bg-opacity-20 flex items-center justify-center`}>
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registrar Series</h3>
                  <p className="text-[11px] text-dark-500 mt-0.5 font-medium">Series × Reps × Peso (kg)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[70px_1fr_1fr_40px] gap-3 px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-500 flex items-center justify-center">Series</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-500 flex items-center justify-center">Reps</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-500 flex items-center justify-center">Peso</span>
            <span></span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.02]">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[70px_1fr_1fr_40px] gap-3 px-5 py-3 items-center hover:bg-white/[0.01] transition-colors">
                {/* Quantity */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-sm font-bold pointer-events-none">×</span>
                  <input type="number" min={1} value={row.quantity || ''} onChange={(e) => updateRow(index, 'quantity', parseInt(e.target.value) || 1)} placeholder="1"
                    className="w-full rounded-xl bg-indigo-500/10 border border-indigo-500/20 pl-7 pr-2 py-3 text-indigo-300 text-center font-bold text-base focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/15 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all placeholder:text-dark-600" />
                </div>
                {/* Reps */}
                <input type="number" min={0} value={row.reps || ''} onChange={(e) => updateRow(index, 'reps', parseInt(e.target.value) || 0)} placeholder="0"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-3 text-white text-center font-bold text-base focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all placeholder:text-dark-600" />
                {/* Weight */}
                <div className="relative">
                  <input type="number" min={0} step={0.5} value={row.weight || ''} onChange={(e) => updateRow(index, 'weight', parseFloat(e.target.value) || 0)} placeholder="0"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-3 pr-8 text-white text-center font-bold text-base focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all placeholder:text-dark-600" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 text-[10px] font-bold">kg</span>
                </div>
                {/* Remove */}
                <button onClick={() => removeRow(index)} disabled={rows.length <= 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer ${rows.length <= 1 ? 'text-dark-700 cursor-not-allowed' : 'text-dark-500 hover:text-rose-400 hover:bg-rose-500/10'}`}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-white/[0.04] flex gap-3">
            <button onClick={addRow}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.08] py-3.5 text-dark-400 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all cursor-pointer press-effect">
              <Plus size={18} /><span className="font-bold text-sm">Añadir Fila</span>
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`flex-[1.5] flex items-center justify-center gap-2 rounded-xl py-3.5 bg-gradient-to-r ${style.gradient} text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg ${style.glow} press-effect cursor-pointer disabled:opacity-60`}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? 'Guardando...' : 'Guardar Registro'}</span>
            </button>
          </div>
        </div>

        {/* History */}
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04]">
              <Clock size={16} className="text-dark-400" />
            </div>
            <h3 className="text-base font-bold text-white">Historial Reciente</h3>
            {history.length > 0 && <span className="text-[10px] font-bold text-dark-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.04]">{history.length}</span>}
          </div>

          {loading ? (
            <div className="rounded-2xl glass-card p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
              <span className="text-dark-400 text-sm font-medium">Cargando historial...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl glass-card p-12 text-center">
              <div className="text-5xl mb-4 opacity-20">📝</div>
              <p className="text-dark-400 font-semibold text-sm">No hay registros todavía</p>
              <p className="text-dark-600 text-xs mt-1">¡Empieza a entrenar y registra tu progreso!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((entry, i) => (
                <div key={entry.id} className="rounded-xl glass-card p-4 hover:border-white/[0.08] transition-all animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium text-dark-500 flex items-center gap-2">
                      <Clock size={12} className="text-dark-600" />{formatDate(entry.date)}
                    </span>
                    <button onClick={() => handleDelete(entry.id)} className="text-dark-600 hover:text-rose-400 transition-colors cursor-pointer p-2 rounded-lg hover:bg-rose-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.sets.map((s, si) => (
                      <div key={si} className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2 text-center hover:bg-white/[0.05] hover:border-white/[0.08] transition-all">
                        <div className="text-[9px] uppercase tracking-wider text-dark-600 mb-1 font-bold">S{s.setNumber}</div>
                        <div className="text-sm font-bold text-white">{s.reps}<span className="text-dark-500 mx-0.5">×</span>{s.weight}<span className="text-dark-500 text-[10px] ml-0.5">kg</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
