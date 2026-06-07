import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized. Please check your .env configuration.");
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signOut = async () => {
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export const onAuthStateChanged = (callback) => {
    if (!auth) {
        // Mock auth state changed to immediately fire with null (logged out)
        callback(null);
        return () => {};
    }
    return firebaseOnAuthStateChanged(auth, callback);
};
