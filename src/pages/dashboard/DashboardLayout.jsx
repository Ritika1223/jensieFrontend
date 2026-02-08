import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";

export default function DashboardLayout() {
  const { isMobile } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <Sidebar />

      <main
        className={`flex-1 overflow-y-auto transition-[padding] duration-300 ${
          isMobile ? "pl-14 pt-2" : ""
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
