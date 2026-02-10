// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_WEB_CLIENT_ID,
  ANDROID_CLIENT_ID,
} from '@env';

// --- Initialize Firebase ---
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Google Sign-In helper ---
// Accepts a Google ID token (JWT) and signs in with Firebase using that token.
async function signInWithGoogleIdToken(idToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    console.log('✅ Signed in with Google via ID token');
    return auth.currentUser;
  } catch (error) {
    console.error('❌ Firebase sign-in with ID token failed:', error);
    throw error;
  }
}

// --- Export auth and signIn function ---
export { auth, signInWithGoogleIdToken };
