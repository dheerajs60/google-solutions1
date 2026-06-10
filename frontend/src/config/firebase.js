import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUyZbburur_PrEzDM4vGxG-ZbF1g3KWtU",
  authDomain: "hackathon-481806.firebaseapp.com",
  projectId: "hackathon-481806",
  storageBucket: "hackathon-481806.firebasestorage.app",
  messagingSenderId: "408407025940",
  appId: "1:408407025940:web:701255d58b4a764c6d3a01",
  measurementId: "G-W5N0JHJ33K"
};

let app, analytics;
try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== "undefined") {
        analytics = getAnalytics(app);
    }
} catch (e) {
    console.error("Firebase config error", e);
}

export const auth = app ? getAuth(app) : null;
export default app;
