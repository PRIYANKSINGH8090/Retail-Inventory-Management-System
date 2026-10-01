import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerError, setRegisterError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setRegisterError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        {
          fullName,
          username,
          email,
          password,
          role: "customer", 
        }
      );

      console.log("Backend response:", response.data);

      setSuccessMessage("Account created successfully! Taking you to login...");

      // form clear
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");

      // go to login page
      setTimeout(() => navigate("/", { replace: true }), 1500);

    } catch (error) {
      console.log("Register error:", error);

      if (error.response) {
        setRegisterError(
          error.response.data.message || "Registration failed"
        );
      } else {
        setRegisterError("Server se connect nahi ho pa raha.");
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

          {/* TITLE */}
          <h2 className="text-white text-2xl font-bold mb-8">
            Create account
          </h2>


          {/* REGISTER FORM */}
          <form onSubmit={handleRegister}>

            {/* FULL NAME */}
            <div className="mb-5">

              <label
                htmlFor="fullName"
                className="block text-[#8faec2] text-sm mb-2"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 bg-[#162731] border border-[#294554] rounded outline-none px-3 text-white focus:border-[#ffb91f]"
                required
              />

            </div>


            {/* USERNAME */}
            <div className="mb-5">

              <label
                htmlFor="username"
                className="block text-[#8faec2] text-sm mb-2"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 bg-[#162731] border border-[#294554] rounded outline-none px-3 text-white focus:border-[#ffb91f]"
                required
              />

            </div>


            {/* EMAIL */}
            <div className="mb-5">

              <label
                htmlFor="email"
                className="block text-[#8faec2] text-sm mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-[#162731] border border-[#294554] rounded outline-none px-3 text-white focus:border-[#ffb91f]"
                required
              />

            </div>


            {/* PASSWORD */}
            <div className="mb-5">

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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-[#162731] border border-[#294554] rounded outline-none px-3 text-white focus:border-[#ffb91f]"
                required
              />

            </div>


            {/* ERROR */}
            {registerError && (
              <p className="text-red-400 text-sm mb-4">
                {registerError}
              </p>
            )}


            {/* SUCCESS */}
            {successMessage && (
              <p className="text-green-400 text-sm mb-4">
                {successMessage}
              </p>
            )}


            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="w-full h-10 bg-[#ffb91f] hover:bg-[#ffc83d] text-[#111] font-semibold rounded transition"
            >
              Create account
            </button>

          </form>


          {/* LOGIN */}
          <div className="text-center mt-5">

            <a
              href="/"
              className="text-[#8fb8d1] text-sm underline hover:text-white"
            >
              Already have an account? Sign in
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;