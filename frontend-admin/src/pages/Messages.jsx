import { useState } from "react";

const initialMessages = [];

function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const selectedMessage = messages.find((m) => m.contact_id === selectedId);

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const handleOpen = (msg) => {
    setSelectedId(msg.contact_id);
    if (!msg.is_read) {
      setMessages((prev) =>
        prev.map((m) =>
          m.contact_id === msg.contact_id ? { ...m, is_read: true } : m,
        ),
      );
    }
  };

  const handleToggleRead = (id) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.contact_id === id ? { ...m, is_read: !m.is_read } : m,
      ),
    );
  };

  return (
    <div style={s.page}>
      {!selectedMessage ? (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>✉</div>
              <div>
                <div style={s.kicker}>PEOPLE</div>
                <h1 style={s.h1}>Messages</h1>
                <p style={s.sub}>
                  Contact form submissions from the storefront.
                  {unreadCount > 0 && ` ${unreadCount} unread.`}
                </p>
              </div>
            </div>
          </div>

          <div style={s.filterRow}>
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...s.filterBtn,
                  ...(filter === f ? s.filterBtnActive : {}),
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={s.card}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}></th>
                  <th style={s.th}>From</th>
                  <th style={s.th}>Subject</th>
                  <th style={s.th}>Date</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={s.emptyState}>
                      No messages to show.
                    </td>
                  </tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.contact_id} style={s.tr}>
                    <td style={s.td}>
                      {!m.is_read && <span style={s.unreadDot} />}
                    </td>
                    <td
                      style={{
                        ...s.td,
                        fontWeight: m.is_read ? 500 : 700,
                        color: "#e7e9ee",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpen(m)}
                    >
                      {m.name}
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#6b7280",
                          fontWeight: 400,
                        }}
                      >
                        {m.email}
                      </div>
                    </td>
                    <td
                      style={{
                        ...s.td,
                        color: m.is_read ? "#9aa2b1" : "#e7e9ee",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpen(m)}
                    >
                      {m.subject || "(no subject)"}
                    </td>
                    <td style={{ ...s.td, color: "#9aa2b1" }}>
                      {m.created_at}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => handleToggleRead(m.contact_id)}
                        style={s.toggleLink}
                      >
                        {m.is_read ? "Mark unread" : "Mark read"}
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
              <div style={s.headerIcon}>✉</div>
              <div>
                <div style={s.kicker}>PEOPLE</div>
                <h1 style={s.h1}>
                  {selectedMessage.subject || "(no subject)"}
                </h1>
                <p style={s.sub}>
                  From {selectedMessage.name} ({selectedMessage.email}) —{" "}
                  {selectedMessage.created_at}
                </p>
              </div>
            </div>
            <button style={s.secondaryBtn} onClick={() => setSelectedId(null)}>
              ← Back to Messages
            </button>
          </div>

          <div style={s.card}>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "#c7cbd4",
                margin: 0,
              }}
            >
              {selectedMessage.message}
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
  unreadDot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#5b8cff",
  },
  toggleLink: {
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

export default Messages;
