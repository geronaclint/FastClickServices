const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const registerBuyer = async ({ fullName, email, password }) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password, role: "buyer" }),
  });
  return response.json();
};

export const loginBuyer = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "buyer" }),
  });
  return response.json();
};

export const loginSellerAccount = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "seller" }),
  });
  return response.json();
};

const getStoragePrefix = () => {
  return window.location.pathname.startsWith('/seller-') ? 'seller_' : 'buyer_';
};

// One-time migration: move old un-prefixed keys to the correct prefixed keys
(function migrateOldAuthKeys() {
  const oldToken = localStorage.getItem("token");
  const oldUser = localStorage.getItem("user");
  if (oldToken && oldUser) {
    try {
      const parsed = JSON.parse(oldUser);
      const isSeller = parsed.role === "provider" || parsed.role === "admin" || parsed.role === "seller";
      const prefix = isSeller ? "seller_" : "buyer_";
      // Only migrate if the new key doesn't already exist
      if (!localStorage.getItem(prefix + "token")) {
        localStorage.setItem(prefix + "token", oldToken);
        localStorage.setItem(prefix + "user", oldUser);
      }
    } catch {}
    // Remove old keys to prevent confusion
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
})();

export const saveAuthData = ({ token, user }) => {
  const isSeller = user.role === 'provider' || user.role === 'admin' || user.role === 'seller';
  const prefix = isSeller ? 'seller_' : 'buyer_';
  localStorage.setItem(prefix + "token", token);
  localStorage.setItem(prefix + "user", JSON.stringify(user));
};

export const clearAuthData = () => {
  const prefix = getStoragePrefix();
  localStorage.removeItem(prefix + "token");
  localStorage.removeItem(prefix + "user");
};

export const getAuthToken = () => {
  const prefix = getStoragePrefix();
  return localStorage.getItem(prefix + "token");
};

export const getUser = () => {
  const prefix = getStoragePrefix();
  const raw = localStorage.getItem(prefix + "user");
  return raw ? JSON.parse(raw) : null;
};

export const updateUserLocal = (newData) => {
  const prefix = getStoragePrefix();
  const raw = localStorage.getItem(prefix + "user");
  if (raw) {
    const user = JSON.parse(raw);
    const updated = { ...user, ...newData };
    localStorage.setItem(prefix + "user", JSON.stringify(updated));
  }
};

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});