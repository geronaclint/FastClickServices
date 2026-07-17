/**
 * Card — base container with consistent radius, shadow, and padding.
 */
export default function Card({ children, className = "", padding = "p-6" }) {
  return (
    <div
      className={`rounded-[var(--radius-md)] bg-white shadow-[var(--shadow-card)] ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
