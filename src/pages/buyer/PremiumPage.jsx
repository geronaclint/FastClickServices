import { Check, Crown, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    subtitle: "For individuals getting started",
    price: "0",
    icon: Star,
    accent: "slate",
    features: [
      "Up to 3 requests per week (service & support)",
      "Basic support ticket system",
      "Standard delivery (5–7 days)",
      "Email support",
      "Basic warranty coverage",
    ],
  },
  {
    name: "Premium",
    subtitle: "For growing businesses",
    price: "149",
    icon: Zap,
    accent: "blue",
    popular: true,
    features: [
      "Unlimited orders",
      "Priority support tickets (Up to High)",
      "Express delivery (2–3 days)",
      "24/7 phone & email support",
      "Extended warranty (2 years)",
      "Dedicated account manager",
      "Analytics Dashboard (Premium)",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For large organizations",
    price: "499",
    icon: Crown,
    accent: "violet",
    features: [
      "Everything in Premium",
      "Custom service SLAs",
      "Priority technician assignment (incl. Urgent)",
      "Lifetime warranty coverage",
      "Custom integration support",
      "Quarterly business reviews",
      "Advanced Analytics & Reports",
      "White-glove onboarding",
    ],
  },
];

function PlanCard({ plan, currentPlan, onUpgrade }) {
  const Icon = plan.icon;
  const isBlue = plan.accent === "blue";
  const isViolet = plan.accent === "violet";
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
          : isBlue
          ? "border-2 border-blue-600"
          : "border border-slate-200"
      }`}
    >
      {plan.popular && !isCurrent && (
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-blue-600 px-5 py-1 text-sm font-bold text-white">
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
            isBlue ? "text-blue-600" : isViolet ? "text-violet-600" : "text-slate-500"
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
                isViolet ? "text-violet-600" : isBlue ? "text-blue-600" : "text-slate-500"
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
              : isBlue
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : isViolet
              ? "border border-violet-600 text-violet-600 hover:bg-violet-50"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default function PremiumPage({ user, onUpgrade }) {
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
    <div className="space-y-9">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <Crown className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Upgrade to Premium</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-500">
          Get priority service, extended warranties, and exclusive benefits with our
          premium plans
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

      {/* FAQ / support section can be added here */}
    </div>
  );
}
