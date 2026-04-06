import { useState, useEffect } from "react";
import initialTransactions from "../assets/transactions";
import ApexChart from "react-apexcharts";
import { useTheme } from "../store/ThemeContext";

const LS_KEY = "zorvin_transactions";

export default function Pie_chart_card() {
  const { darkMode } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  const transactions = (() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  })();

  const SHOWN_CATEGORIES = ["Food", "Rent", "Transport", "Entertainment"];
  const totals = { Food: 0, Rent: 0, Transport: 0, Entertainment: 0, Other: 0 };
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const key = SHOWN_CATEGORIES.includes(t.category) ? t.category : "Other";
      totals[key] += t.amount;
    });

  const labels = Object.keys(totals);
  const series = Object.values(totals).map((v) => parseFloat(v.toFixed(2)));
  const legendColor = darkMode ? "#e5e7eb" : "#1a1a3e";

  const options = {
    labels,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: { colors: legendColor },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0, colors: ["transparent"] },
    plotOptions: { pie: { donut: { size: "75%" } } },
    tooltip: { y: { formatter: (val) => `₹${val.toLocaleString()}` } },
  };

  if (!loaded) {
    return (
      <div className="dash-card rounded-3xl p-5 flex flex-col items-center gap-4 h-full"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)", animationDelay: "75ms" }}>
        <div className="h-3 w-44 rounded shimmer-box" />
        <div className="w-32 h-32 rounded-full shimmer-box mt-2" />
        <div className="flex gap-4 mt-2">
          {[80, 60, 72, 55, 48].map((w, i) => (
            <div key={i} className="h-2.5 rounded shimmer-box" style={{ width: w }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="dash-card text-(--text) h-full overflow-hidden"
      style={{ animationDelay: "75ms" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative flex flex-col items-center w-full h-full py-3 rounded-3xl"
        style={{
          background: hovered
            ? "linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-card) 60%, rgba(96,165,250,0.06) 100%)"
            : "var(--bg-card)",
          border: `1px solid ${hovered ? "rgba(96,165,250,0.4)" : "var(--border-sub)"}`,
          boxShadow: hovered ? "0 12px 40px rgba(96,165,250,0.13)" : "none",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          fontFamily: "'Friends', sans-serif",
        }}
      >
        {/* accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg, transparent, #60a5fa, transparent)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.35s ease",
          }} />

        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          Category-wise Expenditure
        </p>
        <ApexChart
          className="mt-2 w-full"
          options={options}
          series={series}
          type="donut"
          width="100%"
          height="170"
        />
      </div>
    </div>
  );
}
