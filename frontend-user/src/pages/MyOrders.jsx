/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  pending: "bg-[#221a0d] text-[#eab308]",
  confirmed: "bg-[#0d1f36] text-[#4f8ef7]",
  shipped: "bg-[#1c1530] text-[#a78bfa]",
  delivered: "bg-[#0f2a1c] text-[#4ade80]",
  cancelled: "bg-[#2a1414] text-[#f87171]",
};

const paymentColors = {
  pending: "bg-[#221a0d] text-[#eab308]",
  complete: "bg-[#0f2a1c] text-[#4ade80]",
  failed: "bg-[#2a1414] text-[#f87171]",
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { user, checked } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { state: { from: "/my-orders" } });
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchOrders();
  }, [user, checked]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/my-orders");
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-[#0e1117] border border-[#1a1f2e] rounded-2xl animate-pulse mb-3"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
          Account
        </p>
        <h1 className="text-3xl font-extrabold text-[#f0f2f7]">My Orders</h1>
        <p className="text-[#4a5568] text-sm mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={48} className="text-[#1a1f2e] mb-4" />
          <h3 className="text-[#f0f2f7] font-bold text-lg mb-2">
            No orders yet
          </h3>
          <p className="text-[#4a5568] text-sm mb-6">
            Start shopping to see your orders here
          </p>
          <Link
            to="/products"
            className="bg-[#4f8ef7] text-white font-bold px-6 py-3 rounded-xl no-underline hover:bg-[#3a7be8] transition-colors text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-[#0e1117] border border-[#1a1f2e] rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => toggleExpand(order.order_id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-[#4f8ef7]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#f0f2f7] font-mono">
                      {order.order_number}
                    </p>
                    <p className="text-[11px] text-[#4a5568] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[order.order_status] || "bg-[#1a1f2e] text-[#9aa2b1]"}`}
                  >
                    {order.order_status}
                  </span>
                  <span className="text-[14px] font-extrabold text-[#f0f2f7]">
                    ₹{Number(order.final_amount).toLocaleString()}
                  </span>
                  {expandedId === order.order_id ? (
                    <ChevronUp size={16} className="text-[#4a5568]" />
                  ) : (
                    <ChevronDown size={16} className="text-[#4a5568]" />
                  )}
                </div>
              </div>

              {expandedId === order.order_id && (
                <div className="border-t border-[#1a1f2e] p-5">
                  <div className="mb-4">
                    <p className="text-[10.5px] font-bold text-[#4a5568] uppercase tracking-widest mb-3">
                      Items
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {order.OrderItems?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.Product?.cover_image ? (
                            <img
                              src={item.Product.cover_image}
                              alt={item.Product.product_name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#1a1f2e] flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#f0f2f7] truncate">
                              {item.Product?.product_name}
                            </p>
                            <p className="text-[11px] text-[#4a5568]">
                              Qty: {item.quantity} × ₹
                              {Number(item.price).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-[13px] font-bold text-[#f0f2f7] flex-shrink-0">
                            ₹
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1a1f2e]">
                    <div>
                      <p className="text-[10.5px] font-bold text-[#4a5568] uppercase tracking-widest mb-2">
                        Payment
                      </p>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${paymentColors[order.Payment?.payment_status] || "bg-[#1a1f2e] text-[#9aa2b1]"}`}
                      >
                        {order.Payment?.payment_status || "pending"}
                      </span>
                      <p className="text-[11px] text-[#4a5568] mt-1 capitalize">
                        {order.Payment?.payment_method === "cash"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold text-[#4a5568] uppercase tracking-widest mb-2">
                        Delivery Address
                      </p>
                      <p className="text-[12px] text-[#9aa2b1] leading-relaxed">
                        {order.Address
                          ? `${order.Address.full_name}, ${order.Address.address}, ${order.Address.city}, ${order.Address.state} - ${order.Address.pincode}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
