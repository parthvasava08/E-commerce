import { Link, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

const NAV = [
  {
    label: "Overview",
    items: [{ to: "/", icon: "◆", name: "Dashboard" }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/category", icon: "▤", name: "Categories" },
      { to: "/subcategory", icon: "▥", name: "Subcategories" },
      { to: "/brand", icon: "◈", name: "Brands" },
      { to: "/product", icon: "▦", name: "Products" },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/orders", icon: "⛁", name: "Orders" },
      { to: "/payments", icon: "◐", name: "Payments" },
      { to: "/Coupons", icon: "◍", name: "Coupons" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/Users", icon: "◑", name: "Users" },
      { to: "/Reviews", icon: "★", name: "Reviews" },
      { to: "/Messages", icon: "✉", name: "Messages" },
    ],
  },
];

function Sidebar({ onLogout }) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post("/api/admin/logout");
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      onLogout();
    }
  };

  return (
    <aside className="w-[230px] min-h-screen bg-[#0b0e14] border-r border-[#1e2432] flex flex-col flex-shrink-0 py-[18px] font-sans">
      <div className="flex items-center gap-2.5 px-[18px] pb-[18px] border-b border-[#1e2432] mb-3.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-[#3b6ee8] flex items-center justify-center text-[15px] font-extrabold text-white flex-shrink-0">
          S
        </div>
        <div className="text-[13.5px] font-extrabold text-[#f1f2f6] leading-snug tracking-[0.3px]">
          ADMIN
          <span className="block text-[9.5px] text-[#5b6270] font-semibold tracking-[0.6px]">
            DASHBOARD
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.label} className="px-2.5 mb-1">
            <p className="text-[9.5px] uppercase tracking-[1px] text-[#565d6b] font-bold px-2.5 pt-3 pb-1.5 m-0">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] font-medium no-underline mb-px transition-colors
                    ${
                      active
                        ? "bg-[#1b2436] text-[#5b8cff] font-bold"
                        : "text-[#9aa2b1] hover:bg-[#111623] hover:text-[#e7e9ee]"
                    }`}
                >
                  <span className="w-4 text-center text-[13px]">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 px-[18px] pt-3.5 border-t border-[#1e2432] mt-auto">
        <div className="w-[30px] h-[30px] rounded-lg bg-[#1b2436] text-[#5b8cff] flex items-center justify-center text-xs font-bold flex-shrink-0">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] text-[#e7e9ee] font-bold m-0 truncate">
            Admin
          </p>
          <span className="text-[10.5px] text-[#5b6270]">Store owner</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-bold text-[#f87171] hover:text-[#ff8080] cursor-pointer bg-transparent border-none flex-shrink-0"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
