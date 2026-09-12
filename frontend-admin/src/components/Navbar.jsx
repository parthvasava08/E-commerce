import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Plus,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import api from "../api/axiosInstance";

const mockNotifications = [
  {
    id: 1,
    text: "New order received",
    sub: "ORD-31455650 — ₹9,000",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    text: "Low stock alert",
    sub: "Castrol Edge Engine Oil — 0 left",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    text: "New user registered",
    sub: "checkouttest joined",
    time: "3h ago",
    unread: false,
  },
];

function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  const handleLogout = async () => {
    try {
      await api.post("/api/admin/logout");
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <header className="flex items-center justify-between px-7 py-3.5 bg-[#0b0e14] border-b border-[#1e2432]">
      {/* Search */}
      <div className="flex items-center gap-2.5 bg-[#111623] border border-[#1e2432] rounded-lg px-3.5 py-2 w-80 focus-within:border-[#3b6ee8] transition-colors">
        <Search size={14} className="text-[#6b7280] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm text-[#e7e9ee] placeholder-[#565d6b] w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Add Product */}
        <button
          onClick={() => navigate("/product")}
          className="flex items-center gap-1.5 bg-[#3b6ee8] text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap hover:bg-[#2d5fd4] transition-colors border-none"
        >
          <Plus size={14} />
          Add Product
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUserOpen(false);
            }}
            className="relative w-9 h-9 rounded-lg bg-[#111623] border border-[#1e2432] flex items-center justify-center text-[#9aa2b1] hover:border-[#3b6ee8] hover:text-[#3b6ee8] transition-colors cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f87171] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-[#111623] border border-[#1e2432] rounded-2xl overflow-hidden shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2432]">
                <span className="text-[13px] font-extrabold text-[#e7e9ee]">
                  Notifications
                </span>
                <span className="text-[11px] font-bold text-[#3b6ee8]">
                  {unreadCount} unread
                </span>
              </div>
              {mockNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-[#1e2432] hover:bg-[#0b0e14] transition-colors cursor-pointer ${n.unread ? "bg-[#0d1420]" : ""}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.unread ? "bg-[#3b6ee8]" : "bg-[#2a3042]"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#e7e9ee] truncate">
                      {n.text}
                    </p>
                    <p className="text-[11px] text-[#6b7280] truncate mt-0.5">
                      {n.sub}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#4a5568] flex-shrink-0 mt-0.5">
                    {n.time}
                  </span>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <button className="text-[12px] font-bold text-[#3b6ee8] bg-transparent border-none cursor-pointer hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserOpen(!userOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 bg-[#111623] border border-[#1e2432] rounded-lg px-3 py-2 hover:border-[#3b6ee8] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#3b6ee8] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <span className="text-xs font-semibold text-[#e7e9ee]">Admin</span>
            <ChevronDown size={13} className="text-[#4a5568]" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-12 w-48 bg-[#111623] border border-[#1e2432] rounded-xl overflow-hidden shadow-2xl z-50">
              <div className="px-4 py-3 border-b border-[#1e2432]">
                <p className="text-[12.5px] font-bold text-[#e7e9ee]">Admin</p>
                <p className="text-[11px] text-[#4a5568]">admin@example.com</p>
              </div>
              <button
                onClick={() => setUserOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#9aa2b1] bg-transparent border-none cursor-pointer hover:bg-[#0b0e14] hover:text-[#e7e9ee] transition-colors"
              >
                <Settings size={14} />
                Settings
              </button>
              <div className="h-px bg-[#1e2432]" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#f87171] bg-transparent border-none cursor-pointer hover:bg-[#0b0e14] transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
