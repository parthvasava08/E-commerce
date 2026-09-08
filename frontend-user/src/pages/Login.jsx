import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    contact: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const from = location.state?.from || "/";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      if (mode === "login") {
        const res = await api.post("/api/users/login", {
          email: form.email,
          password: form.password,
        });
        login(res.data.user);
        navigate("/", { replace: true });
      } else {
        await api.post("/api/users/register", {
          username: form.username,
          email: form.email,
          contact: form.contact,
          password: form.password,
        });
        setMessage({
          text: "Account created — you can now sign in.",
          type: "success",
        });
        setMode("login");
        setForm((prev) => ({
          ...prev,
          username: "",
          contact: "",
          password: "",
        }));
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-gray-50 dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors";

  return (
    <div className="min-h-screen bg-white dark:bg-[#080a0f] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#4f8ef7] flex items-center justify-center text-white font-extrabold">
            K
          </div>
          <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold text-xl tracking-widest">
            KOREX
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-8">
          <div className="flex bg-gray-200 dark:bg-[#080a0f] rounded-xl p-1 mb-7">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMode(tab);
                  setMessage({ text: "", type: "" });
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer border-none ${
                  mode === tab
                    ? "bg-[#4f8ef7] text-white"
                    : "bg-transparent text-gray-400 dark:text-[#4a5568] hover:text-gray-900 dark:hover:text-[#f0f2f7]"
                }`}
              >
                {tab === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {message.text && (
            <div
              className={`px-4 py-3 rounded-lg text-sm font-semibold mb-5 ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-[#0f2a1c] text-green-600 dark:text-[#4ade80] border border-green-200 dark:border-[#17422c]"
                  : "bg-red-50 dark:bg-[#2a1414] text-red-500 dark:text-[#f87171] border border-red-200 dark:border-[#422121]"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className={inputCls}
              />
            </div>

            {mode === "register" && (
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
                />
                <input
                  type="text"
                  placeholder="Contact number (optional)"
                  value={form.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  className={inputCls}
                />
              </div>
            )}

            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568] hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors bg-transparent border-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4f8ef7] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#3a7be8] transition-colors disabled:opacity-50 cursor-pointer border-none mt-1"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="text-center text-gray-400 dark:text-[#4a5568] text-xs mt-6">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage({ text: "", type: "" });
              }}
              className="text-[#4f8ef7] font-bold bg-transparent border-none cursor-pointer hover:underline"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>

        <p className="text-center mt-5">
          <Link
            to="/"
            className="text-gray-400 dark:text-[#4a5568] text-xs no-underline hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
          >
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
