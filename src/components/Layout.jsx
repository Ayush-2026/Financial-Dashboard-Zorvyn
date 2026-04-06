import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useTheme } from "../store/ThemeContext";

const pageTitles = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
};

export default function Layout() {
  const [role, setRole] = useState("User");
  const { pathname } = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-page) text-(--text) transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col p-6 gap-6 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-(--text)">
            {pageTitles[pathname] || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-(--bg-control) text-(--text) text-sm px-3 py-1 rounded-md outline-none border border-[var(--border-s)] transition-colors"
            >
              <option>User</option>
              <option>Admin</option>
            </select>
            <button
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-(--bg-control) hover:bg-[var(--bg-hover)] cursor-pointer transition-colors border border-[var(--border-s)]"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
          <Outlet context={{ role }} />
        </div>
      </div>
    </div>
  );
}
