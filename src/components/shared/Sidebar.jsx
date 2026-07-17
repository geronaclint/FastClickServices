import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { DrawerTransition } from "./motion";

/**
 * Sidebar — responsive sidebar that collapses to a drawer on mobile.
 *
 * Usage:
 *   <Sidebar
 *     brand={<BrandComponent />}
 *     nav={<NavLinks />}
 *     footer={<LogoutButton />}
 *   />
 *
 * On desktop (≥1024px): fixed sidebar, no hamburger.
 * On mobile (<1024px): hidden by default, Menu button in fixed top bar, drawer slides in.
 */

export default function Sidebar({
  brand,
  nav,
  footer,
  width = "w-[260px]",
  className = "",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on window resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2.5 shadow-md lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <DrawerTransition>
              <aside
                className={`absolute left-0 top-0 h-full w-[280px] flex flex-col overflow-y-auto ${className}`}
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-4 top-4 rounded-xl p-1 text-white/70 transition hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                {brand}
                {nav}
                <div className="mt-auto">{footer}</div>
              </aside>
            </DrawerTransition>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-y-auto lg:flex ${width} ${className}`}
      >
        {brand}
        {nav}
        <div className="mt-auto">{footer}</div>
      </aside>
    </>
  );
}
