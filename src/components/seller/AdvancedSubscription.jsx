import { Check, Crown, Star, Zap } from "lucide-react";
import Button from "../shared/Button";

const plans = [
  { name: "Free", subtitle: "Basic access for individual sellers", price: "0", icon: Star, accent: "slate",
    features: ["Manage incoming requests", "Basic ticket handling", "Standard dashboard", "Email support"] },
  { name: "Professional", subtitle: "For growing service businesses", price: "299", icon: Zap, accent: "orange", popular: true,
    features: ["Everything in Free", "Analytics Dashboard", "PDF & CSV Exporting", "Performance Insights", "Priority Seller Support"] },
  { name: "Enterprise", subtitle: "For large scale agencies", price: "999", icon: Crown, accent: "blue",
    features: ["Everything in Professional", "Advanced Custom Analytics", "Quarterly Business Reviews", "Dedicated Account Manager", "White-glove onboarding"] },
];

function PlanCard({ plan, currentPlan, onUpgrade }) {
  const Icon = plan.icon;
  const isCurrent = currentPlan === plan.name;
  const currentLevel = plans.findIndex((p) => p.name === currentPlan);
  const thisLevel = plans.findIndex((p) => p.name === plan.name);
  const btnLabel = isCurrent ? "Current Plan" : thisLevel < currentLevel ? `Downgrade to ${plan.name}` : `Upgrade to ${plan.name}`;
  const accent = plan.accent === "orange" ? "border-orange-500" : plan.accent === "blue" ? "border-blue-600" : "";

  return (
    <div className={`relative flex min-h-[500px] flex-col rounded-2xl bg-white p-6 shadow-sm ${isCurrent ? "border-2 border-emerald-500 ring-2 ring-emerald-200" : plan.popular && !isCurrent ? `border-2 ${accent}` : "border border-slate-200"}`}>
      {plan.popular && !isCurrent && <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 px-5 py-1 text-sm font-bold text-white"><Star className="mr-1 inline h-3 w-3 fill-white" />Most Popular</div>}
      {isCurrent && <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-5 py-1 text-sm font-bold text-white">✓ Active Plan</div>}
      <div className="mb-5 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${plan.accent === "orange" ? "text-orange-500" : plan.accent === "blue" ? "text-blue-600" : "text-slate-500"}`} />
        <div><h3 className="text-xl font-extrabold">{plan.name}</h3><p className="mt-1 text-sm text-slate-400">{plan.subtitle}</p></div>
      </div>
      <div className="mb-7"><span className="text-4xl font-extrabold">₱{plan.price}</span><span className="ml-1 text-slate-400">/month</span></div>
      <ul className="space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-700"><Check className={`mt-0.5 h-4 w-4 ${plan.accent === "orange" ? "text-orange-500" : plan.accent === "blue" ? "text-blue-600" : "text-slate-500"}`} />{f}</li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {isCurrent ? (
          <Button variant="ghost" disabled className="w-full bg-emerald-50 text-emerald-600">Current Plan</Button>
        ) : plan.accent === "orange" ? (
          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => onUpgrade(plan.name)}>{btnLabel}</Button>
        ) : plan.accent === "blue" ? (
          <Button variant="secondary" className="w-full border-blue-600 text-blue-600" onClick={() => onUpgrade(plan.name)}>{btnLabel}</Button>
        ) : (
          <Button variant="ghost" className="w-full" onClick={() => onUpgrade(plan.name)}>{btnLabel}</Button>
        )}
      </div>
    </div>
  );
}

export default function AdvancedSubscription({ user, onUpgrade }) {
  const currentPlan = user?.subscription || "Free";

  const handleUpgrade = (planName) => {
    if (planName === currentPlan) return;
    if (window.confirm(`Switch to ${planName} plan?`)) onUpgrade(planName);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-9 py-4 md:py-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500"><Crown className="h-9 w-9" /></div>
        <h1 className="mt-6 text-2xl font-extrabold md:text-3xl">Advanced Subscription</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 md:text-base">Unlock analytics, advanced exporting, and priority support for your provider account.</p>
        <button className="mt-8 rounded-xl bg-white px-7 py-3 text-sm font-bold shadow-sm">Monthly</button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => <PlanCard key={plan.name} plan={plan} currentPlan={currentPlan} onUpgrade={handleUpgrade} />)}
      </div>
    </div>
  );
}
