import { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const prefersReducedMotion = () =>
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const shake = (el) => {
  if (!el?.animate || prefersReducedMotion()) return;
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-8px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 400, easing: "ease-in-out" },
  );
};

const inputCls = (hasError) =>
  `w-full bg-[#0b0e14] border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#e7e9ee] placeholder-[7c8699] outline-none transition-colors ${
    hasError
      ? "border-red-500/70 focus:border-red-400"
      : "border-[#262c3a] focus:border-[#5b8cff]"
  }`;

function AdminLogin({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pageRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleMove = (e) => {
    const el = pageRef.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${e.clientX - r.left}px`);
    el.style.setProperty("--py", `${e.clientY - r.top}px`);
    el.style.setProperty("--h", "1");
  };

  const handleLeave = () => {
    pageRef.current?.style.setProperty("--h", "0");
  };

  const errors = {};
  if (!form.email.trim()) errors.email = "Enter your email";
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Enter a valid email address";
  if (!form.password) errors.password = "Enter your password";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      shake(cardRef.current);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/admin/login", {
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("Login successful");
      onLoginSuccess(res.data.admin);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      shake(cardRef.current);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={pageRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden min-h-screen bg-[#0b0e14] flex items-center justify-center p-4 sm:p-7 font-sans text-[#e7e9ee]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#5b8cff 1px, transparent 1px), linear-gradient(90deg, #5b8cff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: "var(--h, 0)",
          background:
            "radial-gradient(480px circle at var(--px, 50%) var(--py, 50%), rgba(91,140,255,0.16), transparent 60%)",
        }}
      />

      <div
        className={`relative w-full max-w-[400px] transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          ref={cardRef}
          className="bg-[#111623] border border-[#1e2432] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#1b2436] flex items-center justify-center text-[#5b8cff]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight m-0">
                Admin Login
              </h1>
              <p className="text-xs text-[#9aa2b1] m-0 mt-0.5">
                KOREX control panel
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#c7cbd4] mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[7c8699] pointer-events-none"
                />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={submitted && !!errors.email}
                  className={inputCls(submitted && !!errors.email)}
                />
              </div>
              {submitted && errors.email && (
                <p
                  role="alert"
                  className="text-[12px] text-[#f87171] mt-1.5 mb-0"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#c7cbd4] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[7c8699] pointer-events-none"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onKeyUp={(e) =>
                    setCapsLock(!!e.getModifierState?.("CapsLock"))
                  }
                  aria-invalid={submitted && !!errors.password}
                  className={`${inputCls(submitted && !!errors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[7c8699] hover:text-[#e7e9ee] transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {capsLock && (
                <p className="text-[12px] text-amber-400 mt-1.5 mb-0">
                  Caps Lock is on
                </p>
              )}
              {submitted && errors.password && (
                <p
                  role="alert"
                  className="text-[12px] text-[#f87171] mt-1.5 mb-0"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b6ee8] hover:bg-[#335fcc] text-white border-none py-3 rounded-lg text-sm font-bold cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[7c8699] mt-4 mb-0">
          Authorised staff only. Too many failed attempts will lock sign-in for
          15 minutes.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
