import BuyerHeader from "./BuyerHeader";
import BuyerSidebar from "./BuyerSidebar";

export default function BuyerLayout({
  children,
  currentPage,
  setPage,
  onLogout,
  isDarkMode,
  user,
}) {
  return (
    <div
      className={`min-h-screen transition ${
        isDarkMode
          ? "dark-mode bg-slate-950 text-white"
          : "bg-[#edf3ff] text-slate-950"
      }`}
    >
      <BuyerSidebar
        currentPage={currentPage}
        setPage={setPage}
        onLogout={onLogout}
        user={user}
      />

      <div className="ml-[260px] min-h-screen">
        <BuyerHeader isDarkMode={isDarkMode} user={user} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
