import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Config values copied from the Firebase console (Project settings → Your apps)
const firebaseConfig = {
  apiKey: "AIzaSyBLE1vLaYSf01K751siBmLBN-tbYSGAfFo",
  authDomain: "arbeit-sabualha.firebaseapp.com",
  projectId: "arbeit-sabualha",
  storageBucket: "arbeit-sabualha.firebasestorage.app",
  messagingSenderId: "596895643723",
  appId: "1:596895643723:web:83cda825e01d0ebfa3b5ce",
};

// Initialize the Firebase app and export the Firestore database handle
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);