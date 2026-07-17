import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Moon,
  PenLine,
  Phone,
  Save,
  Sun,
  UserRound,
  X,
  Camera,
} from "lucide-react";
import { getProfile, updateProfile } from "../../services/profileService";
import { updateUserLocal } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { buyerTheme, setBuyerTheme, resolvedBuyer } = useTheme();
  const isDarkMode = resolvedBuyer === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });

  useEffect(() => {
    const photoKey = `profilePhoto_${user?.id || 'default'}`;
    const savedPhoto = localStorage.getItem(photoKey) || "";
    
    getProfile()
      .then((res) => {
        if (res.success) {
          setProfile({
            fullName: res.data.full_name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
            photo: savedPhoto,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cardClass = isDarkMode
    ? "border border-slate-700 bg-slate-900 shadow-slate-950/40"
    : "border border-slate-200 bg-white shadow-slate-300/40";

  const inputClass = isDarkMode
    ? "w-full rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:text-slate-300"
    : "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:text-slate-700";

  const labelClass = isDarkMode ? "text-slate-200" : "text-slate-700";

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveMessage("");
    try {
      // Don't send the large base64 photo string to the backend to avoid payload too large errors
      const { photo, ...profileData } = profile;
      // Never send email — it's read-only
      delete profileData.email;
      const res = await updateProfile(profileData);
      
      // Save photo to local storage (frontend only) using user-specific key
      const photoKey = `profilePhoto_${user?.id || 'default'}`;
      if (profile.photo) {
        localStorage.setItem(photoKey, profile.photo);
      }
      
      if (res.success) {
        setIsEditing(false);
        setSaveMessage("Profile updated successfully!");

        // Also update localStorage user data
        updateUserLocal({ fullName: profile.fullName });
        updateUser({ fullName: profile.fullName, photo: profile.photo });
      } else {
        setSaveMessage(res.message || "Update failed.");
      }
    } catch {
      setSaveMessage("Cannot connect to backend server.");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading profile...</div>;
  }
  
  const initials = profile.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold">Profile Settings</h1>
        <p className={`mt-3 text-lg ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Manage your account information and preferences
        </p>
      </div>

      {saveMessage && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-bold ${
            saveMessage.includes("successfully")
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {saveMessage}
        </div>
      )}

      <section className={`rounded-3xl p-8 shadow-md ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                isDarkMode ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isDarkMode ? <Moon className="h-8 w-8" /> : <Sun className="h-8 w-8" />}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold">Appearance</h2>
              <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
                Currently using {isDarkMode ? "dark" : "light"} mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBuyerTheme(isDarkMode ? "light" : "dark")}
            className={`relative h-12 w-20 rounded-full p-1 transition ${
              isDarkMode ? "bg-blue-600" : "bg-slate-300"
            }`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`block h-10 w-10 rounded-full bg-white shadow transition ${
                isDarkMode ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      <section className={`overflow-hidden rounded-3xl shadow-md ${cardClass}`}>
        <div
          className={`flex items-center justify-between border-b p-8 ${
            isDarkMode ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <div>
            <h2 className="text-2xl font-extrabold">Personal Information</h2>
            <p className={`mt-2 text-lg ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Update your personal details and photo
            </p>
          </div>

          {!isEditing && (
            <button
               type="button"
               onClick={() => setIsEditing(true)}
               className="flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-700"
            >
               <PenLine className="h-6 w-6" />
               Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-7 p-8">
          {/* Photo Upload Section */}
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 flex-shrink-0">
               {profile.photo ? (
                 <img src={profile.photo} alt="Profile" className="h-full w-full rounded-full object-cover shadow-sm ring-4 ring-slate-100" />
               ) : (
                 <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-sm ring-4 ring-slate-100">
                   {initials}
                 </div>
               )}
               {isEditing && (
                 <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700">
                   <Camera className="h-4 w-4" />
                   <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                 </label>
               )}
            </div>
            <div>
               <h3 className="text-lg font-bold">Profile Photo</h3>
               <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {isEditing ? "Click the camera icon to upload a new photo." : "Your profile avatar."}
               </p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <ProfileField
            icon={UserRound}
            label="Full Name"
            value={profile.fullName}
            disabled={!isEditing}
            inputClass={inputClass}
            labelClass={labelClass}
            onChange={(value) => setProfile({ ...profile, fullName: value })}
          />

          <ProfileField
            icon={Mail}
            label="Email Address"
            value={profile.email}
            disabled={true}
            inputClass={inputClass}
            labelClass={labelClass}
            onChange={() => {}}
            hint="Email address cannot be changed"
          />

          <ProfileField
            icon={Phone}
            label="Phone Number"
            value={profile.phone}
            disabled={!isEditing}
            inputClass={inputClass}
            labelClass={labelClass}
            onChange={(value) => setProfile({ ...profile, phone: value })}
          />

          <div>
            <div className="mb-3 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <label className={`font-bold ${labelClass}`}>Address</label>
            </div>

            <textarea
              value={profile.address}
              disabled={!isEditing}
              onChange={(event) => setProfile({ ...profile, address: event.target.value })}
              className={`${inputClass} min-h-[110px] resize-none`}
            />
          </div>

          {isEditing && (
            <div className="grid gap-4 pt-4 md:grid-cols-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-700"
              >
                <Save className="h-5 w-5" />
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold transition ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  disabled,
  inputClass,
  labelClass,
  onChange,
  hint,
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <label className={`font-bold ${labelClass}`}>{label}</label>
        {hint && <span className="ml-auto text-xs text-slate-400">{hint}</span>}
      </div>

      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  );
}
