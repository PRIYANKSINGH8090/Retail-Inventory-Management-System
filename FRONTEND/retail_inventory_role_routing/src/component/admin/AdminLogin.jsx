import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");

    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/v1/users/login", {
        email,
        password,
      });

      const user = res.data.user;

      if (!["admin", "staff"].includes(user.role)) {
        setErr("This account is not an administrator or staff account");
        return;
      }

      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("authToken", res.data.accessToken);
      localStorage.setItem("adminLoggedIn", "true");

      navigate(user.role === "admin" ? "/admin/dashboard" : "/staff/catalogue", {
        replace: true,
      });
    } catch (error) {
      setErr(error.response?.data?.message || "Server se connect nahi ho pa raha.");
    }
  };

  return (
    <div className="auth">
      <div className="auth-art">
        <h1>Dockside</h1>
        <p>Warehouse administration and operations.</p>
      </div>

      <div className="auth-form">
        <h2>Administrator Login</h2>
        <p className="muted">Sign in to access the admin panel.</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          placeholder="admin email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {err && <p className="error">{err}</p>}

        <button className="btn" onClick={submit}>
          Sign in
        </button>

      </div>
    </div>
  );
}
