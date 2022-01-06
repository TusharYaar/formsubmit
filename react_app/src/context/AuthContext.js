import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase/config";

import { getUserProfile, getUserForms } from "../Utils/apiFunction";

const DEFUALT_USER_STATE = {
  isSignedIn: false,
  user: null,
  isLoading: true,
};

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setUser] = useState(DEFUALT_USER_STATE);

  const handleAuthChange = useCallback(async (user) => {
    if (user) {
      const { emailVerified, uid, displayName, photoURL, email } = user;
      setUser({
        isSignedIn: true,
        user: { email, emailVerified, uid, displayName, photoURL, forms: [] },
        isLoading: false,
      });
      console.log("Fetching user profile");
      const IdToken = await user.getIdToken(true);
      const response = await getUserProfile(IdToken);
      console.log(response);
      setUser({
        isSignedIn: true,
        user: { email, emailVerified, uid, displayName, photoURL, ...response },
        isLoading: false,
      });

      console.log("User Logged in");
    } else {
      setUser({ ...DEFUALT_USER_STATE, isLoading: false });
      console.log("No User or User Logged Out");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
    return unsubscribe;
  }, [handleAuthChange]);

  const signIn = async (email, password) => {
    try {
      setUser({ ...DEFUALT_USER_STATE });
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setUser({ ...DEFUALT_USER_STATE, isLoading: false });
      console.log(error.message);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      setUser({ ...DEFUALT_USER_STATE });
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setUser({ ...DEFUALT_USER_STATE, isLoading: false });
      console.log(error.message);
      throw error;
    }
  };

  const logOut = () => {
    signOut(auth);
  };

  const signInWithGoogle = () => {
    setUser({ ...DEFUALT_USER_STATE });
    return signInWithRedirect(auth, googleProvider);
  };

  const getForms = async () => {
    try {
      const IdToken = await auth.currentUser.getIdToken(true);
      const response = await getUserForms(IdToken);
      setUser({
        ...currentUser,
        user: { ...currentUser.user, forms: response },
      });
      console.log(response);
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    logOut,
    signIn,
    signUp,
    signInWithGoogle,
    getForms,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
