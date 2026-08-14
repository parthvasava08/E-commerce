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
      { to: "/coupons", icon: "◍", name: "Coupons" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/users", icon: "◑", name: "Users" },
      { to: "/reviews", icon: "★", name: "Reviews" },
      { to: "/messages", icon: "✉", name: "Messages" },
    ],
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandMark}>S</div>
        <div style={s.brandText}>
          ADMIN
          <span style={s.brandSub}>DASHBOARD</span>
        </div>
      </div>

      {NAV.map((group) => (
        <div key={group.label} style={s.section}>
          <p style={s.sectionTitle}>{group.label.toUpperCase()}</p>
          {group.items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              >
                <span style={s.navIcon}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      ))}

      <div style={s.bottom}>
        <div style={s.avatar}>A</div>
        <div>
          <p style={s.who}>Admin</p>
          <span style={s.role}>Store owner</span>
        </div>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 230,
    background: "#0b0e14",
    borderRight: "1px solid #1e2432",
    color: "#9aa2b1",
    flexShrink: 0,
    padding: "18px 0",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  brand: {
    padding: "0 18px 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderBottom: "1px solid #1e2432",
    marginBottom: 14,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "#3b6ee8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  brandText: {
    fontSize: 13.5,
    fontWeight: 800,
    color: "#f1f2f6",
    lineHeight: 1.3,
    letterSpacing: "0.3px",
  },
  brandSub: {
    display: "block",
    fontSize: 9.5,
    color: "#5b6270",
    fontWeight: 600,
    letterSpacing: "0.6px",
  },
  section: { padding: "0 10px", marginBottom: 4 },
  sectionTitle: {
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#565d6b",
    padding: "12px 10px 6px",
    fontWeight: 700,
    margin: 0,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 8,
    fontSize: 13,
    color: "#9aa2b1",
    textDecoration: "none",
    marginBottom: 1,
    fontWeight: 500,
  },
  navItemActive: { background: "#1b2436", color: "#5b8cff", fontWeight: 700 },
  navIcon: { width: 16, textAlign: "center", fontSize: 13 },
  bottom: {
    marginTop: "auto",
    padding: "14px 18px 0",
    borderTop: "1px solid #1e2432",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "#1b2436",
    color: "#5b8cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  who: { fontSize: 12.5, color: "#e7e9ee", fontWeight: 700, margin: 0 },
  role: { fontSize: 10.5, color: "#5b6270" },
};

export default Sidebar;
