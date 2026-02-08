import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  LogOut,
  ChevronDown,
  PanelLeft,
  Edit,
  User2,
  UserCircle,
} from "lucide-react";
import { useSidebar } from "../../contexts/SidebarContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openAppointments, setOpenAppointments] = useState(false);
  const [appointmentsPopoverOpen, setAppointmentsPopoverOpen] = useState(false);
  const appointmentsRef = useRef(null);
  const { isCollapsed, toggleCollapse, isMobile, toggleMobileMenu, isMobileMenuOpen, closeMobileMenu } = useSidebar();

  // Close appointments popover when clicking outside
  useEffect(() => {
    if (!appointmentsPopoverOpen) return;
    const handleClick = (e) => {
      if (appointmentsRef.current && !appointmentsRef.current.contains(e.target)) {
        setAppointmentsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [appointmentsPopoverOpen]);

  const isActive = (path) => location.pathname === path;
  const isAppointmentRoute =
    location.pathname === "/doctor-appointment" || location.pathname === "/doctor-schedule";
  const showAppointmentsExpanded = openAppointments || isAppointmentRoute;

  // Logout handler
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorDetails");
    navigate("/doctor-login");
    closeMobileMenu?.();
  };

  const showLabels = isMobile ? true : !isCollapsed;

  const sidebarInner = (
    <>
      {/* LOGO HEADER */}
      <div>
        <div className={`px-4 py-6 flex items-center ${isCollapsed ? "flex-col gap-3" : "justify-between"}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? "flex-col" : ""}`}>
            <img src="/jensei-favicon.svg" alt="Jensei" className="w-9 h-9 shrink-0" />
            {showLabels && <img src="/jensei-logo.png" alt="Jensei Logo" className="h-6" />}
          </div>

          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 shrink-0"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft size={15} className={isCollapsed ? "rotate-180" : ""} />
            </button>
          )}
          {/* Mobile: no header close button - PanelLeft floating icon handles toggle */}
        </div>

        {/* MENU */}
        <nav className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
          <SidebarItem icon={<Edit size={18} />} label="Dashboard" to="/dashboard" active={isActive("/dashboard")} showLabel={showLabels} />
          <SidebarItem icon={<UserCircle size={18} />} label="Doctors Profile" to="/doctors-profile" active={isActive("/doctors-profile")} showLabel={showLabels} />

          {/* Appointments - with popover when collapsed */}
          <div ref={appointmentsRef} className="relative">
            <button
              onClick={() => {
                if (isCollapsed && !isMobile) {
                  setAppointmentsPopoverOpen((p) => !p);
                } else {
                  setOpenAppointments(!openAppointments);
                }
              }}
              className={`w-full flex items-center ${showLabels ? "justify-between" : "justify-center"} px-3 py-2.5 rounded-xl ${(showAppointmentsExpanded || appointmentsPopoverOpen) ? "bg-black/5" : "hover:bg-black/5"}`}
            >
              <div className="flex items-center gap-3 text-sm text-black/70">
                <User2 size={18} className="shrink-0" />
                {showLabels && "Appointments"}
              </div>
              {showLabels && <ChevronDown size={16} className={`transition ${showAppointmentsExpanded ? "rotate-180" : ""}`} />}
            </button>

            {/* Expanded: sub-items inline */}
            {showAppointmentsExpanded && showLabels && (
              <div className="ml-10 space-y-2">
                <SubItem label="Appointments" color="bg-yellow-400" to="/doctor-appointment" active={isActive("/doctor-appointment")} />
                <SubItem label="Schedule" color="bg-purple-500" to="/doctor-schedule" active={isActive("/doctor-schedule")} />
              </div>
            )}

            {/* Collapsed (desktop only): popover with sub-items */}
            {isCollapsed && !isMobile && appointmentsPopoverOpen && (
              <div className="absolute left-full top-0 ml-1 min-w-[160px] py-2 px-2 rounded-lg bg-gray-200 border border-gray-300 shadow-lg z-50 space-y-1">
                <SubItem label="Appointments" color="bg-yellow-400" to="/doctor-appointment" active={isActive("/doctor-appointment")} onNavigate={() => setAppointmentsPopoverOpen(false)} />
                <SubItem label="Schedule" color="bg-purple-500" to="/doctor-schedule" active={isActive("/doctor-schedule")} onNavigate={() => setAppointmentsPopoverOpen(false)} />
              </div>
            )}
          </div>

          <SidebarItem icon={<FileText size={18} />} label="Prescriptions" to="/prescriptions" active={isActive("/prescriptions")} showLabel={showLabels} />
        </nav>
      </div>

      {/* LOGOUT */}
      <div className={`${isCollapsed ? "p-2" : "p-6"}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl border hover:bg-black/5 ${isCollapsed ? "p-2 justify-center" : "px-4 py-3"}`}
        >
          <LogOut size={18} className="shrink-0" />
          {showLabels && <span className="text-sm">Log out</span>}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile: PanelLeft icon - always visible, click to expand/collapse sidebar directly */}
        <button
          onClick={toggleMobileMenu}
          className={`lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 border border-gray-300 shadow-md hover:bg-gray-300 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
          aria-label={isMobileMenuOpen ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeft size={20} />
        </button>

        {/* Mobile: overlay + sidebar when open */}
        {isMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-[250px] bg-gray-200 flex flex-col justify-between z-50 shadow-xl">
              {sidebarInner}
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside
      className={`bg-gray-200 flex flex-col justify-between shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-[72px]" : "w-[250px]"
      }`}
    >
      {sidebarInner}
      </aside>
  );
}

/* ---------- Helpers ---------- */

function SidebarItem({ icon, label, to, active, showLabel = true }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${showLabel ? "" : "justify-center"}
        ${active ? "bg-[#2D88F0] text-white" : "hover:bg-black/5 text-black/70"}`}
    >
      {icon}
      {showLabel && label}
    </Link>
  );
}

function SubItem({ label, color, to, active, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded-md transition
        ${
          active
            ? "bg-[#2D88F0]/10 text-[#2D88F0] font-medium"
            : "text-black/70 hover:bg-black/5"
        }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </Link>
  );
}
