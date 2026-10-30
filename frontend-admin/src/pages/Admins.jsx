import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import Notice from "../components/Notice";
import ErrorState from "../components/ErrorState";
import { TableSkeleton, PageHeaderSkeleton } from "../components/Skeleton";
import { getErrorMessage } from "../utils/formHelpers";

const EMPTY_FORM = { admin_name: "", email: "", contact: "", password: "" };

const inputCls =
  "w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#e7e9ee] outline-none box-border focus:border-[#3b6ee8]";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function Admins({ currentAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState({ text: "", type: "success" });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [resetFor, setResetFor] = useState(null); // the admin whose password is being reset
  const [newPassword, setNewPassword] = useState("");
  const [busyId, setBusyId] = useState(null);

  const say = (text, type = "success") => setNotice({ text, type });

  const loadAdmins = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/api/admin/admins");
      setAdmins(res.data);
    } catch (error) {
      console.error(error);
      setLoadError(getErrorMessage(error, "Could not load the admin list."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    say("");
    try {
      const res = await api.post("/api/admin/admins", {
        ...form,
        contact: form.contact.trim() || undefined,
      });
      setAdmins((prev) => [...prev, res.data.admin]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      say(
        `Admin created: ${res.data.admin.email}. Share the password with them privately.`,
      );
    } catch (error) {
      say(getErrorMessage(error, "Could not create the admin."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (admin) => {
    const next = admin.status === "active" ? "disabled" : "active";
    if (
      next === "disabled" &&
      !window.confirm(
        `Disable ${admin.admin_name}? They will be logged out immediately and cannot log in until you enable them again.`,
      )
    ) {
      return;
    }
    setBusyId(admin.admin_id);
    say("");
    try {
      const res = await api.put(`/api/admin/admins/${admin.admin_id}/status`, {
        status: next,
      });
      setAdmins((prev) =>
        prev.map((a) => (a.admin_id === admin.admin_id ? res.data.admin : a)),
      );
      say(res.data.message);
    } catch (error) {
      say(getErrorMessage(error, "Could not change the status."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetFor || busyId) return;
    setBusyId(resetFor.admin_id);
    say("");
    try {
      const res = await api.put(
        `/api/admin/admins/${resetFor.admin_id}/password`,
        {
          new_password: newPassword,
        },
      );
      say(
        `${res.data.message} Share the new password with ${resetFor.admin_name} privately.`,
      );
      setResetFor(null);
      setNewPassword("");
    } catch (error) {
      say(getErrorMessage(error, "Could not reset the password."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (admin) => {
    if (
      !window.confirm(
        `Delete ${admin.admin_name} (${admin.email})? This cannot be undone. To keep the account but stop access, use Disable instead.`,
      )
    ) {
      return;
    }
    setBusyId(admin.admin_id);
    say("");
    try {
      const res = await api.delete(`/api/admin/admins/${admin.admin_id}`);
      setAdmins((prev) => prev.filter((a) => a.admin_id !== admin.admin_id));
      if (resetFor?.admin_id === admin.admin_id) setResetFor(null);
      say(res.data.message);
    } catch (error) {
      say(getErrorMessage(error, "Could not delete the admin."), "error");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <PageHeaderSkeleton />
        <TableSkeleton rows={4} cols={6} label="Loading admins..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="font-sans text-[#e7e9ee]">
        <ErrorState message={loadError} onRetry={loadAdmins} />
      </div>
    );
  }

  return (
    <div className="font-sans text-[#e7e9ee]">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div className="flex gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
            ◎
          </div>
          <div>
            <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-widest mb-1">
              TEAM
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">
              Admins
            </h1>
            <p className="text-[12.8px] text-[#9aa2b1]">
              {admins.length} admin account{admins.length === 1 ? "" : "s"}.
              Only the main admin can add, disable or remove staff.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            say("");
          }}
          className="bg-[#3b6ee8] hover:bg-[#2d5fd4] text-white px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none transition-colors"
        >
          {showForm ? "Close" : "+ Add admin"}
        </button>
      </div>

      <Notice message={notice.text} type={notice.type} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6 mb-5"
        >
          <h2 className="text-[15px] font-extrabold text-[#f1f2f6] mb-1">
            New staff admin
          </h2>
          <p className="text-xs text-[#9aa2b1] mb-4">
            Staff can manage the catalog, orders and customers. They cannot
            manage other admins.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <input
              className={inputCls}
              placeholder="Full name (max 20 characters)"
              aria-label="Full name"
              maxLength={20}
              value={form.admin_name}
              onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
              required
            />
            <input
              className={inputCls}
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              maxLength={50}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className={inputCls}
              placeholder="Mobile number (optional)"
              aria-label="Mobile number"
              maxLength={13}
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <input
              className={inputCls}
              type="password"
              placeholder="Starting password"
              aria-label="Starting password"
              autoComplete="new-password"
              maxLength={72}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <p className="text-[11.5px] text-[#6b7280] mt-2.5">
            Password: 8 to 72 characters with at least one letter and one
            number. Tell the person privately. They can change it on their
            Profile page.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-[#3b6ee8] hover:bg-[#2d5fd4] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none transition-colors"
          >
            {saving ? "Creating..." : "Create admin"}
          </button>
        </form>
      )}

      {resetFor && (
        <form
          onSubmit={handleReset}
          className="bg-[#111623] border border-[#3b6ee8]/40 rounded-2xl p-4 sm:p-6 mb-5"
        >
          <h2 className="text-[15px] font-extrabold text-[#f1f2f6] mb-1">
            Reset password for {resetFor.admin_name}
          </h2>
          <p className="text-xs text-[#9aa2b1] mb-3.5">
            They will be logged out everywhere and must sign in with the new
            password.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              className={`${inputCls} sm:max-w-sm`}
              type="password"
              placeholder="New password"
              aria-label="New password"
              autoComplete="new-password"
              maxLength={72}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={busyId === resetFor.admin_id}
              className="bg-[#3b6ee8] hover:bg-[#2d5fd4] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none"
            >
              Save new password
            </button>
            <button
              type="button"
              onClick={() => {
                setResetFor(null);
                setNewPassword("");
              }}
              className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr>
                {[
                  "Name",
                  "Email",
                  "Mobile",
                  "Role",
                  "Status",
                  "Added",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] ${
                      i === 6 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isMain = a.role === "super_admin";
                const isYou = a.admin_id === currentAdmin?.admin_id;
                const busy = busyId === a.admin_id;
                return (
                  <tr key={a.admin_id} className="border-b border-[#1e2432]">
                    <td className="py-3 px-2.5 font-semibold text-[#e7e9ee]">
                      {a.admin_name}
                      {isYou && (
                        <span className="ml-2 text-[10px] font-bold text-[#5b8cff]">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2.5">{a.email}</td>
                    <td className="py-3 px-2.5">{a.contact || "—"}</td>
                    <td className="py-3 px-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full ${
                          isMain
                            ? "bg-[#1c1530] text-[#a78bfa]"
                            : "bg-[#0d1f36] text-[#5b8cff]"
                        }`}
                      >
                        {isMain ? "Main admin" : "Staff"}
                      </span>
                    </td>
                    <td className="py-3 px-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full capitalize ${
                          a.status === "active"
                            ? "bg-[#0f2a1c] text-[#4ade80]"
                            : "bg-[#2a1414] text-[#f87171]"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-2.5 text-[#9aa2b1] whitespace-nowrap">
                      {formatDate(a.created_at)}
                    </td>
                    <td className="py-3 px-2.5 text-right whitespace-nowrap">
                      {isMain ? (
                        <span className="text-[7c8699] text-xs">—</span>
                      ) : (
                        <span className="inline-flex gap-4">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleStatus(a)}
                            className="text-[#5b8cff] font-bold text-xs cursor-pointer bg-transparent border-none disabled:opacity-50"
                          >
                            {a.status === "active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setResetFor(a);
                              setNewPassword("");
                              say("");
                            }}
                            className="text-[#eab308] font-bold text-xs cursor-pointer bg-transparent border-none disabled:opacity-50"
                          >
                            Reset password
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(a)}
                            className="text-[#f87171] font-bold text-xs cursor-pointer bg-transparent border-none disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admins;
