import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD-3aaFkSeDvNsngh9GxT6Jhx1ShXJgux8',
  authDomain: 'x2o-league-web.firebaseapp.com',
  projectId: 'x2o-league-web',
  storageBucket: 'x2o-league-web.firebasestorage.app',
  messagingSenderId: '108441645433',
  appId: '1:108441645433:web:3ace8b40c79447e8ca7fa8',
  measurementId: 'G-SQ1RFEM1H7'
};

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "x2o-database");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
