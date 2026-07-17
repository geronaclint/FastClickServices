import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Phone, Ticket, User, UserCheck } from "lucide-react";
import { createTicket } from "../../services/ticketService";
import { useAuth } from "../../contexts/AuthContext";
import { getPriorityOptions } from "../../hooks/useServiceForm";
import Button from "../../components/shared/Button";
import Input from "../../components/shared/Input";
import Select from "../../components/shared/Select";
import TextArea from "../../components/shared/TextArea";

export default function TicketPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const priorityOptions = getPriorityOptions(subscription);
  const isLocked = priorityOptions.length <= 1;

  const [form, setForm] = useState({ ticketType: "", priority: "Normal", contactPerson: "", phone: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (form.contactPerson && /\d/.test(form.contactPerson)) errs.contactPerson = "Name should not contain numbers.";
    if (form.phone && /[^\d\s]/.test(form.phone.replace(/\s/g, ""))) errs.phone = "Phone should contain only numbers.";
    const wc = (form.description || "").trim().split(/\s+/).filter(Boolean).length;
    if (wc < 3) errs.description = `Description needs at least 3 words (currently ${wc}).`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMessage("");
    try {
      const result = await createTicket(form);
      if (result.success) {
        setMessage("success");
        setForm({ ticketType: "", priority: "Normal", contactPerson: "", phone: "", description: "" });
        setTimeout(() => navigate("/recent"), 800);
      } else setMessage(result.message || "Failed to submit.");
    } catch { setMessage("Cannot connect to backend server."); }
    finally { setLoading(false); }
  };

  const formatPhone = (raw) => {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0,4)} ${d.slice(4)}`;
    return `${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={() => navigate("/dashboard")} className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="mb-7 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 md:h-14 md:w-14">
          <Ticket className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 md:text-3xl">Ticket Request</h1>
          <p className="text-sm text-slate-500">Request installation, maintenance, or technical support</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-extrabold md:text-2xl">New Ticket Request</h2>
        <p className="mt-2 text-sm text-slate-500">Fill in the details below</p>

        {message && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${message === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-600"}`}>
            {message === "success" ? "Ticket submitted successfully!" : message}
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="Ticket Type" required options={["Technical Support", "Hardware Malfunction", "Software Error", "Warranty Claim"]} placeholder="Select ticket type" value={form.ticketType} onChange={(e) => update("ticketType", e.target.value)} />
            <div>
              <Select label="Priority Level" required options={priorityOptions} value={form.priority} onChange={(e) => update("priority", e.target.value)} disabled={isLocked} />
              {isLocked && <p className="mt-1 text-xs text-slate-400">🔒 Upgrade to unlock more priorities</p>}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Contact Person" icon={User} placeholder="Name of on-site contact" value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value.replace(/[0-9]/g, ""))} error={errors.contactPerson}
              helper={user?.fullName ? <button type="button" onClick={() => update("contactPerson", user.fullName)} className="text-xs font-semibold text-blue-600"><UserCheck className="mr-1 inline h-3 w-3" />Autofill my name</button> : null} />
            <Input label="Contact Phone" icon={Phone} placeholder="0912 365 6095" value={form.phone}
              onChange={(e) => update("phone", formatPhone(e.target.value))} inputMode="numeric" error={errors.phone} />
          </div>

          <TextArea label="Service Description" required placeholder="Describe the service you need in detail (minimum 3 words)..." rows={4} value={form.description}
            onChange={(e) => update("description", e.target.value)} error={errors.description} showCharCount />

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 md:p-5">
            <p className="mb-3 font-extrabold text-orange-600">What happens next?</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {["Our team will review your request within 24 hours", "A qualified technician will be assigned to your request", "You'll get real-time updates on the ticket status"].map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" loading={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">Submit Ticket</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
