/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { ENDPOINTS } from "@/lib/constants";
import { type User } from "@/lib/auth_types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch (err) {
      console.error("Error parsing stored user:", err);
      return null;
    }
  });

  // ---------------------------
  // LOGIN
  // ---------------------------
  const login = useCallback(
    async (tenant: string, email: string, password: string) => {
      const res = await axios.post(ENDPOINTS.LOGIN, {
        tenant,
        email,
        password,
      });
      const newToken = res.data.tokenId;
      const authenticatedUser = res.data.user;

      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      setToken(newToken);
      setUser(authenticatedUser);

      return res.data;
    },
    []
  );

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post(
          ENDPOINTS.LOGOUT,
          {
            token,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      // logout should succeed even if API fails
      console.error("Logout error:", err);
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);

    // Redirect to login page
    window.location.href = "/";
  }, [token]);

  // ---------------------------
  // REQUEST WRAPPER
  // ---------------------------
  const request = useCallback(
    async (url: string, data: unknown) => {
      try {
        const res = await axios.post(url, data);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 401) {
          logout(); // auto-logout if expired or invalid token
        }
        throw err;
      }
    },
    [logout]
  );

  // Attach token & auto-logout on 401
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logout(); // automatic logout
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [logout, token]);

  return {
    token,
    login,
    logout,
    request,
    isAuthenticated: Boolean(token),
    user,
  };
}
