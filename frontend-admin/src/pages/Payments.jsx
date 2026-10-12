/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import {
  TableSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from "../components/Skeleton";
import ErrorState from "../components/ErrorState";
import { getErrorMessage } from "../utils/formHelpers";

const statusCls = {
  complete: "bg-[#0f2a1c] text-[#4ade80]",
  pending: "bg-[#221a0d] text-[#eab308]",
  processing: "bg-[#0d1f36] text-[#5b8cff]",
  failed: "bg-[#2a1414] text-[#f87171]",
};

const methodCls = {
  online: "bg-[#0d1f36] text-[#5b8cff]",
  cash: "bg-[#221a0d] text-[#eab308]",
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/api/payments");
      setPayments(res.data);
      setLoadError("");
    } catch (error) {
      setLoadError(getErrorMessage(error, "Could not load payments."));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) =>
    filter === "all" ? true : p.payment_status === filter,
  );

  const totals = {
    complete: payments
      .filter((p) => p.payment_status === "complete")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    pending: payments
      .filter((p) => p.payment_status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    failed: payments.filter((p) => p.payment_status === "failed").length,
  };

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <PageHeaderSkeleton />
        <StatCardsSkeleton count={3} />
        <TableSkeleton rows={6} cols={6} label="Loading payments..." />
      </div>
    );
  }

  if (loadError && payments.length === 0) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <ErrorState
          message={loadError}
          onRetry={() => {
            setLoading(true);
            fetchPayments();
          }}
        />
      </div>
    );
  }

  return (
    <div className="font-sans text-[#e7e9ee]">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div className="flex gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
            ◐
          </div>
          <div>
            <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
              SALES
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">
              Payments
            </h1>
            <p className="text-[12.8px] text-[#9aa2b1]">
              Track payment status separately from order fulfillment.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          {
            label: "Collected",
            value: `₹${totals.complete.toLocaleString()}`,
            color: "text-[#4ade80]",
          },
          {
            label: "Pending (COD)",
            value: `₹${totals.pending.toLocaleString()}`,
            color: "text-[#eab308]",
          },
          {
            label: "Failed transactions",
            value: totals.failed,
            color: "text-[#f87171]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#111623] border border-[#1e2432] rounded-xl p-[18px]"
          >
            <div className="text-[11.5px] text-[#8a92a3] font-semibold mb-2">
              {s.label}
            </div>
            <div className={`text-[22px] font-extrabold ${s.color}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "complete", "pending", "failed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-[7px] rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
              filter === f
                ? "bg-[#1b2436] text-[#5b8cff] border-[#2c3a55]"
                : "bg-[#111623] text-[#9aa2b1] border-[#1e2432] hover:border-[#5b8cff]"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-[#4a5568] self-center">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#4a5568] text-sm">
            No payments match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[13px] whitespace-nowrap">
              <thead>
                <tr>
                  {[
                    "Order",
                    "Customer",
                    "Method",
                    "Transaction ID",
                    "Amount",
                    "Date",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.payment_id}
                    className="border-b border-[#1e2432] hover:bg-[#0b0e14] transition-colors"
                  >
                    <td className="py-3 px-2.5 font-bold font-mono text-[#5b8cff]">
                      {p.order_number}
                    </td>
                    <td className="py-3 px-2.5 text-[#9aa2b1]">
                      {p.customer_name}
                    </td>
                    <td className="py-3 px-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${methodCls[p.payment_method] || "bg-[#161b26] text-[#9aa2b1]"}`}
                      >
                        {p.payment_method === "cash" ? "COD" : "Online"}
                      </span>
                    </td>
                    <td className="py-3 px-2.5 font-mono text-[#4a5568] text-xs">
                      {p.transaction_id || "—"}
                    </td>
                    <td className="py-3 px-2.5 font-bold">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-2.5 text-[#9aa2b1]">
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${statusCls[p.payment_status] || "bg-[#161b26] text-[#9aa2b1]"}`}
                      >
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-5 p-[14px_18px] bg-[#12161f] border border-[#1e2432] rounded-xl text-xs text-[#8a92a3] leading-relaxed">
        Payment status is independent of order status. COD orders remain pending
        until cash is collected on delivery.
      </div>
    </div>
  );
}

export default Payments;
