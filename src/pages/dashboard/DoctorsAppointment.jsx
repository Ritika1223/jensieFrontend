import { useEffect, useState, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import axios from "axios";

const API_BASE = `https://jensiebackend-1.onrender.com/api/doctor`;

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);

  // Focus the search bar on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const doctorId = localStorage.getItem("doctorId");
      if (!token) {
        setError("You must be logged in to see appointments.");
        setLoading(false);
        return;
      }
      if (!doctorId) {
        setError("Doctor ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/appointments/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const raw =
          res.data?.data ??
          res.data?.appointments ??
          (Array.isArray(res.data) ? res.data : []);
        const list = Array.isArray(raw) ? raw : [];
        setAppointments(
          list.map((apt) => ({
            ...apt,
            note: apt.note ?? apt.notes,
            status: apt.status === "confirmed" ? "ok" : apt.status === "cancelled" ? "cancel" : apt.status,
          }))
        );
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to fetch appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Enable searching as you type and also with Enter key for accessibility
  const onSearchInput = (e) => {
    setSearch(e.target.value);
  };

  const onSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch("");
      if (searchInputRef.current) searchInputRef.current.blur();
    }
    // Enter key is handled via input as-you-type, but if special handling is needed, add here.
  };

  // Case-sensitive search implementation
  const filteredAppointments = appointments.filter((apt) => {
    if (!search.trim()) return true;
    const s = search.trim();
    const note = apt.note ?? apt.notes;
    return (
      (apt.name && apt.name.includes(s)) ||
      (apt.phone && apt.phone.includes(s)) ||
      (note && String(note).includes(s))
    );
  });

  return (
    <main className="flex-1 bg-white px-10 pt-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-semibold text-black">
          Appointments
        </h1>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              onClick={() => {
                if (searchInputRef.current) searchInputRef.current.focus();
              }}
              aria-label="Focus search"
              style={{ cursor: 'pointer' }}
            />
            <input
              ref={searchInputRef}
              placeholder="Search"
              aria-label="Search appointments"
              autoFocus
              className="pl-9 pr-4 h-9 w-[240px] rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={onSearchInput}
              onKeyDown={onSearchKeyDown}
            />
            {/* Active search clear button */}
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#555] bg-transparent border-0 p-0 m-0 cursor-pointer"
                tabIndex={0}
              >
                <svg width="16" height="16" viewBox="0 0 16 16"  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4L12 12" strokeLinecap="round"/>
                  <path d="M12 4L4 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Filter */}
          <button className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="bg-[#FAFAFC] rounded-[16px] p-4 min-h-[200px] relative">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12 w-full absolute inset-0 bg-[#FAFAFC]/90 z-10">
            <span className="text-gray-600 text-sm">Loading appointments...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex items-center justify-center py-10">
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2.5fr_2fr_3fr] px-4 py-3 text-sm text-[#8F95A3]">
              <span>Patient Detail</span>
              <span>Date & Time</span>
              <span>Notes</span>
            </div>

            {/* Rows */}
            {filteredAppointments.length > 0 ? (
              <div className="space-y-2">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id || apt._id || Math.random()}
                    className="grid grid-cols-[2.5fr_2fr_3fr] items-center bg-white rounded-[14px] px-4 py-4"
                  >
                    {/* Patient */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                          apt.color ??
                          "bg-blue-100 text-blue-500"
                        }`}
                      >
                        {/* If avatar or initials, else fallback */}
                        {apt.avatar
                          ? apt.avatar
                          : apt.name
                          ? apt.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                          : "PT"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">
                          {apt.name ?? "—"}
                        </p>
                        <p className="text-xs text-[#8F95A3]">
                          {apt.phone ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm">
                      {apt.status === "ok" ? (
                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          ✓
                        </span>
                      ) : apt.status === "cancel" ? (
                        <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                          ✕
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                          ?
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-black">
                          {/* Accept appointment date as ISO/date string, fallback */}
                          {apt.date
                            ? new Date(apt.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                        <p className="text-xs text-[#8F95A3]">
                          {/* Optionally show time and period */}
                          {apt.time
                            ? apt.time
                            : apt.date
                            ? new Date(apt.date).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <p className="text-sm text-[#555]">
                      {apt.note ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-[#888] text-sm">
                No appointments found.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
