import { useState } from "react";

const initialReviews = [
  {
    review_id: 1,
    product_name: "Galaxy S24",
    username: "sample_user",
    rating: 5,
    review: "Sample review — great product, fast delivery.",
    created_at: "2026-08-16",
  },
];

function Reviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [message, setMessage] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  const filtered = reviews.filter((r) =>
    filterRating === "all" ? true : r.rating === Number(filterRating),
  );

  const handleDelete = (id) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    setReviews((prev) => prev.filter((r) => r.review_id !== id));
    setMessage("Review deleted");
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : "—";

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>★</div>
          <div>
            <div style={s.kicker}>PEOPLE</div>
            <h1 style={s.h1}>Reviews</h1>
            <p style={s.sub}>Moderate reviews submitted by customers.</p>
          </div>
        </div>
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <div style={s.statLabel}>Total reviews</div>
          <div style={s.statValue}>{reviews.length}</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Average rating</div>
          <div style={{ ...s.statValue, color: "#eab308" }}>{avgRating}</div>
        </div>
      </div>

      {message && <div style={s.toast}>{message}</div>}

      <div style={s.filterRow}>
        {["all", "5", "4", "3", "2", "1"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            style={{
              ...s.filterBtn,
              ...(filterRating === r ? s.filterBtnActive : {}),
            }}
          >
            {r === "all" ? "All" : `${r} ★`}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>User</th>
              <th style={s.th}>Rating</th>
              <th style={s.th}>Review</th>
              <th style={s.th}>Date</th>
              <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={s.emptyState}>
                  No reviews match this filter.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.review_id} style={s.tr}>
                <td style={{ ...s.td, fontWeight: 600, color: "#e7e9ee" }}>
                  {r.product_name}
                </td>
                <td style={s.td}>{r.username}</td>
                <td style={{ ...s.td, color: "#eab308", letterSpacing: "1px" }}>
                  {renderStars(r.rating)}
                </td>
                <td style={{ ...s.td, color: "#9aa2b1", maxWidth: 280 }}>
                  {r.review}
                </td>
                <td style={{ ...s.td, color: "#9aa2b1" }}>{r.created_at}</td>
                <td style={{ ...s.td, textAlign: "right" }}>
                  <button
                    onClick={() => handleDelete(r.review_id)}
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
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
    marginBottom: 20,
    maxWidth: 500,
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

export default Reviews;
