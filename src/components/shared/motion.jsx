import { motion, AnimatePresence } from "framer-motion";

/**
 * PageTransition — wraps page-level content for route changes.
 * Usage: <PageTransition><YourPage /></PageTransition>
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ModalTransition — wraps modal content for enter/exit animation.
 * Usage: <AnimatePresence>{open && <ModalTransition><Modal /></ModalTransition>}</AnimatePresence>
 */
export function ModalTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ToastTransition — wraps toast notifications for slide-in.
 */
export function ToastTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * DrawerTransition — for sidebar/mobile drawer slide.
 */
export function DrawerTransition({ children }) {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export { AnimatePresence, motion };
