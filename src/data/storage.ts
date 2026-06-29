import { ref, get, set, remove } from 'firebase/database';
import { db, firebaseReady } from './firebase';
import { WorkoutEntry, WeightEntry } from './types';

// ─── Helpers localStorage (fallback) ───────────────────────────────

const WK_KEY = 'gymtracker_workouts';
const WT_KEY = 'gymtracker_weights';

function localLoad<T>(key: string): T[] {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}
function localSave<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Firebase helpers ──────────────────────────────────────────────

async function fbRead<T>(path: string): Promise<T[]> {
  if (!db) return [];
  const snap = await get(ref(db, path));
  if (!snap.exists()) return [];
  const val = snap.val();
  // val puede ser un object { id: entry } o un array
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.values(val);
}

async function fbWrite(path: string, id: string, data: unknown): Promise<void> {
  if (!db) return;
  await set(ref(db, `${path}/${id}`), data);
}

async function fbDelete(path: string, id: string): Promise<void> {
  if (!db) return;
  await remove(ref(db, `${path}/${id}`));
}

// ─── API pública — Workouts ───────────────────────────────────────

export async function loadWorkouts(): Promise<WorkoutEntry[]> {
  if (firebaseReady) {
    return fbRead<WorkoutEntry>('workouts');
  }
  return localLoad<WorkoutEntry>(WK_KEY);
}

export async function addWorkoutEntry(entry: WorkoutEntry): Promise<void> {
  if (firebaseReady) {
    await fbWrite('workouts', entry.id, entry);
  } else {
    const current = localLoad<WorkoutEntry>(WK_KEY);
    current.push(entry);
    localSave(WK_KEY, current);
  }
}

export async function deleteWorkoutEntry(id: string): Promise<void> {
  if (firebaseReady) {
    await fbDelete('workouts', id);
  } else {
    const current = localLoad<WorkoutEntry>(WK_KEY).filter((w) => w.id !== id);
    localSave(WK_KEY, current);
  }
}

export async function getWorkoutsForUser(user: string): Promise<WorkoutEntry[]> {
  const all = await loadWorkouts();
  return all.filter((w) => w.odnerUser === user);
}

export async function getWorkoutsForExercise(user: string, exerciseId: string): Promise<WorkoutEntry[]> {
  const all = await loadWorkouts();
  return all.filter((w) => w.odnerUser === user && w.exerciseId === exerciseId);
}

// ─── API pública — Peso corporal ─────────────────────────────────

export async function loadWeights(): Promise<WeightEntry[]> {
  if (firebaseReady) {
    return fbRead<WeightEntry>('weights');
  }
  return localLoad<WeightEntry>(WT_KEY);
}

export async function addWeightEntry(entry: WeightEntry): Promise<void> {
  if (firebaseReady) {
    await fbWrite('weights', entry.id, entry);
  } else {
    const current = localLoad<WeightEntry>(WT_KEY);
    current.push(entry);
    localSave(WT_KEY, current);
  }
}

export async function deleteWeightEntry(id: string): Promise<void> {
  if (firebaseReady) {
    await fbDelete('weights', id);
  } else {
    const current = localLoad<WeightEntry>(WT_KEY).filter((w) => w.id !== id);
    localSave(WT_KEY, current);
  }
}

export async function getWeightsForUser(user: string): Promise<WeightEntry[]> {
  const all = await loadWeights();
  return all.filter((w) => w.user === user);
}

// ─── Estado de conexión ───────────────────────────────────────────

export function isCloudConnected(): boolean {
  return firebaseReady;
}
