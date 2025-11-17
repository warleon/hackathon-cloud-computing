import { type ReactNode } from "react";

import { useAuth } from "./useAuth";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
