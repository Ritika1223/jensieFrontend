  import { useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";


  export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    // Inline validation errors (field key -> message)
    const [errors, setErrors] = useState({});

    const API_BASE = "https://jensiebackend-1.onrender.com/api/doctor"; // change if needed

    const setFieldError = (field, message) => {
      setErrors((prev) => ({ ...prev, [field]: message }));
    };
    const clearFieldError = (field) => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };
    const clearErrors = () => setErrors({});

    // 🔹 Send OTP
    const handleSendOtp = async () => {
      // Do not clear errors here, so both new and previous field errors stay visible
      let newErrors = { ...errors };

      // Validate fields and add errors without wiping out other errors
      if (!firstName?.trim()) newErrors.firstName = "First name is required";
      else delete newErrors.firstName;
      if (!lastName?.trim()) newErrors.lastName = "Last name is required";
      else delete newErrors.lastName;
      if (!phone?.trim()) newErrors.phone = "Mobile number is required";
      else if (!/^[\d\s+()-]{10,}$/.test(phone.replace(/\s/g, ""))) {
        newErrors.phone = "Enter a valid mobile number";
      } else {
        delete newErrors.phone;
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).some((k) => !!newErrors[k])) {
        return;
      }

      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE}/send-otp`, {
          firstName,
          lastName,
          phone,
        });
        setOtpSent(true);
        // Keep existing field errors except 'otpSentInfo'; don't remove other errors
        setErrors((prev) => ({
          ...prev,
          otpSentInfo: res.data.message || "OTP sent",
        }));
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to send OTP";
        setErrors((prev) => ({
          ...prev,
          phone: msg,
        }));
      } finally {
        setLoading(false);
      }
    };

    // 🔹 Verify OTP
    const handleVerifyOtpOnly = async () => {
      // Do not clear all errors, just update the 'otp' error if any
      if (!otp?.trim()) {
        setErrors((prev) => ({
          ...prev,
          otp: "Enter OTP",
        }));
        return;
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.otp;
          return next;
        });
      }

      try {
        setLoading(true);
        await axios.post(`${API_BASE}/verify-otp`, { phone, otp });
        setOtpVerified(true);
        // Remove the otp error and otp verified info when OTP is verified
        setErrors((prev) => {
          const next = { ...prev };
          delete next.otp;
          delete next.otpVerifiedInfo;
          return next;
        });
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          otp: err.response?.data?.error || "Invalid OTP",
        }));
      } finally {
        setLoading(false);
      }
    };

    const handleSignup = async () => {
      clearErrors();
      if (!otpVerified) {
        setFieldError("general", "Please verify OTP first");
        return;
      }

      const newErrors = {};
      if (!email?.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Enter a valid email address";
      }
      if (!password?.trim()) newErrors.password = "Password is required";
      else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE}/signup`, {
          firstName,
          lastName,
          phone,
          email,
          password,
        });

        localStorage.setItem("token", res.data.token);

        // Show a small popup/notification using window.alert as a fallback since setSignupPopupOpen is undefined
        window.alert("Signup successful! Redirecting to login...");

        // Navigate to login after 5 seconds
        setTimeout(() => {
          navigate("/doctor-login");
        }, 5000);
      } catch (err) {
        const data = err.response?.data;
        const msg = data?.error || "Signup failed";
        if (data?.errors && typeof data.errors === "object") {
          setErrors((prev) => ({ ...prev, ...data.errors, general: data.error || msg }));
        } else if (data?.field) {
          setFieldError(data.field, msg);
        } else {
          setFieldError("general", msg);
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="w-7xl rounded-2xl shadow">
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F8FAFF]">
          
          {/* LEFT SIDE */}
          <div className="relative hidden md:flex items-center justify-center overflow-hidden">
            <div className="absolute bottom-24 w-72 h-72 rounded-full bg-[#4F6EF7]" />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center px-6">
            <div className="w-full max-w-md">

              <h1 className="text-3xl font-bold text-[#0A1440] mb-2">
                Create your account
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                Get started with secure, guided health support.
              </p>

              {errors.general && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500">First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearFieldError("firstName");
                    }}
                    type="text"
                    className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${errors.firstName ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Last name</label>
                  <input
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearFieldError("lastName");
                    }}
                    type="text"
                    className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${errors.lastName ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="mb-4">
                <label className="text-xs text-gray-500">Mobile Number</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError("phone");
                  }}
                  type="text"
                  placeholder="+91 9876543210"
                  className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* OTP */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="col-span-1 bg-[#4F6EF7] text-white rounded-lg text-sm"
                >
                  {otpSent ? "Resend OTP" : "Send OTP"}
                </button>
                <div className="col-span-2">
                  <input
                    placeholder="OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      clearFieldError("otp");
                    }}
                    disabled={!otpSent || otpVerified}
                    className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${errors.otp ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-600">{errors.otp}</p>
                  )}
                </div>
              </div>
              {!otpVerified && otpSent && (
                <button
                  onClick={handleVerifyOtpOnly}
                  disabled={loading}
                  className="w-full mb-4 bg-[#4F6EF7] text-white py-3 rounded-lg"
                >
                  Verify OTP
                </button>
              )}

              <div className="mb-6">
                <label className="text-xs text-gray-500">Email</label>
                <input
                  type="email"
                  placeholder="eg- abc@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              {otpVerified && (
                <div className="mb-6">
                  <label className="text-xs text-gray-500">Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    className={`w-full mt-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F6EF7] ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSignup}
                className="w-full bg-[#4F6EF7] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                Sign up
              </button>


            </div>
          </div>
        </div>
      </div>
    );
  }
