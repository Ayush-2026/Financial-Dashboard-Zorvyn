import { useState, useEffect } from "react";
import green_up from "../assets/green_up.png";
import red_down from "../assets/red_down.png";
import initialTransactions from "../assets/transactions";
import { NavLink } from "react-router-dom";

export default function Transaction_card() {
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 650);
    return () => clearTimeout(t);
  }, []);

  const filteredTransactions =
    filter === "all"
      ? initialTransactions
      : initialTransactions.filter((t) => t.type === filter);

  const visibleTransactions = filteredTransactions.slice(0, 5);

  const btnCls = (active) => ({
    color: active ? "var(--text)" : "var(--text-dim)",
    borderBottom: active ? "1px solid #818cf8" : "1px solid transparent",
    paddingBottom: "2px",
    transition: "all 0.2s ease",
    fontSize: "13px",
    cursor: "pointer",
  });

  if (!loaded) {
    return (
      <div className="dash-card rounded-3xl px-6 py-4 flex flex-col gap-4 h-full"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)", animationDelay: "200ms" }}>
        <div className="h-3 w-24 rounded shimmer-box" />
        <div className="flex gap-6 mt-1">
          {[40, 56, 60].map((w, i) => <div key={i} className="h-3 rounded shimmer-box" style={{ width: w }} />)}
        </div>
        <div className="space-y-3 mt-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 py-2">
              <div className="w-8 h-8 rounded-xl shimmer-box shrink-0" />
              <div className="flex-1 h-3 rounded shimmer-box" />
              <div className="w-10 h-2.5 rounded shimmer-box" />
              <div className="w-14 h-3 rounded shimmer-box" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="dash-card flex text-(--text) h-full overflow-hidden"
      style={{ animationDelay: "200ms" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative w-full px-6 py-4 rounded-3xl h-full flex flex-col"
        style={{
          background: hovered
            ? "linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-card) 60%, rgba(167,139,250,0.06) 100%)"
            : "var(--bg-card)",
          border: `1px solid ${hovered ? "rgba(167,139,250,0.4)" : "var(--border-sub)"}`,
          boxShadow: hovered ? "0 12px 40px rgba(167,139,250,0.13)" : "none",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          fontFamily: "'Friends', sans-serif",
        }}
      >
        {/* accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg, transparent, #a78bfa, transparent)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.35s ease",
          }} />

        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Transactions</p>

        {/* Filter tabs */}
        <div className="flex gap-7 mt-4 ml-1">
          {[["all", "All"], ["income", "Revenue"], ["expense", "Expenses"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={btnCls(filter === val)}>
              {label}
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="mt-2 flex-1 overflow-hidden">
          {visibleTransactions.map((transaction, index) => (
            <div key={transaction.id}>
              <div
                className="dash-row flex items-center py-2.5 gap-2 rounded-xl px-1 cursor-default"
                style={{
                  animationDelay: `${650 + index * 70}ms`,
                  background: hoveredId === transaction.id
                    ? "rgba(167,139,250,0.06)"
                    : "transparent",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={() => setHoveredId(transaction.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className="rounded-xl p-1.5 shrink-0"
                  style={{
                    background: transaction.type === "income"
                      ? "rgba(52,211,153,0.1)"
                      : "rgba(248,113,113,0.1)",
                    border: `1px solid ${transaction.type === "income" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                  }}
                >
                  <img
                    src={transaction.type === "income" ? green_up : red_down}
                    className="w-5 h-5"
                    alt=""
                  />
                </div>
                <p className="text-[12px] flex-1 min-w-0 truncate text-(--text)">{transaction.category}</p>
                <p className="text-xs w-10 text-center shrink-0" style={{ color: "var(--text-dim)" }}>
                  {new Date(transaction.date).toLocaleString("en-US", { month: "short", day: "numeric" })}
                </p>
                <p
                  className="text-sm font-semibold shrink-0 text-right"
                  style={{ color: transaction.type === "income" ? "#34d399" : "#f87171" }}
                >
                  ₹{transaction.amount}
                </p>
              </div>
              {index !== visibleTransactions.length - 1 && (
                <div style={{ borderBottom: "1px solid var(--divider)" }} />
              )}
            </div>
          ))}
        </div>

        <NavLink
          to="/transactions"
          className="flex justify-end mt-auto pt-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: "#a78bfa" }}
        >
          View All →
        </NavLink>
      </div>
    </div>
  );
}
