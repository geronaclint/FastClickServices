import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ToastTransition } from "./motion";

const ToastContext = createContext(null);

const typeStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const typeIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

let toastId = 0;

/**
 * ToastProvider — wrap your app to enable toast notifications.
 * Usage: <ToastProvider><App /></ToastProvider>
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed bottom-right, mobile-safe */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = typeIcons[toast.type] || Info;
            return (
              <ToastTransition key={toast.id}>
                <div
                  className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg min-w-[280px] max-w-[380px] ${typeStyles[toast.type]}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <p className="flex-1 text-sm font-semibold">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {/* Auto-dismiss progress bar */}
                  {toast.duration > 0 && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 rounded-full bg-current opacity-30"
                      style={{
                        width: "100%",
                        animation: `toast-shrink ${toast.duration}ms linear forwards`,
                      }}
                    />
                  )}
                </div>
              </ToastTransition>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress bar animation */}
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

/**
 * useToast — hook to trigger toast notifications.
 * Usage: const { toast } = useToast();  toast("Saved!", "success");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: if no ToastProvider, just log
    return { toast: (msg) => console.log("[Toast]", msg) };
  }
  return {
    toast: (message, type, duration) => ctx.addToast(message, type, duration),
  };
}
