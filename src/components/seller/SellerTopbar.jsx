import { Sun, Moon } from "lucide-react";
import SellerNotificationDropdown from "./SellerNotificationDropdown";

export default function SellerTopbar({ isDarkMode, toggleDarkMode }) {
  return (
    <div
      className={`fixed left-[245px] right-0 top-0 z-10 flex h-[66px] items-center justify-between border-b px-7 transition ${
        isDarkMode
          ? "border-slate-700 bg-slate-900 text-white"
          : "border-orange-100 bg-white text-slate-950"
      }`}
    >
      <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>
        Seller Dashboard —{" "}
        <span className={isDarkMode ? "font-bold text-white" : "font-bold text-slate-950"}>
          TechKing Store
        </span>
      </p>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`flex h-10 w-16 items-center rounded-full p-1 transition ${
            isDarkMode ? "bg-orange-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition ${
              isDarkMode ? "translate-x-6 text-orange-500" : "translate-x-0 text-slate-500"
            }`}
          >
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
          </span>
        </button>

        <SellerNotificationDropdown isDarkMode={isDarkMode} />

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
          TK
        </div>
      </div>
    </div>
  );
}
