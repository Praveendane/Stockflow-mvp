
import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import api from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user when the app opens
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("stockflow_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        localStorage.removeItem("stockflow_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);

    localStorage.setItem("stockflow_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    localStorage.setItem("stockflow_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("stockflow_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
