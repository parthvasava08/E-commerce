import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertTriangle,
  Check,
  ShieldAlert,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function Message({ msg }) {
  if (!msg.text) return null;
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold mb-4 ${
        msg.type === "success"
          ? "bg-[#0f2a1c] text-[#4ade80] border border-[#17422c]"
          : "bg-[#2a1414] text-[#f87171] border border-[#422121]"
      }`}
    >
      {msg.type === "success" ? (
        <Check size={14} />
      ) : (
        <AlertTriangle size={14} />
      )}
      {msg.text}
    </div>
  );
}

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

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, checked]);

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

  const handleDeactivate = async () => {
    try {
      await api.put("/api/users/deactivate");
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const inputCls =
    "w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
          Account
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
          Profile
        </h1>
        <p className="text-gray-400 dark:text-[#4a5568] text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] flex-shrink-0">
              <User size={16} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Personal Information
              </div>
              <div className="text-xs text-gray-400 dark:text-[#4a5568] mt-0.5">
                Update your name, email and contact
              </div>
            </div>
          </div>

          <Message msg={profileMsg} />

          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <div className="relative">
              <User
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
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

        <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] flex-shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Change Password
              </div>
              <div className="text-xs text-gray-400 dark:text-[#4a5568] mt-0.5">
                Must be at least 6 characters
              </div>
            </div>
          </div>

          <Message msg={passwordMsg} />

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
              />
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    current_password: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    new_password: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    confirm_password: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#4f8ef7] text-white font-bold py-3 rounded-lg border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 text-sm"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 dark:bg-[#0e1117] border border-red-200 dark:border-[#2a1414] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-[#1a0d0d] flex items-center justify-center text-[#f87171] flex-shrink-0">
              <ShieldAlert size={17} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Deactivate account
              </div>
              <p className="text-[13px] text-gray-500 dark:text-[#6b7a99] mt-1 leading-relaxed">
                Your account will be hidden and you won't be able to log in.
                This can be reversed by contacting support.
              </p>

              {!showDeactivate ? (
                <button
                  onClick={() => setShowDeactivate(true)}
                  className="mt-4 text-[#f87171] text-sm font-bold bg-transparent border-none cursor-pointer hover:underline p-0"
                >
                  Deactivate my account
                </button>
              ) : (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleDeactivate}
                    className="bg-[#f87171] text-white text-sm font-bold px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-[#ef4444] transition-colors"
                  >
                    Confirm deactivation
                  </button>
                  <button
                    onClick={() => setShowDeactivate(false)}
                    className="text-gray-400 dark:text-[#9aa2b1] text-sm font-semibold bg-transparent border-none cursor-pointer hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
