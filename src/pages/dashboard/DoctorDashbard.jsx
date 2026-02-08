import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import DoctorProfileMain from "./DoctorProfileMain";
import { API_URL } from "../../config/api.js";

// Default stacked chart data (fallback when API fails)
const DEFAULT_CHART_DATA = [
  { day: 'S', appointment: 12, cancelled: 0 },
  { day: 'S', appointment: 16, cancelled: 0 },
  { day: 'M', appointment: 10, cancelled: 2 },
  { day: 'T', appointment: 8, cancelled: 7 },
  { day: 'W', appointment: 11, cancelled: 3 },
  { day: 'T', appointment: 3, cancelled: 0 },
  { day: 'F', appointment: 9, cancelled: 0 },
];

const ALERTS = [
  { id: 1, type: 'cancellation', title: 'Cancellation', time: '05:30 PM | today', message: 'Sarah William cancelled the appointment for 5:45 PM tomorrow', dotColor: 'bg-[#F28284]' },
  { id: 2, type: 'appointment', title: 'Appointment', time: '05:30 PM | today', message: 'Sarah William cancelled the appointment for 5:45 PM tomorrow', dotColor: 'bg-[#4DD181]' },
  { id: 3, type: 'appointment', title: 'Appointment', time: '05:30 PM | today', message: 'Sarah William cancelled the appointment for 5:45 PM tomorrow', dotColor: 'bg-[#4DD181]' },
];

const RATINGS = [
  { label: 'Value for money', score: 4.5 },
  { label: 'Doctor friendliness', score: 4.6 },
  { label: 'Treatment satisfaction', score: 4.9 },
  { label: 'Explanation of the health issue', score: 4.8 },
];

function StatusIcon({ status }) {
  if (status === 'completed') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#4DD181] shrink-0">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  if (status === 'cancelled') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#F28284] shrink-0">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // pending - clock/hourglass
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#FFD21E] shrink-0">
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// --- Real API fetching logic - uses doctorAppointmentsRaw.json ---

async function fetchDoctorsAppointmentsReal() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const doctorId = localStorage.getItem("doctorId");
    const token = localStorage.getItem("token");
    const url = doctorId
      ? `${API_URL}/api/doctor/appointments/${doctorId}`
      : `${API_URL}/api/doctor/appointments?date=${todayStr}`;
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    const raw = json.data ?? json;
    const list = Array.isArray(raw) ? raw : [];
    const statusMap = { confirmed: 'completed', cancelled: 'cancelled', pending: 'pending' };
    const todayList = list.filter((apt) => apt.date === todayStr);
    return todayList.map((apt) => {
      const name = apt.patientName || apt.name;
      const status = statusMap[apt.status] || apt.status || 'pending';
      return {
        ...apt,
        id: apt.id,
        name,
        phone: apt.patientPhone || apt.phone,
        time: apt.time,
        status,
        avatar: name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : 'P',
        color:
          status === 'pending' ? "bg-[#FFF0ED]" :
          status === 'completed' ? "bg-[#F0F7FF]" :
          status === 'cancelled' ? "bg-[#F2F2F2]" : "bg-[#E9E9E9]",
        textColor:
          status === 'pending' ? "text-[#E73C19]" :
          status === 'completed' ? "text-[#1A68E7]" :
          status === 'cancelled' ? "text-[#8A8A8A]" : "text-[#222222]",
        date: apt.date || todayStr,
      };
    });
  } catch (e) {
    console.error("Failed to load appointments", e);
    return [];
  }
}

export default function Dashboard() {
  const location = useLocation();
  const today = new Date();

  // State to hold today's appointments
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [analyticsPeriod, setAnalyticsPeriod] = useState("week");
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoadingAppointments(true);

    fetchDoctorsAppointmentsReal().then((apts) => {
      if (!ignore) {
        setAppointments(apts);
        setLoadingAppointments(false);
      }
    });

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoadingDashboard(true);
    fetch(`${API_URL}/api/doctor/dashboard`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((json) => {
        if (!ignore && json?.data) setDashboardData(json.data);
      })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoadingDashboard(false); });
    return () => { ignore = true; };
  }, []);

  const analytics = dashboardData?.analytics || {};
  const chartData = Array.isArray(analytics.chartData) && analytics.chartData.length > 0
    ? analytics.chartData.map((d) => ({
        day: d.day ?? '—',
        appointment: Number(d.appointment) || 0,
        cancelled: Number(d.cancelled) || 0,
      }))
    : DEFAULT_CHART_DATA;
  const maxBarValue = Math.max(
    ...chartData.map((d) => d.appointment + d.cancelled),
    1
  );
  const totalPatients = analyticsPeriod === "week"
    ? (analytics.totalPatients?.week ?? 0)
    : (analytics.totalPatients?.month ?? 0);
  const newPatients = analyticsPeriod === "week"
    ? (analytics.newPatients?.week ?? 0)
    : (analytics.newPatients?.month ?? 0);
  const analyticsChange = analytics.changePercent ?? 5;
  const analyticsLabel = analytics.changeLabel ?? "increased by last week";

  return (
    <div className="min-h-screen bg-white flex">
      {/* Main content */}
      <main className=" min-w-0 bg-[#FAFAFC] overflow-auto">
        {/* Background grid pattern */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.08]" style={{
          backgroundImage: `linear-gradient(rgba(233,236,241) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,236,241) 1px, transparent 1px)`,
          backgroundSize: '96px 96px',
        }} />

        <div className="relative z-10 p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 -mt-2">
            <div>
              <h1 className="text-[22px] font-semibold text-black leading-tight">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-[#8F95A3] mt-1">
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-[#8F95A3] mb-1">Welcome Nehar</p>
              <h1 className="text-[22px] font-semibold text-black leading-tight">
                <span className="text-[#0078FA] font-semibold">
                  {appointments.length > 0 ? `${appointments.length} Patient${appointments.length > 1 ? "s" : ""}` : "0 Patient"}
                </span>{" "}
                remaining today
              </h1>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-8 ">
            {/* Left column */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-9">
              {/* Today's Appointments */}
              <div className="w-[360px]">
                <div className="bg-white rounded-[18px] border border-[#EEF0F4] px-4 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[18px] font-semibold text-black">
                      Today’s Appointment
                    </h2>
                    <button className="text-sm text-[#8F95A3] hover:text-black">
                      See All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {loadingAppointments ? (
                      <div className="text-center text-[#8F95A3] py-8">Loading...</div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center text-[#8F95A3] py-8">No appointments for today.</div>
                    ) : (
                      appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between px-3 py-3 rounded-[14px] bg-white hover:bg-[#F7F9FC] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${apt.color} ${apt.textColor}`}
                            >
                              {apt.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black">
                                {apt.name}
                              </p>
                              <p className="text-xs text-[#8F95A3]">
                                {apt.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon status={apt.status} />
                            <span className="text-sm font-medium text-black">
                              {apt.time}
                            </span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-[#71717A]"
                            >
                              <path
                                d="M5 7.5L10 12.5L15 7.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue & Analytics row */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
                <div className="bg-white rounded-[18px] border border-[#EEF0F4] px-6 py-5 ml-5">
                  <h2 className="text-[18px] font-semibold text-black mb-3">
                    Revenue
                  </h2>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-[#8F95A3] mb-0.5">This Week</p>
                      <p className="text-[22px] font-semibold text-black">
                        {loadingDashboard ? "..." : `₹${(dashboardData?.revenue?.week ?? 0).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="w-px h-12 bg-[#E1E4E9]" />
                    <div>
                      <p className="text-sm text-[#8F95A3] mb-0.5">This Month</p>
                      <p className="text-[22px] font-semibold text-black">
                        {loadingDashboard ? "..." : `₹${(dashboardData?.revenue?.month ?? 0).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[18px] border border-[#EEF0F4] px-6 py-5 ml-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h2 className="text-[18px] font-semibold text-black">Analytics</h2>
                      <p className="text-sm text-[#8F95A3] mt-0.5">
                        {loadingDashboard ? "Loading..." : `${analyticsChange}% ${analyticsLabel}`}
                      </p>
                    </div>
                    <div className="relative">
                      <select
                        value={analyticsPeriod}
                        onChange={(e) => setAnalyticsPeriod(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#8F95A3] focus:outline-none focus:ring-2 focus:ring-[#0078FA]"
                      >
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-end gap-2 h-[120px] mt-4">
                    {chartData.map((bar, i) => {
                      const total = bar.appointment + bar.cancelled;
                      const totalPct = maxBarValue > 0 ? (total / maxBarValue) * 100 : 0;
                      const aptPct = total > 0 ? (bar.appointment / total) * totalPct : 0;
                      const cancPct = total > 0 ? (bar.cancelled / total) * totalPct : 0;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div
                            className="w-[18px] h-full rounded-t flex flex-col-reverse gap-px min-h-[40px]"
                            style={{ backgroundColor: '#E5E7EB' }}
                          >
                            {bar.cancelled > 0 && (
                              <div
                                className="w-full rounded-sm shrink-0"
                                style={{
                                  height: `${(cancPct / 100) * 120}px`,
                                  minHeight: cancPct > 0 ? 4 : 0,
                                  background: 'linear-gradient(to top, #FFD21E, #FFE566)',
                                }}
                              />
                            )}
                            {bar.appointment > 0 && (
                              <div
                                className="w-full rounded-sm shrink-0"
                                style={{
                                  height: `${(aptPct / 100) * 120}px`,
                                  minHeight: aptPct > 0 ? 4 : 0,
                                  background: 'linear-gradient(to top, #0078FA, #5BA3FF)',
                                }}
                              />
                            )}
                          </div>
                          <span className="text-xs text-[#8F95A3] mt-2">
                            {bar.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-6 mt-4 pt-4 border-t border-[#E1E4E9]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#0078FA]" />
                      <span className="text-sm text-[#92929D]">Appointment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FFD21E]" />
                      <span className="text-sm text-[#92929D]">Cancelled</span>
                    </div>
                  </div>
                  <div className="flex gap-5 py-4 border-t border-[#E1E4E9]">
                    <div className="flex items-center gap-3">
                      <div className="w-[26px] h-[26px] rounded bg-[#0078FA] flex items-center justify-center">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                          <circle cx="9" cy="7" r="4" />
                          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                          <path d="M16 11l2-2 2 2M18 16v3M18 19v-3" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm text-[#8F95A3]">Total Patient</span>
                        <p className="text-lg font-semibold">
                          {loadingDashboard ? "..." : totalPatients}
                        </p>
                      </div>
                    </div>

                    <div className="w-px h-10 bg-[#EEF0F4]" />

                    <div className="flex items-center gap-3">
                      <div className="w-[26px] h-[26px] rounded bg-[#5AAD0C] flex items-center justify-center">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.5"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                          <path d="M16 11h3M17.5 9.5V12" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm text-[#8F95A3]">New Patient</span>
                        <p className="text-lg font-semibold">
                          {loadingDashboard ? "..." : newPatients}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <DoctorProfileMain />
    </div>
  );
}
