import { useState } from "react";
import {
  Mail,
  User,
  MessageSquare,
  FileText,
  Send,
  CheckCircle,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function ContactUs() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.username || "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/contact", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-gray-50 dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors";

  const infoCards = [
    {
      icon: <MapPin size={18} />,
      title: "Our Location",
      detail: "Surat, Gujarat, India",
    },
    { icon: <Mail size={18} />, title: "Email Us", detail: "support@korex.in" },
    { icon: <Phone size={18} />, title: "Call Us", detail: "+91 98765 43210" },
    {
      icon: <Clock size={18} />,
      title: "Working Hours",
      detail: "Mon–Sat, 9am–6pm",
    },
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-[#0f2a1c] flex items-center justify-center">
            <CheckCircle
              size={40}
              className="text-green-500 dark:text-[#4ade80]"
            />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-3">
          Message Sent!
        </h2>
        <p className="text-gray-400 dark:text-[#4a5568] text-sm mb-8">
          Thanks for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({
              name: user?.username || "",
              email: "",
              subject: "",
              message: "",
            });
          }}
          className="bg-[#4f8ef7] text-white font-bold px-6 py-3 rounded-xl border-none cursor-pointer hover:bg-[#3a7be8] transition-colors text-sm"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10 text-center">
        <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-2">
          Get in Touch
        </p>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-3">
          Contact Us
        </h1>
        <p className="text-gray-400 dark:text-[#4a5568] text-sm max-w-md mx-auto">
          Have a question? We're here for you.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {infoCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-5 flex flex-col items-center text-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4f8ef7]/10 flex items-center justify-center text-[#4f8ef7]">
              {card.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-[#4a5568] uppercase tracking-widest mb-1">
                {card.title}
              </p>
              <p className="text-[13px] font-semibold text-gray-900 dark:text-[#f0f2f7]">
                {card.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7]">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Send a Message
              </div>
              <div className="text-xs text-gray-400 dark:text-[#4a5568] mt-0.5">
                We'll get back to you within 24 hours
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-[#2a1414] text-red-500 dark:text-[#f87171] border border-red-100 dark:border-[#422121] px-4 py-3 rounded-lg text-sm font-semibold mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
                />
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
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
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>
            <div className="relative">
              <FileText
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5568]"
              />
              <input
                type="text"
                placeholder="Subject (optional)"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="relative">
              <MessageSquare
                size={15}
                className="absolute left-3.5 top-3.5 text-gray-400 dark:text-[#4a5568]"
              />
              <textarea
                placeholder="Write your message here..."
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                required
                rows={5}
                className="w-full bg-gray-50 dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4f8ef7] text-white font-bold py-3.5 rounded-xl border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send size={15} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
