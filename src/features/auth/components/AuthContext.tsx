"use client";
import React, { createContext, useContext, useState } from "react";
import { ClientSession, ServerSession, SignUpFormData } from "../types";
import {
  deleteTokenCookie,
  getServerSession,
  loginAndSendJWT,
  signupAndSendJWT,
} from "../server";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthContextType {
  clientSession: ClientSession;
  login: (
    email_prefix: string,
    email_suffix_id: number,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signup: (data: SignUpFormData) => Promise<void>;
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

  async function login(
    email_prefix: string,
    email_suffix_id: number,
    password: string
  ) {
    await loginAndSendJWT(email_prefix, email_suffix_id, password);
    await refreshUser();
    toast.success("Logged in successfully");
  }

  async function signup(data: SignUpFormData) {
    console.log(data);
    await signupAndSendJWT(data);
    await refreshUser();
  }

  async function logout() {
    await deleteTokenCookie();
    setClientSession({ status: "unauthenticated", user: null });
    toast.success("Logged out successfully");
    router.push("/login");
  }

  async function refreshUser() {
    const newSession = await getServerSession();
    setClientSession(newSession);
  }

  return (
    <AuthContext.Provider
      value={{ clientSession, login, logout, refreshUser, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
