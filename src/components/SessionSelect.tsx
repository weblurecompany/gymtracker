import React from 'react';
import { SessionDay, User } from '../data/types';
import { sessions } from '../data/sessions';
import { BarChart3, ChevronRight, LogOut, Scale, Sparkles } from 'lucide-react';

interface Props {
  user: User;
  onSelectSession: (session: SessionDay) => void;
  onBack: () => void;
  onStats: () => void;
  onWeight: () => void;
}

const sessionStyles: Record<string, { bg: string; glow: string; iconBg: string; accent: string }> = {
  'biceps-triceps': { 
    bg: 'from-orange-500 via-rose-500 to-pink-500', 
    glow: 'shadow-orange-500/25', 
    iconBg: 'from-orange-500 to-rose-500',
    accent: 'border-orange-500/20 hover:border-orange-500/40'
  },
  'espalda-hombro': { 
    bg: 'from-blue-500 via-cyan-500 to-teal-400', 
    glow: 'shadow-blue-500/25', 
    iconBg: 'from-blue-500 to-cyan-400',
    accent: 'border-blue-500/20 hover:border-blue-500/40'
  },
  'pecho': { 
    bg: 'from-violet-500 via-purple-500 to-fuchsia-500', 
    glow: 'shadow-violet-500/25', 
    iconBg: 'from-violet-500 to-fuchsia-500',
    accent: 'border-violet-500/20 hover:border-violet-500/40'
  },
  'pierna': { 
    bg: 'from-emerald-500 via-green-500 to-lime-400', 
    glow: 'shadow-emerald-500/25', 
    iconBg: 'from-emerald-500 to-green-400',
    accent: 'border-emerald-500/20 hover:border-emerald-500/40'
  },
};

export const SessionSelect: React.FC<Props> = ({ user, onSelectSession, onBack, onStats, onWeight }) => {
  return (
    <div className="min-h-screen p-4 sm:p-6 relative noise mesh-gradient">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-fade-in-up">
          <button 
            onClick={onBack} 
            className="group w-11 h-11 rounded-2xl glass flex items-center justify-center text-dark-400 hover:text-white hover:border-white/10 transition-all duration-300 cursor-pointer hover-lift"
          >
            <LogOut size={18} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* User badge */}
          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2.5 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
              {user[0]}
            </div>
            <span className="font-semibold text-sm text-white">{user}</span>
          </div>
        </div>

        {/* Title section */}
        <div className="mb-10 animate-fade-in-up stagger-1 opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400/80">Entrenamiento</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
            Sesión del día
          </h2>
          <p className="text-dark-400 font-light text-lg">¿Qué grupo muscular toca hoy?</p>
        </div>

        {/* Session Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {sessions.map((session, index) => {
            const style = sessionStyles[session.id] || sessionStyles['pecho'];
            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`group relative overflow-hidden rounded-2xl glass-card p-5 ${style.accent}
                           transition-all duration-500 hover-lift press-effect
                           hover:shadow-2xl ${style.glow} text-left cursor-pointer
                           animate-fade-in-up opacity-0`}
                style={{ animationDelay: `${0.2 + index * 0.08}s` }}
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-0 group-hover:opacity-[0.06] transition-all duration-700`} />
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${style.bg} opacity-0 group-hover:opacity-100 transition-all duration-300`} />

                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Icon with glow */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${style.iconBg} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center text-2xl shadow-lg ${style.glow} group-hover:scale-105 transition-all duration-500`}>
                          {session.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">{session.name}</h3>
                        <p className="text-[11px] text-dark-500 font-medium mt-0.5">
                          {session.exercises.length} ejercicios disponibles
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-dark-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Muscle group tags */}
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(session.exercises.map(e => e.muscleGroup))].map((group) => (
                      <span key={group} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-dark-400 text-[10px] font-bold uppercase tracking-wider border border-white/[0.04] group-hover:border-white/[0.08] group-hover:bg-white/[0.06] transition-all">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom action buttons */}
        <div className="space-y-3 animate-fade-in-up stagger-4 opacity-0">
          {/* Stats Button */}
          <button
            onClick={onStats}
            className="w-full group relative overflow-hidden rounded-2xl p-5 glass-card
                       border border-indigo-500/20 hover:border-indigo-500/40
                       transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 
                       flex items-center justify-center gap-4 cursor-pointer hover-lift press-effect"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/[0.03] to-indigo-600/0 group-hover:from-indigo-600/[0.05] group-hover:via-indigo-600/[0.08] group-hover:to-indigo-600/[0.05] transition-all duration-500" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={20} className="text-indigo-400" />
            </div>
            <span className="text-base font-bold text-indigo-300 relative z-10">Ver Estadísticas</span>
            <ChevronRight size={18} className="text-indigo-500/60 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all ml-auto" />
          </button>

          {/* Weight Button */}
          <button
            onClick={onWeight}
            className="w-full group relative overflow-hidden rounded-2xl p-5 glass-card
                       border border-amber-500/15 hover:border-amber-500/35
                       transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/15 
                       flex items-center justify-center gap-4 cursor-pointer hover-lift press-effect"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/[0.02] to-amber-600/0 group-hover:from-amber-600/[0.04] group-hover:via-amber-600/[0.06] group-hover:to-amber-600/[0.04] transition-all duration-500" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale size={20} className="text-amber-400" />
            </div>
            <span className="text-base font-bold text-amber-300 relative z-10">Medir Peso Corporal</span>
            <ChevronRight size={18} className="text-amber-500/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};
