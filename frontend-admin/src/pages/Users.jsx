import { useState } from "react";

const initialUsers = [];

function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const selectedUser = users.find((u) => u.user_id === selectedId);

  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.user_id === userId
          ? { ...u, status: u.status === "active" ? "deactivated" : "active" }
          : u,
      ),
    );
    setMessage("User status updated");
  };

  return (
    <div style={s.page}>
      {!selectedUser ? (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>◑</div>
              <div>
                <div style={s.kicker}>PEOPLE</div>
                <h1 style={s.h1}>Users</h1>
                <p style={s.sub}>
                  Registered customers — accounts are created by users, not
                  admin.
                </p>
              </div>
            </div>
          </div>

          {message && <div style={s.toast}>{message}</div>}

          <div style={s.card}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Contact</th>
                  <th style={s.th}>Joined</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={s.emptyState}>
                      No registered users yet.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.user_id} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: 600, color: "#e7e9ee" }}>
                      {u.username}
                    </td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>{u.contact || "—"}</td>
                    <td style={{ ...s.td, color: "#9aa2b1" }}>
                      {u.created_at}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(u.status === "active"
                            ? s.badgeActive
                            : s.badgeInactive),
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedId(u.user_id)}
                        style={s.viewLink}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.user_id)}
                        style={
                          u.status === "active"
                            ? s.deactivateLink
                            : s.activateLink
                        }
                      >
                        {u.status === "active" ? "Deactivate" : "Reactivate"}
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
              <div style={s.headerIcon}>◑</div>
              <div>
                <div style={s.kicker}>PEOPLE</div>
                <h1 style={s.h1}>{selectedUser.username}</h1>
                <p style={s.sub}>{selectedUser.email}</p>
              </div>
            </div>
            <button style={s.secondaryBtn} onClick={() => setSelectedId(null)}>
              ← Back to Users
            </button>
          </div>

          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardHeadIcon}>⛁</div>
              <div style={s.cardTitle}>Order History</div>
            </div>
            <p style={{ color: "#8a92a3", fontSize: 13 }}>
              No orders yet — will populate once this user's orders exist in the
              database.
            </p>
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
  badgeActive: { background: "#0f2a1c", color: "#4ade80" },
  badgeInactive: { background: "#2a1414", color: "#f87171" },
  viewLink: {
    background: "none",
    border: "none",
    color: "#5b8cff",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    marginRight: 14,
  },
  deactivateLink: {
    background: "none",
    border: "none",
    color: "#f87171",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
  },
  activateLink: {
    background: "none",
    border: "none",
    color: "#4ade80",
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

export default Users;
