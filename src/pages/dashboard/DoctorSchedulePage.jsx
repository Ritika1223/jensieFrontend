import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronRight, ChevronDown, ChevronUp, ChevronLeft, Search } from "lucide-react";
import { API_URL } from "../../config/api.js";

const CARDS_PER_VIEW = 4;

/**
 * Utility to generate the next N days from today.
 */
function getNext30Days() {
  const today = new Date();
  let days = [];
  for (let i = 0; i < 30; i++) {
    let d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLongDayDisplay(date) {
  const dayName = WEEKDAY_SHORT[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTH_SHORT[date.getMonth()];
  return `${dayName} ${dayNum} ${month}`;
}

function generateTimeSlots(start, end, intervalMin = 15) {
  let parse = ({ h, m, period }) => {
    let hour = h;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + m;
  };

  let startMin = parse(start);
  let endMin = parse(end);
  if (startMin > endMin) endMin += 24 * 60;

  let slots = [];
  for (let min = startMin; min < endMin; min += intervalMin) {
    let hour = Math.floor(min / 60) % 24;
    let mm = min % 60;
    let period = hour < 12 ? "AM" : "PM";
    let showHour = hour % 12 === 0 ? 12 : hour % 12;
    let label = `${showHour}:${mm.toString().padStart(2, "0")} ${period}`;
    slots.push({
      label,
      timeMinutes: (hour % 24) * 60 + mm,
      hour24: hour,
      minutes: mm,
      period,
    });
  }
  return slots;
}

// Morning: 7 AM–12 PM | Afternoon: 12 PM–4 PM | Evening: 4 PM–7 PM | Night: 7 PM–12 AM
function getSlotSection(hour, minutes) {
  if (hour >= 7 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 16) return "Afternoon";
  if (hour >= 16 && hour < 19) return "Evening";
  return "Night";
}

function makeInitialSlotAvailability(dates, timeSlotsPerDay) {
  const obj = {};
  for (const date of dates) {
    obj[date.toDateString()] = {};
    (timeSlotsPerDay[date.toDateString()] || []).forEach((timeObj) => {
      let timeLabel = typeof timeObj === "string" ? timeObj : timeObj.label;
      obj[date.toDateString()][timeLabel] = true;
    });
  }
  return obj;
}
function makeInitialDayAvailability(dates) {
  return Object.fromEntries(dates.map((d) => [d.toDateString(), true]));
}

// Default times by weekday for Standard mode: 0=Sun, 6=Sat
const STANDARD_DEFAULTS = {
  0: { openingHour: { h: 10, m: 0, period: "AM" }, closingHour: { h: 2, m: 0, period: "PM" }, slotDuration: 15 },
  6: { openingHour: { h: 10, m: 0, period: "AM" }, closingHour: { h: 2, m: 0, period: "PM" }, slotDuration: 15 },
  1: { openingHour: { h: 9, m: 0, period: "AM" }, closingHour: { h: 5, m: 0, period: "PM" }, slotDuration: 15 },
  2: { openingHour: { h: 9, m: 0, period: "AM" }, closingHour: { h: 5, m: 0, period: "PM" }, slotDuration: 15 },
  3: { openingHour: { h: 9, m: 0, period: "AM" }, closingHour: { h: 5, m: 0, period: "PM" }, slotDuration: 15 },
  4: { openingHour: { h: 9, m: 0, period: "AM" }, closingHour: { h: 5, m: 0, period: "PM" }, slotDuration: 15 },
  5: { openingHour: { h: 9, m: 0, period: "AM" }, closingHour: { h: 5, m: 0, period: "PM" }, slotDuration: 15 },
};

// ===== POPUP COMPONENT =====
function ConfirmDayUnavailablePopup({ open, onClose, onConfirm, targetDay, willBeAvailable }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 99999,
        inset: 0,
        background: "rgba(0,0,0,0.36)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#fff",
          width: 404,
          height: 250,
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          boxShadow: "0 8px 34px 0 rgba(0,0,0,0.05)",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: 1,
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 800,
              fontSize: "18px",
              lineHeight: "100%",
              color: "#111827",
              // Removed invalid CSS property 'text'. 'fontWeight' is already set above.
              textAlign: "center",
              width: "100%",
            }}
          >
            {willBeAvailable
              ? `Do you want to mark this day as available?`
              : `Do you want to mark this day as unavailable?`}
            <br />
            <span style={{ fontWeight: 400, fontSize: "14px", color: "#6B7280",  }}>
              <br />
              <span>
                <strong>{targetDay}</strong>
              </span>
            </span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <button
            onClick={() => onConfirm && onConfirm()}
            style={{
              width: 372,
              height: 50,
              borderRadius: 12,
              border: "0.5px solid #E5E7EB",
              opacity: 1,
              background: "linear-gradient(90deg, #796BFF 0%, #4C9EFF 100%)",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 800,
              text: "bold",
              color: "white",
              fontSize: 16,
              padding: "10px 28px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            style={{
              width: 372,
              height: 50,
              borderRadius: 12,
              border: "0.5px solid #E5E7EB",
              opacity: 1,
              background: "#F3F4F6",
              color: "#374151",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              padding: "10px 28px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorSchedule() {
  const allDates = getNext30Days();
  const cardsPerView = CARDS_PER_VIEW;
  const [visibleStart, setVisibleStart] = useState(0);
  const visibleDates = allDates.slice(visibleStart, visibleStart + cardsPerView);
  const DAYS_PER_RIGHT_VIEW = 7;
  const [rightVisibleStart, setRightVisibleStart] = useState(0);
  const rightVisibleDates = allDates.slice(rightVisibleStart, rightVisibleStart + DAYS_PER_RIGHT_VIEW);
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [mode, setMode] = useState("Custom");
  const [openingHour, setOpeningHour] = useState({ h: 7, m: 0, period: "AM" });
  const [closingHour, setClosingHour] = useState({ h: 10, m: 30, period: "AM" });
  const [slotDuration, setSlotDuration] = useState(15);

  const [customDaySettings, setCustomDaySettings] = useState({});
  const [saving, setSaving] = useState(false);

  function getCurrentSettings(dateStr) {
    if (mode === "Standard") {
      const d = new Date(dateStr);
      const weekday = d.getDay();
      return STANDARD_DEFAULTS[weekday] ?? STANDARD_DEFAULTS[1];
    }
    return customDaySettings[dateStr] || { openingHour, closingHour, slotDuration };
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const start = allDates[0];
    const end = allDates[allDates.length - 1];
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    axios
      .get(`${API_URL}/api/doctor/schedule?startDate=${startStr}&endDate=${endStr}`, {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        const data = res.data?.data || {};
        setCustomDaySettings((prev) => {
          const next = { ...prev };
          Object.entries(data).forEach(([dateStr, s]) => {
            if (!s) return;
            const oh = parseInt(s.openingTime?.split(":")[0], 10) || 9;
            const om = parseInt(s.openingTime?.split(":")[1], 10) || 0;
            const ch = parseInt(s.closingTime?.split(":")[0], 10) || 17;
            const cm = parseInt(s.closingTime?.split(":")[1], 10) || 0;
            next[dateStr] = {
              openingHour: {
                h: oh % 12 || 12,
                m: om,
                period: oh >= 12 ? "PM" : "AM",
              },
              closingHour: {
                h: ch % 12 || 12,
                m: cm,
                period: ch >= 12 ? "PM" : "AM",
              },
              slotDuration: s.slotDuration || 15,
            };
          });
          return next;
        });
        setDayAvailability((prev) => {
          const next = { ...prev };
          Object.entries(data).forEach(([dateStr, s]) => {
            if (s && typeof s.isDayAvailable === "boolean") {
              next[dateStr] = s.isDayAvailable;
            }
          });
          return next;
        });
        setSlotAvailability((prev) => {
          const next = { ...prev };
          Object.entries(data).forEach(([dateStr, s]) => {
            if (s?.slotAvailability && typeof s.slotAvailability === "object") {
              next[dateStr] = { ...next[dateStr], ...s.slotAvailability };
            }
          });
          return next;
        });
      })
      .catch(() => {});
  }, []);

  function allTimeSlotsMap() {
    const obj = {};
    for (const date of allDates) {
      const str = date.toDateString();
      let settings;
      if (mode === "Standard") {
        const weekday = date.getDay();
        settings = STANDARD_DEFAULTS[weekday] ?? STANDARD_DEFAULTS[1];
      } else {
        settings = customDaySettings[str] || { openingHour, closingHour, slotDuration };
      }
      obj[str] = generateTimeSlots(
        settings.openingHour,
        settings.closingHour,
        settings.slotDuration
      );
    }
    return obj;
  }
  const timeSlotsPerDay = allTimeSlotsMap();

  const [activeDay, setActiveDay] = useState(
    visibleDates.length > 0 ? visibleDates[0].toDateString() : ""
  );
  const [dayAvailability, setDayAvailability] = useState(makeInitialDayAvailability(allDates));
  const [slotAvailability, setSlotAvailability] = useState(makeInitialSlotAvailability(allDates, timeSlotsPerDay));

  // --- POPUP STATE ---
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTargetDay, setPopupTargetDay] = useState(null);
  const [popupWillBeAvailable, setPopupWillBeAvailable] = useState(false);

  function updateSlotAvailability(dateStr, newSlots) {
    setSlotAvailability((prev) => {
      let oldSlots = prev[dateStr] || {};
      let obj = { ...oldSlots };
      newSlots.forEach((timeObj) => {
        let timeLabel = typeof timeObj === "string" ? timeObj : timeObj.label;
        if (!(timeLabel in obj)) obj[timeLabel] = true;
      });
      Object.keys(obj).forEach((slot) => {
        if (!newSlots.find(t => (typeof t === "string" ? t : t.label) === slot)) delete obj[slot];
      });
      return { ...prev, [dateStr]: obj };
    });
  }

  // Modified toggleDay to show popup before marking unavailable/available
  const toggleDay = (dateStr, e) => {
    e.stopPropagation();
    setPopupTargetDay(dateStr);
    setPopupWillBeAvailable(!dayAvailability[dateStr]);
    setPopupOpen(true);
  };

  const handleConfirmToggleDay = () => {
    setDayAvailability((prev) => {
      const newVal = !prev[popupTargetDay];
      return { ...prev, [popupTargetDay]: newVal };
    });
    setPopupOpen(false);
    setPopupTargetDay(null);
  };

  const handleCancelToggleDay = () => {
    setPopupOpen(false);
    setPopupTargetDay(null);
  };

  const toggleSlot = (dateStr, time) => {
    setSlotAvailability((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [time]: !prev[dateStr][time],
      },
    }));
  };

  function handleTimeSelect(dateStr, key, val) {
    setCustomDaySettings((prev) => {
      const curr = prev[dateStr] || {
        openingHour,
        closingHour,
        slotDuration,
      };
      const next = { ...curr, [key]: val };
      setTimeout(() => {
        updateSlotAvailability(
          dateStr,
          generateTimeSlots(
            next.openingHour,
            next.closingHour,
            next.slotDuration
          )
        );
      }, 2);
      return { ...prev, [dateStr]: next };
    });
  }
  function handleSlotDuration(dateStr, val) {
    handleTimeSelect(dateStr, "slotDuration", val);
  }
  function handleOpeningHour(dateStr, val) {
    handleTimeSelect(dateStr, "openingHour", val);
  }
  function handleClosingHour(dateStr, val) {
    handleTimeSelect(dateStr, "closingHour", val);
  }

  const handleSaveSchedule = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSaving(true);
    const d = new Date(activeDay);
    const dateStr = d.toISOString().split("T")[0];
    const payload = {
      date: dateStr,
      openingHour: curSettings.openingHour,
      closingHour: curSettings.closingHour,
      slotDuration: curSettings.slotDuration,
      isDayAvailable: isDayAvailable,
      slotAvailability: slotAvailability[activeDay] || {},
    };
    axios
      .post(`${API_URL}/api/doctor/schedule`, payload, {
        headers: getAuthHeaders(),
      })
      .then(() => {
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  function isCalendarActiveDay(day, month, year) {
    const date = new Date(year, month, day);
    return activeDay === date.toDateString();
  }
  function isCalendarUnavailableDay(day, month, year) {
    const date = new Date(year, month, day);
    return dayAvailability[date.toDateString()] === false;
  }
  function isCalendarPastDay(day, month, year) {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }
  function handleCalendarSelect(day, month, year) {
    const date = new Date(year, month, day);
    setActiveDay(date.toDateString());
    const idx = allDates.findIndex(d => d.toDateString() === date.toDateString());
    if (idx !== -1 && (idx < visibleStart || idx >= visibleStart + cardsPerView)) {
      setVisibleStart(Math.max(0, Math.min(idx, allDates.length - cardsPerView)));
    }
    if (idx !== -1 && (idx < rightVisibleStart || idx >= rightVisibleStart + DAYS_PER_RIGHT_VIEW)) {
      setRightVisibleStart(Math.max(0, Math.min(idx, allDates.length - DAYS_PER_RIGHT_VIEW)));
    }
  }

  const handleNextDays = () => {
    if (visibleStart + cardsPerView >= allDates.length) return;
    const newStart = visibleStart + cardsPerView;
    setVisibleStart(newStart);
    setActiveDay(allDates[newStart].toDateString());
    if (newStart >= rightVisibleStart + DAYS_PER_RIGHT_VIEW || newStart < rightVisibleStart) {
      setRightVisibleStart(Math.max(0, Math.min(newStart, allDates.length - DAYS_PER_RIGHT_VIEW)));
    }
  };
  const handlePrevDays = () => {
    if (visibleStart === 0) return;
    const newStart = Math.max(visibleStart - cardsPerView, 0);
    setVisibleStart(newStart);
    setActiveDay(allDates[newStart].toDateString());
    if (newStart < rightVisibleStart || newStart >= rightVisibleStart + DAYS_PER_RIGHT_VIEW) {
      setRightVisibleStart(Math.max(0, Math.min(newStart, allDates.length - DAYS_PER_RIGHT_VIEW)));
    }
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minOptions = ["00", "15", "30", "45"];
  const periodOptions = ["AM", "PM"];

  const curSettings = getCurrentSettings(activeDay);
  const isDayAvailable = dayAvailability[activeDay];
  const currentSlots = timeSlotsPerDay[activeDay] || [];

  function groupSlotsBySection(slotsArray) {
    const blocks = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    slotsArray.forEach(slot => {
      const section = getSlotSection(slot.hour24, slot.minutes);
      blocks[section].push(slot);
    });
    return blocks;
  }

  const slotSections = groupSlotsBySection(currentSlots);

  // Collapsible section state: "Morning","Afternoon","Evening". Night always open.
  const [sectionOpen, setSectionOpen] = useState({
    Morning: true,
    Afternoon: true,
    Evening: true,
    Night: true, // We'll keep Night always expanded for now
  });

  const handleToggleSection = sectionName => {
    setSectionOpen(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr] gap-4 w-full min-w-0">
      {/* Pop-up for day unavailable/available */}
      <ConfirmDayUnavailablePopup
        open={popupOpen}
        onClose={handleCancelToggleDay}
        onConfirm={handleConfirmToggleDay}
        targetDay={popupTargetDay || ""}
        willBeAvailable={popupWillBeAvailable}
      />

      {/* LEFT SECTION */}
      <div className="bg-white rounded-xl p-4 sm:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Schedules</h1>
        </div>
        <div className="flex items-stretch gap-2 sm:gap-3 mb-6 min-h-[52px]">
          <button
            type="button"
            onClick={handlePrevDays}
            disabled={visibleStart === 0}
            className={`w-8 h-11 sm:h-12 shrink-0 flex items-center justify-center rounded-lg border self-center
              ${visibleStart === 0 ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-300 hover:bg-gray-50"}
            `}
            tabIndex={0}
            aria-label="Previous days"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="grid grid-cols-4 gap-2 flex-1 min-w-0">
            {visibleDates.map((date) => {
              const dateStr = date.toDateString();
              const isSelected = activeDay === dateStr;
              const isAvailable = dayAvailability[dateStr];
              return (
                <div
                  key={dateStr}
                  className={`
                    flex justify-between items-center gap-2
                    min-w-0 rounded-lg px-2 sm:px-3
                    h-11 sm:h-12 border box-border overflow-hidden
                    transition
                    ${!isAvailable ? "opacity-75" : ""}
                    ${isSelected ? "bg-[#0078FA] border-[#2563EB]" : "bg-[#4C9EFF26] border-[#E5E7EB]"}
                  `}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDay(dateStr);
                      const idx = allDates.findIndex((d) => d.toDateString() === dateStr);
                      if (idx !== -1 && (idx < rightVisibleStart || idx >= rightVisibleStart + DAYS_PER_RIGHT_VIEW)) {
                        setRightVisibleStart(Math.max(0, Math.min(idx, allDates.length - DAYS_PER_RIGHT_VIEW)));
                      }
                    }}
                    className={`
                      flex-1 min-w-0 text-left truncate
                      text-xs sm:text-[13px] font-medium leading-tight
                      py-1 pr-1
                      ${isSelected ? "text-white" : "text-black/70"}
                    `}
                  >
                    {getLongDayDisplay(date)}
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAvailable}
                    onClick={(e) => toggleDay(dateStr, e)}
                    className="shrink-0 w-[26px] h-[14px] rounded-full relative border-0 outline-none flex items-center p-0 transition-colors"
                    style={{
                      background: isAvailable ? "#2563EB" : "#D1D5DB",
                    }}
                    tabIndex={0}
                  >
                    <span
                      className="absolute top-[2px] rounded-full bg-white shadow-sm transition-[left] duration-200 pointer-events-none"
                      style={{
                        left: isAvailable ? "12px" : "2px",
                        width: 10,
                        height: 10,
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNextDays}
            disabled={visibleStart + cardsPerView >= allDates.length}
            className={`w-8 h-11 sm:h-12 shrink-0 flex items-center justify-center rounded-lg border self-center
              ${visibleStart + cardsPerView >= allDates.length ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-300 hover:bg-gray-50"}
            `}
            tabIndex={0}
            aria-label="Next days"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Schedule Section - block for each section with open/close toggle */}
        {isDayAvailable ? (
          <>
            <ScheduleBlock
              section="Morning"
              title="Morning"
              duration={`${slotSections["Morning"].length * curSettings.slotDuration} min`}
              activeDay={activeDay}
              slots={slotSections["Morning"]}
              slotAvailability={slotAvailability[activeDay]}
              onToggleSlot={toggleSlot}
              isDayAvailable={isDayAvailable}
              isOpen={sectionOpen.Morning}
              onArrowClick={() => handleToggleSection("Morning")}
            />
            <ScheduleBlock
              section="Afternoon"
              title="Afternoon"
              duration={`${slotSections["Afternoon"].length * curSettings.slotDuration} min`}
              activeDay={activeDay}
              slots={slotSections["Afternoon"]}
              slotAvailability={slotAvailability[activeDay]}
              onToggleSlot={toggleSlot}
              isDayAvailable={isDayAvailable}
              isOpen={sectionOpen.Afternoon}
              onArrowClick={() => handleToggleSection("Afternoon")}
            />
            <ScheduleBlock
              section="Evening"
              title="Evening"
              duration={`${slotSections["Evening"].length * curSettings.slotDuration} min`}
              activeDay={activeDay}
              slots={slotSections["Evening"]}
              slotAvailability={slotAvailability[activeDay]}
              onToggleSlot={toggleSlot}
              isDayAvailable={isDayAvailable}
              isOpen={sectionOpen.Evening}
              onArrowClick={() => handleToggleSection("Evening")}
            />
            {/* Night section: now also collapsible with arrow */}
            <ScheduleBlock
              section="Night"
              title="Night"
              duration={`${slotSections["Night"].length * curSettings.slotDuration} min`}
              activeDay={activeDay}
              slots={slotSections["Night"]}
              slotAvailability={slotAvailability[activeDay]}
              onToggleSlot={toggleSlot}
              isDayAvailable={isDayAvailable}
              isOpen={sectionOpen.Night}
              onArrowClick={() => handleToggleSection("Night")}
            />
          </>
        ) : (
          <div className="border-t py-12 text-center">
            <p className="text-black/50 font-medium">This day is unavailable</p>
            <p className="text-sm text-black/40 mt-1">
              Turn the toggle on for <strong>{activeDay}</strong> to set schedule and time slots.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SECTION */}
      <div className="bg-white rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 min-w-0">

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
          />
          <input
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none bg-[#F9F9F9]"
          />
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-center font-medium mb-3 flex items-center justify-between">
            <button
              type="button"
              className="ml-2 px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
              onClick={() => {
                let nextMonth = calendarMonth - 1;
                let nextYear = calendarYear;
                if (nextMonth < 0) {
                  nextMonth = 11;
                  nextYear--;
                }
                setCalendarMonth(nextMonth);
                setCalendarYear(nextYear);
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="flex-1 text-center">
              {new Date(calendarYear, calendarMonth).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              className="mr-2 px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
              onClick={() => {
                let nextMonth = calendarMonth + 1;
                let nextYear = calendarYear;
                if (nextMonth > 11) {
                  nextMonth = 0;
                  nextYear++;
                }
                setCalendarMonth(nextMonth);
                setCalendarYear(nextYear);
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-black/50 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-sm text-center">
            {calendarDays.map((day, idx) =>
              day === null ? (
                <div key={`empty-${idx}`} />
              ) : (
                <div
                  key={day}
                  className={[
                    "py-1 rounded-lg relative flex items-center justify-center transition",
                    isCalendarPastDay(day, calendarMonth, calendarYear)
                      ? "cursor-not-allowed opacity-50 text-gray-400 bg-gray-50"
                      : "cursor-pointer",
                    isCalendarActiveDay(day, calendarMonth, calendarYear) && !isCalendarPastDay(day, calendarMonth, calendarYear) && "ring-2 ring-blue-400 ring-inset z-10",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => !isCalendarPastDay(day, calendarMonth, calendarYear) && handleCalendarSelect(day, calendarMonth, calendarYear)}
                  tabIndex={isCalendarPastDay(day, calendarMonth, calendarYear) ? -1 : 0}
                  style={{
                    minHeight: 28,
                    minWidth: 28,
                  }}
                >
                  <span>
                    {day}
                  </span>
                  {/* Cross-cut in red if unavailable */}
                  {isCalendarUnavailableDay(day, calendarMonth, calendarYear) && (
                    <svg
                      width="22"
                      height="22"
                      style={{
                        position: "absolute",
                        top: 3,
                        left: 3,
                        pointerEvents: "none",
                        zIndex: 11,
                      }}
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="22"
                        y2="22"
                        stroke="#dc2626"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="22"
                        y1="0"
                        x2="0"
                        y2="22"
                        stroke="#dc2626"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )
            )}
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md text-sm ${
              mode === "Standard" ? "bg-white shadow font-medium" : ""
            }`}
            onClick={() => setMode("Standard")}
          >
            Standard
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm ${
              mode === "Custom" ? "bg-white shadow font-medium" : ""
            }`}
            onClick={() => setMode("Custom")}
          >
            Custom
          </button>
        </div>
        <div>
          <label className="text-sm text-black/60 block mb-2">Select day (7 days per view)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRightVisibleStart((s) => Math.max(0, s - DAYS_PER_RIGHT_VIEW))}
              disabled={rightVisibleStart === 0}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-nowrap gap-1 flex-1 min-w-0 justify-center overflow-hidden">
              {rightVisibleDates.map((date) => {
                const dateStr = date.toDateString();
                const isSelected = activeDay === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    title={getLongDayDisplay(date)}
                    onClick={() => {
                      setActiveDay(dateStr);
                      const idx = allDates.findIndex((d) => d.toDateString() === dateStr);
                      if (idx !== -1 && (idx < visibleStart || idx >= visibleStart + cardsPerView)) {
                        setVisibleStart(Math.max(0, Math.min(idx, allDates.length - cardsPerView)));
                      }
                      if (idx !== -1 && (idx < rightVisibleStart || idx >= rightVisibleStart + DAYS_PER_RIGHT_VIEW)) {
                        setRightVisibleStart(Math.max(0, Math.min(idx, allDates.length - DAYS_PER_RIGHT_VIEW)));
                      }
                    }}
                    className={`flex-1 min-w-0 px-1 py-1.5 rounded-lg text-xs font-medium truncate ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-black/70 hover:bg-gray-200"
                    }`}
                  >
                    {WEEKDAY_SHORT[date.getDay()]}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                setRightVisibleStart((s) =>
                  Math.min(allDates.length - DAYS_PER_RIGHT_VIEW, s + DAYS_PER_RIGHT_VIEW)
                )
              }
              disabled={rightVisibleStart + DAYS_PER_RIGHT_VIEW >= allDates.length}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700 mt-2">
          Schedule for <strong>{activeDay ? getLongDayDisplay(new Date(activeDay)) : ""}</strong>
        </p>
        <TimeSelect
          label="Opening Hour"
          value={curSettings.openingHour}
          onChange={(val) => {
            if (mode === "Standard") setMode("Custom");
            handleOpeningHour(activeDay, val);
          }}
        />
        <TimeSelect
          label="Closing Hour"
          value={curSettings.closingHour}
          onChange={(val) => {
            if (mode === "Standard") setMode("Custom");
            handleClosingHour(activeDay, val);
          }}
        />
        <div>
          <label className="text-sm text-black/60">Time slot Duration</label>
          <select
            value={curSettings.slotDuration}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            onChange={(e) => {
              if (mode === "Standard") setMode("Custom");
              handleSlotDuration(activeDay, Number(e.target.value));
            }}
          >
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSaveSchedule}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-sm disabled:opacity-60 transition"
        >
          {saving ? "Saving…" : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */
// Accepts slotAvailability, onToggleSlot to enable/disable individual slots
function ScheduleBlock({
  section,
  title,
  duration,
  activeDay,
  slots,
  slotAvailability,
  onToggleSlot,
  isDayAvailable,
  isOpen,
  onArrowClick
}) {
  // Only show section if slots are present
  if (!slots || slots.length === 0) {
    return null;
  }
  const showArrow = ["Morning", "Afternoon", "Evening"].includes(section);
  return (
    <div className="border-t py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-black/50">({duration})</p>
        </div>
        {showArrow && (
          <button
            type="button"
            aria-label={`Toggle ${title} timeslot`}
            className="p-1 rounded hover:bg-gray-100 transition"
            onClick={onArrowClick}
            style={{ marginLeft: 4 }}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {isOpen && (
        <div className="flex flex-wrap gap-2">
          {slots.map((slotObj) => {
            const time = typeof slotObj === "string" ? slotObj : slotObj.label;
            const isAvailable = slotAvailability?.[time] ?? true;
            return (
              <button
                key={time}
                type="button"
                className={`px-3 py-1.5 rounded-lg border text-xs transition
                  ${isAvailable
                    ? "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "border-gray-300 text-gray-400 bg-gray-100 opacity-50"}
                `}
                onClick={() => isDayAvailable && onToggleSlot(activeDay, time)}
                disabled={!isDayAvailable}
                style={{ cursor: isDayAvailable ? "pointer" : "not-allowed" }}
                aria-pressed={!!isAvailable}
              >
                {isAvailable ? time : `${time} (Unavailable)`}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimeSelect({ label, value = { h: 7, m: 0, period: "AM" }, onChange }) {
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minOptions = ["00", "15", "30", "45"];
  const periodOptions = ["AM", "PM"];
  return (
    <div>
      <label className="text-sm text-black/60">{label}</label>
      <div className="flex gap-2 mt-1">
        <select
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          value={String(value.h).padStart(2, "0")}
          onChange={e => {
            onChange &&
              onChange({
                ...value,
                h: Number(e.target.value),
              });
          }}
        >
          {hourOptions.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
        <select
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          value={String(value.m).padStart(2, "0")}
          onChange={e => {
            onChange &&
              onChange({
                ...value,
                m: Number(e.target.value),
              });
          }}
        >
          {minOptions.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          className="px-3 py-2 border rounded-lg text-sm"
          value={value.period}
          onChange={e => {
            onChange && onChange({ ...value, period: e.target.value });
          }}
        >
          {periodOptions.map((am) => (
            <option key={am}>{am}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
