import { X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ModalTransition } from "./motion";

/**
 * Modal — base overlay modal with backdrop blur and framer-motion animation.
 *
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Details">
 *     <p>Modal content</p>
 *   </Modal>
 */
export default function Modal({
  open = false,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal body */}
          <ModalTransition>
            <div
              className={`relative w-full ${sizeClasses[size]} rounded-2xl bg-white p-6 shadow-[var(--shadow-modal)] ${className}`}
            >
              {/* Header */}
              {title && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Close button when no title */}
              {!title && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {children}
            </div>
          </ModalTransition>
        </div>
      )}
    </AnimatePresence>
  );
}
