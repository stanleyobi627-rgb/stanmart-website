import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config";
import type { StoredUser, User } from "../types";

interface SignupInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  signup: (input: SignupInput) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "stanmart_users";
const SESSION_KEY = "stanmart_session";

const encode = (text: string) => btoa(unescape(encodeURIComponent(text)));

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function readSession(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession);

  const startSession = (account: User) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
    setUser(account);
  };

  const signup = ({ name, email, phone, password }: SignupInput): string | null => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) {
      return "This email is reserved.";
    }
    const users = readUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      return "An account with this email already exists.";
    }
    const stored: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      password: encode(password),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, stored]));
    startSession({ id: stored.id, name: stored.name, email: stored.email, phone: stored.phone });
    return null;
  };

  const login = (email: string, password: string): string | null => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      startSession({ id: "admin", name: "Store Owner", email: ADMIN_EMAIL.toLowerCase(), phone: "" });
      return null;
    }
    const found = readUsers().find((u) => u.email === trimmedEmail);
    if (!found || found.password !== encode(password)) {
      return "Invalid email or password.";
    }
    startSession({ id: found.id, name: found.name, email: found.email, phone: found.phone });
    return null;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const isAdmin = user?.email === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider value={{ user, isAdmin, signup, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
