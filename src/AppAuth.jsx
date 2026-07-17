import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import {
  Bolt,
  Wrench,
  ShieldCheck,
  Headphones,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Store,
  ShoppingBag,
} from "lucide-react";
// Auth logic now uses useAuth() context

const featureItems = [
  {
    title: "Expert Installation",
    subtitle: "Certified technicians for all electronics",
    icon: Wrench,
  },
  {
    title: "Warranty Support",
    subtitle: "Extended coverage and claim management",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Support",
    subtitle: "Round-the-clock technical assistance",
    icon: Headphones,
  },
];

function AuthBrandPanel() {
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  const handleSecretClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 2000);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      window.history.pushState({}, "", "/seller-login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#112b52] px-14 py-12 text-white lg:flex lg:w-[52%] lg:flex-col">
      <div className="pointer-events-none absolute -bottom-40 -left-36 h-[420px] w-[420px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -top-28 right-[-120px] h-[480px] w-[480px] rounded-full bg-blue-500/10" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
          <Bolt className="h-8 w-8" />
        </div>

        <div>
          <h1 onClick={handleSecretClick} className="cursor-default text-3xl font-extrabold tracking-wide select-none">SURE SERVE</h1>
          <p className="tracking-[0.16em] text-sky-200">
            ELECTRONICS SERVICE PROVIDER
          </p>
        </div>
      </div>

      <div className="relative mt-32 max-w-3xl">
        <h2 className="text-5xl font-extrabold leading-tight">
          Your Trusted Electronics{" "}
          <span className="text-orange-500">Service Partner</span>
        </h2>

        <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-blue-100">
          Fast, reliable, and professional electronics installation, repair, and
          support — delivered right to your door.
        </p>

        <div className="mt-12 space-y-6">
          {featureItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-6 rounded-2xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/40 text-blue-300">
                  <Icon className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-lg font-bold">{item.title}</p>
                  <p className="text-blue-200">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="relative mt-auto text-blue-300">
        © 2026 SureServe. All rights reserved.
      </p>
    </section>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-3 block font-semibold text-slate-800">{label}</label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

function ForgotPasswordScreen({ isSellerPortal, form, setForm, onBack }) {
  const resetColor = isSellerPortal ? "orange" : "blue";

  const handleResetSubmit = (event) => {
    event.preventDefault();

    setForm({
      ...form,
      resetSent: true,
    });
  };

  if (form.resetSent) {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl shadow-slate-300/60">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>

        <h2 className="mt-8 text-3xl font-extrabold text-slate-950">
          Check Your Email
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-slate-500">
          We&apos;ve sent password reset instructions to{" "}
          <span className="font-bold text-slate-900">{form.resetEmail}</span>
        </p>

        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 text-slate-600">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                resetEmail: "",
                resetSent: false,
              })
            }
            className="font-bold text-blue-600"
          >
            try another email address.
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm({
              ...form,
              resetEmail: "",
              resetSent: false,
            });
            onBack();
          }}
          className={`mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-xl font-bold text-white shadow-xl ${
            resetColor === "orange"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200"
              : "bg-gradient-to-r from-blue-500 to-blue-700 shadow-blue-200"
          }`}
        >
          <ArrowLeft className="h-6 w-6" />
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-xl shadow-slate-300/60">
      <h2 className="text-3xl font-extrabold text-slate-950">
        {isSellerPortal ? "Seller Password Reset" : "Reset Password"}
      </h2>

      <p className="mt-3 text-lg text-slate-500">
        {isSellerPortal
          ? "Enter your seller/admin account email"
          : "Enter your buyer account email"}
      </p>

      <form onSubmit={handleResetSubmit} className="mt-8 space-y-7">
        <Field label="Email Address" icon={Mail}>
          <input
            required
            type="email"
            value={form.resetEmail}
            onChange={(event) =>
              setForm({
                ...form,
                resetEmail: event.target.value,
              })
            }
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </Field>

        <button
          type="submit"
          className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-xl font-bold text-white shadow-xl ${
            resetColor === "orange"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200"
              : "bg-gradient-to-r from-blue-500 to-blue-700 shadow-blue-200"
          }`}
        >
          Send Reset Link
          <ArrowRight className="h-6 w-6" />
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className={`font-bold ${
              resetColor === "orange" ? "text-orange-500" : "text-blue-600"
            }`}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AppAuth({ portalType = "buyer" }) {
  const navigate = useNavigate();
  const { login: authLogin, register: authRegister } = useAuth();
  const [mode, setMode] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    resetEmail: "",
    resetSent: false,
  });

  const isLogin = mode === "login";
  const isSellerPortal = portalType === "seller";

  const resetMessage = () => setAuthMessage("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthMessage("");

    try {
      let result;

      if (isSellerPortal) {
        result = await authLogin({
          email: form.email,
          password: form.password,
          portalType: "seller",
        });

        if (!result.success) {
          setAuthMessage(result.message || "Seller login failed.");
          return;
        }

        navigate("/seller-dashboard", { replace: true });
        return;
      }

      if (isLogin) {
        result = await authLogin({
          email: form.email,
          password: form.password,
          portalType: "buyer",
        });

        if (!result.success) {
          setAuthMessage(result.message || "Login failed.");
          return;
        }

        navigate("/dashboard", { replace: true });
        return;
      }

      result = await authRegister({
        fullName: form.name,
        email: form.email,
        password: form.password,
      });

      if (!result.success) {
        setAuthMessage(result.message || "Registration failed.");
        return;
      }

      setAuthMessage("Account created successfully. You can now sign in.");
      setMode("login");
      setForm({
        ...form,
        name: "",
        password: "",
      });
    } catch (error) {
      setAuthMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] lg:flex">
      <AuthBrandPanel />

      <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
        {showForgotPassword ? (
          <ForgotPasswordScreen
            isSellerPortal={isSellerPortal}
            form={form}
            setForm={setForm}
            onBack={() => {
              setShowForgotPassword(false);
              setForm({
                ...form,
                resetSent: false,
              });
            }}
          />
        ) : (
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-300/60 sm:p-10">
            {!isSellerPortal && (
              <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    resetMessage();
                  }}
                  className={`rounded-xl py-4 text-lg font-bold transition ${
                    isLogin
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-300"
                      : "text-slate-500"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    resetMessage();
                  }}
                  className={`rounded-xl py-4 text-lg font-bold transition ${
                    !isLogin
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-300"
                      : "text-slate-500"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="mt-12">
              <h2 className="text-3xl font-extrabold text-slate-950">
                {isSellerPortal
                  ? "Admin Portal"
                  : isLogin
                  ? "Welcome back!"
                  : "Get started"}
              </h2>

              <p className="mt-3 text-lg text-slate-500">
                {isSellerPortal
                  ? "Sign in to manage SureServe requests and services"
                  : isLogin
                  ? "Sign in to your SureServe account"
                  : "Create your SureServe account today"}
              </p>
            </div>

            {authMessage && (
              <div
                className={`mt-6 rounded-2xl px-5 py-4 text-sm font-bold ${
                  authMessage.includes("successfully")
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {authMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-7">
              {!isSellerPortal && !isLogin && (
                <Field label="Full Name" icon={User}>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="John Smith"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
              )}

              <Field label="Email Address" icon={Mail}>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </Field>

              <Field label="Password" icon={Lock}>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      password: event.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-14 pr-14 text-lg outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </Field>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        resetEmail: form.email,
                        resetSent: false,
                      });
                      setShowForgotPassword(true);
                    }}
                    className={`font-bold ${
                      isSellerPortal ? "text-orange-500" : "text-blue-600"
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-xl font-bold text-white shadow-xl transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  isLogin
                    ? isSellerPortal
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200"
                      : "bg-gradient-to-r from-blue-500 to-blue-700 shadow-blue-200"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200"
                }`}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                {!loading && <ArrowRight className="h-6 w-6" />}
              </button>

              {!isSellerPortal && (
                <p className="text-center text-slate-500">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(isLogin ? "register" : "login");
                      resetMessage();
                    }}
                    className="font-bold text-blue-600"
                  >
                    {isLogin ? "Create one" : "Sign in"}
                  </button>
                </p>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}