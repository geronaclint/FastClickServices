import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

function getStoredTheme(portal) {
  const key = portal === "seller" ? "sellerDarkMode" : "buyerDarkMode";
  // Legacy: stored as boolean dark mode flag
  const legacy = localStorage.getItem(key);
  if (legacy === "true") return "dark";
  if (legacy === "false") return "light";
  // New: stored as theme string
  const stored = localStorage.getItem(`${portal}Theme`);
  if (stored === "dark" || stored === "light" || stored === "system") return stored;
  return "system";
}

function saveTheme(portal, theme) {
  localStorage.setItem(`${portal}Theme`, theme);
  // Keep legacy key in sync for any code that still reads it directly
  const legacyKey = portal === "seller" ? "sellerDarkMode" : "buyerDarkMode";
  localStorage.setItem(legacyKey, theme === "dark" ? "true" : "false");
}

function resolveTheme(theme) {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  // "system" — check media query
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function ThemeProvider({ children }) {
  const [buyerTheme, setBuyerThemeState] = useState(() => getStoredTheme("buyer"));
  const [sellerTheme, setSellerThemeState] = useState(() => getStoredTheme("seller"));

  // Listen for OS theme changes when theme is "system"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      // Force re-render — resolveTheme will pick up the new OS preference
      setBuyerThemeState((prev) => prev); // trigger re-render
      setSellerThemeState((prev) => prev);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setBuyerTheme = useCallback((theme) => {
    setBuyerThemeState(theme);
    saveTheme("buyer", theme);
  }, []);

  const setSellerTheme = useCallback((theme) => {
    setSellerThemeState(theme);
    saveTheme("seller", theme);
  }, []);

  const resolvedBuyer = resolveTheme(buyerTheme);
  const resolvedSeller = resolveTheme(sellerTheme);

  return (
    <ThemeContext.Provider
      value={{
        buyerTheme,
        sellerTheme,
        resolvedBuyer,
        resolvedSeller,
        setBuyerTheme,
        setSellerTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export default ThemeContext;
