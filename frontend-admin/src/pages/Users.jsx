import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const selectedUser = users.find((u) => u.user_id === selectedId);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/all");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "deactivated" : "active";
    try {
      await api.put(`/api/users/${userId}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, status: newStatus } : u,
        ),
      );
      setMessage(
        `User ${newStatus === "active" ? "reactivated" : "deactivated"} successfully`,
      );
    } catch (err) {
      setMessage("Failed to update user status");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee] flex items-center justify-center py-24">
        <p className="text-[#4a5568] text-sm">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#e7e9ee]">
      {!selectedUser ? (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ◑
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
                  PEOPLE
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  Users
                </h1>
                <p className="text-[12.8px] text-[#9aa2b1]">
                  {users.length} registered users
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-[#0f2a1c] text-[#4ade80] border border-[#17422c] px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4">
              {message}
            </div>
          )}

          <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
            {users.length === 0 ? (
              <div className="text-center py-12 text-[#4a5568] text-sm">
                No registered users yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {[
                        "Name",
                        "Email",
                        "Contact",
                        "Joined",
                        "Status",
                        "Actions",
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] ${
                            i === 5 ? "text-right" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-[#1e2432]">
                        <td className="py-3 px-2.5 font-semibold text-[#e7e9ee]">
                          {u.username}
                        </td>
                        <td className="py-3 px-2.5">{u.email}</td>
                        <td className="py-3 px-2.5">{u.contact || "—"}</td>
                        <td className="py-3 px-2.5 text-[#9aa2b1]">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td className="py-3 px-2.5">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${
                              u.status === "active"
                                ? "bg-[#0f2a1c] text-[#4ade80]"
                                : "bg-[#2a1414] text-[#f87171]"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-2.5 text-right">
                          <button
                            onClick={() => setSelectedId(u.user_id)}
                            className="text-[#5b8cff] font-bold text-[12.5px] bg-transparent border-none cursor-pointer mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(u.user_id, u.status)
                            }
                            className={`font-bold text-[12.5px] bg-transparent border-none cursor-pointer ${
                              u.status === "active"
                                ? "text-[#f87171]"
                                : "text-[#4ade80]"
                            }`}
                          >
                            {u.status === "active"
                              ? "Deactivate"
                              : "Reactivate"}
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
                ◑
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
                  PEOPLE
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  {selectedUser.username}
                </h1>
                <p className="text-[12.8px] text-[#9aa2b1]">
                  {selectedUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer"
            >
              ← Back to Users
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff]">
                  ◑
                </div>
                <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                  User Details
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Username", value: selectedUser.username },
                  { label: "Email", value: selectedUser.email },
                  { label: "Contact", value: selectedUser.contact || "—" },
                  { label: "Status", value: selectedUser.status },
                  {
                    label: "Joined",
                    value: selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : "—",
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <span className="text-[10.5px] uppercase tracking-wide text-[#6b7280] font-bold block mb-1">
                      {row.label}
                    </span>
                    <span className="text-[13px] text-[#e7e9ee]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff]">
                  ⛁
                </div>
                <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                  Order History
                </div>
              </div>
              <p className="text-[#8a92a3] text-[13px]">
                Order history will populate once this user's orders exist in the
                database.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Users;
