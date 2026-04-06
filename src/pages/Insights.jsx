import { useMemo, useState, useEffect } from "react";
import initialTransactions from "../assets/transactions";
import upcomingBills from "../assets/Upcoming_Bills";

const LS_KEY = "zorvin_transactions";

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadTransactions() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// ─── data derivation ─────────────────────────────────────────────────────────

function computeInsights(transactions, bills) {
  if (!transactions.length) return null;

  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth();
  const prevDate = new Date(cy, cm - 1, 1);
  const ly = prevDate.getFullYear();
  const lm = prevDate.getMonth();

  const inThisMonth = (d) => {
    const dt = new Date(d);
    return dt.getFullYear() === cy && dt.getMonth() === cm;
  };
  const inLastMonth = (d) => {
    const dt = new Date(d);
    return dt.getFullYear() === ly && dt.getMonth() === lm;
  };

  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes  = transactions.filter((t) => t.type === "income");

  const catTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const totalExpenses = Object.values(catTotals).reduce((s, v) => s + v, 0);
  const topCatEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCatEntry
    ? { name: topCatEntry[0], amount: topCatEntry[1], pct: (topCatEntry[1] / totalExpenses) * 100 }
    : null;

  const thisMonthExp = expenses.filter((t) => inThisMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const lastMonthExp = expenses.filter((t) => inLastMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const expChangePct = lastMonthExp ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : null;

  const thisMonthInc = incomes.filter((t) => inThisMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const savingsRate  = thisMonthInc > 0 ? ((thisMonthInc - thisMonthExp) / thisMonthInc) * 100 : null;

  const biggest = transactions.reduce(
    (max, t) => (t.amount > max.amount ? t : max),
    transactions[0]
  );

  const catCounts = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  const topFreqEntry = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  const topFreqCat = topFreqEntry ? { name: topFreqEntry[0], count: topFreqEntry[1] } : null;

  const totalInc = incomes.reduce((s, t) => s + t.amount, 0);
  const currentBalance = totalInc - totalExpenses;
  const pendingBillsTotal = bills.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0);
  const billPressurePct = currentBalance > 0 ? (pendingBillsTotal / currentBalance) * 100 : null;

  const thisCatMap = expenses.filter((t) => inThisMonth(t.date)).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
  }, {});
  const lastCatMap = expenses.filter((t) => inLastMonth(t.date)).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
  }, {});
  const topIncrease = Object.keys({ ...thisCatMap, ...lastCatMap })
    .map((cat) => ({ cat, delta: (thisCatMap[cat] || 0) - (lastCatMap[cat] || 0) }))
    .filter((c) => c.delta > 0)
    .sort((a, b) => b.delta - a.delta)[0] || null;

  const dayOfMonth  = now.getDate();
  const avgDailySpend = dayOfMonth > 0 ? thisMonthExp / dayOfMonth : 0;

  return {
    topCategory, totalExpenses, thisMonthExp, lastMonthExp, expChangePct,
    savingsRate, thisMonthInc, biggest, topFreqCat,
    currentBalance, pendingBillsTotal, billPressurePct,
    topIncrease, avgDailySpend, dayOfMonth,
  };
}

// ─── accent palette (one per card) ───────────────────────────────────────────

const ACCENTS = [
  { color: "#f87171", glow: "rgba(248,113,113,0.22)", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.32)" },
  { color: "#60a5fa", glow: "rgba(96,165,250,0.22)",  bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.32)"  },
  { color: "#34d399", glow: "rgba(52,211,153,0.22)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.32)"  },
  { color: "#fbbf24", glow: "rgba(251,191,36,0.22)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.32)"  },
  { color: "#a78bfa", glow: "rgba(167,139,250,0.22)", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.32)" },
  { color: "#fb923c", glow: "rgba(251,146,60,0.22)",  bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.32)"  },
  { color: "#22d3ee", glow: "rgba(34,211,238,0.22)",  bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.32)"  },
  { color: "#818cf8", glow: "rgba(129,140,248,0.22)", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.32)" },
];

// ─── SVG icons ────────────────────────────────────────────────────────────────

const ICONS = [
  // tag
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>,
  // bar chart
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>,
  // piggy bank / wallet
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
  </svg>,
  // zap / lightning
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>,
  // refresh / repeat
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>,
  // receipt / file-text
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>,
  // trending up
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>,
  // calendar
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>,
];

// ─── skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl shimmer-box" />
        <div className="h-2.5 w-28 rounded shimmer-box" />
      </div>
      <div className="h-7 w-32 rounded shimmer-box" />
      <div className="h-5 w-24 rounded-full shimmer-box" />
      <div className="h-px w-full shimmer-box" />
      <div className="space-y-1.5">
        <div className="h-2.5 w-full rounded shimmer-box" />
        <div className="h-2.5 w-3/4 rounded shimmer-box" />
      </div>
    </div>
  );
}

// ─── insight card ─────────────────────────────────────────────────────────────

function InsightCard({ title, value, trendLabel, trendUp, description, icon, accent, index, barValue }) {
  const [hovered, setHovered] = useState(false);

  const trendColor =
    trendUp === true  ? "#34d399" :
    trendUp === false ? "#f87171" : "#a5b4fc";
  const trendIcon = trendUp === true ? "↑" : trendUp === false ? "↓" : "•";

  const clampedBar = barValue != null ? Math.min(100, Math.max(0, barValue)) : null;

  return (
    <div
      className="insight-card relative flex flex-col gap-3 rounded-2xl p-5 cursor-default overflow-hidden select-none"
      style={{
        fontFamily: "'Friends', sans-serif",
        background: hovered
          ? `linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-card) 55%, ${accent.bg} 100%)`
          : "var(--bg-card)",
        border: `1px solid ${hovered ? accent.border : "var(--border-sub)"}`,
        boxShadow: hovered ? `0 12px 40px ${accent.glow}, 0 0 0 1px ${accent.border}` : "none",
        transform: hovered ? "translateY(-5px) scale(1.015)" : "translateY(0) scale(1)",
        transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        animationDelay: `${index * 75}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent.color} 50%, transparent 100%)`,
          opacity: hovered ? 1 : 0.45,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: accent.color,
          opacity: hovered ? 0.07 : 0,
          filter: "blur(20px)",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Icon + title */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: hovered ? accent.bg : "var(--subtle-bg)",
            border: `1px solid ${hovered ? accent.border : "var(--divider)"}`,
            color: hovered ? accent.color : "var(--text-dim)",
            transition: "all 0.35s ease",
          }}
        >
          <span className="w-4 h-4 block">{icon}</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-medium leading-tight"
          style={{ color: "var(--text-dim)" }}>
          {title}
        </p>
      </div>

      {/* Main value */}
      <p className="text-[1.6rem] font-semibold leading-none tracking-tight text-(--text)">
        {value}
      </p>

      {/* Trend badge */}
      {trendLabel != null && (
        <div>
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              color: trendColor,
              background: `${trendColor}18`,
              border: `1px solid ${trendColor}35`,
            }}
          >
            {trendIcon} {trendLabel}
          </span>
        </div>
      )}

      {/* Progress bar (for % cards) */}
      {clampedBar != null && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "var(--divider)" }}>
            <div
              className="h-full rounded-full insight-bar"
              style={{
                width: `${clampedBar}%`,
                background: `linear-gradient(90deg, ${accent.color}aa, ${accent.color})`,
                animationDelay: `${index * 75 + 400}ms`,
              }}
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px w-full" style={{ background: "var(--divider)" }} />

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {description}
      </p>
    </div>
  );
}

// ─── Insights page ────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Insights() {
  const [loaded, setLoaded] = useState(false);

  const transactions = useMemo(() => loadTransactions(), []);
  const ins = useMemo(() => computeInsights(transactions, upcomingBills), [transactions]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1100);
    return () => clearTimeout(t);
  }, []);

  const now = new Date();
  const thisMonthName = MONTH_NAMES[now.getMonth()];
  const lastMonthName = MONTH_NAMES[new Date(now.getFullYear(), now.getMonth() - 1).getMonth()];
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (!ins) {
    return (
      <div className="flex items-center justify-center h-48 text-sm" style={{ color: "var(--text-dim)", fontFamily: "'Friends', sans-serif" }}>
        No transaction data available.
      </div>
    );
  }

  const cards = [
    {
      title: "Top Spending Category",
      value: ins.topCategory?.name ?? "—",
      trendLabel: ins.topCategory ? `${ins.topCategory.pct.toFixed(1)}% of all expenses` : null,
      trendUp: false,
      description: ins.topCategory
        ? `${fmt(ins.topCategory.amount)} spent in total across all time.`
        : "No expense data available.",
    },
    {
      title: "Monthly Expense Change",
      value: ins.expChangePct != null
        ? `${ins.expChangePct > 0 ? "+" : ""}${ins.expChangePct.toFixed(1)}%`
        : "—",
      trendLabel: ins.expChangePct != null ? `${fmt(ins.thisMonthExp)} this month` : null,
      trendUp: ins.expChangePct != null ? ins.expChangePct <= 0 : null,
      description: ins.expChangePct != null
        ? `${thisMonthName}: ${fmt(ins.thisMonthExp)} vs ${lastMonthName}: ${fmt(ins.lastMonthExp)}.`
        : `No expense data for ${lastMonthName}.`,
    },
    {
      title: "Savings Rate",
      value: ins.savingsRate != null ? `${ins.savingsRate.toFixed(1)}%` : "—",
      trendLabel: ins.savingsRate != null
        ? (ins.savingsRate >= 0 ? "Positive savings" : "Overspending")
        : null,
      trendUp: ins.savingsRate != null ? ins.savingsRate >= 0 : null,
      description: ins.savingsRate != null
        ? `Saved ${fmt(Math.max(0, ins.thisMonthInc - ins.thisMonthExp))} of ${fmt(ins.thisMonthInc)} earned in ${thisMonthName}.`
        : `No income recorded in ${thisMonthName}.`,
      barValue: ins.savingsRate != null ? Math.max(0, ins.savingsRate) : null,
    },
    {
      title: "Biggest Transaction",
      value: ins.biggest ? fmt(ins.biggest.amount) : "—",
      trendLabel: ins.biggest
        ? (ins.biggest.type === "income" ? "Income" : "Expense")
        : null,
      trendUp: ins.biggest?.type === "income" ? true : false,
      description: ins.biggest
        ? `${ins.biggest.description} · ${ins.biggest.category} · ${ins.biggest.date}`
        : "No transactions found.",
    },
    {
      title: "Most Frequent Category",
      value: ins.topFreqCat?.name ?? "—",
      trendLabel: ins.topFreqCat ? `${ins.topFreqCat.count} transactions` : null,
      trendUp: null,
      description: "Appears most often across your entire transaction history.",
    },
    {
      title: "Bills Pressure",
      value: ins.billPressurePct != null ? `${ins.billPressurePct.toFixed(1)}%` : "—",
      trendLabel: ins.billPressurePct != null ? `${fmt(ins.pendingBillsTotal)} pending` : null,
      trendUp: ins.billPressurePct != null ? ins.billPressurePct < 30 : null,
      description: ins.billPressurePct != null
        ? `Pending bills vs your current balance of ${fmt(ins.currentBalance)}.`
        : "Cannot determine current balance.",
      barValue: ins.billPressurePct,
    },
    {
      title: "Biggest Category Spike",
      value: ins.topIncrease?.cat ?? "No spike",
      trendLabel: ins.topIncrease ? `+${fmt(ins.topIncrease.delta)} vs ${lastMonthName}` : null,
      trendUp: false,
      description: ins.topIncrease
        ? `Spending in ${ins.topIncrease.cat} rose the most compared to last month.`
        : `No category spent more than in ${lastMonthName}.`,
    },
    {
      title: "Avg Daily Spending",
      value: fmt(ins.avgDailySpend),
      trendLabel: null,
      trendUp: null,
      description: `Based on ${fmt(ins.thisMonthExp)} over ${ins.dayOfMonth} day${ins.dayOfMonth !== 1 ? "s" : ""} in ${thisMonthName}.`,
    },
  ];

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: "'Friends', sans-serif" }}>

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl font-semibold text-(--text)">Insights</span>
            <span
              className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}
            >
              <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 mb-px" />
              Live
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Smart summaries derived from your transaction history.
          </p>
        </div>
        <span
          className="text-[11px] px-3 py-1.5 rounded-xl shrink-0"
          style={{ background: "var(--subtle-bg)", color: "var(--text-dim)", border: "1px solid var(--divider)" }}
        >
          Updated {timeStr}
        </span>
      </div>

      {/* ── Cards grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {!loaded
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card, i) => (
              <InsightCard
                key={i}
                index={i}
                icon={ICONS[i]}
                accent={ACCENTS[i]}
                {...card}
              />
            ))}
      </div>
    </div>
  );
}
