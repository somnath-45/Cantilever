import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

export const AuthContext = createContext(null);

const TOKEN_KEY = "cantilever_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setAuthLoading(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
  const { access_token } = await authApi.login({
    username,
    password,
  });

  localStorage.setItem(
    TOKEN_KEY,
    access_token
  );

  const me = await authApi.getMe();

  setUser(me);

  return true;
};
  const signup = async ({ name, email, password, role }) => {
    await authApi.signUp({ name, email, password, role });
  };

  const updateProfile = async (updates) => {
    const updated = await authApi.updateProfile(updates);
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, authLoading, login, signup, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
