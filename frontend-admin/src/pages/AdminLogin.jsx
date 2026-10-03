import { useState } from "react";
import api from "../api/axiosInstance";

function AdminLogin({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/api/admin/login", {
        email: form.email,
        password: form.password,
      });
      onLoginSuccess(res.data.admin);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-7 font-sans text-[#e7e9ee]">
      <div className="w-full max-w-[360px] bg-[#111623] border border-[#1e2432] rounded-2xl p-6 sm:p-8">
        <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] mb-4">
          ◆
        </div>
        <h1 className="text-xl font-extrabold mb-1 tracking-tight">
          Admin Login
        </h1>
        <p className="text-xs text-[#9aa2b1] mb-5">
          Sign in to access the dashboard
        </p>

        {message && (
          <div className="bg-[#2a1414] text-[#f87171] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 border border-[#422121]">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b6ee8] text-white border-none py-3 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
