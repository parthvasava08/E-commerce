import { useState } from "react";

const initialCoupons = [];
const emptyForm = {
  coupon_code: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_amount: "",
  expiry_date: "",
  status: "active",
};

function Coupons() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const isExpired = (dateStr) => new Date(dateStr) < new Date();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.coupon_code.trim() || !form.discount_value) {
      setMessage("Coupon code and discount value are required");
      return;
    }

    if (editingId) {
      setCoupons((prev) =>
        prev.map((c) => (c.coupon_id === editingId ? { ...c, ...form } : c)),
      );
      setMessage("Coupon updated successfully");
    } else {
      const newCoupon = {
        coupon_id: coupons.length
          ? Math.max(...coupons.map((c) => c.coupon_id)) + 1
          : 1,
        ...form,
      };
      setCoupons((prev) => [...prev, newCoupon]);
      setMessage("Coupon added successfully");
    }

    resetForm();
    setView("list");
  };

  const handleEditClick = (coupon) => {
    setEditingId(coupon.coupon_id);
    setForm({
      coupon_code: coupon.coupon_code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_amount: coupon.minimum_amount,
      expiry_date: coupon.expiry_date,
      status: coupon.status,
    });
    setView("form");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this coupon? This cannot be undone.")) return;

    setCoupons((prev) => prev.filter((c) => c.coupon_id !== id));
    setMessage("Coupon deleted");
  };

  const step1Done = form.coupon_code.trim().length > 0;
  const step2Done = !!form.discount_value;
  const step3Done = !!form.expiry_date;

  return (
    <div style={s.page}>
      {view === "list" ? (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>◍</div>
              <div>
                <div style={s.kicker}>SALES</div>
                <h1 style={s.h1}>Coupons</h1>
                <p style={s.sub}>Create and manage discount codes.</p>
              </div>
            </div>
            <button
              style={s.primaryBtn}
              onClick={() => {
                resetForm();
                setView("form");
              }}
            >
              + Add Coupon
            </button>
          </div>

          {message && <div style={s.toast}>{message}</div>}

          <div style={s.card}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Code</th>
                  <th style={s.th}>Discount</th>
                  <th style={s.th}>Min. Order</th>
                  <th style={s.th}>Expires</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={6} style={s.emptyState}>
                      No coupons yet — add your first one above.
                    </td>
                  </tr>
                )}
                {coupons.map((c) => (
                  <tr key={c.coupon_id} style={s.tr}>
                    <td
                      style={{
                        ...s.td,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {c.coupon_code}
                    </td>
                    <td style={s.td}>
                      {c.discount_type === "percentage"
                        ? `${c.discount_value}%`
                        : `₹${c.discount_value}`}
                    </td>
                    <td style={s.td}>₹{c.minimum_amount}</td>
                    <td
                      style={{
                        ...s.td,
                        color: isExpired(c.expiry_date) ? "#f87171" : "#9aa2b1",
                      }}
                    >
                      {c.expiry_date} {isExpired(c.expiry_date) && "(expired)"}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(c.status === "active"
                            ? s.statusActive
                            : s.statusInactive),
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => handleEditClick(c)}
                        style={s.editLink}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.coupon_id)}
                        style={s.deleteLink}
                      >
                        Delete
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
              <div style={s.headerIcon}>◍</div>
              <div>
                <div style={s.kicker}>SALES</div>
                <h1 style={s.h1}>{editingId ? "Edit Coupon" : "Add Coupon"}</h1>
                <p style={s.sub}>
                  {editingId
                    ? "Update this coupon's rules."
                    : "Create a new discount code."}
                </p>
              </div>
            </div>
            <button
              style={s.secondaryBtn}
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              ← Back to Coupons
            </button>
          </div>

          <div style={s.formGrid}>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>◍</div>
                <div>
                  <div style={s.cardTitle}>Coupon Rules</div>
                  <div style={s.cardSub}>
                    Code and discount value are required.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={s.field}>
                  <label style={s.label}>Coupon code</label>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={form.coupon_code}
                    onChange={(e) =>
                      handleChange("coupon_code", e.target.value.toUpperCase())
                    }
                    style={{ ...s.input, letterSpacing: "0.5px" }}
                  />
                </div>

                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>Discount type</label>
                    <select
                      value={form.discount_type}
                      onChange={(e) =>
                        handleChange("discount_type", e.target.value)
                      }
                      style={s.input}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat amount (₹)</option>
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>
                      Discount value{" "}
                      {form.discount_type === "percentage" ? "(%)" : "(₹)"}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.discount_value}
                      onChange={(e) =>
                        handleChange("discount_value", e.target.value)
                      }
                      style={s.input}
                    />
                  </div>
                </div>

                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>Minimum order amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.minimum_amount}
                      onChange={(e) =>
                        handleChange("minimum_amount", e.target.value)
                      }
                      style={s.input}
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Expiry date</label>
                    <input
                      type="date"
                      value={form.expiry_date}
                      onChange={(e) =>
                        handleChange("expiry_date", e.target.value)
                      }
                      style={s.input}
                    />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    style={s.input}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div style={s.formActions}>
                  <button type="submit" style={s.primaryBtn}>
                    {editingId ? "Save Changes" : "Add Coupon"}
                  </button>
                  <button
                    type="button"
                    style={s.secondaryBtn}
                    onClick={() => {
                      resetForm();
                      setView("list");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>☰</div>
                <div style={s.cardTitle}>Checklist</div>
              </div>

              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background: step1Done ? "#22c55e" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Set a code</div>
                  <div style={s.checkSub}>
                    Must be unique — customers enter this at checkout.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background: step2Done ? "#3b82f6" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Set discount value</div>
                  <div style={s.checkSub}>
                    Choose flat amount or percentage.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background: step3Done ? "#eab308" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Set expiry</div>
                  <div style={s.checkSub}>
                    Expired coupons are rejected automatically at checkout.
                  </div>
                </div>
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
  primaryBtn: {
    background: "#3b6ee8",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
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
    marginBottom: 20,
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
  cardSub: { fontSize: 12, color: "#8a92a3", marginTop: 3 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#c7cbd4",
    marginBottom: 7,
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
  formActions: { display: "flex", gap: 10, marginTop: 6 },
  checkItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: "12px 0",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    marginTop: 5,
    flexShrink: 0,
  },
  checkTitle: { fontSize: 13, fontWeight: 700, color: "#e7e9ee" },
  checkSub: { fontSize: 11.8, color: "#8a92a3", marginTop: 2 },
  divider: { height: 1, background: "#1e2432" },
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
  statusActive: { background: "#0f2a1c", color: "#4ade80" },
  statusInactive: { background: "#221a0d", color: "#eab308" },
  editLink: {
    background: "none",
    border: "none",
    color: "#5b8cff",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    marginRight: 16,
  },
  deleteLink: {
    background: "none",
    border: "none",
    color: "#f87171",
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
};

export default Coupons;
