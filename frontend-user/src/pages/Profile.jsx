/* eslint-disable react-hooks/static-components */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, AlertTriangle, Check } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, checked, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    contact: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateConfirmed, setDeactivateConfirmed] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchProfile();
  }, [user, checked, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/users/profile");
      setProfile({
        username: res.data.user.username || "",
        email: res.data.user.email || "",
        contact: res.data.user.contact || "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: "", type: "" });
    try {
      await api.put("/api/users/profile", profile);
      setProfileMsg({ text: "Profile updated successfully", type: "success" });
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: "", type: "" });
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMsg({ text: "New passwords don't match", type: "error" });
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put("/api/users/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMsg({
        text: "Password changed successfully",
        type: "success",
      });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const closeDeactivate = () => {
    if (deactivateLoading) return;
    setShowDeactivate(false);
    setDeactivatePassword("");
    setDeactivateConfirmed(false);
    setDeactivateError("");
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    if (deactivateLoading) return;
    if (!deactivatePassword) {
      setDeactivateError("Enter your password to confirm.");
      return;
    }
    if (!deactivateConfirmed) {
      setDeactivateError("Please tick the box to confirm you understand.");
      return;
    }

    setDeactivateLoading(true);
    setDeactivateError("");
    try {
      await api.put("/api/users/deactivate", { password: deactivatePassword });
      await logout();
      navigate("/");
    } catch (err) {
      setDeactivateError(
        err.response?.data?.message ||
          "Could not deactivate your account. Please try again.",
      );
      setDeactivatePassword("");
    } finally {
      setDeactivateLoading(false);
    }
  };

  const inputCls =
    "w-full bg-gray-50 dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#7c8699] outline-none focus:border-[#4f8ef7] transition-colors";

  const Msg = ({ msg }) =>
    msg.text ? (
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold mb-4 ${
          msg.type === "success"
            ? "bg-green-50 dark:bg-[#0f2a1c] text-green-600 dark:text-[#4ade80] border border-green-200 dark:border-[#17422c]"
            : "bg-red-50 dark:bg-[#2a1414] text-red-500 dark:text-[#f87171] border border-red-200 dark:border-[#422121]"
        }`}
      >
        {msg.type === "success" ? (
          <Check size={14} />
        ) : (
          <AlertTriangle size={14} />
        )}
        {msg.text}
      </div>
    ) : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
          Account
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
          Profile
        </h1>
        <p className="text-gray-400 dark:text-[#7c8699] text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] flex-shrink-0">
              <User size={16} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Personal Information
              </div>
              <div className="text-xs text-gray-400 dark:text-[#7c8699] mt-0.5">
                Update your name, email and contact
              </div>
            </div>
          </div>
          <Msg msg={profileMsg} />
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <div className="relative">
              <User
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7c8699]"
              />
              <input
                type="text"
                placeholder="Username"
                value={profile.username}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, username: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7c8699]"
              />
              <input
                type="email"
                placeholder="Email address"
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7c8699]"
              />
              <input
                type="text"
                placeholder="Contact number"
                value={profile.contact}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, contact: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-[#4f8ef7] text-white font-bold py-3 rounded-lg border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 text-sm"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] flex-shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Change Password
              </div>
              <div className="text-xs text-gray-400 dark:text-[#7c8699] mt-0.5">
                At least 8 characters, with a letter and a number
              </div>
            </div>
          </div>

          <Msg msg={passwordMsg} />
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            {["current_password", "new_password", "confirm_password"].map(
              (field) => (
                <div key={field} className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7c8699]"
                  />
                  <input
                    type="password"
                    placeholder={
                      field === "current_password"
                        ? "Current password"
                        : field === "new_password"
                          ? "New password"
                          : "Confirm new password"
                    }
                    value={passwordForm[field]}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        [field]: e.target.value,
                      }))
                    }
                    className={inputCls}
                  />
                </div>
              ),
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#4f8ef7] text-white font-bold py-3 rounded-lg border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 text-sm"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="mt-2 border-t border-gray-200 dark:border-[#1a1f2e] pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-[#f0f2f7] m-0">
                Close your account
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-[#9aa2b1] mt-1 mb-0 max-w-md leading-relaxed">
                Sign out everywhere and close this account. Your past orders
                stay on record, and{" "}
                <Link
                  to="/contact"
                  className="text-[#4f8ef7] font-semibold hover:underline"
                >
                  support
                </Link>{" "}
                can reactivate it later.
              </p>
            </div>
            <button
              onClick={() => setShowDeactivate(true)}
              className="shrink-0 bg-transparent border border-gray-300 dark:border-[#2a3042] text-gray-700 dark:text-[#c7cbd4] text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer hover:border-[#f87171] hover:text-[#f87171] transition-colors"
            >
              Deactivate account
            </button>
          </div>

          {showDeactivate && (
            <div
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
              onClick={closeDeactivate}
              onKeyDown={(e) => e.key === "Escape" && closeDeactivate()}
            >
              <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="deactivate-title"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleDeactivate}
                className="w-full max-w-md bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6 shadow-2xl"
              >
                <h2
                  id="deactivate-title"
                  className="text-lg font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-1"
                >
                  Deactivate your account?
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-[#9aa2b1] mb-4">
                  You will be signed out right away and will not be able to log
                  in again until our support team reactivates your account.
                </p>

                {deactivateError && (
                  <div
                    role="alert"
                    className="bg-red-50 dark:bg-[#2a1414] border border-red-100 dark:border-[#422121] text-[#f87171] text-xs font-semibold rounded-lg px-3.5 py-2.5 mb-4"
                  >
                    {deactivateError}
                  </div>
                )}

                <label className="block text-xs font-semibold text-gray-600 dark:text-[#c7cbd4] mb-1.5">
                  Enter your password to confirm
                </label>
                <div className="relative mb-4">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7c8699]"
                  />
                  <input
                    type="password"
                    autoFocus
                    autoComplete="current-password"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <label className="flex items-start gap-2.5 text-[13px] text-gray-600 dark:text-[#9aa2b1] mb-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deactivateConfirmed}
                    onChange={(e) => setDeactivateConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#f87171]"
                  />
                  <span>
                    I understand that I will be signed out and cannot log in
                    until my account is reactivated.
                  </span>
                </label>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDeactivate}
                    disabled={deactivateLoading}
                    className="bg-transparent border border-gray-200 dark:border-[#1a1f2e] text-gray-600 dark:text-[#9aa2b1] text-sm font-bold px-4 py-2.5 rounded-lg cursor-pointer hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors disabled:opacity-50"
                  >
                    Keep my account
                  </button>
                  <button
                    type="submit"
                    disabled={
                      deactivateLoading ||
                      !deactivatePassword ||
                      !deactivateConfirmed
                    }
                    className="bg-[#f87171] text-white text-sm font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer hover:bg-[#ef4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deactivateLoading
                      ? "Deactivating..."
                      : "Deactivate account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
