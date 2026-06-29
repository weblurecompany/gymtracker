import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  CONFIGURACIÓN DE FIREBASE                                      ║
// ║                                                                  ║
// ║  Para que los datos se guarden en la nube:                       ║
// ║  1. Ve a https://console.firebase.google.com                     ║
// ║  2. Crea un nuevo proyecto                                       ║
// ║  3. Ve a "Realtime Database" y crea una base de datos            ║
// ║  4. En las reglas, pon:                                          ║
// ║     { "rules": { ".read": true, ".write": true } }              ║
// ║  5. Ve a Configuración del proyecto > General > Tus apps         ║
// ║  6. Añade una app web y copia los valores aquí abajo             ║
// ╚══════════════════════════════════════════════════════════════════╝

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
};

let db: ReturnType<typeof getDatabase> | null = null;
let firebaseReady = false;

try {
  const isConfigured =
    firebaseConfig.apiKey !== 'TU_API_KEY' &&
    firebaseConfig.projectId !== 'TU_PROYECTO';

  if (isConfigured) {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    firebaseReady = true;
  }
} catch (e) {
  console.warn('Firebase no se pudo inicializar:', e);
}

export { db, firebaseReady };
