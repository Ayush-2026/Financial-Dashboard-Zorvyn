import { useState, useEffect } from "react";
import upcomingBills from "../assets/Upcoming_Bills";

export default function Upcoming_bills() {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  const visibleBills = upcomingBills.slice(0, 3);

  if (!loaded) {
    return (
      <div className="dash-card rounded-3xl px-7 py-4 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)", animationDelay: "150ms" }}>
        <div className="h-3 w-28 rounded shimmer-box" />
        <div className="space-y-4 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md shimmer-box" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded shimmer-box" />
                  <div className="h-2 w-14 rounded shimmer-box" />
                </div>
              </div>
              <div className="h-7 w-16 rounded-lg shimmer-box" />
            </div>
          ))}
        </div>
        <div className="h-3 w-16 rounded shimmer-box ml-auto mt-1" />
      </div>
    );
  }

  return (
    <div
      className="dash-card flex text-(--text) overflow-hidden"
      style={{ animationDelay: "150ms" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative w-full px-7 py-4 rounded-3xl flex flex-col justify-between"
        style={{
          background: hovered
            ? "linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-card) 60%, rgba(251,146,60,0.06) 100%)"
            : "var(--bg-card)",
          border: `1px solid ${hovered ? "rgba(251,146,60,0.4)" : "var(--border-sub)"}`,
          boxShadow: hovered ? "0 12px 40px rgba(251,146,60,0.12)" : "none",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          fontFamily: "'Friends', sans-serif",
        }}
      >
        {/* accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg, transparent, #fb923c, transparent)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.35s ease",
          }} />

        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          Upcoming Bills
        </p>

        <div className="space-y-0 mt-4">
          {visibleBills.map((bill, i) => (
            <div
              key={bill.id}
              className="dash-row flex items-center justify-between border-b py-2 cursor-default"
              style={{
                borderColor: "var(--divider)",
                animationDelay: `${700 + i * 80}ms`,
                background: hoveredId === bill.id ? "rgba(251,146,60,0.05)" : "transparent",
                borderRadius: hoveredId === bill.id ? "10px" : "0",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={() => setHoveredId(bill.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-black rounded-md px-2 py-1 text-xs text-center shrink-0 font-semibold"
                  style={{
                    background: hoveredId === bill.id
                      ? "linear-gradient(135deg, #fde68a, #fb923c)"
                      : "var(--bg-control)",
                    transition: "background 0.25s ease",
                    minWidth: "2.5rem",
                    color: hoveredId === bill.id ? "#000" : "var(--text)",
                  }}
                >
                  <p className="text-[10px]">{new Date(bill.dueDate).toLocaleString("en-US", { month: "short" })}</p>
                  <p className="font-bold text-sm leading-none">{new Date(bill.dueDate).getDate()}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-(--text)">{bill.company}</p>
                  <p className="text-xs capitalize" style={{ color: "var(--text-dim)" }}>{bill.billingCycle}</p>
                </div>
              </div>

              <div
                className="rounded-lg px-3 py-1 text-sm font-medium shrink-0"
                style={{
                  border: `1px solid ${hoveredId === bill.id ? "rgba(251,146,60,0.5)" : "var(--border-s)"}`,
                  color: hoveredId === bill.id ? "#fb923c" : "var(--text)",
                  background: hoveredId === bill.id ? "rgba(251,146,60,0.08)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                ₹{bill.amount}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-3 text-sm cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "#fb923c" }}>
          View All →
        </div>
      </div>
    </div>
  );
}
