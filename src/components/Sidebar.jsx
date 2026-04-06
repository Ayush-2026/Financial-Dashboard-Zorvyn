import zorvyn_logo from '../assets/zorvyn_logo.png'
import dashboard_96 from '../assets/dashboard_96.png'
import ledger_96 from '../assets/ledger_96.png'
import analytics_100 from '../assets/analytics_100.png'
import { NavLink } from 'react-router-dom'

const linkBase = "flex items-center justify-center lg:justify-start rounded-2xl w-full lg:w-45 px-2 lg:px-4 py-3 lg:py-4 transition-all duration-200";

export default function Sidebar() {
  return (
    <div className="w-16 lg:w-70 mr-2 lg:mr-5 h-screen bg-(--bg-page) rounded-2xl px-2 lg:pl-11 lg:pr-4 text-(--text) flex flex-col shrink-0 transition-colors duration-300 border-r border-(--border)">
      <img src={zorvyn_logo} width="150px" className="pt-8 pb-4 hidden lg:block" />
      <img src={zorvyn_logo} width="36px" className="pt-4 pb-4 block lg:hidden mx-auto" />

      <div className="flex flex-col items-center lg:items-start flex-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `mt-6 lg:mt-10 ${linkBase} ${isActive
              ? "bg-(--bg-active) opacity-100"
              : "opacity-60 hover:opacity-90 hover:bg-(--bg-active)"}`}
          style={({ isActive }) => isActive ? {
            border: "1px solid rgba(129,140,248,0.35)",
            boxShadow: "0 0 14px rgba(129,140,248,0.15)",
          } : { border: "1px solid transparent" }}>
          <img src={dashboard_96} width={22} className="lg:mr-5 shrink-0 sidebar-icon" alt="" />
          <span className="hidden lg:inline font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `mt-2 ${linkBase} ${isActive
              ? "bg-(--bg-active) opacity-100"
              : "opacity-60 hover:opacity-90 hover:bg-(--bg-active)"}`}
          style={({ isActive }) => isActive ? {
            border: "1px solid rgba(129,140,248,0.35)",
            boxShadow: "0 0 14px rgba(129,140,248,0.15)",
          } : { border: "1px solid transparent" }}>
          <img src={ledger_96} width={22} className="lg:mr-5 shrink-0 sidebar-icon" alt="" />
          <span className="hidden lg:inline font-medium">Transactions</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `mt-2 ${linkBase} ${isActive
              ? "bg-(--bg-active) opacity-100"
              : "opacity-60 hover:opacity-90 hover:bg-(--bg-active)"}`}
          style={({ isActive }) => isActive ? {
            border: "1px solid rgba(129,140,248,0.35)",
            boxShadow: "0 0 14px rgba(129,140,248,0.15)",
          } : { border: "1px solid transparent" }}>
          <img src={analytics_100} width={22} className="lg:mr-5 shrink-0 sidebar-icon" alt="" />
          <span className="hidden lg:inline font-medium">Analytics</span>
        </NavLink>
      </div>
    </div>
  );
}
