import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/doctor"; // adjust if needed

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email?.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      // Post email and password to login endpoint
      const res = await axios.post(
        `${API_BASE}/login`,
        { email: email.trim(), password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Accept token and doctor information from either root, or .doctor key
      const token = res.data?.token;
      // Accept _id from res.data.doctor._id, res.data._id, or res.data.doctorId
      let doctorId =
        res.data?.doctor?._id ||
        res.data?._id ||
        res.data?.doctorId;

      // If doctor info was under doctor, also store the full details for future use
      if (token && res.data?.doctor) {
        localStorage.setItem("doctorDetails", JSON.stringify(res.data.doctor));
      }

      // If token is present, but doctorId could not be determined, fallback: still go to dashboard
      if (token && !doctorId) {
        // Optionally, notify for missing ID, but don't block login success.
        localStorage.setItem("token", token);
        navigate("/dashboard");
        return;
      }

      if (!token) {
        setError("Login failed: token not returned from server.");
        setLoading(false);
        return;
      }

      // Save token and doctorId to localStorage if present
      localStorage.setItem("token", token);
      console.log(doctorId);
      console.log(token);
      if (doctorId) localStorage.setItem("doctorId", doctorId);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      let message = data?.error ?? data?.message ?? "Invalid email or password. Please try again.";
      if (data?.errors && Array.isArray(data.errors)) {
        message = data.errors.map((e) => e.msg || e.message || e).join(". ");
      } else if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
        message = Object.entries(data.errors).map(([k, v]) => `${k}: ${v}`).join(". ");
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F8FAFF]">
      
      {/* LEFT SIDE */}
      <div className="relative hidden md:flex items-center justify-center bg-[#F8FAFF] overflow-hidden">
        <div className="w-72 h-72 rounded-full bg-[#4F6EF7] blur-[2px]" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          
          <h1 className="text-3xl font-bold text-[#0A1440] mb-2">
            Welcome Back!
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Hello Doctor,
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">E-mail</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${error ? "border-red-500 focus:ring-red-500" : ""}`}
            />
          </div>

          {/* Password */}
          <div className="mb-2 relative">
            <label className="text-xs text-gray-500">Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${error ? "border-red-500 focus:ring-red-500" : ""}`}
            />
          </div>

          <div className="text-right mb-6">
            <button className="text-xs font-medium text-[#0A1440]">
              Forgot Password
            </button>
          </div>

          {/* Sign in */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#4F6EF7] text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
           {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-3 text-xs text-gray-400">
              Or sign in with
            </span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button onClick={() =>
    window.location.href = "http://localhost:3000/api/doctor/google"
  }
           className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 transition">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>


        </div>
      </div>
    </div>
  );
}
