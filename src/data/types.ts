export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface SetRecord {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface WorkoutEntry {
  id: string;
  odnerUser: string;
  date: string; // ISO string
  sessionType: string;
  exerciseId: string;
  sets: SetRecord[];
}

export interface WeightEntry {
  id: string;
  user: string;
  date: string; // ISO string
  weight: number; // kg
}

export interface SessionDay {
  id: string;
  name: string;
  icon: string;
  color: string;
  exercises: Exercise[];
}

export type User = 'Gonzalo' | 'Alae';

export type TimeRange = '1semana' | '1mes' | '3meses' | '6meses' | '1año' | 'todo';
