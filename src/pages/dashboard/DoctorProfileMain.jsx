import { useState, useEffect } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { API_URL } from "../../config/api.js";

const API_BASE = `${API_URL}/api/doctor`;
const DEMO_DOCTOR_IMAGE = "/landing-page/doctors/doctor-1.png";

export default function DoctorProfileMain(props) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view profile");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use /profile endpoint – backend gets doctorId from JWT token
        const res = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = res.data?.doctor ?? res.data?.user ?? res.data?.data ?? res.data;
        setProfile(typeof raw === "object" && raw !== null ? raw : res.data);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="w-1/2 xl:w-[320px] bg-[#F8F8F8] rounded-[17px] border border-black/5 p-6 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-[86px] h-[86px] rounded-full bg-gray-200" />
          <div className="h-5 w-32 bg-gray-200 rounded mt-3" />
          <div className="h-4 w-24 bg-gray-200 rounded mt-2" />
          <div className="flex justify-between mt-6 w-full">
            <div className="h-10 w-16 bg-gray-200 rounded" />
            <div className="h-10 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-1/2 xl:w-[320px] bg-[#F8F8F8] rounded-[17px] border border-black/5 p-6">
        <p className="text-sm text-red-600 text-center">{error}</p>
      </div>
    );
  }

  const data = profile || {};
  const first = data.firstName ?? data.first_name ?? data.givenName ?? "";
  const last = data.lastName ?? data.last_name ?? data.familyName ?? "";
  const name =
    props.name ??
    data.name ??
    data.fullName ??
    (first || last ? [first, last].filter(Boolean).join(" ").trim() : null) ??
    "N/A";
  const specialty = props.specialty ?? data.specialty ?? data.speciality ?? data.department ?? "N/A";
  const image = props.image ?? data.image ?? data.avatar ?? data.photo ?? DEMO_DOCTOR_IMAGE;
  const verified = props.verified ?? data.verified ?? false;
  const rating =
    props.rating ??
    (typeof data.rating === "number" || typeof data.rating === "string" ? data.rating : null) ??
    (typeof data.overallRating === "number" || typeof data.overallRating === "string" ? data.overallRating : null) ??
    "N/A";
  const totalPatients =
    props.totalPatients ??
    (typeof data.totalPatients === "number" || typeof data.totalPatients === "string" ? data.totalPatients : null) ??
    (typeof data.patientCount === "number" || typeof data.patientCount === "string" ? data.patientCount : null) ??
    "N/A";
  const reviews = Array.isArray(props.reviews)
    ? props.reviews
    : (Array.isArray(data.reviews) ? data.reviews : data.ratings) ?? [];
  const alertsList = Array.isArray(props.alerts) ? props.alerts : (Array.isArray(data.alerts) ? data.alerts : []);

  return (
    <div className="w-1/2 xl:w-[320px] bg-[#F8F8F8] rounded-[17px] border border-black/5 p-6">
      {/* Doctor info */}
      <div className="flex flex-col items-center text-center">
        <img
          src={image}
          alt={name}
          className="w-[86px] h-[86px] rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEMO_DOCTOR_IMAGE;
          }}
        />

        <div className="flex items-center gap-1 mt-3">
          <h3 className="text-base font-semibold text-black">{name}</h3>
          {verified && (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#3B82F6">
              <path d="M10 0l2.5 2.5L16 3l-1 3 2 3-3 1-1 3-3-1-3 1-1-3-3-1 2-3-1-3 3.5-.5L10 0z"/>
            </svg>
          )}
        </div>

        <p className="text-sm text-[#92929D]">{specialty}</p>
      </div>

      {/* Rating stats */}
      <div className="flex justify-between mt-6">
        <div className="text-center">
          <p className="text-sm text-[#92929D]">Overall Rating</p>
          <p className="text-lg font-semibold">{rating}</p>
        </div>
        <div className="w-px bg-[#E1E4E9]" />
        <div className="text-center">
          <p className="text-sm text-[#92929D]">Total Patients</p>
          <p className="text-lg font-semibold">{totalPatients}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6 space-y-2">
        {(Array.isArray(reviews) ? reviews : []).length > 0 ? (
          (Array.isArray(reviews) ? reviews : []).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-[#444]">{item.label ?? "N/A"}</span>
              <span className="flex items-center gap-1 font-medium">
                <Star className="w-4 h-4 fill-[#FFD21E] text-[#FFD21E]" />
                {item.value ?? item.score ?? "N/A"}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-[#92929D]">No reviews available</div>
        )}
      </div>

      {/* Alerts */}
      <div className="mt-7">
        <h4 className="text-sm font-semibold mb-3">Alerts</h4>

        <div className="space-y-4">
          {alertsList.length > 0 ? (
            alertsList.map((alert, index) => (
              <div key={index} className="flex gap-3">
                <span
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === "cancel"
                      ? "bg-[#F28284]"
                      : "bg-[#4DD181]"
                  }`}
                />
                <div>
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-medium">{alert.title ?? "N/A"}</p>
                    <span className="text-xs text-[#92929D]">
                      {alert.time ?? "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-[#666]">
                    {alert.message ?? "N/A"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[#92929D]">No alerts to show</div>
          )}
        </div>
      </div>
    </div>
  );
}
