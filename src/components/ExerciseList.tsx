import React, { useState } from 'react';
import { SessionDay, User, Exercise } from '../data/types';
import { ArrowLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { ExerciseDetail } from './ExerciseDetail';

interface Props {
  user: User;
  session: SessionDay;
  onBack: () => void;
}

const sessionStyles: Record<string, { gradient: string; glow: string; accent: string }> = {
  'biceps-triceps': { gradient: 'from-orange-500 to-rose-500', glow: 'shadow-orange-500/20', accent: 'bg-orange-500' },
  'espalda-hombro': { gradient: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/20', accent: 'bg-blue-500' },
  'pecho': { gradient: 'from-violet-500 to-fuchsia-500', glow: 'shadow-violet-500/20', accent: 'bg-violet-500' },
  'pierna': { gradient: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/20', accent: 'bg-emerald-500' },
};

export const ExerciseList: React.FC<Props> = ({ user, session, onBack }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (selectedExercise) {
    return (
      <ExerciseDetail
        user={user}
        session={session}
        exercise={selectedExercise}
        onBack={() => setSelectedExercise(null)}
      />
    );
  }

  const muscleGroups = [...new Set(session.exercises.map((e) => e.muscleGroup))];
  const style = sessionStyles[session.id] || sessionStyles['pecho'];

  return (
    <div className="min-h-screen p-4 sm:p-6 relative noise mesh-gradient">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in-up">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-dark-400 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center group-hover:border-white/10 transition-all hover-lift">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Sesiones</span>
          </button>

          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2.5 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
              {user[0]}
            </div>
            <span className="font-semibold text-sm text-white">{user}</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-5 mb-10 animate-fade-in-up stagger-1 opacity-0">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-2xl blur-xl opacity-40`} />
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-3xl shadow-xl ${style.glow}`}>
              {session.icon}
            </div>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{session.name}</h2>
            <p className="text-dark-400 text-sm font-light mt-1.5 flex items-center gap-2">
              <Dumbbell size={14} className="text-dark-500" />
              Selecciona un ejercicio para registrar
            </p>
          </div>
        </div>

        {/* Exercises grouped by muscle */}
        {muscleGroups.map((group, gi) => (
          <div 
            key={group} 
            className="mb-8 animate-fade-in-up opacity-0" 
            style={{ animationDelay: `${0.2 + gi * 0.1}s` }}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${style.gradient}`} />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-dark-400">{group}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              <span className="text-[10px] font-bold text-dark-600 bg-white/[0.03] px-2 py-1 rounded-lg">
                {session.exercises.filter(e => e.muscleGroup === group).length}
              </span>
            </div>

            {/* Exercise buttons */}
            <div className="space-y-2">
              {session.exercises
                .filter((e) => e.muscleGroup === group)
                .map((exercise, ei) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="w-full flex items-center justify-between rounded-xl glass-card p-4
                               border-transparent hover:border-white/10 transition-all duration-300 
                               group cursor-pointer hover-lift press-effect"
                    style={{ animationDelay: `${ei * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Number badge */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} bg-opacity-10 
                                      flex items-center justify-center text-sm font-bold text-white
                                      group-hover:scale-105 transition-transform shadow-lg ${style.glow}`}>
                        {ei + 1}
                      </div>
                      <span className="font-semibold text-white group-hover:text-white transition-colors text-[15px]">
                        {exercise.name}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-dark-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
