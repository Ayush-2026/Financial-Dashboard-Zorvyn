import { useState, useEffect } from "react";
import ApexChart from "react-apexcharts";
import initialTransactions from "../assets/transactions";
import { useTheme } from "../store/ThemeContext";

export default function LineChart() {
  const { darkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  const monthlyData = initialTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString("en-US", { month: "short" });
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    if (t.type === "income") acc[month].income += t.amount;
    else acc[month].expense += t.amount;
    return acc;
  }, {});

  const monthOrder = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const months = [], incomeData = [], expenseData = [];
  monthOrder.forEach((m) => {
    if (monthlyData[m]) {
      months.push(m);
      incomeData.push(monthlyData[m].income);
      expenseData.push(monthlyData[m].expense);
    }
  });

  const options = {
    chart: {
      type: "line",
      parentHeightOffset: 0,
      background: "transparent",
      toolbar: {
        show: !isMobile,
        tools: { zoom: !isMobile, zoomin: !isMobile, zoomout: !isMobile, pan: false, reset: false, selection: false },
      },
    },
    xaxis: {
      categories: months,
      tickAmount: isMobile ? 4 : undefined,
      labels: {
        style: { colors: darkMode ? "#9090c0" : "#3a3a7e" },
        rotate: isMobile ? -45 : 0,
        rotateAlways: isMobile,
      },
    },
    yaxis: {
      min: Math.min(...incomeData, ...expenseData) - 500,
      max: Math.max(...incomeData, ...expenseData) + 500,
      show: !isMobile,
      labels: { style: { colors: darkMode ? "#9090c0" : "#3a3a7e" } },
    },
    stroke: { curve: "smooth", width: isMobile ? 2 : 3 },
    colors: ["#34d399", "#f87171"],
    dataLabels: { enabled: false },
    legend: {
      position: "top",
      labels: { colors: darkMode ? "#cbd5f5" : "#3a3a7e" },
    },
    grid: {
      borderColor: darkMode ? "rgba(76,76,154,0.3)" : "#c5caec",
      padding: { top: -10, bottom: 0, ...(isMobile && { left: 0 }) },
    },
    tooltip: { theme: darkMode ? "dark" : "light" },
  };

  const series = [
    { name: "Income",  data: incomeData  },
    { name: "Expense", data: expenseData },
  ];

  if (!loaded) {
    return (
      <div className="dash-card rounded-3xl p-4 h-full min-h-64 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)", animationDelay: "300ms" }}>
        <div className="h-3 w-40 rounded shimmer-box" />
        <div className="flex-1 flex flex-col justify-end gap-2 pb-4">
          <div className="flex items-end gap-2 h-full">
            {[55, 70, 45, 80, 60, 75, 50, 85, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-t shimmer-box" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dash-card h-full min-h-64 overflow-hidden"
      style={{ animationDelay: "300ms" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative rounded-3xl p-4 h-full flex flex-col"
        style={{
          background: hovered
            ? "linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-card) 60%, rgba(34,211,238,0.05) 100%)"
            : "var(--bg-card)",
          border: `1px solid ${hovered ? "rgba(34,211,238,0.35)" : "var(--border-sub)"}`,
          boxShadow: hovered ? "0 12px 40px rgba(34,211,238,0.1)" : "none",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          fontFamily: "'Friends', sans-serif",
        }}
      >
        {/* accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.35s ease",
          }} />

        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          Income vs Expense Trend
        </p>

        <div className="flex-1 min-h-0 mt-1">
          <ApexChart options={options} series={series} type="line" height="100%" />
        </div>
      </div>
    </div>
  );
}
