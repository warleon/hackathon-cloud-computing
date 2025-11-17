import { createContext, useContext } from "react";
import type { useAuth } from "./useAuth";

export type AuthContextValue = ReturnType<typeof useAuth>;
export const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
