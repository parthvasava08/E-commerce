import { Link, useLocation } from "react-router-dom";

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

const TEAM_GROUP = {
  label: "Team",
  items: [{ to: "/admins", icon: "◎", name: "Admins" }],
};

function Sidebar({ open = false, onClose = () => {}, admin = null }) {
  const location = useLocation();
  const groups = admin?.role === "super_admin" ? [...NAV, TEAM_GROUP] : NAV;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen w-[230px] bg-[#0b0e14] border-r border-[#1e2432] flex flex-col flex-shrink-0 py-[18px] font-sans transition-transform duration-200 lg:static lg:z-auto lg:h-auto lg:min-h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
          {groups.map((group) => (
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
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] font-medium no-underline mb-px transition-colors ${
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
      </aside>
    </>
  );
}

export default Sidebar;
