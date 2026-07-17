/**
 * TokenPreview — temporary scratch page for reviewing the design system.
 * Shows all color tokens, typography, spacing, radius, and shadows.
 * DELETE THIS FILE before merging Phase 2 into production.
 */
export default function TokenPreview() {
  const colors = [
    { name: "neutral-50", value: "var(--neutral-50)", css: "--neutral-50" },
    { name: "neutral-100", value: "var(--neutral-100)", css: "--neutral-100" },
    { name: "neutral-200", value: "var(--neutral-200)", css: "--neutral-200" },
    { name: "neutral-400", value: "var(--neutral-400)", css: "--neutral-400" },
    { name: "neutral-600", value: "var(--neutral-600)", css: "--neutral-600" },
    { name: "neutral-800", value: "var(--neutral-800)", css: "--neutral-800" },
    { name: "neutral-900", value: "var(--neutral-900)", css: "--neutral-900" },
    { name: "buyer-brand", value: "var(--buyer-brand)", css: "--buyer-brand" },
    { name: "buyer-accent", value: "var(--buyer-accent)", css: "--buyer-accent" },
    { name: "buyer-bg", value: "var(--buyer-bg)", css: "--buyer-bg" },
    { name: "buyer-sidebar", value: "var(--buyer-sidebar)", css: "--buyer-sidebar" },
    { name: "seller-brand", value: "var(--seller-brand)", css: "--seller-brand" },
    { name: "seller-accent", value: "var(--seller-accent)", css: "--seller-accent" },
    { name: "seller-bg", value: "var(--seller-bg)", css: "--seller-bg" },
    { name: "seller-sidebar", value: "var(--seller-sidebar)", css: "--seller-sidebar" },
    { name: "status-pending", value: "var(--status-pending)", css: "--status-pending" },
    { name: "status-processing", value: "var(--status-processing)", css: "--status-processing" },
    { name: "status-finished", value: "var(--status-finished)", css: "--status-finished" },
    { name: "status-cancelled", value: "var(--status-cancelled)", css: "--status-cancelled" },
    { name: "priority-low", value: "var(--priority-low)", css: "--priority-low" },
    { name: "priority-normal", value: "var(--priority-normal)", css: "--priority-normal" },
    { name: "priority-high", value: "var(--priority-high)", css: "--priority-high" },
    { name: "priority-urgent", value: "var(--priority-urgent)", css: "--priority-urgent" },
  ];

  const typography = [
    { label: "Display (28px/700)", className: "text-[28px] font-bold", sample: "Page Title" },
    { label: "H2 (20px/600)", className: "text-[20px] font-semibold", sample: "Section Header" },
    { label: "H3 (16px/600)", className: "text-[16px] font-semibold", sample: "Card Title" },
    { label: "Body (14px/400)", className: "text-[14px] font-normal", sample: "Body text goes here. This is the standard paragraph style used throughout the application." },
    { label: "Small (12px/400)", className: "text-[12px] font-normal text-slate-400", sample: "Meta information" },
  ];

  const statuses = ["Pending", "Processing", "Finished", "Cancelled"];
  const priorities = ["Low", "Normal", "High", "Urgent"];
  const radii = ["--radius-sm: 6px", "--radius-md: 10px", "--radius-lg: 16px"];
  const radiusValues = ["6px", "10px", "16px"];

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-8">
      <div>
        <h1 className="text-[28px] font-bold">SureServe Design Tokens</h1>
        <p className="mt-2 text-slate-500">Review all tokens before proceeding to Phase 3 (Component Library).</p>
      </div>

      {/* Colors */}
      <section>
        <h2 className="mb-4 text-[20px] font-semibold">Color Tokens</h2>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((c) => (
            <div key={c.name} className="rounded-[10px] bg-white p-4 shadow-sm">
              <div
                className="h-10 rounded-[6px] border"
                style={{ backgroundColor: `var(${c.css})` }}
              />
              <p className="mt-2 text-[12px] font-semibold">{c.name}</p>
              <p className="text-[12px] text-slate-400">{c.css}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="mb-4 text-[20px] font-semibold">Typography</h2>
        <div className="space-y-4 rounded-[10px] bg-white p-6 shadow-sm">
          {typography.map((t) => (
            <div key={t.label}>
              <p className="text-[12px] text-slate-400 mb-1">{t.label}</p>
              <p className={t.className}>{t.sample}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="mb-4 text-[20px] font-semibold">Status Colors</h2>
        <div className="flex gap-4">
          {statuses.map((s) => {
            const cssVar = s === "Pending" ? "--status-pending"
              : s === "Processing" ? "--status-processing"
              : s === "Finished" ? "--status-finished"
              : "--status-cancelled";
            return (
              <span
                key={s}
                className="rounded-[6px] px-3 py-1 text-[12px] font-semibold text-white"
                style={{ backgroundColor: `var(${cssVar})` }}
              >
                {s}
              </span>
            );
          })}
        </div>
      </section>

      {/* Priority Colors */}
      <section>
        <h2 className="mb-4 text-[20px] font-semibold">Priority Colors</h2>
        <div className="flex gap-4">
          {priorities.map((p) => {
            const cssVar = p === "Low" ? "--priority-low"
              : p === "Normal" ? "--priority-normal"
              : p === "High" ? "--priority-high"
              : "--priority-urgent";
            return (
              <span
                key={p}
                className="rounded-[6px] px-3 py-1 text-[12px] font-semibold text-white"
                style={{ backgroundColor: `var(${cssVar})` }}
              >
                {p}
              </span>
            );
          })}
        </div>
      </section>

      {/* Radius */}
      <section>
        <h2 className="mb-4 text-[20px] font-semibold">Border Radius</h2>
        <div className="flex gap-6">
          {radii.map((r, i) => (
            <div key={r} className="text-center">
              <div
                className="h-16 w-16 bg-blue-600"
                style={{ borderRadius: radiusValues[i] }}
              />
              <p className="mt-2 text-[12px] text-slate-400">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shadows */}
      <section>
        <h2 className="mb-4 text-[20px] font-semibold">Shadows</h2>
        <div className="flex gap-8">
          <div className="rounded-[10px] bg-white p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="text-[12px] text-slate-400">Card Shadow</p>
          </div>
          <div className="rounded-[16px] bg-white p-8 text-center" style={{ boxShadow: "var(--shadow-modal)" }}>
            <p className="text-[12px] text-slate-400">Modal Shadow</p>
          </div>
        </div>
      </section>
    </div>
  );
}
