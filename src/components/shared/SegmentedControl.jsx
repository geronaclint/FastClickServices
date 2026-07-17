/**
 * SegmentedControl — for 2-4 way choices like theme (Light/Dark/System)
 * or billing period (Monthly/Annual).
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`inline-flex rounded-xl bg-slate-100 p-1 ${className}`}
      role="radiogroup"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange && onChange(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
