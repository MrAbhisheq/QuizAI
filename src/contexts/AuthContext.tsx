import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, UserSettings } from '../types';
import { LoadingScreen } from '../components/LoadingScreen';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserSettings: (settings: UserSettings) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const defaultSettings: UserSettings = {
  aiModel: 'gemini',
  defaultNumberOfQuestions: 5,
  defaultQuestionType: 'multiple-choice'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        } else {
          // Create default user document
          const newUserData: User = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            settings: defaultSettings
          };
          await setDoc(doc(db, 'users', user.uid), newUserData);
          setUserData(newUserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newUserData: User = {
      id: user.uid,
      name,
      email,
      settings: defaultSettings
    };

    await setDoc(doc(db, 'users', user.uid), newUserData);

    // Send email verification
    await sendEmailVerification(user);

    // Sign out the user so they must verify before using the app
    await firebaseSignOut(auth);
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified (only for email/password sign-in)
    if (!user.emailVerified) {
      // Sign out the unverified user
      await firebaseSignOut(auth);
      throw { code: 'auth/email-not-verified', message: 'Please verify your email before signing in. Check your inbox for the verification link.' };
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      const newUserData: User = {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        settings: defaultSettings
      };
      await setDoc(doc(db, 'users', user.uid), newUserData);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserSettings = async (settings: UserSettings) => {
    if (!currentUser) return;

    const updatedUserData: User = {
      ...userData!,
      settings
    };

    await setDoc(doc(db, 'users', currentUser.uid), updatedUserData);
    setUserData(updatedUserData);
  };

  const resendVerificationEmail = async () => {
    // To resend, we need to temporarily sign in
    // This is called from the Auth component which will handle the flow
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserSettings,
    resendVerificationEmail,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
