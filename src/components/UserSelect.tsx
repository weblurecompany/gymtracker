import React, { useState, useRef, useEffect } from 'react';
import { User } from '../data/types';
import { Crown, Zap, Lock, ShieldCheck, X, Sparkles } from 'lucide-react';

interface Props {
  onSelect: (user: User) => void;
}

const USER_PINS: Record<User, string> = {
  Gonzalo: '2009',
  Alae: '9889',
};

const userProfiles: Record<User, { gradient: string; gradientAlt: string; icon: React.ReactNode; accent: string; glowColor: string; shadowColor: string }> = {
  Gonzalo: {
    gradient: 'from-violet-600 via-indigo-500 to-blue-500',
    gradientAlt: 'from-violet-500 to-indigo-600',
    icon: <Crown size={18} className="text-amber-300 drop-shadow-lg" />,
    accent: 'shadow-violet-500/30',
    glowColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: 'shadow-violet-500/40',
  },
  Alae: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    gradientAlt: 'from-emerald-500 to-teal-600',
    icon: <Zap size={18} className="text-yellow-300 drop-shadow-lg" />,
    accent: 'shadow-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: 'shadow-emerald-500/40',
  },
};

export const UserSelect: React.FC<Props> = ({ onSelect }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (selectedUser) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [selectedUser]);

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setPin(['', '', '', '']);
    setError(false);
    setSuccess(false);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setPin(['', '', '', '']);
    setError(false);
    setSuccess(false);
  };

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 3) {
      const fullPin = newPin.join('');
      if (selectedUser && fullPin === USER_PINS[selectedUser]) {
        setSuccess(true);
        setTimeout(() => {
          onSelect(selectedUser);
          handleCloseModal();
        }, 700);
      } else {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 800);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
    }
    if (e.key === 'Escape') handleCloseModal();
  };

  const profile = selectedUser ? userProfiles[selectedUser] : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative noise mesh-gradient">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[130px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[180px] animate-float-slow" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          {/* Logo icon with glow */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl blur-2xl opacity-50 animate-pulse-glow" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-float">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                <path d="M6.5 6.5h11M6.5 17.5h11M3 12h1.5M19.5 12H21M5.5 8.5v7M18.5 8.5v7M8 6.5v11M16 6.5v11" />
              </svg>
            </div>
            {/* Sparkle decorations */}
            <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight gradient-text mb-4">
            GymTracker
          </h1>

          {/* Subtitle badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">
              Pro Edition
            </span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          </div>

          <p className="text-dark-400 text-lg font-light">Tu progreso, tu victoria</p>
        </div>

        {/* User Selection */}
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <p className="text-center text-dark-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
            Selecciona tu perfil
          </p>

          <div className="grid grid-cols-2 gap-5">
            {(['Gonzalo', 'Alae'] as User[]).map((user, index) => {
              const userProfile = userProfiles[user];
              return (
                <button
                  key={user}
                  onClick={() => handleOpenModal(user)}
                  className={`group relative overflow-hidden rounded-3xl glass-card p-8 
                             transition-all duration-500 hover-lift press-effect
                             hover:shadow-2xl ${userProfile.shadowColor} cursor-pointer`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${userProfile.gradient} opacity-0 group-hover:opacity-[0.08] transition-all duration-700`} />
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${userProfile.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative z-10 flex flex-col items-center gap-5">
                    {/* Avatar with badge */}
                    <div className="relative">
                      {/* Glow effect behind avatar */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${userProfile.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 scale-110`} />
                      
                      <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${userProfile.gradient} flex items-center justify-center text-3xl font-black text-white shadow-xl ${userProfile.accent} group-hover:scale-105 transition-all duration-500`}>
                        {user[0]}
                      </div>

                      {/* Badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-dark-900/95 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        {userProfile.icon}
                      </div>
                    </div>

                    {/* Name and action */}
                    <div className="text-center">
                      <span className="text-xl font-bold text-white block mb-2">{user}</span>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-dark-500 font-semibold uppercase tracking-[0.2em] group-hover:text-indigo-400/80 transition-colors duration-300">
                        <Lock size={10} className="group-hover:scale-110 transition-transform" />
                        <span>Acceder</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {selectedUser && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            style={{ animation: 'fade-in-up 0.2s ease-out' }}
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm animate-scale-in">
            {/* Glow behind modal */}
            <div
              className="absolute -inset-8 rounded-[50px] blur-3xl opacity-30 animate-pulse-glow"
              style={{ background: profile.glowColor }}
            />

            <div className="relative rounded-3xl glass-card overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-dark-400 hover:text-white transition-all cursor-pointer z-10 hover:rotate-90 duration-300"
              >
                <X size={16} />
              </button>

              {/* Top gradient accent */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${profile.gradient}`} />

              <div className="p-8 pt-6">
                {/* User info */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-5">
                    <div className={`absolute inset-0 bg-gradient-to-br ${profile.gradient} rounded-2xl blur-lg opacity-40`} />
                    <div className={`relative w-18 h-18 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-2xl font-black text-white shadow-lg`}>
                      {selectedUser[0]}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedUser}</h3>
                  <div className="flex items-center gap-2 text-dark-400">
                    <Lock size={13} />
                    <span className="text-xs font-medium">Introduce tu código de acceso</span>
                  </div>
                </div>

                {/* PIN inputs */}
                <div className="flex justify-center gap-3 mb-8">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <input
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={pin[index]}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-14 h-16 rounded-2xl text-center text-2xl font-black transition-all duration-300 outline-none
                          ${success
                            ? 'bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                            : error
                              ? 'bg-rose-500/15 border-2 border-rose-500/50 text-rose-400 animate-[shake_0.5s_ease-in-out]'
                              : pin[index]
                                ? `bg-gradient-to-b from-white/[0.08] to-white/[0.04] border-2 border-indigo-500/50 text-white shadow-[0_0_25px_rgba(99,102,241,0.15)]`
                                : 'bg-white/[0.04] border-2 border-white/[0.08] text-white hover:border-white/20'
                          }
                        `}
                      />
                      {/* Progress dot */}
                      <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        pin[index] 
                          ? success ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]' 
                          : 'bg-dark-700'
                      }`} />
                    </div>
                  ))}
                </div>

                {/* Status messages */}
                <div className="h-10 flex items-center justify-center">
                  {error && (
                    <div className="flex items-center gap-2 text-rose-400 animate-scale-in">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <X size={12} />
                      </div>
                      <span className="text-sm font-semibold">Código incorrecto</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-2 text-emerald-400 animate-success-pop">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck size={13} />
                      </div>
                      <span className="text-sm font-semibold">Acceso concedido</span>
                    </div>
                  )}
                  {!error && !success && (
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            pin[i] ? 'bg-indigo-400 scale-125' : 'bg-dark-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
