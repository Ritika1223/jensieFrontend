import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config/api.js";
import {
  MapPin,
  Mail,
  Check,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Search,
  Star,
  PenSquare,
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Phone,
  Twitter,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const API_BASE = `${API_URL}/api/doctor`;

// Demo doctor image (from public folder) – used when no image from API or on load error
const DEMO_DOCTOR_IMAGE = "/landing-page/doctors/doctor-1.png";

const RATING_BARS = [
  { label: "Value for money", value: 4.5 },
  { label: "Doctor friendliness", value: 4.6 },
  { label: "Treatment satisfaction", value: 4.9 },
  { label: "Explanation of the health issue", value: 4.8 },
];

const SAMPLE_REVIEWS = [
  {
    name: "Alexander Rity",
    avatar: null,
    time: "1 month ago",
    rating: 5.0,
    text: "Easy booking, great value! Cozy rooms at a reasonable price in Sheffield's vibrant center. Surprisingly quiet with nearby. Traveler's accommodations. Highly recommended!",
  },
  {
    name: "Emma Crieght",
    avatar: null,
    time: "2 months ago",
    rating: 5.0,
    text: "Effortless booking, unbeatable affordability! Small yet comfortable rooms in the heart of Sheffield's nightlife hub, surrounded by elegant housing, it's a peaceful gem. Thumbs up!",
  },
];

const VISIT_REASON_COLORS = ["#166534", "#84CC16", "#BEF264", "#D1D5DB", "#9CA3AF", "#4B5563"];
const na = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? v : "N/A");

const DEFAULT_PROFILE = {
  name: "",
  specialty: "",
  image: DEMO_DOCTOR_IMAGE,
  rating: "",
  overallRating: "",
  totalRatings: "",
  verified: false,
  fee: "",
  location: "",
  email: "",
  about: "",
  education: "",
  registration: "",
  specializedIssues: [],
  treatments: [],
  visitReasons: [],
  linkedin: "",
  instagram: "",
  youtube: "",
  twitter: "",
  website: "",
};

function DonutChart({ data, size = 120 }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + (Number(d.percent) || 0), 0);
  if (total === 0) return null;
  const segments = data.reduce((acc, d) => {
    const pct = (d.percent / total) * 100;
    const offset = acc.reduce((sum, s) => sum + s.pct, 0);
    acc.push({ ...d, pct, offset });
    return acc;
  }, []);

  const strokeWidth = size * 0.2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} className="shrink-0">
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circumference;
        const gap = circumference - dash;
        const dashOffset = -((seg.offset / 100) * circumference);
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color || "#9CA3AF"}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CALENDAR_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TIME_PERIODS = ["Morning", "Afternoon", "Evening", "Night"];

function format24to12(time24) {
  const [h, m] = (time24 || "09:00").split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${period}`;
}

export default function DoctorsProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Evening");
  const [selectedTime, setSelectedTime] = useState("6:30 PM");
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [slotsFromApi, setSlotsFromApi] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...DEFAULT_PROFILE });
  const [saving, setSaving] = useState(false);

  const openEditModal = () => {
    setEditForm({ ...profile });
    setEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    setSaving(true);
    setProfile(editForm);
    setEditModalOpen(false);
    const token = localStorage.getItem("token");
    const doctorId = localStorage.getItem("doctorId") || profile?._id || profile?.doctorId;
    if (token && doctorId) {
      const payload = {
        name: editForm.name || undefined,
        specialty: editForm.specialty || undefined,
        image: editForm.image || undefined,
        rating: editForm.rating || undefined,
        fee: editForm.fee || undefined,
        location: editForm.location || undefined,
        email: editForm.email || undefined,
        about: editForm.about || undefined,
        education: editForm.education || undefined,
        registration: editForm.registration || undefined,
        specializedIssues: (editForm.specializedIssues || []).filter(Boolean),
        treatments: (editForm.treatments || []).filter(Boolean),
        visitReasons: (editForm.visitReasons || []).filter((r) => r && (r.label || r.percent)),
      };
      axios.put(`${API_BASE}/${doctorId}`, payload, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    setSaving(false);
  };

  const clinicPhotos = [
    "https://images.unsplash.com/photo-1631217868264-682b1506d881?w=800&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
    "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80",
  ];

  // Merge profile: raw from /profile or /:doctorId has real name/email; raw-profile has fallback data
  const mapRawToProfile = (raw, prev) => {
    if (!raw || typeof raw !== "object") return prev;
    const first = raw.firstName ?? raw.first_name ?? "";
    const last = raw.lastName ?? raw.last_name ?? "";
    const rawName = raw.name ?? ([first, last].filter(Boolean).join(" ").trim() || null);
    const rawEmail = raw.email ?? null;
    return {
      ...prev,
      // Name & email: fromId = real doctor (ID fetch); else raw-profile fallback
      name: rawName || prev.name,
      email: rawEmail ?? prev.email,
      specialty: raw.specialty ?? raw.speciality ?? prev.specialty,
      image: raw.image ?? raw.avatar ?? raw.photo ?? DEMO_DOCTOR_IMAGE,
      rating: raw.rating ?? raw.overallRating ?? prev.rating,
      overallRating: raw.overallRating ?? raw.rating ?? prev.overallRating,
      totalRatings: raw.totalRatings ?? raw.total_ratings ?? raw.totalPatients ?? raw.patientCount ?? prev.totalRatings,
      verified: raw.verified ?? prev.verified,
      location: raw.location ?? raw.city ?? prev.location,
      about: raw.about ?? raw.bio ?? prev.about,
      education: raw.education ?? prev.education,
      registration: raw.registration ?? raw.registrations?.[0] ?? prev.registration,
      fee: raw.fee ?? raw.consultationFee ?? prev.fee,
      specializedIssues: Array.isArray(raw.specializedIssues) ? raw.specializedIssues : (raw.specialized_issues || prev.specializedIssues || []),
      treatments: Array.isArray(raw.treatments) ? raw.treatments : (prev.treatments || []),
      visitReasons: Array.isArray(raw.visitReasons) ? raw.visitReasons : (raw.visit_reasons || prev.visitReasons || []),
    };
  };

  useEffect(() => {
    const doctorId = localStorage.getItem("doctorId") || profile?._id || profile?.doctorId;
    if (!doctorId) {
      setSlotsFromApi(null);
      return;
    }
    let cancelled = false;
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;
    (async () => {
      setSlotsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/doctor/slots/${doctorId}?date=${dateStr}`);
        if (cancelled) return;
        const slots = res.data?.data?.availableSlots || [];
        const byPeriod = { Morning: [], Afternoon: [], Evening: [], Night: [] };
        slots.forEach((s) => {
          const label = s.label || format24to12(s.startTime);
          if (s.period && byPeriod[s.period]) byPeriod[s.period].push(label);
        });
        setSlotsFromApi(byPeriod);
      } catch {
        if (!cancelled) setSlotsFromApi(null);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDate, selectedMonth, selectedYear, profile?._id, profile?.doctorId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const doctorId = localStorage.getItem("doctorId");

    const fetchRawProfile = () =>
      axios.get(`${API_BASE}/raw-profile`).then((res) => {
        const raw = res.data?.doctor ?? res.data?.data ?? res.data;
        setProfile((prev) => mapRawToProfile(raw, prev));
      }).catch(() => {});

    if (token) {
      // Prefer /profile – backend gets doctorId from JWT; name & email are real from ID
      const applyIdData = (raw) => {
        if (raw && typeof raw === "object") {
          const id = raw._id ?? raw.doctorId;
          if (id && !localStorage.getItem("doctorId")) localStorage.setItem("doctorId", String(id));
          setProfile((prev) => mapRawToProfile(raw, prev));
          return true;
        }
        return false;
      };

      const loadFallback = () =>
        doctorId
          ? axios.get(`${API_BASE}/${doctorId}`, { headers: { Authorization: `Bearer ${token}` } })
              .then((res) => { const raw = res.data?.doctor ?? res.data?.user ?? res.data?.data ?? res.data; if (!applyIdData(raw)) fetchRawProfile(); })
              .catch(() => fetchRawProfile())
          : fetchRawProfile();

      axios
        .get(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          const raw = res.data?.doctor ?? res.data?.user ?? res.data?.data ?? res.data;
          if (!applyIdData(raw)) return fetchRawProfile();
        })
        .catch(() => loadFallback())
        .finally(() => setLoading(false));
    } else {
      fetchRawProfile().finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const p = profile;
  const displayMonth = MONTHS[calendarMonth];
  const allApiSlots = slotsFromApi ? Object.values(slotsFromApi).flat() : [];
  const periodSlots = slotsFromApi?.[selectedPeriod] || [];
  // Only display saved slots from API - no fallback
  const timeSlots =
    periodSlots.length > 0 ? periodSlots : allApiSlots.length > 0 ? allApiSlots : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Doctors Profile</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openEditModal}
            className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 transition"
            title="Edit profile"
          >
            <Pencil size={20} />
          </button>
          <div className="relative w-64 sm:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
          />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative shrink-0">
                <img
                  src={p.image || DEMO_DOCTOR_IMAGE}
                  alt={na(p.name)}
                  className="w-32 h-32 rounded-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = DEMO_DOCTOR_IMAGE; }}
                />
                <span className="absolute -top-0.5 -left-0.5 w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-sm font-bold text-yellow-900 shadow">
                  {na(p.rating)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-indigo-500 text-sm font-medium mb-0.5">{na(p.specialty)}</p>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-800">{na(p.name)}</h2>
                  {p.verified && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#3B82F6" className="shrink-0">
                      <path d="M10 0l2.5 2.5L16 3l-1 3 2 3-3 1-1 3-3-1-3 1-1-3-3-1 2-3-1-3 3.5-.5L10 0z" />
                    </svg>
                  )}
                  <span className="text-gray-700 font-medium ml-auto">{na(p.fee)} fee</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-gray-600 text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="shrink-0" />
                    {na(p.location)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="shrink-0" />
                    {na(p.email)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <a href={p.instagram || "#"} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-200" aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                  <a href={p.linkedin || "#"} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200" aria-label="LinkedIn">
                    <Linkedin size={16} />
                  </a>
                  <a href={p.youtube || "#"} className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200" aria-label="YouTube">
                    <Youtube size={16} />
                  </a>
                  <a href={p.twitter || "#"} className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-200" aria-label="Twitter">
                    <Twitter size={16} />
                  </a>
                  <a href={p.website || "#"} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200" aria-label="Website">
                    <Globe size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{na(p.about)}</p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Education</h3>
            <p className="flex items-center gap-2 text-gray-700 text-sm">
              <Check size={18} className="text-green-500 shrink-0" />
              {na(p.education)}
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Registrations</h3>
            <p className="flex items-center gap-2 text-gray-700 text-sm">
              <Check size={18} className="text-green-500 shrink-0" />
              {na(p.registration)}
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Specialized/Issues</h3>
            <div className="flex flex-wrap gap-2">
              {(p.specializedIssues || []).length > 0
                ? (p.specializedIssues || []).map((item, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">{na(item)}</span>
                  ))
                : <span className="text-gray-500 text-sm">{na(null)}</span>}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Treatments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {(p.treatments || []).length > 0
                ? (p.treatments || []).map((t, i) => (
                    <p key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <Check size={18} className="text-green-500 shrink-0" />
                      {na(t)}
                    </p>
                  ))
                : <p className="text-gray-500 text-sm">{na(null)}</p>}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Top Patient Visit Reasons</h3>
            {(p.visitReasons || []).length > 0 ? (
              <div className="flex flex-wrap items-start gap-6">
                <DonutChart data={(p.visitReasons || []).filter((r) => r && (r.percent || r.label))} size={120} />
                <div className="space-y-2">
                  {(p.visitReasons || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-3.5 h-3.5 rounded shrink-0" style={{ backgroundColor: item.color || "#9CA3AF" }} />
                      <span>{na(item.label)} – {na(item.percent)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{na(null)}</p>
            )}
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Reviews</h3>
              <button type="button" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                <PenSquare size={16} />
                Write a Feedback
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold text-gray-800">{na(p.overallRating ?? p.rating)}</p>
                <div className="flex justify-center sm:justify-start gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} className="fill-purple-500 text-purple-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{na(p.totalRatings)} Ratings</p>
              </div>
              <div className="flex-1 space-y-2">
                {RATING_BARS.map((bar, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-200 rounded-full"
                        style={{ width: `${(bar.value / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap w-48">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {SAMPLE_REVIEWS.map((rev, i) => (
                <div key={i} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-sm font-medium text-gray-500">
                    {rev.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm">{rev.name}</span>
                      <span className="text-xs text-gray-400">{rev.time}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Star key={j} size={14} className="fill-purple-500 text-purple-500" />
                      ))}
                      <span className="text-sm font-medium text-gray-600 ml-1">{rev.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{rev.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-4">
              Show More
              <ChevronDown size={16} />
            </button>
          </section>
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-6">
          {/* Book Appointment */}
          <div className="bg-[#F6F4F0] rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Book Appointment</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900">{displayMonth} {calendarYear}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear((y) => y - 1);
                    } else setCalendarMonth((m) => m - 1);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear((y) => y + 1);
                    } else setCalendarMonth((m) => m + 1);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-gray-500 mb-2">
              {CALENDAR_DAYS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {showFullCalendar ? (
              <>
                {/* Full calendar grid - 6 rows, includes prev/next month days */}
                <div className="grid grid-cols-7 gap-1.5 text-sm text-center mb-4">
                  {(() => {
                    const first = new Date(calendarYear, calendarMonth, 1);
                    const startOffset = first.getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
                    const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                    const daysPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
                    const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                    const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                    const cells = [];
                    for (let i = 0; i < startOffset; i++) {
                      const day = daysPrevMonth - startOffset + 1 + i;
                      cells.push({ day, month: prevMonth, year: prevYear, isCurrentMonth: false });
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                      cells.push({ day: d, month: calendarMonth, year: calendarYear, isCurrentMonth: true });
                    }
                    const remaining = 42 - cells.length;
                    for (let d = 1; d <= remaining; d++) {
                      cells.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
                    }
                    return cells.map((cell, i) => {
                      const isSelected =
                        cell.year === selectedYear &&
                        cell.month === selectedMonth &&
                        cell.day === selectedDate;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedDate(cell.day);
                            setSelectedMonth(cell.month);
                            setSelectedYear(cell.year);
                            if (!cell.isCurrentMonth) {
                              setCalendarMonth(cell.month);
                              setCalendarYear(cell.year);
                            }
                          }}
                          className={`py-2 rounded-lg text-sm font-medium transition ${
                            isSelected
                              ? "bg-gray-900 text-white"
                              : cell.isCurrentMonth
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {cell.day}
                        </button>
                      );
                    });
                  })()}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullCalendar(false)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
                >
                  Show Less Calendar
                  <ChevronUp size={14} />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-12 h-12 shrink-0 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 hover:bg-purple-300 transition"
                    aria-label="Call"
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold transition"
                  >
                    Book Now
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.5 text-sm text-center mb-4">
                  {(() => {
                    const first = new Date(calendarYear, calendarMonth, 1);
                    const startOffset = first.getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const cells = [];
                    for (let i = 0; i < startOffset; i++) cells.push(null);
                    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                    return cells.map((day, i) =>
                      day === null ? (
                        <div key={i} />
                      ) : (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedMonth(calendarMonth);
                            setSelectedYear(calendarYear);
                          }}
                          className={`py-1.5 rounded-lg ${
                            selectedDate === day && selectedMonth === calendarMonth && selectedYear === calendarYear
                              ? "bg-gray-800 text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    );
                  })()}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullCalendar(true)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:underline mb-4"
                >
                  Show full Calendar
                  <ChevronDown size={14} />
                </button>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {TIME_PERIODS.map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        selectedPeriod === period ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                {slotsLoading ? (
                  <p className="text-sm text-gray-500 mb-4">Loading slots…</p>
                ) : timeSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">No slots available. Doctor has not set schedule for this day.</p>
                ) : null}
                <div className="flex flex-wrap gap-2 mb-4">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedTime === time ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-12 h-12 shrink-0 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 hover:bg-purple-300 transition"
                    aria-label="Call"
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold transition"
                  >
                    <Phone size={18} />
                    Book Now
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Location</h3>
            <div className="relative rounded-xl overflow-hidden bg-gray-200 aspect-[4/3] flex items-center justify-center">
              <MapPin size={40} className="text-purple-500 z-10" />
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80"
                alt="Map"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">2.7km</p>
          </div>

          {/* Photo's */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Photo's</h3>
            <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video mb-3">
              <img
                src={clinicPhotos[mainPhotoIndex]}
                alt="Clinic"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {clinicPhotos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMainPhotoIndex(i)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    mainPhotoIndex === i ? "border-lime-500" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
        >
          Report an issue
        </button>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Edit profile</h2>
              <button type="button" onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Image URL</label>
                <input type="text" placeholder="N/A" value={editForm.image || ""} onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Name</label>
                  <input type="text" placeholder="N/A" value={editForm.name || ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Specialty</label>
                  <input type="text" placeholder="N/A" value={editForm.specialty || ""} onChange={(e) => setEditForm((f) => ({ ...f, specialty: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Rating</label>
                  <input type="text" placeholder="N/A" value={editForm.rating ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, rating: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Fee</label>
                  <input type="text" placeholder="N/A" value={editForm.fee ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, fee: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Location</label>
                <input type="text" placeholder="N/A" value={editForm.location ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email</label>
                <input type="email" placeholder="N/A" value={editForm.email ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">About</label>
                <textarea placeholder="N/A" value={editForm.about ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, about: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Education</label>
                <input type="text" placeholder="N/A" value={editForm.education ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, education: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Registrations</label>
                <input type="text" placeholder="N/A" value={editForm.registration ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, registration: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Verified</label>
                <input type="checkbox" checked={!!editForm.verified} onChange={(e) => setEditForm((f) => ({ ...f, verified: e.target.checked }))} className="rounded" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Specialized/Issues (add one per line or use Add)</label>
                {(editForm.specializedIssues || []).map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder="N/A" value={item} onChange={(e) => { const n = [...(editForm.specializedIssues || [])]; n[i] = e.target.value; setEditForm((f) => ({ ...f, specializedIssues: n })); }} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                    <button type="button" onClick={() => setEditForm((f) => ({ ...f, specializedIssues: (f.specializedIssues || []).filter((_, j) => j !== i) }))} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditForm((f) => ({ ...f, specializedIssues: [...(f.specializedIssues || []), ""] }))} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"><Plus size={14} /> Add new</button>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Treatments</label>
                {(editForm.treatments || []).map((t, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder="N/A" value={t} onChange={(e) => { const n = [...(editForm.treatments || [])]; n[i] = e.target.value; setEditForm((f) => ({ ...f, treatments: n })); }} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                    <button type="button" onClick={() => setEditForm((f) => ({ ...f, treatments: (f.treatments || []).filter((_, j) => j !== i) }))} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditForm((f) => ({ ...f, treatments: [...(f.treatments || []), ""] }))} className="flex items-center gap-1 text-sm text-green-600 hover:underline"><Plus size={14} /> Add treatment</button>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Visit reasons (label, %, color)</label>
                {(editForm.visitReasons || []).map((item, i) => (
                  <div key={i} className="flex flex-wrap gap-2 mb-2 p-2 border rounded">
                    <input type="text" placeholder="Label" value={item.label ?? ""} onChange={(e) => { const n = [...(editForm.visitReasons || [])]; n[i] = { ...n[i], label: e.target.value }; setEditForm((f) => ({ ...f, visitReasons: n })); }} className="w-32 px-2 py-1 border rounded text-sm" />
                    <input type="number" placeholder="%" value={item.percent ?? ""} onChange={(e) => { const n = [...(editForm.visitReasons || [])]; n[i] = { ...n[i], percent: Number(e.target.value) || 0 }; setEditForm((f) => ({ ...f, visitReasons: n })); }} className="w-16 px-2 py-1 border rounded text-sm" />
                    <input type="text" placeholder="#color" value={item.color ?? ""} onChange={(e) => { const n = [...(editForm.visitReasons || [])]; n[i] = { ...n[i], color: e.target.value }; setEditForm((f) => ({ ...f, visitReasons: n })); }} className="w-20 px-2 py-1 border rounded text-sm" />
                    <button type="button" onClick={() => setEditForm((f) => ({ ...f, visitReasons: (f.visitReasons || []).filter((_, j) => j !== i) }))} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditForm((f) => ({ ...f, visitReasons: [...(f.visitReasons || []), { label: "", percent: 0, color: VISIT_REASON_COLORS[(f.visitReasons || []).length % VISIT_REASON_COLORS.length] }] }))} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"><Plus size={14} /> Add visit reason</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500 block mb-1">LinkedIn</label><input type="url" value={editForm.linkedin ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, linkedin: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Instagram</label><input type="url" value={editForm.instagram ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">YouTube</label><input type="url" value={editForm.youtube ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, youtube: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Website</label><input type="url" value={editForm.website ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</button>
              <button type="button" onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
