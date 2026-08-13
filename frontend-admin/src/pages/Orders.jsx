import { useState } from "react";

const initialOrders = [
  {
    order_id: 1,
    order_number: "ORD-1042",
    customer_name: "Rahul Mehta",
    address: "221B, Ring Road, Surat, Gujarat - 395002",
    items: [{ product_name: "Galaxy S24", quantity: 1, price: 69999 }],
    total_amount: 69999,
    discount: 0,
    shipping_charge: 99,
    final_amount: 70098,
    payment_method: "online",
    payment_status: "complete",
    order_status: "pending",
    created_at: "2026-08-10",
  },
  {
    order_id: 2,
    order_number: "ORD-1041",
    customer_name: "Sneha Patil",
    address: "44, MG Road, Pune, Maharashtra - 411001",
    items: [
      { product_name: "Running Shoes", quantity: 1, price: 2499 },
      { product_name: "Water Bottle", quantity: 2, price: 299 },
    ],
    total_amount: 3097,
    discount: 100,
    shipping_charge: 0,
    final_amount: 2997,
    payment_method: "cash",
    payment_status: "pending",
    order_status: "confirmed",
    created_at: "2026-08-11",
  },
];

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");

  const selectedOrder = orders.find((o) => o.order_id === selectedId);

  const handleStatusChange = (orderId, newStatus) => {
    // mock update — swap for axios.put(`/api/orders/${orderId}/status`, { order_status: newStatus })
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId ? { ...o, order_status: newStatus } : o,
      ),
    );
    setMessage(`Order status updated to "${newStatus}"`);
  };

  return (
    <div style={s.page}>
      {!selectedOrder ? (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>⛁</div>
              <div>
                <div style={s.kicker}>SALES</div>
                <h1 style={s.h1}>Orders</h1>
                <p style={s.sub}>View and manage customer orders.</p>
              </div>
            </div>
          </div>

          {message && <div style={s.toast}>{message}</div>}

          <div style={s.card}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Order</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Total</th>
                  <th style={s.th}>Payment</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} style={s.emptyState}>
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o.order_id} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: 700 }}>
                      {o.order_number}
                    </td>
                    <td style={s.td}>{o.customer_name}</td>
                    <td style={{ ...s.td, color: "#9aa2b1" }}>
                      {o.created_at}
                    </td>
                    <td style={{ ...s.td, fontWeight: 700 }}>
                      ₹{o.final_amount}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(s.payment[o.payment_status] || s.badgeNeutral),
                        }}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(s.status[o.order_status] || s.badgeNeutral),
                        }}
                      >
                        {o.order_status}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedId(o.order_id)}
                        style={s.viewLink}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>⛁</div>
              <div>
                <div style={s.kicker}>SALES</div>
                <h1 style={s.h1}>{selectedOrder.order_number}</h1>
                <p style={s.sub}>Placed on {selectedOrder.created_at}</p>
              </div>
            </div>
            <button style={s.secondaryBtn} onClick={() => setSelectedId(null)}>
              ← Back to Orders
            </button>
          </div>

          {message && <div style={s.toast}>{message}</div>}

          <div style={s.formGrid}>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>▦</div>
                <div style={s.cardTitle}>Items</div>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Product</th>
                    <th style={s.th}>Qty</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        {item.product_name}
                      </td>
                      <td style={s.td}>{item.quantity}</td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        ₹{item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={s.summaryBlock}>
                <div style={s.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
                <div style={s.summaryRow}>
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
                <div style={s.summaryRow}>
                  <span>Shipping</span>
                  <span>₹{selectedOrder.shipping_charge}</span>
                </div>
                <div style={{ ...s.summaryRow, ...s.summaryTotal }}>
                  <span>Total</span>
                  <span>₹{selectedOrder.final_amount}</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ ...s.card, marginBottom: 16 }}>
                <div style={s.cardHead}>
                  <div style={s.cardHeadIcon}>◑</div>
                  <div style={s.cardTitle}>Customer</div>
                </div>
                <div style={s.infoLine}>
                  <span style={s.infoLabel}>Name</span>
                  {selectedOrder.customer_name}
                </div>
                <div style={s.infoLine}>
                  <span style={s.infoLabel}>Address</span>
                  {selectedOrder.address}
                </div>
              </div>

              <div style={{ ...s.card, marginBottom: 16 }}>
                <div style={s.cardHead}>
                  <div style={s.cardHeadIcon}>◐</div>
                  <div style={s.cardTitle}>Payment</div>
                </div>
                <div style={s.infoLine}>
                  <span style={s.infoLabel}>Method</span>
                  {selectedOrder.payment_method}
                </div>
                <div style={s.infoLine}>
                  <span style={s.infoLabel}>Status</span>
                  <span
                    style={{
                      ...s.badge,
                      ...(s.payment[selectedOrder.payment_status] ||
                        s.badgeNeutral),
                    }}
                  >
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>

              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={s.cardHeadIcon}>⛁</div>
                  <div style={s.cardTitle}>Order Status</div>
                </div>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.order_id, e.target.value)
                  }
                  style={s.input}
                >
                  {STATUS_FLOW.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <p style={s.helpText}>
                  Cancelling restocks inventory automatically (handled
                  server-side in a transaction).
                </p>
              </div>
            </div>
          </div>
        </>
      )}
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
  secondaryBtn: {
    background: "#161b26",
    color: "#c7cbd4",
    border: "1px solid #262c3a",
    padding: "10px 18px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  toast: {
    background: "#0f2a1c",
    color: "#4ade80",
    padding: "10px 16px",
    borderRadius: 9,
    fontSize: 12.8,
    fontWeight: 600,
    marginBottom: 18,
    border: "1px solid #17422c",
  },
  card: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 14,
    padding: 24,
  },
  formGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 },
  cardHead: {
    display: "flex",
    gap: 12,
    marginBottom: 18,
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
  cardTitle: { fontSize: 15, fontWeight: 800, color: "#f1f2f6" },
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
  badge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  badgeNeutral: { background: "#161b26", color: "#9aa2b1" },
  payment: {
    complete: { background: "#0f2a1c", color: "#4ade80" },
    pending: { background: "#221a0d", color: "#eab308" },
    processing: { background: "#0d1f36", color: "#5b8cff" },
    failed: { background: "#2a1414", color: "#f87171" },
  },
  status: {
    pending: { background: "#221a0d", color: "#eab308" },
    confirmed: { background: "#0d1f36", color: "#5b8cff" },
    shipped: { background: "#1c1530", color: "#a78bfa" },
    delivered: { background: "#0f2a1c", color: "#4ade80" },
    cancelled: { background: "#2a1414", color: "#f87171" },
  },
  viewLink: {
    background: "none",
    border: "none",
    color: "#5b8cff",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "34px 0",
    color: "#6b7280",
    fontSize: 13,
  },
  summaryBlock: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid #1e2432",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#9aa2b1",
    padding: "5px 0",
  },
  summaryTotal: {
    fontWeight: 800,
    color: "#e7e9ee",
    fontSize: 14.5,
    marginTop: 6,
    paddingTop: 10,
    borderTop: "1px solid #1e2432",
  },
  infoLine: {
    fontSize: 13,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  infoLabel: {
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#6b7280",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    background: "#0b0e14",
    border: "1px solid #262c3a",
    borderRadius: 9,
    padding: "11px 14px",
    fontSize: 13.5,
    color: "#e7e9ee",
    outline: "none",
    boxSizing: "border-box",
  },
  helpText: {
    fontSize: 11.5,
    color: "#6b7280",
    marginTop: 10,
    lineHeight: 1.5,
  },
};

export default Orders;
