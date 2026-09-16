import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { Search, Bell, Plus, User, LogOut, ChevronDown, ShoppingBag, Package, Users, CreditCard } from "lucide-react";
import api from "../api/axiosInstance";

const typeIcon = {
  order: <ShoppingBag size={14} className="text-[#5b8cff]" />,
  stock: <Package size={14} className="text-[#f87171]" />,
  user: <Users size={14} className="text-[#4ade80]" />,
  payment: <CreditCard size={14} className="text-[#eab308]" />,
};

const typeBg = {
  order: "bg-[#0d1f36]",
  stock: "bg-[#2a1414]",
  user: "bg-[#0f2a1c]",
  payment: "bg-[#221a0d]",
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

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

     
      <div className="flex items-center gap-2.5 bg-[#111623] border border-[#1e2432] rounded-lg px-3.5 py-2 w-80 focus-within:border-[#3b6ee8] transition-colors">
        <Search size={14} className="text-[#6b7280] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm text-[#e7e9ee] placeholder-[#565d6b] w-full"
        />
      </div>

   
      <div className="flex items-center gap-3">

       
        <button
          onClick={() => navigate("/product")}
          className="flex items-center gap-1.5 bg-[#3b6ee8] text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap hover:bg-[#2d5fd4] transition-colors border-none"
        >
          <Plus size={14} />
          Add Product
        </button>

     
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
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
                <span className="text-[13px] font-extrabold text-[#e7e9ee]">Notifications</span>
                <span className="text-[11px] font-bold text-[#3b6ee8]">{unreadCount} unread</span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-[#4a5568] text-sm">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-[#1e2432] hover:bg-[#0b0e14] transition-colors cursor-pointer ${n.unread ? "bg-[#0d1420]" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${typeBg[n.type]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {typeIcon[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-[#e7e9ee] truncate">{n.text}</p>
                      <p className="text-[11px] text-[#6b7280] truncate mt-0.5">{n.sub}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#4a5568]">{timeAgo(n.time)}</span>
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#3b6ee8]" />}
                    </div>
                  </div>
                ))
              )}

              <div className="px-4 py-2.5 text-center">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-[12px] font-bold text-[#3b6ee8] bg-transparent border-none cursor-pointer hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

     
        <div className="relative">
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
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
              <div className="h-px bg-[#1e2432]" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#f87171] bg-transparent border-none cursor-pointer hover:bg-[#0b0e14] transition-colors"
              >
                <LogOut size={14} />Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;