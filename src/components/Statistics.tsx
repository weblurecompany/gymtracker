import React, { useState, useMemo, useEffect } from 'react';
import { User, TimeRange, WorkoutEntry, WeightEntry } from '../data/types';
import { sessions } from '../data/sessions';
import { getWorkoutsForUser, getWeightsForUser } from '../data/storage';
import { ArrowLeft, TrendingUp, Calendar, Dumbbell, Trophy, Flame, Loader2, Scale, Sparkles, Layers } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';

interface Props {
  user: User;
  onBack: () => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '1semana', label: '7D' },
  { value: '1mes', label: '1M' },
  { value: '3meses', label: '3M' },
  { value: '6meses', label: '6M' },
  { value: '1año', label: '1A' },
  { value: 'todo', label: 'Todo' },
];

function getDateThreshold(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case '1semana': return new Date(now.getTime() - 7 * 86400000);
    case '1mes': return new Date(now.getTime() - 30 * 86400000);
    case '3meses': return new Date(now.getTime() - 90 * 86400000);
    case '6meses': return new Date(now.getTime() - 180 * 86400000);
    case '1año': return new Date(now.getTime() - 365 * 86400000);
    case 'todo': return new Date(0);
  }
}

const exerciseColors = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa',
  '#f472b6', '#2dd4bf', '#fb923c', '#22d3ee', '#a3e635',
  '#c084fc', '#4ade80', '#facc15', '#fb7185', '#60a5fa',
];

const sessionStyles: Record<string, { gradient: string; glow: string; color: string }> = {
  'biceps-triceps': { gradient: 'from-orange-500 to-rose-500', glow: 'shadow-orange-500/20', color: '#f97316' },
  'espalda-hombro': { gradient: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/20', color: '#3b82f6' },
  'pecho': { gradient: 'from-violet-500 to-fuchsia-500', glow: 'shadow-violet-500/20', color: '#8b5cf6' },
  'pierna': { gradient: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/20', color: '#10b981' },
  'todas': { gradient: 'from-indigo-500 to-purple-500', glow: 'shadow-indigo-500/20', color: '#6366f1' },
};

// All exercises from all sessions for "Todas" view
const allExercises = sessions.flatMap(s => s.exercises.map(e => ({ ...e, sessionId: s.id, sessionName: s.name })));

export const Statistics: React.FC<Props> = ({ user, onBack }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1mes');
  const [selectedSession, setSelectedSession] = useState<string>('todas');
  const [allWorkouts, setAllWorkouts] = useState<WorkoutEntry[]>([]);
  const [allWeights, setAllWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [wk, wt] = await Promise.all([getWorkoutsForUser(user), getWeightsForUser(user)]);
        if (!cancelled) { setAllWorkouts(wk); setAllWeights(wt); }
      } catch (e) { console.error('Error:', e); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const filteredWorkouts = useMemo(() => {
    const threshold = getDateThreshold(timeRange);
    if (selectedSession === 'todas') {
      return allWorkouts.filter((w) => new Date(w.date) >= threshold);
    }
    return allWorkouts.filter((w) => new Date(w.date) >= threshold && w.sessionType === selectedSession);
  }, [allWorkouts, timeRange, selectedSession]);

  const filteredWeights = useMemo(() => {
    const threshold = getDateThreshold(timeRange);
    return allWeights.filter((w) => new Date(w.date) >= threshold).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allWeights, timeRange]);

  const currentSession = selectedSession === 'todas' ? null : sessions.find((s) => s.id === selectedSession);
  const currentExercises = selectedSession === 'todas' ? allExercises : (currentSession?.exercises || []);

  const weightChartData = useMemo(() => filteredWeights.map((w) => ({
    date: new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    peso: w.weight,
  })), [filteredWeights]);

  const chartData = useMemo(() => {
    const exerciseMap = new Map<string, Map<string, { maxWeight: number }>>();
    filteredWorkouts.forEach((w) => {
      const dateKey = new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (!exerciseMap.has(w.exerciseId)) exerciseMap.set(w.exerciseId, new Map());
      const dateMap = exerciseMap.get(w.exerciseId)!;
      const maxWeight = Math.max(...w.sets.map((s) => s.weight));
      const existing = dateMap.get(dateKey);
      if (!existing || maxWeight > existing.maxWeight) dateMap.set(dateKey, { maxWeight });
    });
    const allDates = new Set<string>();
    exerciseMap.forEach((dm) => dm.forEach((_, d) => allDates.add(d)));
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const [da, ma] = a.split('/').map(Number);
      const [db, mb] = b.split('/').map(Number);
      return ma !== mb ? ma - mb : da - db;
    });
    return sortedDates.map((date) => {
      const point: Record<string, string | number> = { date };
      exerciseMap.forEach((dm, eid) => { const val = dm.get(date); if (val) point[eid] = val.maxWeight; });
      return point;
    });
  }, [filteredWorkouts]);

  const summaryStats = useMemo(() => {
    const totalSessions = filteredWorkouts.length;
    const totalVolume = filteredWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, st) => s + st.reps * st.weight, 0), 0);
    const totalSets = filteredWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
    let maxWeight = 0, maxExercise = '';
    filteredWorkouts.forEach((w) => { 
      w.sets.forEach((s) => { 
        if (s.weight > maxWeight) { 
          maxWeight = s.weight; 
          const ex = allExercises.find((e) => e.id === w.exerciseId); 
          maxExercise = ex?.name || w.exerciseId; 
        } 
      }); 
    });
    return { totalSessions, totalVolume, totalSets, maxWeight, maxExercise };
  }, [filteredWorkouts]);

  const volumeChartData = useMemo(() => {
    const dateMap = new Map<string, number>();
    filteredWorkouts.forEach((w) => {
      const dateKey = new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      const vol = w.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + vol);
    });
    return Array.from(dateMap.keys()).sort((a, b) => {
      const [da, ma] = a.split('/').map(Number);
      const [db, mb] = b.split('/').map(Number);
      return ma !== mb ? ma - mb : da - db;
    }).map((d) => ({ date: d, volumen: dateMap.get(d) || 0 }));
  }, [filteredWorkouts]);

  const activeExercises = currentExercises.filter((ex) => filteredWorkouts.some((w) => w.exerciseId === ex.id));

  // Get color for exercise based on its session (for "Todas" view)
  const getExerciseColor = (exerciseId: string, index: number) => {
    if (selectedSession !== 'todas') {
      return exerciseColors[index % exerciseColors.length];
    }
    const exercise = allExercises.find(e => e.id === exerciseId);
    if (exercise) {
      const sessionStyle = sessionStyles[exercise.sessionId];
      return sessionStyle?.color || exerciseColors[index % exerciseColors.length];
    }
    return exerciseColors[index % exerciseColors.length];
  };

  const tooltipStyle = {
    backgroundColor: 'rgba(10, 15, 30, 0.95)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '16px',
    color: '#f1f5f9',
    fontSize: '12px',
    padding: '14px 18px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient noise">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <Loader2 size={40} className="animate-spin text-indigo-400 relative" />
          </div>
          <span className="text-dark-400 font-medium">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 relative noise mesh-gradient">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-600/8 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
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
        <div className="mb-10 animate-fade-in-up stagger-1 opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400/80">Rendimiento</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">Estadísticas</h2>
          <p className="text-dark-400 font-light text-lg">Analiza tu progreso y rendimiento</p>
        </div>

        {/* Time Range */}
        <div className="mb-8 animate-fade-in-up stagger-2 opacity-0">
          <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-dark-500 mb-3 block">Rango de tiempo</label>
          <div className="inline-flex rounded-2xl glass p-1.5 gap-1 border border-white/5">
            {timeRanges.map((tr) => (
              <button key={tr.value} onClick={() => setTimeRange(tr.value)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${timeRange === tr.value ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' : 'text-dark-500 hover:text-white hover:bg-white/[0.04]'}`}>
                {tr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight Chart */}
        {weightChartData.length > 0 && (
          <div className="rounded-2xl glass-card p-5 sm:p-6 mb-8 animate-fade-in-up stagger-2 opacity-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"><Scale size={18} className="text-amber-400" /></div>
                <div>
                  <h3 className="text-base font-bold text-white">Peso Corporal</h3>
                  <p className="text-[11px] text-dark-500">Evolución de tu peso</p>
                </div>
              </div>
              {filteredWeights.length > 0 && (
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{filteredWeights[filteredWeights.length - 1].weight}</span>
                  <span className="text-dark-500 text-sm ml-1">kg</span>
                </div>
              )}
            </div>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} unit="kg" tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={tooltipStyle} formatter={((v: any) => [`${v} kg`, 'Peso']) as any} />
                  <Area type="monotone" dataKey="peso" stroke="#fbbf24" strokeWidth={3} fill="url(#weightGrad)" dot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }} activeDot={{ r: 6, stroke: 'rgba(251,191,36,0.3)', strokeWidth: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Session Selector with "Todas" option */}
        <div className="mb-6 animate-fade-in-up stagger-2 opacity-0">
          <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-dark-500 mb-3 block">Grupo muscular</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* "Todas" option */}
            <button onClick={() => setSelectedSession('todas')}
              className={`rounded-xl p-3.5 text-sm font-semibold transition-all duration-300 cursor-pointer border flex items-center gap-2 justify-center press-effect ${
                selectedSession === 'todas' 
                  ? 'glass border-white/10 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/[0.02] border-white/[0.04] text-dark-500 hover:border-white/[0.08] hover:text-white'
              }`}>
              <Layers size={16} /><span className="text-xs font-bold">Todas</span>
            </button>
            {sessions.map((s) => {
              const style = sessionStyles[s.id];
              const isActive = selectedSession === s.id;
              return (
                <button key={s.id} onClick={() => setSelectedSession(s.id)}
                  className={`rounded-xl p-3.5 text-sm font-semibold transition-all duration-300 cursor-pointer border flex items-center gap-2 justify-center press-effect ${isActive ? `glass border-white/10 text-white shadow-lg ${style?.glow || ''}` : 'bg-white/[0.02] border-white/[0.04] text-dark-500 hover:border-white/[0.08] hover:text-white'}`}>
                  <span className="text-lg">{s.icon}</span><span className="text-xs font-bold hidden sm:inline">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Legend for "Todas" view */}
        {selectedSession === 'todas' && (
          <div className="mb-6 p-4 rounded-xl glass-card animate-fade-in-up">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-500 mb-3">Leyenda de colores</p>
            <div className="flex flex-wrap gap-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sessionStyles[s.id].color }} />
                  <span className="text-xs text-dark-400 font-medium">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in-up stagger-3 opacity-0">
          {[
            { icon: <Calendar size={16} className="text-indigo-400" />, label: 'Registros', value: summaryStats.totalSessions, unit: '', gradient: 'from-indigo-500/10 to-indigo-600/5', iconBg: 'bg-indigo-500/15' },
            { icon: <Dumbbell size={16} className="text-emerald-400" />, label: 'Series', value: summaryStats.totalSets, unit: '', gradient: 'from-emerald-500/10 to-emerald-600/5', iconBg: 'bg-emerald-500/15' },
            { icon: <Flame size={16} className="text-orange-400" />, label: 'Vol. Total', value: summaryStats.totalVolume.toLocaleString('es-ES'), unit: 'kg', gradient: 'from-orange-500/10 to-orange-600/5', iconBg: 'bg-orange-500/15' },
            { icon: <Trophy size={16} className="text-amber-400" />, label: 'Máx Peso', value: summaryStats.maxWeight, unit: 'kg', subtitle: summaryStats.maxExercise, gradient: 'from-amber-500/10 to-amber-600/5', iconBg: 'bg-amber-500/15' },
          ].map((card, i) => (
            <div key={i} className={`rounded-2xl glass-card p-4 stat-card bg-gradient-to-br ${card.gradient} hover:border-white/[0.08] transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center`}>{card.icon}</div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-dark-500">{card.label}</span>
              </div>
              <p className="text-2xl font-black text-white">{card.value}{card.unit && <span className="text-sm text-dark-500 ml-1">{card.unit}</span>}</p>
              {'subtitle' in card && card.subtitle && <p className="text-[10px] text-dark-500 mt-2 truncate font-medium">{card.subtitle as string}</p>}
            </div>
          ))}
        </div>

        {filteredWorkouts.length === 0 ? (
          <div className="rounded-2xl glass-card p-16 text-center animate-fade-in-up stagger-3 opacity-0">
            <div className="text-6xl mb-5 opacity-20">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Sin datos de entrenamiento</h3>
            <p className="text-dark-500 font-light">Registra tus entrenamientos para ver las estadísticas aquí</p>
          </div>
        ) : (
          <>
            {chartData.length > 0 && activeExercises.length > 0 && (
              <div className="rounded-2xl glass-card p-5 sm:p-6 mb-6 animate-fade-in-up stagger-3 opacity-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center"><TrendingUp size={18} className="text-indigo-400" /></div>
                  <div>
                    <h3 className="text-base font-bold text-white">Peso Máximo por Ejercicio</h3>
                    <p className="text-[11px] text-dark-500">Evolución del peso máximo usado{selectedSession === 'todas' && ' (coloreado por sesión)'}</p>
                  </div>
                </div>
                <div className="h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} unit="kg" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={((value: any, name: any) => { 
                        const ex = allExercises.find((e: any) => e.id === name); 
                        const label = ex ? (selectedSession === 'todas' ? `${ex.name} (${ex.sessionName})` : ex.name) : name;
                        return [`${value} kg`, label]; 
                      }) as any} />
                      <Legend formatter={(value: string) => { 
                        const ex = allExercises.find((e) => e.id === value); 
                        return ex ? (selectedSession === 'todas' ? `${ex.name}` : ex.name) : value; 
                      }} wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      {activeExercises.map((ex, i) => (
                        <Line key={ex.id} type="monotone" dataKey={ex.id} stroke={getExerciseColor(ex.id, i)} strokeWidth={3}
                          dot={{ r: 4, fill: getExerciseColor(ex.id, i), strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 3, stroke: 'rgba(255,255,255,0.2)' }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {volumeChartData.length > 0 && (
              <div className="rounded-2xl glass-card p-5 sm:p-6 mb-6 animate-fade-in-up stagger-4 opacity-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center"><Flame size={18} className="text-violet-400" /></div>
                  <div>
                    <h3 className="text-base font-bold text-white">Volumen Total por Sesión</h3>
                    <p className="text-[11px] text-dark-500">Suma de (repeticiones × peso)</p>
                  </div>
                </div>
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeChartData}>
                      <defs>
                        <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} unit="kg" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={((value: any) => [`${Number(value).toLocaleString('es-ES')} kg`, 'Volumen']) as any} />
                      <Area type="monotone" dataKey="volumen" stroke="#818cf8" strokeWidth={3} fill="url(#volumeGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Per-exercise breakdown */}
            <div className="rounded-2xl glass-card p-5 sm:p-6 mb-8 animate-fade-in-up stagger-5 opacity-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Dumbbell size={18} className="text-emerald-400" /></div>
                <div>
                  <h3 className="text-base font-bold text-white">Resumen por Ejercicio</h3>
                  <p className="text-[11px] text-dark-500">Mejores marcas y progreso</p>
                </div>
              </div>
              <div className="space-y-3">
                {activeExercises.map((ex, i) => {
                  const exWorkouts = filteredWorkouts.filter((w) => w.exerciseId === ex.id);
                  const allSets = exWorkouts.flatMap((w) => w.sets);
                  const maxW = Math.max(...allSets.map((s) => s.weight), 0);
                  const maxR = Math.max(...allSets.map((s) => s.reps), 0);
                  const avgW = allSets.length > 0 ? (allSets.reduce((s, st) => s + st.weight, 0) / allSets.length).toFixed(1) : '0';
                  const sorted = [...exWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  let progress = 0;
                  if (sorted.length >= 2) {
                    const firstMax = Math.max(...sorted[0].sets.map((s) => s.weight));
                    const lastMax = Math.max(...sorted[sorted.length - 1].sets.map((s) => s.weight));
                    progress = firstMax > 0 ? ((lastMax - firstMax) / firstMax) * 100 : 0;
                  }
                  const exerciseColor = getExerciseColor(ex.id, i);
                  const sessionInfo = selectedSession === 'todas' && 'sessionName' in ex ? (ex as any).sessionName : null;
                  
                  return (
                    <div key={ex.id} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:border-white/[0.08] transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: exerciseColor, boxShadow: `0 0 10px ${exerciseColor}60` }} />
                          <div>
                            <span className="font-bold text-white text-sm">{ex.name}</span>
                            {sessionInfo && <span className="text-[10px] text-dark-500 ml-2">({sessionInfo})</span>}
                          </div>
                        </div>
                        {progress !== 0 && (
                          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${progress > 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                            {progress > 0 ? '↑' : '↓'} {Math.abs(progress).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[{ label: 'Registros', value: exWorkouts.length, unit: '' }, { label: 'Máx Peso', value: maxW, unit: 'kg' }, { label: 'Máx Reps', value: maxR, unit: '' }, { label: 'Media', value: avgW, unit: 'kg' }].map((stat) => (
                          <div key={stat.label} className="text-center p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                            <div className="text-[9px] text-dark-600 uppercase tracking-wider mb-1.5 font-bold">{stat.label}</div>
                            <div className="text-sm font-bold text-white">{stat.value}{stat.unit && <span className="text-dark-500 text-[10px] ml-0.5">{stat.unit}</span>}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
