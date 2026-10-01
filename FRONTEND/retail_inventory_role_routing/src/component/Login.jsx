import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [role, setRole] = useState("customer");
  const [emailorusername, setemailorusername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        { 
          email: emailorusername,
          password
        }
      );

      console.log(response.data);

      // Use the role returned by the backend, not the role selected in the UI.
      const user =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        response.data;

      const loggedInRole = String(user?.role || role).toLowerCase();

      if (!["admin", "staff", "customer"].includes(loggedInRole)) {
        setLoginError("Login successful, but user role is missing or invalid.");
        return;
      }

      localStorage.setItem(
        "authUser",
        JSON.stringify({
          ...user,
          role: loggedInRole,
        })
      );

      // Save token if your backend sends one.
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      if (loggedInRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (loggedInRole === "staff") {
        navigate("/staff/catalogue", { replace: true });
      } else {
        navigate("/customer/shop", { replace: true });
      }

    } catch (error) {
      console.log(error);

      if (error.response) {
        setLoginError(
          error.response.data.message || "Invalid email or password"
        );
      } else {
        setLoginError("Server se connect nahi ho pa raha.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0c171e]">

      {/* LEFT SIDE */}
      <div className="w-full md:w-[52%] min-h-75 md:min-h-screen bg-[#162731] relative">
        <div className="absolute left-8 md:left-12 bottom-10 md:bottom-20">
          <h1 className="text-[#ffb91f] text-5xl md:text-7xl font-extrabold tracking-[-2px] mb-5 md:mb-9">
            Dockside
          </h1>

          <p className="text-gray-100 text-base md:text-xl leading-relaxed">
            Order from the warehouse.
            <br />
            Track it to your door.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[48%] min-h-screen bg-[#0c171e] flex justify-center">

        <div className="w-93.25 max-w-[calc(100%-40px)] pt-12 md:pt-14 pb-10">

          <h2 className="text-white text-2xl font-bold mb-8">
            Sign in
          </h2>

          {/* ROLE */}
          <div className="mb-8">
            <p className="text-[#8faec2] text-sm mb-2">
              Sign in as
            </p>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`px-4 py-2 text-sm rounded border transition ${
                  role === "customer"
                    ? "bg-[#ffb91f] border-[#ffb91f] text-[#111]"
                    : "bg-transparent border-[#294554] text-[#8faec2] hover:border-[#ffb91f] hover:text-white"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole("staff")}
                className={`px-4 py-2 text-sm rounded border transition ${
                  role === "staff"
                    ? "bg-[#ffb91f] border-[#ffb91f] text-[#111]"
                    : "bg-transparent border-[#294554] text-[#8faec2] hover:border-[#ffb91f] hover:text-white"
                }`}
              >
                Staff
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-4 py-2 text-sm rounded border transition ${
                  role === "admin"
                    ? "bg-[#ffb91f] border-[#ffb91f] text-[#111]"
                    : "bg-transparent border-[#294554] text-[#8faec2] hover:border-[#ffb91f] hover:text-white"
                }`}
              >
                Admin
              </button>

            </div>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="mb-6">

              <label
                htmlFor="email"
                className="block text-[#8faec2] text-sm mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={emailorusername}
                onChange={(e) => {
                  setemailorusername(e.target.value);
                  setLoginError("");
                }}
                className="w-full h-11 bg-[#162731] border border-[#294554] rounded outline-none px-3 text-white focus:border-[#ffb91f]"
                required
              />

            </div>

            {/* PASSWORD */}
            <div className="mb-4">

              <label
                htmlFor="password"
                className="block text-[#8faec2] text-sm mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError("");
                }}
                className="w-full h-11 bg-[#162731] border border-[#294554] rounded outline-none px-3 text-white focus:border-[#ffb91f]"
                required
              />

            </div>

            {/* LOGIN ERROR */}
            {loginError && (
              <p className="text-red-400 text-sm mb-4">
                {loginError}
              </p>
            )}

            {/* SIGN IN */}
            <button
              type="submit"
              className="w-full h-10 bg-[#ffb91f] hover:bg-[#ffc83d] text-[#111] font-semibold rounded transition"
            >
              Sign in
            </button>

          </form>

          {/* REGISTER */}
          {role === "customer" && (
            <div className="text-center mt-5">
              <a
                href="/register"
                className="text-[#8fb8d1] text-sm underline hover:text-white"
              >
                New customer? Create an account
              </a>
            </div>
          )}

          {/* SELECTED ROLE */}
          <p className="text-center text-[#607d8b] text-xs mt-6">
            Signing in as{" "}
            <span className="text-[#ffb91f] capitalize">
              {role}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default App;