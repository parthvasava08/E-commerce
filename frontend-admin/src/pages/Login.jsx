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
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.headerIcon}>◑</div>
          <h1 style={s.h1}>Welcome, {loggedInUser.username}</h1>
          <p style={s.sub}>{loggedInUser.email}</p>

          {message && <div style={s.toast}>{message}</div>}

          <button style={s.primaryBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.headerIcon}>◑</div>
        <h1 style={s.h1}>{mode === "login" ? "Log in" : "Create account"}</h1>
        <p style={s.sub}>
          {mode === "login" ? "Log in to continue" : "Sign up to get started"}
        </p>

        {message && <div style={s.toast}>{message}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                style={s.input}
              />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={s.input}
            />
          </div>

          {mode === "register" && (
            <div style={s.field}>
              <label style={s.label}>Contact</label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                style={s.input}
              />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              style={s.input}
            />
          </div>

          <button type="submit" style={s.primaryBtn}>
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p style={s.switchText}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span
                style={s.link}
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
                style={s.link}
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

const s = {
  page: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "#0b0e14",
    color: "#e7e9ee",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    boxSizing: "border-box",
  },
  card: {
    width: 360,
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 14,
    padding: 32,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#1b2436",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#5b8cff",
    marginBottom: 16,
  },
  h1: {
    fontSize: 22,
    fontWeight: 800,
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  sub: { fontSize: 12.8, color: "#9aa2b1", margin: "0 0 20px" },
  toast: {
    background: "#0f2a1c",
    color: "#4ade80",
    padding: "10px 16px",
    borderRadius: 9,
    fontSize: 12.8,
    fontWeight: 600,
    marginBottom: 18,
    border: "1px solid #17422c",
  },
  field: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#c7cbd4",
    marginBottom: 7,
  },
  input: {
    width: "100%",
    background: "#0b0e14",
    border: "1px solid #262c3a",
    borderRadius: 9,
    padding: "11px 14px",
    fontSize: 13.5,
    color: "#e7e9ee",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    width: "100%",
    background: "#3b6ee8",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 6,
  },
  switchText: {
    textAlign: "center",
    fontSize: 12.5,
    color: "#6b7280",
    marginTop: 18,
  },
  link: {
    color: "#5b8cff",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Login;
