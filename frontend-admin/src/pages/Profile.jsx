import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import Notice from "../components/Notice";
import { getErrorMessage } from "../utils/formHelpers";

const CARD = "bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6";
const LABEL = "block text-xs font-semibold text-[#c7cbd4] mb-1.5";
const INPUT =
  "w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff] disabled:opacity-60 disabled:cursor-not-allowed";
const BTN =
  "bg-[#3b6ee8] text-white px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap border-none disabled:opacity-50 disabled:cursor-not-allowed";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({ admin_name: "", email: "", contact: "" });
  const [profileNotice, setProfileNotice] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwNotice, setPwNotice] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/admin/profile");
        const a = res.data.admin;
        setForm({
          admin_name: a.admin_name || "",
          email: a.email || "",
          contact: a.contact || "",
        });
      } catch (error) {
        setLoadError(getErrorMessage(error, "Could not load your profile."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (savingProfile) return;

    const name = form.admin_name.trim();
    if (!name) {
      setProfileNotice({ type: "error", text: "Name is required." });
      return;
    }
    if (name.length > 20) {
      setProfileNotice({
        type: "error",
        text: "Name can be at most 20 characters.",
      });
      return;
    }
    const digits = form.contact.replace(/[\s-]/g, "");
    if (digits && !/^[6-9]\d{9}$/.test(digits)) {
      setProfileNotice({
        type: "error",
        text: "Enter a valid 10-digit mobile number, or leave it empty.",
      });
      return;
    }

    setSavingProfile(true);
    setProfileNotice(null);
    try {
      const res = await api.put("/api/admin/profile", {
        admin_name: name,
        contact: digits,
      });
      const a = res.data.admin;
      setForm((prev) => ({
        ...prev,
        admin_name: a.admin_name || "",
        contact: a.contact || "",
      }));
      setProfileNotice({ type: "success", text: "Profile updated." });
      window.dispatchEvent(new Event("admin:profile-updated"));
    } catch (error) {
      setProfileNotice({
        type: "error",
        text: getErrorMessage(error, "Could not update your profile."),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (savingPw) return;

    if (!pw.current || !pw.next || !pw.confirm) {
      setPwNotice({
        type: "error",
        text: "Fill in all three password fields.",
      });
      return;
    }
    if (pw.next.length < 8) {
      setPwNotice({
        type: "error",
        text: "The new password must be at least 8 characters.",
      });
      return;
    }
    if (!/[A-Za-z]/.test(pw.next) || !/\d/.test(pw.next)) {
      setPwNotice({
        type: "error",
        text: "The new password needs at least one letter and one number.",
      });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwNotice({
        type: "error",
        text: "The new password and the confirmation do not match.",
      });
      return;
    }
    if (pw.next === pw.current) {
      setPwNotice({
        type: "error",
        text: "The new password must be different from the current one.",
      });
      return;
    }

    setSavingPw(true);
    setPwNotice(null);
    try {
      await api.put("/api/admin/change-password", {
        current_password: pw.current,
        new_password: pw.next,
      });
      setPw({ current: "", next: "", confirm: "" });
      setPwNotice({ type: "success", text: "Password changed successfully." });
    } catch (error) {
      setPw((prev) => ({ ...prev, current: "" }));
      setPwNotice({
        type: "error",
        text: getErrorMessage(error, "Could not change the password."),
      });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee] flex items-center justify-center py-24">
        <p className="text-[#4a5568] text-sm">Loading profile...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="font-sans py-24 text-center">
        <p className="text-[#f87171] text-sm">{loadError}</p>
      </div>
    );
  }

  const initial = (form.admin_name || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="font-sans text-[#e7e9ee]">
      <div className="flex gap-3.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
          ◉
        </div>
        <div>
          <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
            ACCOUNT
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            My Profile
          </h1>
          <p className="text-xs text-[#9aa2b1]">
            Your administrator details and password.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
        <form onSubmit={saveProfile} className={CARD} noValidate>
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-full bg-[#3b6ee8] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-extrabold text-[#f1f2f6] truncate">
                {form.admin_name || "Administrator"}
              </div>
              <div className="text-xs text-[#8a92a3] truncate">
                {form.email}
              </div>
            </div>
          </div>

          <Notice message={profileNotice?.text} type={profileNotice?.type} />

          <div className="mb-4.5">
            <label className={LABEL}>Name</label>
            <input
              type="text"
              maxLength={20}
              value={form.admin_name}
              onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
              className={INPUT}
            />
          </div>

          <div className="mb-4.5">
            <label className={LABEL}>Email</label>
            <input type="email" value={form.email} disabled className={INPUT} />
            <p className="text-[11.5px] text-[#6b7280] mt-1.5">
              The email is your login and cannot be changed here.
            </p>
          </div>

          <div className="mb-5">
            <label className={LABEL}>Contact number (optional)</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="10-digit mobile number"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className={INPUT}
            />
          </div>

          <button type="submit" disabled={savingProfile} className={BTN}>
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>

        <form onSubmit={savePassword} className={CARD} noValidate>
          <div className="text-[15px] font-extrabold text-[#f1f2f6] mb-1">
            Change password
          </div>
          <p className="text-xs text-[#8a92a3] mb-5">
            Use at least 8 characters with a letter and a number.
          </p>

          <Notice message={pwNotice?.text} type={pwNotice?.type} />

          <div className="mb-4.5">
            <label className={LABEL}>Current password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              className={INPUT}
            />
          </div>

          <div className="mb-4.5">
            <label className={LABEL}>New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              className={INPUT}
            />
          </div>

          <div className="mb-5">
            <label className={LABEL}>Confirm new password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className={INPUT}
            />
          </div>

          <button type="submit" disabled={savingPw} className={BTN}>
            {savingPw ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
