import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, FileText, MapPin, Phone, User, UserCheck, Wrench } from "lucide-react";
import { createServiceRequest } from "../../services/serviceRequestService";
import { useAuth } from "../../contexts/AuthContext";
import { getPriorityOptions } from "../../hooks/useServiceForm";
import Button from "../../components/shared/Button";
import Input from "../../components/shared/Input";
import Select from "../../components/shared/Select";
import TextArea from "../../components/shared/TextArea";
import FieldWrap from "../../components/shared/FieldWrap";

const commonLocations = [
  "Quezon City, Metro Manila", "Manila City, Metro Manila", "Makati City, Metro Manila",
  "Taguig City, Metro Manila", "Pasig City, Metro Manila", "Cebu City, Cebu",
  "Davao City, Davao del Sur", "Baguio City, Benguet",
];

export default function InstallationPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const priorityOptions = getPriorityOptions(subscription);
  const isLocked = priorityOptions.length <= 1;

  const [form, setForm] = useState({ serviceType: "", priority: "Normal", location: "", contactPerson: "", phone: "", date: "", time: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleLocationChange = (value) => {
    update("location", value);
    if (value.length >= 2) {
      const filtered = commonLocations.filter((l) => l.toLowerCase().includes(value.toLowerCase()));
      setLocationSuggestions(filtered.slice(0, 5));
      setShowLocationDropdown(filtered.length > 0);
    } else setShowLocationDropdown(false);
  };

  const selectLocation = (loc) => { update("location", loc); setShowLocationDropdown(false); };

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
      const result = await createServiceRequest(form);
      if (result.success) {
        setMessage("success");
        setForm({ serviceType: "", priority: "Normal", location: "", contactPerson: "", phone: "", date: "", time: "", description: "" });
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 md:h-14 md:w-14">
          <Wrench className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 md:text-3xl">Service Request</h1>
          <p className="text-sm text-slate-500">Request installation, maintenance, or technical support</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-extrabold md:text-2xl">New Service Request</h2>
        <p className="mt-2 text-sm text-slate-500">Fill in the details below to request a service</p>

        {message && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${message === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-600"}`}>
            {message === "success" ? "Service request submitted successfully!" : message}
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="Service Type" required options={["Installation", "Maintenance", "Repair"]} placeholder="Select service type" value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)} />
            <div>
              <Select label="Priority Level" required options={priorityOptions} value={form.priority} onChange={(e) => update("priority", e.target.value)} disabled={isLocked} />
              {isLocked && <p className="mt-1 text-xs text-slate-400">🔒 Upgrade to unlock more priorities</p>}
            </div>
          </div>

          <div className="relative">
            <Input label="Service Location" required icon={MapPin} placeholder="Enter the address where service is needed" value={form.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => { if (form.location.length >= 2) { const f = commonLocations.filter((l) => l.toLowerCase().includes(form.location.toLowerCase())); if (f.length > 0) { setLocationSuggestions(f.slice(0,5)); setShowLocationDropdown(true); } } }}
              onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)} />
            {showLocationDropdown && locationSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {locationSuggestions.map((loc) => (
                  <li key={loc}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectLocation(loc)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-blue-50"><MapPin className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" /><span>{loc}</span></button></li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Input label="Contact Person" icon={User} placeholder="Name of on-site contact" value={form.contactPerson}
                onChange={(e) => update("contactPerson", e.target.value.replace(/[0-9]/g, ""))} error={errors.contactPerson}
                helper={user?.fullName ? <button type="button" onClick={() => update("contactPerson", user.fullName)} className="text-xs font-semibold text-blue-600 hover:text-blue-700"><UserCheck className="mr-1 inline h-3 w-3" />Autofill my name</button> : null} />
            </div>
            <Input label="Contact Phone" icon={Phone} placeholder="0912 365 6095" value={form.phone}
              onChange={(e) => update("phone", formatPhone(e.target.value))} inputMode="numeric" error={errors.phone} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Preferred Date" required type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => update("date", e.target.value)} />
            <Select label="Preferred Time" icon={Clock3} options={["Morning", "Afternoon", "Evening"]} placeholder="Select time slot" value={form.time} onChange={(e) => update("time", e.target.value)} />
          </div>

          <TextArea label="Service Description" required placeholder="Describe the service you need in detail (minimum 3 words)..." rows={4} value={form.description}
            onChange={(e) => update("description", e.target.value)} error={errors.description} showCharCount />

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 md:p-5">
            <p className="mb-3 font-extrabold text-blue-600">What happens next?</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {["Our team will review your request within 2 hours", "You'll receive a confirmation call to schedule the service", "A qualified technician will be assigned to your request", "You'll get real-time updates on the service status"].map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" loading={loading} className="flex-1">Submit Request</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
