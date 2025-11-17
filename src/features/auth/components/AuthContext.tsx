"use client";
import React, { createContext, useContext, useState } from "react";
import { ClientSession, ServerSession } from "../types";
import { deleteServerSession, getServerSession } from "../lib";

interface AuthContextType {
  clientSession: ClientSession;
  login: (redirectTo?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession?: ServerSession;
}) => {
  const [clientSession, setClientSession] = useState<ClientSession>(
    serverSession ?? { status: "loading", user: null }
  );

  const login = (redirectTo: string = "/me") => {
    window.location.href = `/api/auth/login?redirectTo=${redirectTo}`;
  };

  const logout = async () => {
    await deleteServerSession();
    setClientSession({ status: "unauthenticated", user: null });
  };

  const refreshUser = async () => {
    const newSession = await getServerSession();
    setClientSession(newSession);
  };

  return (
    <AuthContext.Provider value={{ clientSession, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
