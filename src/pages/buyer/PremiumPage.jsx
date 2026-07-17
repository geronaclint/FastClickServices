import { Check, Crown, Star, Zap } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";

const plans = [
  { name: "Free", subtitle: "For individuals getting started", price: "0", icon: Star, accent: "slate",
    features: ["Up to 3 requests per week", "Basic support ticket system", "Standard delivery (5–7 days)", "Email support", "Basic warranty coverage"] },
  { name: "Premium", subtitle: "For growing businesses", price: "149", icon: Zap, accent: "blue", popular: true,
    features: ["Unlimited orders", "Priority support (Up to High)", "Express delivery (2–3 days)", "24/7 phone & email support", "Extended warranty (2 years)", "Dedicated account manager", "Analytics Dashboard"] },
  { name: "Enterprise", subtitle: "For large organizations", price: "499", icon: Crown, accent: "violet",
    features: ["Everything in Premium", "Custom service SLAs", "Priority technician (incl. Urgent)", "Lifetime warranty coverage", "Custom integration support", "Quarterly business reviews", "Advanced Analytics", "White-glove onboarding"] },
];

function PlanCard({ plan, currentPlan, onUpgrade }) {
  const Icon = plan.icon;
  const isCurrent = currentPlan === plan.name;
  const currentLevel = plans.findIndex((p) => p.name === currentPlan);
  const thisLevel = plans.findIndex((p) => p.name === plan.name);
  const isDowngrade = thisLevel < currentLevel;
  const btnLabel = isCurrent ? "Current Plan" : isDowngrade ? `Downgrade to ${plan.name}` : `Upgrade to ${plan.name}`;
  const accentColor = plan.accent === "blue" ? "border-blue-600" : plan.accent === "violet" ? "border-violet-600" : "";
  const accentBg = plan.accent === "blue" ? "bg-blue-600 hover:bg-blue-700" : plan.accent === "violet" ? "border border-violet-600 text-violet-600 hover:bg-violet-50" : "bg-slate-100 text-slate-500 hover:bg-slate-200";

  return (
    <div className={`relative flex min-h-[520px] flex-col rounded-2xl bg-white p-6 shadow-sm ${isCurrent ? "border-2 border-emerald-500 ring-2 ring-emerald-200" : plan.popular && !isCurrent ? `border-2 ${accentColor}` : "border border-slate-200"}`}>
      {plan.popular && !isCurrent && <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-5 py-1 text-sm font-bold text-white"><Star className="mr-1 inline h-3 w-3 fill-white" />Most Popular</div>}
      {isCurrent && <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-5 py-1 text-sm font-bold text-white">✓ Active Plan</div>}
      <div className="mb-5 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${plan.accent === "blue" ? "text-blue-600" : plan.accent === "violet" ? "text-violet-600" : "text-slate-500"}`} />
        <div><h3 className="text-xl font-extrabold">{plan.name}</h3><p className="mt-1 text-sm text-slate-400">{plan.subtitle}</p></div>
      </div>
      <div className="mb-7"><span className="text-4xl font-extrabold">₱{plan.price}</span><span className="ml-1 text-slate-400">/month</span></div>
      <ul className="space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-700"><Check className={`mt-0.5 h-4 w-4 ${plan.accent === "violet" ? "text-violet-600" : plan.accent === "blue" ? "text-blue-600" : "text-slate-500"}`} />{f}</li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <Button variant={isCurrent ? "ghost" : plan.accent === "blue" ? "primary" : plan.accent === "violet" ? "secondary" : "ghost"} className={`w-full ${isCurrent ? "bg-emerald-50 text-emerald-600" : ""} ${!isCurrent && plan.accent === "violet" ? "border-violet-600 text-violet-600" : ""}`}
          disabled={isCurrent} onClick={() => onUpgrade(plan.name)}>{btnLabel}</Button>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  const { user, updateUser } = useAuth();
  const currentPlan = user?.subscription || "Free";

  const handleUpgrade = (planName) => {
    if (planName === currentPlan) return;
    if (window.confirm(`Switch to ${planName} plan?`)) updateUser({ subscription: planName });
  };

  return (
    <div className="space-y-9">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600"><Crown className="h-9 w-9" /></div>
        <h1 className="mt-6 text-2xl font-extrabold md:text-3xl">Upgrade to Premium</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 md:text-base">Get priority service, extended warranties, and exclusive benefits with our premium plans</p>
        <button className="mt-8 rounded-xl bg-white px-7 py-3 text-sm font-bold shadow-sm">Monthly</button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => <PlanCard key={plan.name} plan={plan} currentPlan={currentPlan} onUpgrade={handleUpgrade} />)}
      </div>
    </div>
  );
}
