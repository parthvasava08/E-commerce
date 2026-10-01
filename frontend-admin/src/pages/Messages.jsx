import { useState } from "react";

const initialMessages = [
  {
    contact_id: 1,
    name: "Sample Contact",
    email: "contact@example.com",
    subject: "Sample inquiry",
    message: "This is a sample message shown for demo purposes.",
    created_at: "2026-08-14",
    is_read: false,
  },
];

function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(null);
  // eslint-disable-next-line no-unused-vars
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
                        {m.created_at}
                      </td>
                      <td className="py-3.5 px-2.5 align-middle text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggleRead(m.contact_id)}
                          className="text-[#5b8cff] font-bold text-xs cursor-pointer bg-transparent border-none"
                        >
                          {m.is_read ? "Mark unread" : "Mark read"}
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
                  {selectedMessage.created_at}
                </p>
              </div>
            </div>
            <button
              className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedId(null)}
            >
              ← Back to Messages
            </button>
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
