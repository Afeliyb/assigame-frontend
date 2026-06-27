"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/types";
import {
  loginRequest,
  registerRequest,
  RegisterData,
  updateUtilisateur,
} from "@/lib/api/utilisateurs";
import { ApiError } from "@/lib/api/config";

type AuthResult = { success: boolean; error?: string };

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateUser: async () => ({ success: false }),
});

const STORAGE_KEY = "assigame-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Impossible de lire la session enregistrée", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (next: AuthUser | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const loggedInUser = await loginRequest(email, password);
      persist(loggedInUser);
      return { success: true };
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Connexion impossible. Réessayez.";
      return { success: false, error: message };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResult> => {
    try {
      const newUser = await registerRequest(data);
      persist(newUser);
      return { success: true };
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Inscription impossible. Réessayez.";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    persist(null);
  };

  const updateUser = async (partial: Partial<AuthUser>): Promise<AuthResult> => {
    if (!user) return { success: false, error: "Vous n'êtes pas connecté." };
    try {
      const updated = await updateUtilisateur(user.id, {
        nom: partial.lastName,
        prenom: partial.firstName,
        telephone: partial.phone,
        whatsapp: partial.whatsapp,
        localisation: partial.location,
        avatar: partial.avatar,
        bio: partial.bio,
      });
      persist(updated);
      return { success: true };
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Mise à jour impossible. Réessayez.";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
