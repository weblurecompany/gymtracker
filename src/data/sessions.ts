import { SessionDay } from './types';

export const sessions: SessionDay[] = [
  {
    id: 'biceps-triceps',
    name: 'Bíceps + Tríceps',
    icon: '💪',
    color: 'from-orange-500 to-red-500',
    exercises: [
      { id: 'curl-predicador', name: 'Curl Predicador', muscleGroup: 'Bíceps' },
      { id: 'curl-inclinado-mancuernas', name: 'Curl Inclinado con Mancuernas', muscleGroup: 'Bíceps' },
      { id: 'curl-biceps-polea', name: 'Curl de Bíceps en Polea', muscleGroup: 'Bíceps' },
      { id: 'extension-polea', name: 'Extensión en Polea', muscleGroup: 'Tríceps' },
      { id: 'extension-overhead', name: 'Extensión Overhead', muscleGroup: 'Tríceps' },
      { id: 'press-frances', name: 'Press Francés', muscleGroup: 'Tríceps' },
      { id: 'abdominales-biceps', name: 'Abdominales', muscleGroup: 'Core' },
    ],
  },
  {
    id: 'espalda-hombro',
    name: 'Espalda + Hombro',
    icon: '🔱',
    color: 'from-blue-500 to-cyan-500',
    exercises: [
      { id: 'remo', name: 'Remo', muscleGroup: 'Espalda' },
      { id: 'jalon-polea', name: 'Jalón en Polea', muscleGroup: 'Espalda' },
      { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'Espalda' },
      { id: 'press-militar', name: 'Press Militar', muscleGroup: 'Hombro' },
      { id: 'elevaciones-laterales', name: 'Elevaciones Laterales', muscleGroup: 'Hombro' },
      { id: 'press-hombro-maquina', name: 'Press de Hombro en Máquina', muscleGroup: 'Hombro' },
      { id: 'abdominales-espalda', name: 'Abdominales', muscleGroup: 'Core' },
    ],
  },
  {
    id: 'pecho',
    name: 'Pecho',
    icon: '🏋️',
    color: 'from-purple-500 to-pink-500',
    exercises: [
      { id: 'press-banca', name: 'Press de Banca', muscleGroup: 'Pecho' },
      { id: 'aperturas-mancuerna', name: 'Aperturas con Mancuerna', muscleGroup: 'Pecho' },
      { id: 'press-maquina', name: 'Press en Máquina', muscleGroup: 'Pecho' },
      { id: 'abdominales-pecho', name: 'Abdominales', muscleGroup: 'Core' },
    ],
  },
  {
    id: 'pierna',
    name: 'Pierna',
    icon: '🦵',
    color: 'from-green-500 to-emerald-500',
    exercises: [
      { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Pierna' },
      { id: 'extension-cuadriceps', name: 'Extensión de Cuádriceps', muscleGroup: 'Pierna' },
      { id: 'abdominales-pierna', name: 'Abdominales', muscleGroup: 'Core' },
    ],
  },
];
