import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  Truck,
  Wallet,
  ShieldCheck,
  PackageSearch,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s]{7,15}$/;

const STRENGTH_COLORS = [
  "",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
];

const BRAND_POINTS = [
  { icon: Truck, text: "Free delivery on orders above ₹999" },
  { icon: Wallet, text: "Cash on Delivery available" },
  { icon: ShieldCheck, text: "Secure online payments with Razorpay" },
  { icon: PackageSearch, text: "Track every order" },
];

const passwordRules = (pw) => [
  { label: "At least 8 characters", ok: pw.length >= 8 },
  { label: "At least one letter", ok: /[A-Za-z]/.test(pw) },
  { label: "At least one number", ok: /\d/.test(pw) },
];

const strengthOf = (pw) => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return {
    score,
    label: ["Too weak", "Weak", "Fair", "Good", "Strong"][score],
  };
};

const prefersReducedMotion = () =>
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Quick horizontal shake, used when a submit fails.
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
  `w-full bg-gray-50 dark:bg-[#080a0f] border rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] outline-none transition-all focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-gray-200 dark:border-[#1a1f2e] focus:border-[#4f8ef7] focus:ring-[#4f8ef7]/15"
  }`;

// These helpers live outside Login so they are not re-created on every keystroke.
function Enter({ delay = 0, children }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {children}
    </div>
  );
}

function Pop({ children }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:scale-100 ${
        shown ? "scale-100" : "scale-0"
      }`}
    >
      {children}
    </div>
  );
}

function Field({ icon: Icon, error, trailing, ...props }) {
  return (
    <div>
      <div className="group relative">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568] group-focus-within:text-[#4f8ef7] transition-colors pointer-events-none"
        />
        <input
          {...props}
          aria-invalid={!!error}
          className={`${inputCls(!!error)} ${trailing ? "pr-10" : ""}`}
        />
        {trailing}
      </div>
      {error && (
        <p
          role="alert"
          className="text-[12px] text-red-500 dark:text-[#f87171] mt-1.5 mb-0"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    contact: "",
    password: "",
    confirm: "",
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState("");

  const panelRef = useRef(null);
  const cardRef = useRef(null);
  const timerRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const isRegister = mode === "register";
  const rules = passwordRules(form.password);
  const strength = strengthOf(form.password);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const errors = {};
  if (isRegister && !form.username.trim()) errors.username = "Enter your name";
  if (!form.email.trim()) errors.email = "Enter your email";
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Enter a valid email address";
  if (isRegister && form.contact.trim() && !PHONE_RE.test(form.contact.trim()))
    errors.contact = "Enter a valid phone number";
  if (!form.password) errors.password = "Enter your password";
  else if (isRegister && rules.some((r) => !r.ok))
    errors.password = "Password does not meet the requirements";
  if (isRegister && form.confirm !== form.password)
    errors.confirm = "Passwords do not match";

  const shown = (field) =>
    (touched[field] || submitted) && errors[field] ? errors[field] : "";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const switchMode = (next) => {
    setMode(next);
    setTouched({});
    setSubmitted(false);
    setForm((prev) => ({ ...prev, password: "", confirm: "" }));
  };

  // Cursor parallax + glow on the brand panel (no re-render: CSS variables only).
  const handleMove = (e) => {
    const el = panelRef.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      ((e.clientX - r.left) / r.width - 0.5).toFixed(3),
    );
    el.style.setProperty(
      "--my",
      ((e.clientY - r.top) / r.height - 0.5).toFixed(3),
    );
    el.style.setProperty("--px", `${e.clientX - r.left}px`);
    el.style.setProperty("--py", `${e.clientY - r.top}px`);
    el.style.setProperty("--h", "1");
  };

  const handleLeave = () => {
    const el = panelRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
    el.style.setProperty("--h", "0");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      shake(cardRef.current);
      return;
    }

    setLoading(true);
    const email = form.email.trim();

    try {
      if (!isRegister) {
        const res = await api.post("/api/users/login", {
          email,
          password: form.password,
        });
        login(res.data.user);
        toast.success("Login successful");
        navigate(from, { replace: true });
        return;
      }

      await api.post("/api/users/register", {
        username: form.username.trim(),
        email,
        contact: form.contact.trim(),
        password: form.password,
      });
      toast.success("Account created successfully");

      try {
        const res = await api.post("/api/users/login", {
          email,
          password: form.password,
        });
        setWelcome(form.username.trim().split(/\s+/)[0]);
        // Let the welcome screen show before the router sends them onward.
        timerRef.current = setTimeout(
          () => {
            login(res.data.user);
            navigate(from, { replace: true });
          },
          prefersReducedMotion() ? 300 : 1400,
        );
      } catch {
        toast.info("Account created. Please sign in.");
        switchMode("login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      shake(cardRef.current);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-[#080a0f]">
      {/* Brand panel */}
      <div
        ref={panelRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="hidden lg:flex relative overflow-hidden flex-col justify-between bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white p-12"
      >
        <div
          className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-white/10 blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform:
              "translate(calc(var(--mx, 0) * -50px), calc(var(--my, 0) * -50px))",
          }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-black/10 blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform:
              "translate(calc(var(--mx, 0) * 60px), calc(var(--my, 0) * 60px))",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: "var(--h, 0)",
            background:
              "radial-gradient(420px circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,0.16), transparent 60%)",
          }}
        />

        <Link to="/" className="relative flex items-center gap-2 no-underline">
          <div className="w-10 h-10 rounded-xl bg-white text-[#1e3a8a] flex items-center justify-center font-extrabold">
            K
          </div>
          <span className="text-white font-extrabold text-xl tracking-widest">
            KOREX
          </span>
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-4 xl:max-w-[300px] 2xl:max-w-md">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-white/85 text-base mb-8 max-w-md xl:max-w-[300px] 2xl:max-w-md">
            {isRegister
              ? "Join KOREX to save your cart, track orders and check out faster."
              : "Sign in to see your cart, wishlist and orders."}
          </p>
          <ul className="list-none p-0 m-0 flex flex-col gap-4 xl:max-w-[300px] 2xl:max-w-md">
            {BRAND_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={17} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/60 text-xs m-0">
          © {new Date().getFullYear()} KOREX
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12">
        <div ref={cardRef} className="w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden flex items-center justify-center gap-2 mb-8 no-underline"
          >
            <div className="w-9 h-9 rounded-xl bg-[#4f8ef7] flex items-center justify-center text-white font-extrabold">
              K
            </div>
            <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold text-xl tracking-widest">
              KOREX
            </span>
          </Link>

          {welcome ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-6">
                <Pop>
                  <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Check size={40} strokeWidth={3} className="text-white" />
                  </div>
                </Pop>
              </div>
              <Enter delay={200}>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-2">
                  Welcome, {welcome}!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 m-0">
                  Your account is ready. Taking you back to shopping...
                </p>
              </Enter>
            </div>
          ) : (
            <>
              <div className="relative flex bg-gray-100 dark:bg-[#0e1117] rounded-xl p-1 mb-7">
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-[#4f8ef7] shadow transition-transform duration-300 ease-out ${
                    isRegister ? "translate-x-full" : "translate-x-0"
                  }`}
                />
                {["login", "register"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchMode(tab)}
                    className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors cursor-pointer border-none bg-transparent ${
                      mode === tab
                        ? "text-white"
                        : "text-gray-500 dark:text-[#6b7280] hover:text-gray-900 dark:hover:text-[#f0f2f7]"
                    }`}
                  >
                    {tab === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              <form
                key={mode}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                {isRegister && (
                  <Enter delay={0}>
                    <Field
                      icon={User}
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="Full name"
                      aria-label="Full name"
                      value={form.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      onBlur={() => handleBlur("username")}
                      error={shown("username")}
                      maxLength={100}
                    />
                  </Enter>
                )}

                <Enter delay={isRegister ? 60 : 0}>
                  <Field
                    icon={Mail}
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email address"
                    aria-label="Email address"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    error={shown("email")}
                    maxLength={150}
                  />
                </Enter>

                {isRegister && (
                  <Enter delay={120}>
                    <Field
                      icon={Phone}
                      type="tel"
                      name="tel"
                      autoComplete="tel"
                      placeholder="Phone number (optional)"
                      aria-label="Phone number"
                      value={form.contact}
                      onChange={(e) => handleChange("contact", e.target.value)}
                      onBlur={() => handleBlur("contact")}
                      error={shown("contact")}
                      maxLength={20}
                    />
                  </Enter>
                )}

                <Enter delay={isRegister ? 180 : 70}>
                  <Field
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    placeholder="Password"
                    aria-label="Password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    onKeyUp={(e) =>
                      setCapsLock(!!e.getModifierState?.("CapsLock"))
                    }
                    error={isRegister ? "" : shown("password")}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568] hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors bg-transparent border-none cursor-pointer flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    }
                  />

                  {capsLock && (
                    <p className="text-[12px] text-amber-600 dark:text-amber-400 mt-1.5 mb-0">
                      Caps Lock is on
                    </p>
                  )}

                  {isRegister && form.password && (
                    <div className="mt-3">
                      <div className="flex gap-1.5 mb-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              n <= strength.score
                                ? STRENGTH_COLORS[strength.score]
                                : "bg-gray-200 dark:bg-[#1a1f2e]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0 mb-2">
                        {strength.label}
                      </p>
                      <ul className="list-none p-0 m-0 flex flex-col gap-1">
                        {rules.map((r) => (
                          <li
                            key={r.label}
                            className={`flex items-center gap-1.5 text-[12px] transition-colors ${
                              r.ok
                                ? "text-green-600 dark:text-[#4ade80]"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            <Check
                              size={12}
                              className={r.ok ? "opacity-100" : "opacity-30"}
                            />
                            {r.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Enter>

                {isRegister && (
                  <Enter delay={240}>
                    <Field
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      name="confirm"
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      aria-label="Confirm password"
                      value={form.confirm}
                      onChange={(e) => handleChange("confirm", e.target.value)}
                      onBlur={() => handleBlur("confirm")}
                      error={shown("confirm")}
                    />
                  </Enter>
                )}

                <Enter delay={isRegister ? 300 : 140}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative overflow-hidden w-full bg-gradient-to-r from-[#3a7be8] to-[#4f8ef7] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#4f8ef7]/30 disabled:opacity-60 cursor-pointer border-none mt-1"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      <>
                        {isRegister ? "Create Account" : "Sign In"}
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </Enter>
              </form>

              <p className="text-center text-gray-500 dark:text-[#6b7280] text-sm mt-6 mb-0">
                {isRegister ? "Already have an account? " : "New to KOREX? "}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? "login" : "register")}
                  className="text-[#4f8ef7] font-bold bg-transparent border-none cursor-pointer hover:underline"
                >
                  {isRegister ? "Sign In" : "Create an account"}
                </button>
              </p>

              <p className="text-center mt-5 mb-0">
                <Link
                  to="/"
                  className="text-gray-500 dark:text-[#6b7280] text-xs no-underline hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
                >
                  ← Back to store
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
