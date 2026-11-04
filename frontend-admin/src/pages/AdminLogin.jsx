import { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
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
  `w-full bg-[#0b0e14] border rounded-xl pl-11 pr-3.5 py-3 text-sm text-[#e7e9ee] placeholder-[#7c8699] outline-none transition-colors focus:ring-4 ${
    hasError
      ? "border-red-500/70 focus:border-red-400 focus:ring-red-500/10"
      : "border-[#262c3a] focus:border-[#5b8cff] focus:ring-[#5b8cff]/10"
  }`;

function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-[#4f8ef7] flex items-center justify-center text-white text-lg font-extrabold">
        K
      </div>
      <span className="text-xl font-extrabold tracking-tight text-white">
        KOREX
      </span>
    </div>
  );
}

function AdminLogin({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    <div className="min-h-screen bg-[#0b0e14] grid lg:grid-cols-2 font-sans text-[#e7e9ee]">
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #0e1a38, #2b5fc7)" }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #8fb2ff, transparent 70%)",
          }}
        />
        <Logo className="relative" />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white m-0 mb-4">
            Run your store from one place.
          </h2>
          <p className="text-base text-white/75 leading-relaxed m-0">
            Manage products, orders, payments, customers and messages in the
            KOREX control panel.
          </p>
        </div>
        <p className="relative text-xs text-white/60 m-0">
          Authorised staff only.
        </p>
      </aside>

      <main className="flex items-center justify-center p-5 sm:p-8">
        <div
          className={`w-full max-w-[400px] transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <Logo className="lg:hidden mb-8" />

          <div ref={cardRef}>
            <h1 className="text-3xl font-extrabold tracking-tight m-0">
              Welcome back
            </h1>
            <p className="text-sm text-[#9aa2b1] mt-2 mb-8">
              Sign in to continue to the admin panel.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-[#c7cbd4] mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c8699] pointer-events-none"
                  />
                  <input
                    id="admin-email"
                    type="email"
                    name="admin-email"
                    autoComplete="username"
                    autoFocus
                    placeholder="name@example.com"
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

              <div className="mb-7">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[#c7cbd4] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c8699] pointer-events-none"
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
                    className={`${inputCls(submitted && !!errors.password)} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8699] hover:text-[#e7e9ee] transition-colors bg-transparent border-none cursor-pointer flex items-center"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                className="w-full bg-[#3b6ee8] hover:bg-[#335fcc] text-white border-none py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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

            <p className="text-[12px] text-[#7c8699] leading-relaxed mt-6 mb-0">
              Too many failed attempts will lock sign-in for 15 minutes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLogin;
