import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginBuyer as apiLoginBuyer,
  loginSellerAccount as apiLoginSeller,
  registerBuyer as apiRegisterBuyer,
  saveAuthData as persistAuth,
  clearAuthData as clearPersistedAuth,
  getUser as getStoredUser,
  getAuthToken,
} from "../services/authService";
import { loginSeller as setSellerFlag, logoutSeller as clearSellerFlag, isSellerLoggedIn } from "../utils/sellerAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = getStoredUser();
    const savedToken = getAuthToken();
    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const isBuyer = user?.role === "buyer";
  const isSeller = user?.role === "provider" || user?.role === "admin" || user?.role === "seller";
  const subscription = user?.subscription || "Free";

  const login = useCallback(async ({ email, password, portalType = "buyer" }) => {
    let result;
    if (portalType === "seller") {
      result = await apiLoginSeller({ email, password });
    } else {
      result = await apiLoginBuyer({ email, password });
    }

    if (!result.success) {
      return result; // { success: false, message: "..." }
    }

    persistAuth({ token: result.token, user: result.user });

    if (portalType === "seller") {
      setSellerFlag();
    }

    setUser(result.user);
    setToken(result.token);
    return result;
  }, []);

  const register = useCallback(async ({ fullName, email, password }) => {
    const result = await apiRegisterBuyer({ fullName, email, password });
    return result;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearPersistedAuth();
    clearSellerFlag();
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      // Keep localStorage in sync for legacy code
      persistAuth({ token: token || getAuthToken(), user: updated });
      return updated;
    });
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isBuyer,
        isSeller,
        subscription,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
