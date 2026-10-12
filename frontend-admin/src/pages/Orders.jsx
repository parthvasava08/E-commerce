import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { TableSkeleton, PageHeaderSkeleton } from "../components/Skeleton";
import ErrorState from "../components/ErrorState";
import { getErrorMessage } from "../utils/formHelpers";

const ALLOWED = {
  pending: ["confirmed", "shipped", "delivered", "cancelled"],
  confirmed: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const paymentBadge = {
  complete: "bg-[#0f2a1c] text-[#4ade80]",
  pending: "bg-[#221a0d] text-[#eab308]",
  processing: "bg-[#0d1f36] text-[#5b8cff]",
  failed: "bg-[#2a1414] text-[#f87171]",
};

const statusBadge = {
  pending: "bg-[#221a0d] text-[#eab308]",
  confirmed: "bg-[#0d1f36] text-[#5b8cff]",
  shipped: "bg-[#1c1530] text-[#a78bfa]",
  delivered: "bg-[#0f2a1c] text-[#4ade80]",
  cancelled: "bg-[#2a1414] text-[#f87171]",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const selectedOrder = orders.find((o) => o.order_id === selectedId);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
      setLoadError("");
    } catch (error) {
      setLoadError(getErrorMessage(error, "Could not load orders."));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, {
        order_status: newStatus,
      });

      await fetchOrders();
      setIsError(false);
      setMessage(`Order status updated to "${newStatus}"`);
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err, "Failed to update status"));
      console.error(err);
    }
  };

  const inputCls =
    "w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#e7e9ee] outline-none box-border";

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <PageHeaderSkeleton />
        <TableSkeleton rows={7} cols={7} label="Loading orders..." />
      </div>
    );
  }

  if (loadError && orders.length === 0) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <ErrorState
          message={loadError}
          onRetry={() => {
            setLoading(true);
            fetchOrders();
          }}
        />
      </div>
    );
  }

  return (
    <div className="font-sans text-[#e7e9ee]">
      {!selectedOrder ? (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ⛁
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
                  SALES
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  Orders
                </h1>
                <p className="text-[12.8px] text-[#9aa2b1]">
                  {orders.length} total orders
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4 border ${
                isError
                  ? "bg-[#2a1414] text-[#f87171] border-[#4a1d1d]"
                  : "bg-[#0f2a1c] text-[#4ade80] border-[#17422c]"
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-[#4a5568] text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full sm:min-w-[720px] border-collapse text-[13px] whitespace-nowrap">
                  <thead>
                    <tr>
                      {[
                        "Order",
                        "Customer",
                        "Date",
                        "Total",
                        "Payment",
                        "Status",
                        "Actions",
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] ${
                            i === 6 ? "text-right" : "text-left"
                          } ${[1, 2, 4].includes(i) ? "hidden sm:table-cell" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.order_id}
                        className="border-b border-[#1e2432]"
                      >
                        <td className="py-3 px-2.5 font-bold font-mono">
                          {o.order_number}
                          <div className="sm:hidden font-sans font-normal text-[11px] text-[#9aa2b1] mt-0.5">
                            {o.customer_name}
                          </div>
                        </td>
                        <td className="py-3 px-2.5 hidden sm:table-cell">
                          {o.customer_name}
                        </td>
                        <td className="py-3 px-2.5 text-[#9aa2b1] hidden sm:table-cell">
                          {new Date(o.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-2.5 font-bold">
                          ₹{Number(o.final_amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-2.5 hidden sm:table-cell">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${paymentBadge[o.payment_status] || "bg-[#161b26] text-[#9aa2b1]"}`}
                          >
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="py-3 px-2.5">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${statusBadge[o.order_status] || "bg-[#161b26] text-[#9aa2b1]"}`}
                          >
                            {o.order_status}
                          </span>
                        </td>
                        <td className="py-3 px-2.5 text-right">
                          <button
                            onClick={() => setSelectedId(o.order_id)}
                            className="text-[#5b8cff] font-bold text-[12.5px] bg-transparent border-none cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ⛁
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
                  SALES
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  {selectedOrder.order_number}
                </h1>
                <p className="text-[12.8px] text-[#9aa2b1]">
                  Placed on{" "}
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedId(null);
                setMessage("");
              }}
              className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer"
            >
              ← Back to Orders
            </button>
          </div>

          {message && (
            <div
              className={`px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4 border ${
                isError
                  ? "bg-[#2a1414] text-[#f87171] border-[#4a1d1d]"
                  : "bg-[#0f2a1c] text-[#4ade80] border-[#17422c]"
              }`}
            >
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                  ▦
                </div>
                <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                  Items
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {["Product", "Qty", "Price"].map((h, i) => (
                        <th
                          key={h}
                          className={`text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] ${i === 2 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, i) => (
                      <tr key={i} className="border-b border-[#1e2432]">
                        <td className="py-3 px-2.5 font-semibold">
                          {item.product_name}
                        </td>
                        <td className="py-3 px-2.5">{item.quantity}</td>
                        <td className="py-3 px-2.5 text-right">
                          ₹{Number(item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1e2432]">
                {[
                  {
                    label: "Subtotal",
                    value: `₹${Number(selectedOrder.total_amount).toLocaleString()}`,
                  },
                  {
                    label: "Discount",
                    value: `-₹${Number(selectedOrder.discount).toLocaleString()}`,
                  },
                  {
                    label: "Shipping",
                    value: `₹${Number(selectedOrder.shipping_charge).toLocaleString()}`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between text-[13px] text-[#9aa2b1] py-[5px]"
                  >
                    {row.label}
                    <span>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[14.5px] font-extrabold text-[#e7e9ee] mt-1.5 pt-2.5 border-t border-[#1e2432]">
                  Total{" "}
                  <span>
                    ₹{Number(selectedOrder.final_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
                <div className="flex gap-3 mb-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                    ◑
                  </div>
                  <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                    Customer
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-[10.5px] uppercase tracking-wide text-[#6b7280] font-bold block mb-1">
                      Name
                    </span>
                    <span className="text-[13px]">
                      {selectedOrder.customer_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] uppercase tracking-wide text-[#6b7280] font-bold block mb-1">
                      Address
                    </span>
                    <span className="text-[13px] text-[#9aa2b1]">
                      {selectedOrder.address || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
                <div className="flex gap-3 mb-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                    ◐
                  </div>
                  <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                    Payment
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-[10.5px] uppercase tracking-wide text-[#6b7280] font-bold block mb-1">
                      Method
                    </span>
                    <span className="text-[13px] capitalize">
                      {selectedOrder.payment_method === "cash"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] uppercase tracking-wide text-[#6b7280] font-bold block mb-1">
                      Status
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${paymentBadge[selectedOrder.payment_status] || "bg-[#161b26] text-[#9aa2b1]"}`}
                    >
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
                <div className="flex gap-3 mb-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                    ⛁
                  </div>
                  <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                    Order Status
                  </div>
                </div>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.order_id, e.target.value)
                  }
                  disabled={ALLOWED[selectedOrder.order_status].length === 0}
                  className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {[
                    selectedOrder.order_status,
                    ...ALLOWED[selectedOrder.order_status],
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-[11.5px] text-[#6b7280] mt-2.5 leading-relaxed">
                  {ALLOWED[selectedOrder.order_status].length === 0
                    ? "This order is final and can't be changed."
                    : "Cancelling restocks inventory automatically."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Orders;
