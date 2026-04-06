import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import initialTransactions from "../assets/transactions";

const ROWS_PER_PAGE = 7;
const LS_KEY = "zorvin_transactions";

const CATEGORIES = ["Salary", "Food", "Rent", "Transport", "Freelance", "Entertainment", "Groceries", "Other"];
const PAYMENT_METHODS = ["UPI", "Bank Transfer", "Card", "Cash", "Bank"];

const inputCls = "bg-(--bg-input) border border-(--border-sub) rounded-xl px-3 py-2.5 text-(--text) text-sm w-full outline-none placeholder-(--text-dim) focus:border-[#6c6cd4] transition-colors";
const sortCls  = "bg-(--bg-input) border border-(--border-sub) rounded-xl px-3 py-2.5 text-(--text) text-sm outline-none focus:border-[#6c6cd4] transition-colors";

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const incomeStyle = { color: "#34d399" };
const expenseStyle = { color: "#f87171" };
const incomeBadge = "px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/25";
const expenseBadge = "px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/25";

export default function Transactions() {
  const { role } = useOutletContext();
  const isAdmin = role === "Admin";

  const [loaded,        setLoaded]        = useState(false);
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [hoveredRow,    setHoveredRow]    = useState(null);
  const [hoveredCard,   setHoveredCard]   = useState(null);
  const [cardHovered,   setCardHovered]   = useState(false);   // table card
  const [addHovered,    setAddHovered]    = useState(false);   // add card

  const [form,          setForm]          = useState({ amount: "", category: "Food", type: "expense", date: "", paymentMethod: "UPI", description: "" });
  const [filters,       setFilters]       = useState({ amountMin: "", amountMax: "", category: "", type: "", dateFrom: "", dateTo: "" });
  const [activeFilters, setActiveFilters] = useState({});
  const [search,        setSearch]        = useState("");
  const [sort,          setSort]          = useState("date-desc");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page,          setPage]          = useState(1);
  const [editingId,     setEditingId]     = useState(null);
  const [editForm,      setEditForm]      = useState({});

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch { return initialTransactions; }
  });

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 700); return () => clearTimeout(t); }, []);

  // ── pipeline ─────────────────────────────────────────────────────────────────
  const filtered = transactions
    .filter((t) => {
      if (activeFilters.amountMin && t.amount < Number(activeFilters.amountMin)) return false;
      if (activeFilters.amountMax && t.amount > Number(activeFilters.amountMax)) return false;
      if (activeFilters.category && t.category.toLowerCase() !== activeFilters.category.toLowerCase()) return false;
      if (activeFilters.type && t.type !== activeFilters.type) return false;
      if (activeFilters.dateFrom && new Date(t.date) < new Date(activeFilters.dateFrom)) return false;
      if (activeFilters.dateTo   && new Date(t.date) > new Date(activeFilters.dateTo))   return false;
      return true;
    })
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "date-desc")   return new Date(b.date) - new Date(a.date);
      if (sort === "date-asc")    return new Date(a.date) - new Date(b.date);
      if (sort === "amount-desc") return b.amount - a.amount;
      if (sort === "amount-asc")  return a.amount - b.amount;
      return 0;
    });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const currentRows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleAdd = () => {
    if (!form.amount || !form.category || !form.date) return;
    setTransactions((prev) => [{ id: `t${Date.now()}`, amount: parseFloat(form.amount), category: form.category, type: form.type, date: form.date, paymentMethod: form.paymentMethod, description: form.description || form.category }, ...prev]);
    setForm({ amount: "", category: "Food", type: "expense", date: "", paymentMethod: "UPI", description: "" });
    setPage(1);
  };
  const confirmDelete = () => { setTransactions((prev) => prev.filter((t) => t.id !== confirmDeleteId)); setConfirmDeleteId(null); };
  const startEdit = (t) => { setEditingId(t.id); setEditForm({ ...t }); };
  const saveEdit  = () => { setTransactions((prev) => prev.map((t) => t.id === editingId ? { ...t, ...editForm, amount: parseFloat(editForm.amount) } : t)); setEditingId(null); };
  const applyFilters = () => { setActiveFilters({ ...filters }); setPage(1); };
  const resetFilters = () => { setFilters({ amountMin: "", amountMax: "", category: "", type: "", dateFrom: "", dateTo: "" }); setActiveFilters({}); setPage(1); };
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  // ── card hover style factory ──────────────────────────────────────────────────
  const cardStyle = (hov, accent, glow) => ({
    fontFamily: "'Friends', sans-serif",
    background:   hov ? `linear-gradient(145deg,var(--bg-deep) 0%,var(--bg-card) 60%,${accent}0a 100%)` : "var(--bg-card)",
    border:       `1px solid ${hov ? `${accent}55` : "var(--border-sub)"}`,
    boxShadow:    hov ? `0 12px 40px ${glow}` : "none",
    transform:    hov ? "translateY(-3px)" : "translateY(0)",
    transition:   "all 0.35s cubic-bezier(0.22,1,0.36,1)",
    position:     "relative",
    overflow:     "hidden",
  });

  const accentBar = (color, hov) => (
    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
      style={{ background: `linear-gradient(90deg,transparent,${color},transparent)`, opacity: hov ? 1 : 0.4, transition: "opacity 0.35s ease" }} />
  );

  const cornerGlow = (color, hov) => (
    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
      style={{ background: color, opacity: hov ? 0.07 : 0, filter: "blur(24px)", transition: "opacity 0.4s ease" }} />
  );

  // ── skeleton ─────────────────────────────────────────────────────────────────
  if (!loaded) return (
    <div className="flex flex-col gap-5 md:h-full" style={{ fontFamily: "'Friends', sans-serif" }}>
      {isAdmin && (
        <div className="md:shrink-0 rounded-3xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)" }}>
          <div className="h-3 w-36 rounded shimmer-box" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-20 rounded shimmer-box" />
                <div className="h-9 w-full rounded-xl shimmer-box" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-1">
            <div className="h-9 w-20 rounded-xl shimmer-box" />
            <div className="h-9 w-16 rounded-xl shimmer-box" />
          </div>
        </div>
      )}
      <div className="rounded-3xl p-5 flex flex-col gap-4 md:flex-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border-sub)" }}>
        <div className="flex gap-2">
          <div className="flex-1 h-10 rounded-xl shimmer-box" />
          <div className="w-20 h-10 rounded-xl shimmer-box" />
          <div className="w-20 h-10 rounded-xl shimmer-box" />
        </div>
        <div className="space-y-1">
          <div className="h-8 w-full rounded shimmer-box opacity-50" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3 items-center">
              <div className="flex-1 h-3 rounded shimmer-box" />
              <div className="w-20 h-3 rounded shimmer-box" />
              <div className="w-24 h-3 rounded shimmer-box" />
              <div className="w-16 h-5 rounded-full shimmer-box" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 md:h-full" style={{ fontFamily: "'Friends', sans-serif" }}>

      {/* ── Delete modal ────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="dash-card rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            style={{ background: "var(--bg-deep)", border: "1px solid rgba(248,113,113,0.3)", boxShadow: "0 20px 60px rgba(248,113,113,0.15)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)" }}>
              <svg className="w-6 h-6" style={{ color: "#f87171" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
              </svg>
            </div>
            <p className="text-base font-semibold text-(--text) mb-1">Delete Transaction?</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--border-sub)", color: "var(--text-dim)", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-control)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 px-5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(220,38,38,0.85)", color: "#fff", border: "1px solid rgba(248,113,113,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(220,38,38,0.85)"}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add transaction — Admin only ─────────────────────── */}
      {isAdmin && (
        <div className="dash-card md:shrink-0 rounded-3xl p-5"
          style={cardStyle(addHovered, "#34d399", "rgba(52,211,153,0.15)")}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}>
          {accentBar("#34d399", addHovered)}
          {cornerGlow("#34d399", addHovered)}
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-dim)" }}>Add New Transaction</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Amount",         node: <input className={inputCls} placeholder="1000" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} /> },
              { label: "Category",       node: <select className={inputCls} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select> },
              { label: "Type",           node: <select className={inputCls} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}><option value="expense">Expense</option><option value="income">Income</option></select> },
              { label: "Date",           node: <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /> },
              { label: "Payment Method", node: <select className={inputCls} value={form.paymentMethod} onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select> },
              { label: "Description",    node: <input className={inputCls} placeholder="e.g. Swiggy order" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /> },
            ].map(({ label, node }) => (
              <div key={label}>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-dim)" }}>{label}</label>
                {node}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setForm({ amount: "", category: "Food", type: "expense", date: "", paymentMethod: "UPI", description: "" })}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ border: "1px solid var(--border-sub)", color: "var(--text-dim)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-control)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Reset
            </button>
            <button onClick={handleAdd}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: "linear-gradient(135deg,#34d39988,#34d399)", border: "1px solid rgba(52,211,153,0.4)" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Table card ──────────────────────────────────────────── */}
      <div className="dash-card flex flex-col rounded-3xl p-5 md:flex-1 md:min-h-0"
        style={cardStyle(cardHovered, "#818cf8", "rgba(129,140,248,0.13)")}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}>
        {accentBar("#818cf8", cardHovered)}
        {cornerGlow("#818cf8", cardHovered)}

        {/* ── Search + Sort + Filter toggle ─────────────────── */}
        <div className="md:shrink-0 flex gap-2 mb-4 relative z-10">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-dim)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input className={`${inputCls} pl-9`} placeholder="Search…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className={`${sortCls} sm:hidden shrink-0 w-20`} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="date-desc">↓ Date</option>
            <option value="date-asc">↑ Date</option>
            <option value="amount-desc">↓ Amt</option>
            <option value="amount-asc">↑ Amt</option>
          </select>
          <select className={`${sortCls} hidden sm:block shrink-0 w-48`} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="date-desc">Date: Latest first</option>
            <option value="date-asc">Date: Oldest first</option>
            <option value="amount-desc">Amount: High → Low</option>
            <option value="amount-asc">Amount: Low → High</option>
          </select>
          <button onClick={() => setFilterOpen((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background:  filterOpen || hasActiveFilters ? "rgba(129,140,248,0.15)" : "transparent",
              border:      `1px solid ${filterOpen || hasActiveFilters ? "rgba(129,140,248,0.45)" : "var(--border-sub)"}`,
              color:       filterOpen || hasActiveFilters ? "#a5a5f5" : "var(--text-dim)",
            }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
            </svg>
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#818cf8" }} />}
          </button>
        </div>

        {/* ── Filter panel ─────────────────────────────────────── */}
        {filterOpen && (
          <div className="dash-card md:shrink-0 mb-4 p-4 rounded-2xl relative z-10"
            style={{ background: "var(--bg-panel)", border: "1px solid rgba(129,140,248,0.2)", animationDuration: "0.3s" }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Min Amount", node: <input className={inputCls} placeholder="500"  type="number" value={filters.amountMin} onChange={(e) => setFilters((p) => ({ ...p, amountMin: e.target.value }))} /> },
                { label: "Max Amount", node: <input className={inputCls} placeholder="5000" type="number" value={filters.amountMax} onChange={(e) => setFilters((p) => ({ ...p, amountMax: e.target.value }))} /> },
                { label: "Category",   node: <select className={inputCls} value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}><option value="">All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select> },
                { label: "Type",       node: <select className={inputCls} value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></select> },
                { label: "From",       node: <input className={inputCls} type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} /> },
                { label: "To",         node: <input className={inputCls} type="date" value={filters.dateTo}   onChange={(e) => setFilters((p) => ({ ...p, dateTo:   e.target.value }))} /> },
              ].map(({ label, node }) => (
                <div key={label}>
                  <label className="text-xs mb-1.5 block" style={{ color: "var(--text-dim)" }}>{label}</label>
                  {node}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={resetFilters}
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--border-sub)", color: "var(--text-dim)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-control)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Reset
              </button>
              <button onClick={() => { applyFilters(); setFilterOpen(false); }}
                className="px-4 py-1.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: "linear-gradient(135deg,#4c4cdb,#6c6cef)", border: "1px solid rgba(129,140,248,0.4)" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Apply
              </button>
            </div>
          </div>
        )}

        {/* ── Desktop table ─────────────────────────────────────── */}
        <div className="hidden md:flex flex-col md:flex-1 md:min-h-0 overflow-y-auto overflow-x-auto relative z-10">
          <table className="w-full text-sm" style={{ color: "var(--text-accent)" }}>
            <thead className="sticky top-0 z-10" style={{ background: "var(--bg-card)" }}>
              <tr style={{ borderBottom: "1px solid rgba(129,140,248,0.2)" }}>
                {["Category", "Amount", "Date", "Type", ...(isAdmin ? ["Actions"] : [])].map((h) => (
                  <th key={h} className={`pb-3 text-left font-medium text-xs uppercase tracking-widest ${h === "Category" ? "pl-2" : ""}`}
                    style={{ color: "var(--text-dim)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((t, i) => (
                <tr key={t.id}
                  className="dash-row"
                  style={{
                    borderBottom: "1px solid var(--divider)",
                    background: hoveredRow === t.id
                      ? t.type === "income" ? "rgba(52,211,153,0.04)" : "rgba(248,113,113,0.04)"
                      : "transparent",
                    transition: "background 0.2s ease",
                    animationDelay: `${700 + i * 50}ms`,
                  }}
                  onMouseEnter={() => setHoveredRow(t.id)}
                  onMouseLeave={() => setHoveredRow(null)}>

                  <td className="py-3.5 pl-2">
                    {editingId === t.id ? (
                      <select className={`${inputCls} w-36`} value={editForm.category}
                        onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 rounded-full shrink-0 transition-all duration-200"
                          style={{ background: hoveredRow === t.id ? (t.type === "income" ? "#34d399" : "#f87171") : "transparent" }} />
                        <div>
                          <p className="font-medium text-(--text)">{t.category}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{t.description}</p>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5">
                    {editingId === t.id ? (
                      <input className={`${inputCls} w-24`} type="number" value={editForm.amount}
                        onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} />
                    ) : (
                      <span className="font-semibold" style={t.type === "income" ? incomeStyle : expenseStyle}>
                        {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5">
                    {editingId === t.id ? (
                      <input className={`${inputCls} w-36`} type="date" value={editForm.date}
                        onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} />
                    ) : (
                      <span className="text-sm" style={{ color: "var(--text-dim)" }}>
                        {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5">
                    {editingId === t.id ? (
                      <select className={`${inputCls} w-28`} value={editForm.type}
                        onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    ) : (
                      <span className={t.type === "income" ? incomeBadge : expenseBadge}>
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                    )}
                  </td>

                  {isAdmin && (
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        {editingId === t.id ? (
                          <>
                            <button onClick={saveEdit} className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors"
                              style={{ background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(52,211,153,0.35)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(52,211,153,0.2)"}>Save</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded-lg text-xs transition-colors"
                              style={{ background: "var(--subtle-bg)", color: "var(--text-dim)" }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-control)"}
                              onMouseLeave={e => e.currentTarget.style.background = "var(--subtle-bg)"}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg transition-all"
                              style={{ color: "var(--text-dim)" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(129,140,248,0.2)"; e.currentTarget.style.color = "#a5a5f5"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-dim)"; }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                              </svg>
                            </button>
                            <button onClick={() => setConfirmDeleteId(t.id)} className="p-1.5 rounded-lg transition-all"
                              style={{ color: "var(--text-dim)" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-dim)"; }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {currentRows.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-16 text-center">
                    <p className="text-sm" style={{ color: "var(--text-dim)" }}>No transactions found</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Try adjusting your filters or search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ───────────────────────────────────────── */}
        <div className="md:hidden flex flex-col gap-3 relative z-10">
          {currentRows.map((t, i) => (
            <div key={t.id}
              className="dash-row rounded-2xl p-4 cursor-default"
              style={{
                background: hoveredCard === t.id
                  ? t.type === "income" ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)"
                  : "var(--subtle-bg)",
                border: `1px solid ${hoveredCard === t.id
                  ? t.type === "income" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"
                  : "var(--divider)"}`,
                boxShadow: hoveredCard === t.id
                  ? t.type === "income" ? "0 4px 20px rgba(52,211,153,0.1)" : "0 4px 20px rgba(248,113,113,0.1)"
                  : "none",
                transform: hoveredCard === t.id ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.25s ease",
                animationDelay: `${700 + i * 60}ms`,
              }}
              onMouseEnter={() => setHoveredCard(t.id)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-(--text) truncate">{t.category}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{t.description}</p>
                </div>
                <span className="font-semibold text-sm shrink-0" style={t.type === "income" ? incomeStyle : expenseStyle}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div className="flex items-center gap-2">
                  <span className={t.type === "income" ? incomeBadge : expenseBadge}>
                    {t.type === "income" ? "Income" : "Expense"}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg transition-all"
                        style={{ color: "var(--text-dim)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(129,140,248,0.2)"; e.currentTarget.style.color = "#a5a5f5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-dim)"; }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                        </svg>
                      </button>
                      <button onClick={() => setConfirmDeleteId(t.id)} className="p-1.5 rounded-lg transition-all"
                        style={{ color: "var(--text-dim)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-dim)"; }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {editingId === t.id && (
                <div className="mt-3 pt-3 grid grid-cols-2 gap-2" style={{ borderTop: "1px solid var(--divider)" }}>
                  <select className={inputCls} value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input className={inputCls} type="number" placeholder="Amount" value={editForm.amount} onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} />
                  <input className={inputCls} type="date" value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} />
                  <select className={inputCls} value={editForm.type} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <button onClick={saveEdit} className="col-span-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                    style={{ background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>Save</button>
                  <button onClick={() => setEditingId(null)} className="col-span-1 px-3 py-1.5 rounded-xl text-xs transition-colors"
                    style={{ background: "var(--subtle-bg)", color: "var(--text-dim)" }}>Cancel</button>
                </div>
              )}
            </div>
          ))}
          {currentRows.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>No transactions found</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Try adjusting your filters or search</p>
            </div>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────────── */}
        <div className="md:shrink-0 flex items-center justify-between mt-5 pt-4 gap-2 relative z-10"
          style={{ borderTop: "1px solid var(--divider)" }}>
          <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-dim)" }}>
            {currentRows.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            {[{ label: "← Prev", disabled: page === 1, onClick: () => setPage((p) => p - 1) },
              { label: "Next →", disabled: page === totalPages, onClick: () => setPage((p) => p + 1) }
            ].map(({ label, disabled, onClick }) => (
              <button key={label} disabled={disabled} onClick={onClick}
                className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: "1px solid var(--border-sub)", color: "var(--text-dim)", background: "transparent" }}
                onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = "rgba(129,140,248,0.15)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.4)"; e.currentTarget.style.color = "#a5a5f5"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-sub)"; e.currentTarget.style.color = "var(--text-dim)"; }}>
                {label}
              </button>
            ))}
            <span className="text-xs px-2 whitespace-nowrap font-medium" style={{ color: "var(--text-dim)" }}>{page} / {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
