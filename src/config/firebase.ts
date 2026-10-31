import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: 'AIzaSyA7agBd8j8om1Mpa8Rr1QIL0bgetVXr-lg',
  authDomain: 'lazan-a9ce1.firebaseapp.com',
  projectId: 'lazan-a9ce1',
  storageBucket: 'lazan-a9ce1.firebasestorage.app',
  messagingSenderId: '893991106391',
  appId: '1:893991106391:web:65b41a82aa3cc50a1b7012',
};

// Singleton Firebase App instance
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Cross-platform Auth initialization with React Native AsyncStorage persistence
let authInstance: Auth;

if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    const getReactNativePersistence = (FirebaseAuth as unknown as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => any;
    }).getReactNativePersistence;

    if (getReactNativePersistence) {
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      authInstance = getAuth(app);
    }
  } catch {
    // In dev / Fast Refresh, auth may already be initialized
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
