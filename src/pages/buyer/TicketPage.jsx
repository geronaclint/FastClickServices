import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Phone, Ticket, User, UserCheck } from "lucide-react";
import { createTicket } from "../../services/ticketService";
import { useAuth } from "../../contexts/AuthContext";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100";

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getPriorityOptions(subscription) {
  const plan = (subscription || "Free").toLowerCase();
  if (plan === "enterprise") return ["Low", "Normal", "High", "Urgent"];
  if (plan === "professional" || plan === "premium") return ["Low", "Normal", "High"];
  return ["Low", "Normal"];
}

function FieldWrap({ label, required, icon: Icon, children, extra }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-900">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
        {extra}
      </div>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        {children}
      </div>
    </div>
  );
}

export default function TicketPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const priorityOptions = getPriorityOptions(subscription);

  const [form, setForm] = useState({
    ticketType: "",
    priority: "Normal",
    contactPerson: "",
    phone: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    if (/\d/.test(form.contactPerson)) {
      errs.contactPerson = "Name should not contain numbers.";
    }

    if (form.phone && /[^\d\s]/.test(form.phone.replace(/\s/g, ""))) {
      errs.phone = "Phone should contain only numbers.";
    }

    const wc = wordCount(form.description);
    if (wc < 3) {
      errs.description = `Description needs at least 3 words (currently ${wc}).`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await createTicket(form);

      if (result.success) {
        setMessage("Ticket submitted successfully!");
        setForm({ ticketType: "", priority: "Normal", contactPerson: "", phone: "", description: "" });
        setTimeout(() => navigate("/recent"), 800);
      } else {
        setMessage(result.message || "Failed to submit ticket.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-5 flex items-center gap-2 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="mb-7 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
          <Ticket className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Ticket Request</h1>
          <p className="text-slate-500">
            Request installation, maintenance, or technical support
          </p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold">New Ticket Request</h2>
        <p className="mt-2 text-slate-500">
          Fill in the details below to request a service
        </p>

        {message && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
              message.includes("successfully")
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FieldWrap label="Ticket Type" required>
              <select
                className={fieldClass}
                value={form.ticketType}
                onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
              >
                <option value="">Select ticket type</option>
                <option>Technical Support</option>
                <option>Hardware Malfunction</option>
                <option>Software Error</option>
                <option>Warranty Claim</option>
              </select>
            </FieldWrap>

            <FieldWrap
              label="Priority Level"
              required
              extra={
                priorityOptions.length === 1 && (
                  <span className="ml-auto rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    🔒 Upgrade to unlock
                  </span>
                )
              }
            >
              <select
                className={fieldClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                disabled={priorityOptions.length === 1}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </FieldWrap>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FieldWrap
              label="Contact Person"
              icon={User}
              extra={
                user?.fullName && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, contactPerson: user.fullName })}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                  >
                    <UserCheck className="h-3 w-3" />
                    Autofill my name
                  </button>
                )
              }
            >
              <input
                className={`${fieldClass} pl-11`}
                placeholder="Name of on-site contact"
                value={form.contactPerson}
                onChange={(e) => {
                  const val = e.target.value.replace(/[0-9]/g, "");
                  setForm({ ...form, contactPerson: val });
                }}
              />
              {errors.contactPerson && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.contactPerson}</p>
              )}
            </FieldWrap>

            <FieldWrap label="Contact Phone" icon={Phone}>
              <input
                className={`${fieldClass} pl-11`}
                placeholder="0912 365 6095"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: formatPhone(e.target.value) });
                }}
                inputMode="numeric"
              />
              {errors.phone && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.phone}</p>
              )}
            </FieldWrap>
          </div>

          <FieldWrap label="Service Description" required icon={FileText}>
            <textarea
              className={`${fieldClass} h-32 resize-none pl-11`}
              placeholder="Describe the service you need in detail (minimum 3 words)..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-xs font-semibold text-red-500">{errors.description}</p>
              ) : (
                <p className="text-xs text-slate-400">Minimum 3 words required</p>
              )}
              <span className={`text-xs font-semibold ${wordCount(form.description) >= 3 ? "text-emerald-500" : "text-slate-400"}`}>
                {wordCount(form.description)} / 3 words
              </span>
            </div>
          </FieldWrap>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
            <p className="mb-3 font-extrabold text-orange-600">What happens next?</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {[
                "Our team will review your request within 24 hours",
                "A qualified technician will be assigned to your request",
                "You'll get real-time updates on the ticket status",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white px-7 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
