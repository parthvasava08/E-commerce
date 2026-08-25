import { useState } from "react";
import axios from "axios";

function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    contact: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ username: "", email: "", contact: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (mode === "login") {
        const res = await axios.post("http://localhost:5000/api/users/login", {
          email: form.email,
          password: form.password,
        });
        setLoggedInUser(res.data.user);
        setMessage("Login successful");
      } else {
        // eslint-disable-next-line no-unused-vars
        const res = await axios.post(
          "http://localhost:5000/api/users/register",
          form,
        );
        setMessage("Registered successfully — you can now log in");
        setMode("login");
        resetForm();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setMessage("Logged out");
    resetForm();
  };

  if (loggedInUser) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-7 font-sans text-[#e7e9ee]">
        <div className="w-[360px] bg-[#111623] border border-[#1e2432] rounded-2xl p-8">
          <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] mb-4">
            ◑
          </div>
          <h1 className="text-xl font-extrabold mb-1 tracking-tight">
            Welcome, {loggedInUser.username}
          </h1>
          <p className="text-xs text-[#9aa2b1] mb-5">{loggedInUser.email}</p>

          {message && (
            <div className="bg-[#0f2a1c] text-[#4ade80] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 border border-[#17422c]">
              {message}
            </div>
          )}

          <button
            className="w-full bg-[#3b6ee8] text-white border-none py-3 rounded-lg text-sm font-bold cursor-pointer mt-1.5"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-7 font-sans text-[#e7e9ee]">
      <div className="w-[360px] bg-[#111623] border border-[#1e2432] rounded-2xl p-8">
        <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] mb-4">
          ◑
        </div>
        <h1 className="text-xl font-extrabold mb-1 tracking-tight">
          {mode === "login" ? "Log in" : "Create account"}
        </h1>
        <p className="text-xs text-[#9aa2b1] mb-5">
          {mode === "login" ? "Log in to continue" : "Sign up to get started"}
        </p>

        {message && (
          <div className="bg-[#0f2a1c] text-[#4ade80] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 border border-[#17422c]">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
              />
            </div>
          )}

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

          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                Contact
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
              />
            </div>
          )}

          <div className="mb-4">
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
            className="w-full bg-[#3b6ee8] text-white border-none py-3 rounded-lg text-sm font-bold cursor-pointer mt-1.5"
          >
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#6b7280] mt-5">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span
                className="text-[#5b8cff] cursor-pointer font-bold"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-[#5b8cff] cursor-pointer font-bold"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Log in
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
