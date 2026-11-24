import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token"),
  );

  async function login(email, password) {
    const data = await loginUser(email, password);

    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    queryClient.clear();
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
