import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import api from "../api/axiosInstance";
import {
  Skeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from "../components/Skeleton";
import ErrorState from "../components/ErrorState";
import { getErrorMessage } from "../utils/formHelpers";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const statusBadge = {
  pending: "bg-amber-500/10 text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  shipped: "bg-violet-500/10 text-violet-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const BAR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0e14] border border-[#1e2432] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-[#6b7280] text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-sm">
          ₹{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/dashboard/stats", {
          params: { range },
        });
        setStats(res.data);
        setLoadError("");
      } catch (error) {
        // A failed refresh keeps showing the numbers already on screen
        setLoadError(getErrorMessage(error, "Could not load the dashboard."));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [range, reloadKey]);

  if (loading) {
    return (
      <div
        className="font-sans text-[#e7e9ee]"
        role="status"
        aria-label="Loading dashboard..."
      >
        <PageHeaderSkeleton />
        <StatCardsSkeleton count={4} />
        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
          <Skeleton className="h-4 w-40 mb-5" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  if (loadError && !stats) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <ErrorState
          message={loadError}
          onRetry={() => {
            setLoading(true);
            setReloadKey((k) => k + 1);
          }}
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: <TrendingUp size={18} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      link: "/payments",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: <ShoppingBag size={18} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      link: "/orders",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers || 0,
      icon: <Users size={18} />,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      link: "/Users",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: <Package size={18} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      link: "/product",
    },
  ];

  const pieData = Object.entries(stats?.ordersByStatus || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  return (
    <div className="font-sans text-[#e7e9ee] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#3b6ee8] tracking-widest uppercase mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-[#111623] border border-[#1e2432] rounded-2xl p-5 no-underline text-inherit block hover:border-[#3b6ee8] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}
              >
                {card.icon}
              </div>
              <ArrowUpRight
                size={16}
                className="text-[#2a3042] group-hover:text-[#3b6ee8] transition-colors"
              />
            </div>
            <div className="text-2xl font-extrabold mb-1">{card.value}</div>
            <div className="text-xs text-[#4a5568] font-semibold">
              {card.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-[15px] font-extrabold text-[#f1f2f6]">
              Revenue Overview
            </h2>
            <p className="text-xs text-[#4a5568] mt-0.5">
              {range === "12m"
                ? "Monthly completed payments — last 12 months"
                : `Daily completed payments — last ${range === "30d" ? 30 : 7} days`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              ["7d", "7 days"],
              ["30d", "30 days"],
              ["12m", "12 months"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                  range === value
                    ? "bg-[#1b2436] text-[#5b8cff] border-[#2c3a55]"
                    : "bg-[#111623] text-[#9aa2b1] border-[#1e2432]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {stats?.revenueChart?.every((d) => d.revenue === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#4a5568]">
            <TrendingUp size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No completed payments in this period</p>
            {range !== "12m" && (
              <p className="text-xs mt-1">Try a longer range above.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={stats?.revenueChart || []}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b6ee8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b6ee8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e2432"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4a5568", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4a5568", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b6ee8"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{
                  fill: "#3b6ee8",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "#111623",
                }}
                activeDot={{
                  r: 6,
                  stroke: "#3b6ee8",
                  strokeWidth: 2,
                  fill: "#111623",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
          <h2 className="text-[15px] font-extrabold text-[#f1f2f6] mb-1">
            Orders by Status
          </h2>
          <p className="text-xs text-[#4a5568] mb-4">
            Distribution across all statuses
          </p>

          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#4a5568]">
              <ShoppingBag size={28} className="mb-2 opacity-30" />
              <p className="text-xs">No orders yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
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
                      fontSize: 11,
                    }}
                    formatter={(value, name) => [
                      value,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                    />
                    <span className="text-[11px] text-[#6b7280] capitalize">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
          <h2 className="text-[15px] font-extrabold text-[#f1f2f6] mb-1">
            Products by Category
          </h2>
          <p className="text-xs text-[#4a5568] mb-4">
            Top categories by product count
          </p>

          {!stats?.productsByCategoryChart?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#4a5568]">
              <Package size={28} className="mb-2 opacity-30" />
              <p className="text-xs">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={stats.productsByCategoryChart}
                margin={{ top: 5, right: 5, left: -20, bottom: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2432"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#4a5568", fontSize: 9 }}
                  angle={-35}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#4a5568", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0e14",
                    border: "1px solid #1e2432",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(value) => [value, "Products"]}
                />
                <Bar dataKey="products" radius={[4, 4, 0, 0]} maxBarSize={32}>
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

        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
          <h2 className="text-[15px] font-extrabold text-[#f1f2f6] mb-1">
            Status Breakdown
          </h2>
          <p className="text-xs text-[#4a5568] mb-5">Total orders per status</p>

          <div className="flex flex-col gap-3">
            {Object.entries(stats?.ordersByStatus || {}).map(
              ([status, count]) => {
                const total = stats?.totalOrders || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold capitalize text-[#9aa2b1]">
                        {status}
                      </span>
                      <span className="text-[12px] font-bold text-[#e7e9ee]">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1e2432] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: STATUS_COLORS[status] || "#6b7280",
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-extrabold text-[#f1f2f6]">
                Recent Orders
              </h2>
              <p className="text-xs text-[#4a5568] mt-0.5">
                Latest 5 transactions
              </p>
            </div>
            <Link
              to="/orders"
              className="text-xs font-bold text-[#3b6ee8] no-underline hover:underline"
            >
              View all →
            </Link>
          </div>

          {!stats?.recentOrders?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#4a5568]">
              <ShoppingBag size={28} className="mb-2 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse">
                <thead>
                  <tr>
                    {["Order", "Customer", "Amount", "Status"].map((h, i) => (
                      <th
                        key={h}
                        className={`text-[#4a5568] font-bold text-[10px] uppercase tracking-widest pb-3 ${i === 0 ? "text-left" : i === 2 ? "text-right" : "text-left"} px-1 border-b border-[#1e2432]`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr
                      key={o.order_id}
                      className="border-b border-[#1e2432] hover:bg-[#0b0e14] transition-colors"
                    >
                      <td className="py-3 px-1 font-bold font-mono text-[11px] text-[#3b6ee8]">
                        {o.order_number}
                      </td>
                      <td className="py-3 px-1 text-[12px] text-[#9aa2b1]">
                        {o.customer_name}
                      </td>
                      <td className="py-3 px-1 text-right font-bold text-[13px]">
                        ₹{Number(o.final_amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-1">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge[o.order_status] || "bg-[#161b26] text-[#9aa2b1]"}`}
                        >
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-extrabold text-[#f1f2f6]">
                Low Stock Alerts
              </h2>
              <p className="text-xs text-[#4a5568] mt-0.5">
                Products below 5 units
              </p>
            </div>
            {stats?.lowStockProducts?.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
                <AlertTriangle size={11} />
                {stats.lowStockProducts.length} items
              </div>
            )}
          </div>

          {!stats?.lowStockProducts?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#4a5568]">
              <Package size={28} className="mb-2 opacity-30" />
              <p className="text-sm">All products well stocked</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.lowStockProducts.map((p) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between p-3 bg-[#0b0e14] rounded-xl border border-[#1e2432]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={14} className="text-red-400" />
                    </div>
                    <span className="text-[13px] font-semibold text-[#e7e9ee] truncate max-w-[150px]">
                      {p.product_name}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      p.stock_quantity === 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {p.stock_quantity === 0
                      ? "Out of stock"
                      : `${p.stock_quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/product"
            className="block text-center text-xs font-bold text-[#3b6ee8] no-underline hover:underline mt-4"
          >
            Manage inventory →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
