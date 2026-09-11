/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import api from "../api/axiosInstance";

const STATUS_COLORS = {
  pending: "#eab308",
  confirmed: "#5b8cff",
  shipped: "#a78bfa",
  delivered: "#4ade80",
  cancelled: "#f87171",
};

const statusBadge = {
  pending: "bg-[#221a0d] text-[#eab308]",
  confirmed: "bg-[#0d1f36] text-[#5b8cff]",
  shipped: "bg-[#1c1530] text-[#a78bfa]",
  delivered: "bg-[#0f2a1c] text-[#4ade80]",
  cancelled: "bg-[#2a1414] text-[#f87171]",
};

const BAR_COLORS = [
  "#5b8cff",
  "#4ade80",
  "#eab308",
  "#a78bfa",
  "#f87171",
  "#38bdf8",
  "#fb923c",
  "#f472b6",
];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee] flex items-center justify-center py-24">
        <p className="text-[#4a5568] text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: "▦",
      link: "/product",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: "⛁",
      link: "/orders",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers || 0,
      icon: "◑",
      link: "/Users",
    },
    {
      label: "Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: "₹",
      link: "/payments",
    },
  ];

  const pieData = Object.entries(stats?.ordersByStatus || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  return (
    <div className="font-sans text-[#e7e9ee]">
      <div className="mb-6">
        <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
          OVERVIEW
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-[#111623] border border-[#1e2432] rounded-xl p-[18px] no-underline text-inherit block hover:border-[#5b8cff] transition-colors"
          >
            <div className="flex justify-between items-start mb-2.5">
              <div className="text-xs text-[#8a92a3] font-semibold">
                {stat.label}
              </div>
              <div className="w-[30px] h-[30px] rounded-lg bg-[#1b2436] flex items-center justify-center text-[13px] text-[#5b8cff]">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-extrabold">{stat.value}</div>
          </Link>
        ))}
      </div>

      <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-[22px] mb-5">
        <div className="flex gap-3 mb-5 items-start">
          <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
            ₹
          </div>
          <div>
            <div className="text-[14.5px] font-extrabold text-[#f1f2f6]">
              Revenue — Last 7 Days
            </div>
            <div className="text-[11.5px] text-[#8a92a3] mt-0.5">
              Daily completed payment totals
            </div>
          </div>
        </div>
        {stats?.revenueChart?.every((d) => d.revenue === 0) ? (
          <div className="text-center py-8 text-[#6b7280] text-sm">
            No revenue data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={stats?.revenueChart || []}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2432" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b0e14",
                  border: "1px solid #1e2432",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#9aa2b1" }}
                formatter={(value) => [
                  `₹${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#5b8cff"
                strokeWidth={2.5}
                dot={{ fill: "#5b8cff", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-[22px]">
          <div className="flex gap-3 mb-5 items-start">
            <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
              ⛁
            </div>
            <div className="text-[14.5px] font-extrabold text-[#f1f2f6]">
              Orders by Status
            </div>
          </div>
          {pieData.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280] text-sm">
              No orders yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={STATUS_COLORS[entry.name] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0e14",
                    border: "1px solid #1e2432",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    value,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#9aa2b1", fontSize: 12 }}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-[22px]">
          <div className="flex gap-3 mb-5 items-start">
            <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
              ▤
            </div>
            <div className="text-[14.5px] font-extrabold text-[#f1f2f6]">
              Products by Category
            </div>
          </div>
          {!stats?.productsByCategoryChart?.length ? (
            <div className="text-center py-8 text-[#6b7280] text-sm">
              No data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={stats.productsByCategoryChart}
                margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2432" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0e14",
                    border: "1px solid #1e2432",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [value, "Products"]}
                />
                <Bar dataKey="products" radius={[4, 4, 0, 0]}>
                  {stats.productsByCategoryChart.map((_, index) => (
                    <Cell
                      key={index}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-[22px]">
          <div className="flex gap-3 mb-4 items-start">
            <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
              ⛁
            </div>
            <div>
              <div className="text-[14.5px] font-extrabold text-[#f1f2f6]">
                Recent Orders
              </div>
              <div className="text-[11.5px] text-[#8a92a3] mt-0.5">
                Latest transactions
              </div>
            </div>
          </div>

          {!stats?.recentOrders?.length ? (
            <div className="text-center py-6 text-[#6b7280] text-sm">
              No orders yet.
            </div>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  {["Order", "Customer", "Amount", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#6b7280] font-bold text-[10px] uppercase tracking-wide pb-3 px-1 border-b border-[#1e2432]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.order_id} className="border-b border-[#1e2432]">
                    <td className="py-2.5 px-1 font-bold font-mono text-[11px]">
                      {o.order_number}
                    </td>
                    <td className="py-2.5 px-1 text-[#9aa2b1] truncate max-w-[80px]">
                      {o.customer_name}
                    </td>
                    <td className="py-2.5 px-1 font-bold">
                      ₹{Number(o.final_amount).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-[2px] rounded-full capitalize ${statusBadge[o.order_status] || "bg-[#161b26] text-[#9aa2b1]"}`}
                      >
                        {o.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Link
            to="/orders"
            className="block text-center text-[12.5px] font-bold text-[#5b8cff] no-underline mt-3"
          >
            View all orders →
          </Link>
        </div>

        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-[22px]">
          <div className="flex gap-3 mb-4 items-start">
            <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
              !
            </div>
            <div>
              <div className="text-[14.5px] font-extrabold text-[#f1f2f6]">
                Low Stock Alerts
              </div>
              <div className="text-[11.5px] text-[#8a92a3] mt-0.5">
                Products below 5 units
              </div>
            </div>
          </div>
          {!stats?.lowStockProducts?.length ? (
            <div className="text-center py-[26px] text-[#6b7280] text-sm">
              No low-stock products.
            </div>
          ) : (
            stats.lowStockProducts.map((p) => (
              <div
                key={p.product_id}
                className="flex justify-between items-center py-[9px] border-b border-[#1e2432] text-[13px]"
              >
                <span className="font-semibold text-[#e7e9ee] truncate max-w-[160px]">
                  {p.product_name}
                </span>
                <span className="text-[11px] font-bold text-[#f87171] bg-[#2a1414] px-[9px] py-[3px] rounded-full flex-shrink-0">
                  {p.stock_quantity} left
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
