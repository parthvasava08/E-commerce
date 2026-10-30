import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const refreshBell = () =>
  window.dispatchEvent(new Event("notifications:refresh"));

function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await api.get("/api/contact");
      setMessages(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, []);

  const setReadState = async (id, is_read) => {
    try {
      await api.put(`/api/contact/${id}/read`, { is_read });
      setMessages((prev) =>
        prev.map((m) => (m.contact_id === id ? { ...m, is_read } : m)),
      );
      refreshBell();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update message");
      console.error(err);
    }
  };

  const handleOpen = (m) => {
    setSelectedId(m.contact_id);
    if (!m.is_read) setReadState(m.contact_id, true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      await api.delete(`/api/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m.contact_id !== id));
      if (selectedId === id) setSelectedId(null);
      setMessage("Message deleted");
      refreshBell();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete message");
      console.error(err);
    }
  };

  useEffect(() => {
    const openId = location.state?.openId;
    if (!openId || loading) return;
    navigate(location.pathname, { replace: true, state: null });
    (async () => {
      let list = messages;
      if (!list.some((x) => x.contact_id === openId)) {
        try {
          const res = await api.get("/api/contact");
          list = res.data;
          setMessages(list);
        } catch (err) {
          console.error(err);
        }
      }
      const target = list.find((x) => x.contact_id === openId);
      if (target) handleOpen(target);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, location.key]);

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const filtered = messages.filter((m) =>
    filter === "unread" ? !m.is_read : filter === "read" ? m.is_read : true,
  );
  const selectedMessage = messages.find((m) => m.contact_id === selectedId);

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee] flex items-center justify-center py-24">
        <p className="text-[7c8699] text-sm">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#e7e9ee]">
      {!selectedMessage ? (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ✉
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
                  PEOPLE
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  Messages
                </h1>
                <p className="text-xs text-[#9aa2b1]">
                  Contact form submissions from the storefront.
                  {unreadCount > 0 && ` ${unreadCount} unread.`}
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-[#0f2a1c] text-[#4ade80] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border border-[#17422c]">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border capitalize ${
                  filter === f
                    ? "bg-[#1b2436] text-[#5b8cff] border-[#2c3a55]"
                    : "bg-[#111623] text-[#9aa2b1] border-[#1e2432]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]"></th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      From
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Subject
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Date
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] !text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8.5 text-[#6b7280] text-sm"
                      >
                        No messages to show.
                      </td>
                    </tr>
                  )}
                  {filtered.map((m) => (
                    <tr
                      key={m.contact_id}
                      className="border-b border-[#1e2432]"
                    >
                      <td className="py-3.5 px-2.5 align-middle">
                        {!m.is_read && (
                          <span className="inline-block w-2 h-2 rounded-full bg-[#5b8cff]" />
                        )}
                      </td>
                      <td
                        className={`py-3.5 px-2.5 align-middle text-[#e7e9ee] cursor-pointer ${
                          m.is_read ? "font-medium" : "font-bold"
                        }`}
                        onClick={() => handleOpen(m)}
                      >
                        {m.name}
                        <div className="text-[11.5px] text-[#6b7280] font-normal">
                          {m.email}
                        </div>
                      </td>
                      <td
                        className={`py-3.5 px-2.5 align-middle cursor-pointer ${
                          m.is_read ? "text-[#9aa2b1]" : "text-[#e7e9ee]"
                        }`}
                        onClick={() => handleOpen(m)}
                      >
                        {m.subject || "(no subject)"}
                      </td>
                      <td className="py-3.5 px-2.5 align-middle text-[#9aa2b1] whitespace-nowrap">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="py-3.5 px-2.5 align-middle text-right whitespace-nowrap">
                        <button
                          onClick={() => setReadState(m.contact_id, !m.is_read)}
                          className="text-[#5b8cff] font-bold text-xs mr-4 cursor-pointer bg-transparent border-none"
                        >
                          {m.is_read ? "Mark unread" : "Mark read"}
                        </button>
                        <button
                          onClick={() => handleDelete(m.contact_id)}
                          className="text-[#f87171] font-bold text-xs cursor-pointer bg-transparent border-none"
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
        </>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ✉
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
                  PEOPLE
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1 break-words">
                  {selectedMessage.subject || "(no subject)"}
                </h1>
                <p className="text-xs text-[#9aa2b1] break-words">
                  From {selectedMessage.name} ({selectedMessage.email}) —{" "}
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedId(null)}
              >
                ← Back to Messages
              </button>
              <button
                className="bg-[#2a1414] text-[#f87171] border border-[#4a1d1d] px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
                onClick={() => handleDelete(selectedMessage.contact_id)}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
            <p className="text-[13.5px] leading-[1.7] text-[#c7cbd4] break-words">
              {selectedMessage.message}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Messages;
