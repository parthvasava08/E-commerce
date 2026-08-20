import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    lowStockCount: 0,
    lowStockProducts: [],
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: "▦",
      link: "/product",
    },
    { label: "Total Orders", value: 0, icon: "⛁", link: "/orders" },
    { label: "Customers", value: 0, icon: "◑", link: "/users" },
    { label: "Revenue", value: "₹0", icon: "₹", link: "/payments" },
  ];

  const statusCounts = [
    { label: "Pending", count: 0, color: "#eab308" },
    { label: "Confirmed", count: 0, color: "#3b82f6" },
    { label: "Shipped", count: 0, color: "#a78bfa" },
    { label: "Delivered", count: 0, color: "#22c55e" },
    { label: "Cancelled", count: 0, color: "#f87171" },
  ];

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <div>
          <div style={s.kicker}>OVERVIEW</div>
          <h1 style={s.h1}>Dashboard</h1>
          <p style={s.sub}></p>
        </div>
      </div>

      <div style={s.stats}>
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link} style={s.statCard}>
            <div style={s.statTop}>
              <div style={s.statLabel}>{stat.label}</div>
              <div style={s.statIcon}>{stat.icon}</div>
            </div>
            <div style={s.statValue}>{stat.value}</div>
          </Link>
        ))}
      </div>

      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardHeadIcon}>⛁</div>
            <div>
              <div style={s.cardTitle}>Recent Orders</div>
              <div style={s.cardSub}>Latest transactions from your store</div>
            </div>
          </div>
          <div style={s.placeholder}>No orders yet.</div>
          <Link to="/orders" style={s.viewAllLink}>
            View all orders →
          </Link>
        </div>

        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardHeadIcon}>⛁</div>
            <div style={s.cardTitle}>Orders by Status</div>
          </div>
          {statusCounts.map((sc) => (
            <div key={sc.label} style={s.statusRow}>
              <span style={{ ...s.dot, background: sc.color }} />
              <span style={s.statusLabel}>{sc.label}</span>
              <span style={s.statusCount}>{sc.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardHeadIcon}>▦</div>
            <div>
              <div style={s.cardTitle}>Best-Selling Products</div>
              <div style={s.cardSub}>Ranked by units sold</div>
            </div>
          </div>
          <div style={s.placeholder}>No sales data yet.</div>
          <Link to="/product" style={s.viewAllLink}>
            Manage products →
          </Link>
        </div>

        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardHeadIcon}>!</div>
            <div>
              <div style={s.cardTitle}>Low Stock Alerts</div>
              <div style={s.cardSub}>Products below 5 units</div>
            </div>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div style={s.placeholder}>No low-stock products right now.</div>
          ) : (
            stats.lowStockProducts.map((p) => (
              <div key={p.product_id} style={s.lowStockRow}>
                <span style={s.lowStockName}>{p.product_name}</span>
                <span style={s.lowStockQty}>{p.stock_quantity} left</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "#0b0e14",
    color: "#e7e9ee",
    padding: 28,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  headerRow: { marginBottom: 24 },
  kicker: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#5b8cff",
    letterSpacing: "1px",
    marginBottom: 4,
  },
  h1: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  sub: { fontSize: 12.8, color: "#9aa2b1", margin: 0 },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 18,
  },
  statCard: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 12,
    padding: 18,
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statLabel: { fontSize: 12, color: "#8a92a3", fontWeight: 600 },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "#1b2436",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    color: "#5b8cff",
  },
  statValue: { fontSize: 24, fontWeight: 800 },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 18,
  },
  card: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 14,
    padding: 22,
  },
  cardHead: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  cardHeadIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "#1b2436",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#5b8cff",
    flexShrink: 0,
  },
  cardTitle: { fontSize: 14.5, fontWeight: 800, color: "#f1f2f6" },
  cardSub: { fontSize: 11.5, color: "#8a92a3", marginTop: 3 },
  placeholder: {
    textAlign: "center",
    padding: "26px 0",
    color: "#6b7280",
    fontSize: 13,
  },
  lowStockRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid #1e2432",
    fontSize: 13,
  },
  lowStockName: { fontWeight: 600, color: "#e7e9ee" },
  lowStockQty: {
    fontSize: 11,
    fontWeight: 700,
    color: "#f87171",
    background: "#2a1414",
    padding: "3px 9px",
    borderRadius: 20,
  },
  viewAllLink: {
    display: "block",
    textAlign: "center",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#5b8cff",
    textDecoration: "none",
    marginTop: 8,
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 0",
  },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  statusLabel: { flex: 1, fontSize: 13, fontWeight: 600 },
  statusCount: { fontSize: 13, fontWeight: 800, color: "#9aa2b1" },
  footnote: {
    marginTop: 6,
    padding: "14px 18px",
    background: "#12161f",
    border: "1px solid #1e2432",
    borderRadius: 10,
    fontSize: 12,
    color: "#8a92a3",
    lineHeight: 1.6,
  },
};

export default Dashboard;
