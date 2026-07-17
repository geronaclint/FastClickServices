import { useEffect, useState } from "react";
import { Mail, MapPin, Moon, Phone, Save, Sun, UserRound, X, Camera } from "lucide-react";
import { getProfile, updateProfile } from "../../services/profileService";
import { updateUserLocal } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../../components/shared/Button";
import Toggle from "../../components/shared/Toggle";
import SegmentedControl from "../../components/shared/SegmentedControl";
import Input from "../../components/shared/Input";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { buyerTheme, setBuyerTheme, resolvedBuyer } = useTheme();
  const isDarkMode = resolvedBuyer === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "", address: "", photo: "" });

  useEffect(() => {
    const photoKey = `profilePhoto_${user?.id || "default"}`;
    const savedPhoto = localStorage.getItem(photoKey) || "";
    getProfile().then((res) => {
      if (res.success) setProfile({ fullName: res.data.full_name || "", email: res.data.email || "", phone: res.data.phone || "", address: res.data.address || "", photo: savedPhoto });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setProfile((p) => ({ ...p, photo: r.result })); r.readAsDataURL(file); }
  };

  const handleSave = async () => {
    setSaveMsg("");
    try {
      const { photo, email, ...data } = profile;
      const res = await updateProfile(data);
      const photoKey = `profilePhoto_${user?.id || "default"}`;
      if (profile.photo) localStorage.setItem(photoKey, profile.photo);
      if (res.success) {
        setIsEditing(false); setSaveMsg("Profile updated!");
        updateUserLocal({ fullName: profile.fullName });
        updateUser({ fullName: profile.fullName, photo: profile.photo });
      } else setSaveMsg(res.message || "Update failed.");
    } catch { setSaveMsg("Cannot connect to backend."); }
  };

  const themeOptions = [
    { value: "light", label: "☀️ Light" },
    { value: "dark", label: "🌙 Dark" },
    { value: "system", label: "💻 System" },
  ];

  if (loading) return <div className="p-10 text-center text-slate-400">Loading profile...</div>;

  const initials = profile.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold md:text-4xl">Profile Settings</h1>
        <p className="mt-2 text-sm text-slate-500 md:text-lg">Manage your account information and preferences</p>
      </div>

      {saveMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold ${saveMsg.includes("updated") ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-600"}`}>{saveMsg}</div>
      )}

      {/* Appearance */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Sun className="h-6 w-6" /></div>
            <div><h2 className="text-lg font-extrabold md:text-2xl">Appearance</h2><p className="text-sm text-slate-500">Theme preference</p></div>
          </div>
          <SegmentedControl options={themeOptions} value={buyerTheme} onChange={setBuyerTheme} />
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-extrabold md:text-2xl">Personal Information</h2><p className="text-sm text-slate-500">Update your personal details and photo</p></div>
          {!isEditing && <Button iconLeft={Camera} onClick={() => setIsEditing(true)}>Edit Profile</Button>}
        </div>

        <div className="space-y-6 p-6">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0">
              {profile.photo ? <img src={profile.photo} alt="" className="h-full w-full rounded-full object-cover ring-4 ring-slate-100" />
                : <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">{initials}</div>}
              {isEditing && <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md"><Camera className="h-3.5 w-3.5" /><input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label>}
            </div>
            <div><h3 className="font-bold">Profile Photo</h3><p className="text-sm text-slate-400">{isEditing ? "Click the camera icon to upload." : "Your avatar."}</p></div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Full Name" icon={UserRound} value={profile.fullName} disabled={!isEditing} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
            <Input label="Email Address" icon={Mail} value={profile.email} disabled helperText="Email cannot be changed" />
            <Input label="Phone Number" icon={Phone} value={profile.phone} disabled={!isEditing} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </div>

          <Input label="Address" icon={MapPin} value={profile.address} disabled={!isEditing} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />

          {isEditing && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button iconLeft={Save} onClick={handleSave} className="flex-1">Save Changes</Button>
              <Button variant="secondary" iconLeft={X} onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
