/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  CheckCircle,
  Circle,
  XCircle,
  Search,
  Truck,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import api from "../api/axiosInstance";

const statusColors = {
  pending: "text-yellow-500 dark:text-[#eab308]",
  confirmed: "text-blue-500 dark:text-[#4f8ef7]",
  shipped: "text-purple-500 dark:text-[#a78bfa]",
  delivered: "text-green-500 dark:text-[#4ade80]",
  cancelled: "text-red-500 dark:text-[#f87171]",
};

function TrackOrder() {
  const { orderNumber: urlOrderNumber } = useParams();
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      const res = await api.get(`/api/track/${orderNumber.trim()}`);
      setOrder(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Order not found. Please check your order number."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    if (urlOrderNumber) handleSearch();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[#4f8ef7]/10 flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-[#4f8ef7]" />
        </div>
        <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-2">
          Tracking
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-2">
          Track Your Order
        </h1>
        <p className="text-gray-400 dark:text-[7c8699] text-sm">
          Enter your order number to see the latest status
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 flex items-center bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-xl px-4 py-3 gap-3 focus-within:border-[#4f8ef7] transition-colors">
          <Search
            size={18}
            className="text-gray-400 dark:text-[7c8699] flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Enter order number (e.g. ORD-31455650)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[7c8699] w-full font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="bg-[#4f8ef7] text-white font-bold px-6 py-3 rounded-xl border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 text-sm flex-shrink-0"
        >
          {loading ? "Tracking..." : "Track"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-[#2a1414] border border-red-200 dark:border-[#422121] rounded-xl p-4 flex items-center gap-3 mb-6">
          <XCircle
            size={18}
            className="text-red-500 dark:text-[#f87171] flex-shrink-0"
          />
          <p className="text-red-600 dark:text-[#f87171] text-sm font-semibold">
            {error}
          </p>
        </div>
      )}

      {order && (
        <div className="flex flex-col gap-5">
          {order.cancelled && (
            <div className="bg-red-50 dark:bg-[#2a1414] border border-red-200 dark:border-[#422121] rounded-2xl p-5 flex items-center gap-4">
              <XCircle
                size={24}
                className="text-red-500 dark:text-[#f87171] flex-shrink-0"
              />
              <div>
                <p className="font-bold text-red-600 dark:text-[#f87171]">
                  Order Cancelled
                </p>
                <p className="text-red-400 text-sm mt-0.5">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10.5px] text-[#4f8ef7] font-bold uppercase tracking-widest mb-1">
                  Order Number
                </p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-[#f0f2f7] font-mono">
                  {order.order_number}
                </p>
              </div>
              <span
                className={`text-sm font-extrabold capitalize ${statusColors[order.order_status]}`}
              >
                {order.order_status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-[#1a1f2e]">
              <div>
                <p className="text-[10.5px] text-gray-400 dark:text-[7c8699] font-bold uppercase tracking-widest mb-1">
                  Placed On
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#f0f2f7]">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] text-gray-400 dark:text-[7c8699] font-bold uppercase tracking-widest mb-1">
                  Total
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#f0f2f7]">
                  ₹{Number(order.final_amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] text-gray-400 dark:text-[7c8699] font-bold uppercase tracking-widest mb-1">
                  Payment
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#f0f2f7] capitalize">
                  {order.payment_method === "cash"
                    ? "Cash on Delivery"
                    : "Online"}
                </p>
              </div>
            </div>
          </div>

          {!order.cancelled && (
            <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
              <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-6">
                Order Timeline
              </h2>

              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-100 dark:bg-[#1a1f2e]" />

                <div className="flex flex-col gap-6">
                  {order.timeline.map((step, index) => (
                    <div key={step.status} className="flex gap-4 relative">
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                          step.completed
                            ? "bg-[#4f8ef7] border-[#4f8ef7]"
                            : "bg-white dark:bg-[#0e1117] border-gray-200 dark:border-[#1a1f2e]"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle size={18} className="text-white" />
                        ) : (
                          <Circle
                            size={18}
                            className="text-gray-300 dark:text-[#2a3042]"
                          />
                        )}
                      </div>

                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-[13.5px] font-bold ${
                              step.completed
                                ? "text-gray-900 dark:text-[#f0f2f7]"
                                : "text-gray-400 dark:text-[7c8699]"
                            }`}
                          >
                            {step.label}
                          </p>
                          {index ===
                            order.timeline.filter((s) => s.completed).length -
                              1 &&
                            step.completed &&
                            !order.cancelled && (
                              <span className="text-[10px] font-bold bg-[#4f8ef7]/10 text-[#4f8ef7] px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                        </div>
                        <p
                          className={`text-[12px] ${
                            step.completed
                              ? "text-gray-500 dark:text-[#6b7a99]"
                              : "text-gray-300 dark:text-[#2a3042]"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
            <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-4">
              Items Ordered
            </h2>
            <div className="flex flex-col gap-3">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-[#1a1f2e] last:border-0"
                >
                  {item.cover_image ? (
                    <img
                      src={item.cover_image}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1a1f2e] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-[#f0f2f7] truncate">
                      {item.product_name}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-[7c8699]">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-gray-900 dark:text-[#f0f2f7] flex-shrink-0">
                    ₹{(Number(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {order.address && (
            <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={16} className="text-[#4f8ef7]" />
                <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                  Delivery Address
                </h2>
              </div>
              <p className="text-[13px] text-gray-500 dark:text-[#9aa2b1] leading-relaxed">
                {order.address}
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate("/my-orders")}
              className="text-[#4f8ef7] text-sm font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              ← View all orders
            </button>
          </div>
        </div>
      )}

      {!loading && !order && !error && !searched && (
        <div className="text-center py-12">
          <Truck
            size={48}
            className="text-gray-200 dark:text-[#1a1f2e] mx-auto mb-4"
          />
          <p className="text-gray-400 dark:text-[7c8699] text-sm">
            Enter your order number above to track your order
          </p>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;
