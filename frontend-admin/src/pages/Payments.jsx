import { useState } from "react";

const initialPayments = [
  {
    payment_id: 1,
    order_number: "ORD-1001",
    customer_name: "Rahul Mehta",
    payment_method: "online",
    transaction_id: "TXN-SAMPLE-001",
    amount: 2349,
    payment_date: "2026-08-15",
    payment_status: "complete",
  },
];

function Payments() {
  const [payments] = useState(initialPayments);
  const [filter, setFilter] = useState("all");

  const filtered = payments.filter((p) =>
    filter === "all" ? true : p.payment_status === filter,
  );

  const totals = {
    complete: payments
      .filter((p) => p.payment_status === "complete")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments
      .filter((p) => p.payment_status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    failed: payments.filter((p) => p.payment_status === "failed").length,
  };

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>◐</div>
          <div>
            <div style={s.kicker}>SALES</div>
            <h1 style={s.h1}>Payments</h1>
            <p style={s.sub}>
              Track payment status separately from order fulfillment.
            </p>
          </div>
        </div>
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <div style={s.statLabel}>Collected</div>
          <div style={{ ...s.statValue, color: "#4ade80" }}>
            ₹{totals.complete.toLocaleString()}
          </div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Pending (COD)</div>
          <div style={{ ...s.statValue, color: "#eab308" }}>
            ₹{totals.pending.toLocaleString()}
          </div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Failed transactions</div>
          <div style={{ ...s.statValue, color: "#f87171" }}>
            {totals.failed}
          </div>
        </div>
      </div>

      <div style={s.filterRow}>
        {["all", "complete", "pending", "processing", "failed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...s.filterBtn,
              ...(filter === f ? s.filterBtnActive : {}),
            }}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Order</th>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Method</th>
              <th style={s.th}>Transaction ID</th>
              <th style={s.th}>Amount</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={s.emptyState}>
                  No payments match this filter.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.payment_id} style={s.tr}>
                <td style={{ ...s.td, fontWeight: 700 }}>{p.order_number}</td>
                <td style={s.td}>{p.customer_name}</td>
                <td style={s.td}>
                  <span
                    style={{
                      ...s.methodBadge,
                      ...(p.payment_method === "online"
                        ? s.methodOnline
                        : s.methodCash),
                    }}
                  >
                    {p.payment_method}
                  </span>
                </td>
                <td
                  style={{
                    ...s.td,
                    fontFamily: "monospace",
                    color: "#9aa2b1",
                    fontSize: 12,
                  }}
                >
                  {p.transaction_id || "—"}
                </td>
                <td style={{ ...s.td, fontWeight: 700 }}>
                  ₹{p.amount.toLocaleString()}
                </td>
                <td style={{ ...s.td, color: "#9aa2b1" }}>
                  {p.payment_date || "—"}
                </td>
                <td style={s.td}>
                  <span
                    style={{
                      ...s.badge,
                      ...(s.status[p.payment_status] || {}),
                    }}
                  >
                    {p.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.footnote}>
        Payment status here is independent of order status — an order can be
        "confirmed" while payment is still "pending" (e.g. Cash on Delivery).
        Razorpay integration (real transaction IDs, live status updates) is
        backend work, scheduled after the frontend pass.
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: { display: "flex", gap: 14 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#1b2436",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#5b8cff",
    flexShrink: 0,
  },
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
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 20,
  },
  stat: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 12,
    padding: 18,
  },
  statLabel: {
    fontSize: 11.5,
    color: "#8a92a3",
    fontWeight: 600,
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: 800 },
  filterRow: { display: "flex", gap: 8, marginBottom: 16 },
  filterBtn: {
    background: "#111623",
    color: "#9aa2b1",
    border: "1px solid #1e2432",
    padding: "7px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  filterBtnActive: {
    background: "#1b2436",
    color: "#5b8cff",
    borderColor: "#2c3a55",
  },
  card: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 14,
    padding: 24,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "0 10px 14px",
    borderBottom: "1px solid #1e2432",
  },
  tr: { borderBottom: "1px solid #1e2432" },
  td: { padding: "13px 10px", verticalAlign: "middle" },
  methodBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  methodOnline: { background: "#0d1f36", color: "#5b8cff" },
  methodCash: { background: "#221a0d", color: "#eab308" },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  status: {
    complete: { background: "#0f2a1c", color: "#4ade80" },
    pending: { background: "#221a0d", color: "#eab308" },
    processing: { background: "#0d1f36", color: "#5b8cff" },
    failed: { background: "#2a1414", color: "#f87171" },
  },
  emptyState: {
    textAlign: "center",
    padding: "34px 0",
    color: "#6b7280",
    fontSize: 13,
  },
  footnote: {
    marginTop: 20,
    padding: "14px 18px",
    background: "#12161f",
    border: "1px solid #1e2432",
    borderRadius: 10,
    fontSize: 12,
    color: "#8a92a3",
    lineHeight: 1.6,
  },
};

export default Payments;
