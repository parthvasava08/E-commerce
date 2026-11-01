import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Wallet,
  Heart,
  User,
  Truck,
  Headset,
  ChevronRight,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const paymentColors = {
  pending: "bg-yellow-50 dark:bg-[#221a0d] text-yellow-600 dark:text-[#eab308]",
  complete: "bg-green-50 dark:bg-[#0f2a1c] text-green-600 dark:text-[#4ade80]",
  failed: "bg-red-50 dark:bg-[#2a1414] text-red-500 dark:text-[#f87171]",
};

const TILES = [
  {
    to: "/my-orders",
    icon: Package,
    title: "My Orders",
    text: "View and track your orders",
  },
  {
    to: "/wishlist",
    icon: Heart,
    title: "Wishlist",
    text: "Products you saved",
  },
  {
    to: "/profile",
    icon: User,
    title: "Profile & security",
    text: "Name, contact and password",
  },
  {
    to: "/track",
    icon: Truck,
    title: "Track an order",
    text: "Check status with an order number",
  },
  {
    to: "/contact",
    icon: Headset,
    title: "Help & support",
    text: "Contact our team",
  },
];

function Account() {
  const { user, checked } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { state: { from: "/account" } });
      return;
    }
    api
      .get("/api/my-orders")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, checked, navigate]);

  const stats = useMemo(() => {
    const paid = orders
      .filter((o) => o.Payment?.payment_status === "complete")
      .reduce((sum, o) => sum + Number(o.final_amount || 0), 0);
    const pending = orders.filter(
      (o) =>
        o.order_status !== "cancelled" &&
        o.order_status !== "delivered" &&
        (o.Payment?.payment_status || "pending") === "pending",
    ).length;
    return { total: orders.length, paid, pending };
  }, [orders]);

  const visible = showAll ? orders : orders.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-[#4f8ef7] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
            My Account
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7] m-0 truncate">
            {user?.username}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Orders", value: stats.total },
          { label: "Paid so far", value: formatPrice(stats.paid) },
          { label: "Payment pending", value: stats.pending },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl px-4 py-4"
          >
            <p className="text-[12px] text-gray-500 dark:text-[#9aa2b1] m-0 mb-1">
              {s.label}
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-[#f0f2f7] m-0">
              {loading ? "–" : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {TILES.map(({ to, icon: Icon, title, text }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl px-5 py-4 no-underline transition-colors hover:border-[#4f8ef7]"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] shrink-0">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-gray-900 dark:text-[#f0f2f7] m-0">
                {title}
              </p>
              <p className="text-[13px] text-gray-500 dark:text-[#9aa2b1] m-0 mt-0.5">
                {text}
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-gray-400 dark:text-[#7c8699] group-hover:text-[#4f8ef7] transition-colors"
            />
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7]">
            <Wallet size={16} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-[#f0f2f7] m-0">
              Payments
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-[#9aa2b1] m-0">
              Payment history for your orders
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-24 bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl animate-pulse" />
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl px-5 py-8 text-center text-sm text-gray-500 dark:text-[#9aa2b1]">
            No payments yet. Once you place an order, it will show up here.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl divide-y divide-gray-200 dark:divide-[#1a1f2e]">
            {visible.map((o) => {
              const status = o.Payment?.payment_status || "pending";
              const method =
                o.Payment?.payment_method === "cash"
                  ? "Cash on Delivery"
                  : "Paid online";
              return (
                <Link
                  key={o.order_id}
                  to={`/track/${o.order_number}`}
                  className="flex items-center gap-4 px-5 py-4 no-underline hover:bg-gray-50 dark:hover:bg-[#080a0f] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 dark:text-[#f0f2f7] m-0 truncate">
                      {o.order_number}
                    </p>
                    <p className="text-[12.5px] text-gray-500 dark:text-[#9aa2b1] m-0 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {method}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                      paymentColors[status] ||
                      "bg-gray-100 dark:bg-[#1a1f2e] text-gray-500 dark:text-[#9aa2b1]"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7] w-24 text-right">
                    {formatPrice(o.final_amount)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {orders.length > 5 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-4 bg-transparent border-none text-[#4f8ef7] text-sm font-bold cursor-pointer hover:underline p-0"
          >
            {showAll ? "Show fewer" : `Show all ${orders.length} payments`}
          </button>
        )}
      </section>
    </div>
  );
}

export default Account;
