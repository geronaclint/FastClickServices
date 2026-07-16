import { Check, Crown, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    subtitle: "Basic access for individual sellers",
    price: "0",
    icon: Star,
    accent: "slate",
    features: [
      "Manage incoming requests",
      "Basic ticket handling",
      "Standard dashboard",
      "Email support",
    ],
  },
  {
    name: "Professional",
    subtitle: "For growing service businesses",
    price: "299",
    icon: Zap,
    accent: "orange",
    popular: true,
    features: [
      "Everything in Free",
      "Analytics Dashboard (Premium)",
      "PDF & CSV Exporting",
      "Performance Insights",
      "Priority Seller Support",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For large scale agencies",
    price: "999",
    icon: Crown,
    accent: "blue",
    features: [
      "Everything in Professional",
      "Advanced Custom Analytics",
      "Quarterly Business Reviews",
      "Dedicated Account Manager",
      "White-glove onboarding",
    ],
  },
];

function PlanCard({ plan, currentPlan, onUpgrade }) {
  const Icon = plan.icon;
  const isOrange = plan.accent === "orange";
  const isBlue = plan.accent === "blue";
  const isCurrent = currentPlan === plan.name;

  const currentLevel = plans.findIndex((p) => p.name === currentPlan);
  const thisLevel = plans.findIndex((p) => p.name === plan.name);
  const isDowngrade = thisLevel < currentLevel;

  const buttonLabel = isCurrent
    ? "Current Plan"
    : isDowngrade
    ? `Downgrade to ${plan.name}`
    : `Upgrade to ${plan.name}`;

  return (
    <div
      className={`relative flex min-h-[520px] flex-col rounded-2xl bg-white p-6 shadow-sm ${
        isCurrent
          ? "border-2 border-emerald-500 ring-2 ring-emerald-200"
          : isOrange
          ? "border-2 border-orange-500"
          : "border border-slate-200"
      }`}
    >
      {plan.popular && !isCurrent && (
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-orange-500 px-5 py-1 text-sm font-bold text-white">
          <Star className="h-3 w-3 fill-white" />
          Most Popular
        </div>
      )}

      {isCurrent && (
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-emerald-500 px-5 py-1 text-sm font-bold text-white">
          ✓ Active Plan
        </div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <Icon
          className={`h-5 w-5 ${
            isOrange ? "text-orange-500" : isBlue ? "text-blue-600" : "text-slate-500"
          }`}
        />
        <div>
          <h3 className="text-xl font-extrabold">{plan.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{plan.subtitle}</p>
        </div>
      </div>

      <div className="mb-7">
        <span className="text-4xl font-extrabold">₱{plan.price}</span>
        <span className="ml-1 text-slate-400">/month</span>
      </div>

      <ul className="space-y-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-slate-700">
            <Check
              className={`mt-0.5 h-4 w-4 ${
                isOrange ? "text-orange-500" : isBlue ? "text-blue-600" : "text-slate-500"
              }`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <button
          type="button"
          disabled={isCurrent}
          onClick={() => onUpgrade(plan.name)}
          className={`w-full rounded-xl py-4 font-bold transition ${
            isCurrent
              ? "bg-emerald-50 text-emerald-600 cursor-default"
              : isOrange
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : isBlue
              ? "border border-blue-600 text-blue-600 hover:bg-blue-50"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default function AdvancedSubscription({ user, onUpgrade }) {
  const currentPlan = user?.subscription || "Free";

  const handleUpgrade = (planName) => {
    if (planName === currentPlan) return;
    const action =
      plans.findIndex((p) => p.name === planName) < plans.findIndex((p) => p.name === currentPlan)
        ? "Downgrade"
        : "Upgrade";

    if (window.confirm(`${action} to ${planName} plan? Your dashboard will update immediately.`)) {
      onUpgrade(planName);
    }
  };

  return (
    <div className="space-y-9 max-w-6xl mx-auto py-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
          <Crown className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Advanced Subscription</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-500">
          Unlock analytics, advanced exporting features, and priority support for your provider account.
        </p>

        <div className="mt-8 inline-flex items-center gap-4">
          <button className="rounded-xl bg-white px-7 py-3 font-bold shadow-sm">Monthly</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>
    </div>
  );
}
