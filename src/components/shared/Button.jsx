import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:bg-blue-400",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50",
  ghost:
    "text-slate-600 hover:bg-slate-100 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:bg-red-400",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-7 py-3.5 text-base gap-3 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        IconLeft && <IconLeft className="h-4 w-4" />
      )}
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4" />}
    </button>
  );
}
