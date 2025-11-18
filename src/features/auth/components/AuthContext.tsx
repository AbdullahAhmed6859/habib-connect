"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ClientSession, ServerSession } from "../types";
import {
  deleteTokenCookie,
  getServerSession,
  loginAndSendJWT,
} from "../server";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";

interface AuthContextType {
  clientSession: ClientSession;
  login: (email: string, password: string) => Promise<void>;
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
  const router = useRouter();
  const [clientSession, setClientSession] = useState<ClientSession>(
    serverSession ?? { status: "loading", user: null }
  );

  async function login(email: string, password: string) {
    const success = await loginAndSendJWT(email, password);
    if (!success) {
      toast.error("Failed to login");
      return;
    }
    await refreshUser();
    toast.success("Logged in successfully");
  }

  useEffect(() => {
    if (clientSession.status === "unauthenticated") {
      router.push("/login");
    }
  }, [clientSession.status, router]);

  // async function signup(data: SignUpData) {

  // }

  async function logout() {
    await deleteTokenCookie();
    setClientSession({ status: "unauthenticated", user: null });
  }

  async function refreshUser() {
    const newSession = await getServerSession();
    setClientSession(newSession);
  }

  useEffect(() => {
    if (clientSession.status === "unauthenticated") {
      router.push("/login");
    }
  }, [clientSession.status, router]);

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
