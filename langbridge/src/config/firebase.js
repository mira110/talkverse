import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Returns true only when real credentials exist in .env
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim().length > 10 &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account", // Shows all available Google accounts
    });
  } catch (err) {
    console.warn("Firebase initialization notice:", err);
  }
}

export { auth, googleProvider };

// Helper: Sign up with Email & Password
export async function signupWithEmail(email, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured yet. Please add your API key in langbridge/.env");
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

// Helper: Log in with Email & Password
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured yet. Please add your API key in langbridge/.env");
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Helper: Sign in with Google Popup (shows available emails)
export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("Firebase Google Authentication requires API keys in langbridge/.env");
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Helper: Sign out
export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}
