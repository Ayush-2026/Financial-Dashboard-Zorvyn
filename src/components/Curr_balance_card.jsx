import { useState, useEffect } from 'react';
import initialTransactions from '../assets/transactions';
import green_up from '../assets/green_up.png';
import red_down from '../assets/red_down.png';

export default function Curr_balance_card() {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, []);

  const calculate_summary = (transactions) => {
    let income = 0, expense = 0;
    for (const t of transactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { balance: income - expense, income, expense };
  };

  const { balance, income, expense } = calculate_summary(initialTransactions);

  if (!loaded) {
    return (
      <div className="dash-card rounded-3xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-sub)', animationDelay: '0ms' }}>
        <div className="h-3 w-28 rounded shimmer-box" />
        <div className="h-9 w-40 rounded shimmer-box" />
        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl shimmer-box" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 rounded shimmer-box" />
              <div className="h-2 w-10 rounded shimmer-box" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl shimmer-box" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 rounded shimmer-box" />
              <div className="h-2 w-12 rounded shimmer-box" />
            </div>
          </div>
        </div>
        <div className="mt-5 h-px w-full shimmer-box" />
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-2 w-28 rounded shimmer-box" />
            <div className="h-4 w-20 rounded-full shimmer-box" />
          </div>
          <div className="h-2 w-full rounded-full shimmer-box" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="dash-card relative flex text-(--text) overflow-hidden"
      style={{ animationDelay: '0ms' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 0.35s ease',
        }} />

      {/* corner glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: '#818cf8',
          opacity: hovered ? 0.07 : 0,
          filter: 'blur(24px)',
          transition: 'opacity 0.4s ease',
        }} />

      <div
        className="w-full px-5 py-6 rounded-3xl transition-all duration-350 relative"
        style={{
          background: hovered
            ? 'linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-card) 60%, rgba(129,140,248,0.07) 100%)'
            : 'var(--bg-card)',
          border: `1px solid ${hovered ? 'rgba(129,140,248,0.4)' : 'var(--border-sub)'}`,
          boxShadow: hovered ? '0 12px 40px rgba(129,140,248,0.15)' : 'none',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          fontFamily: "'Friends', sans-serif",
        }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Current Balance</p>

        <p className="balance-value mt-5 text-[32px] md:text-[40px] font-bold text-(--text) leading-none">
          ₹ {balance.toFixed(2)}
        </p>

        <div className="flex mt-6 gap-6">
          {/* Income */}
          <div className="flex items-center gap-2 group/inc">
            <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <img src={green_up} className="w-5 h-5" alt="" />
            </div>
            <div className="text-xs">
              <p className="whitespace-nowrap font-medium" style={{ color: '#34d399' }}>₹ {income.toFixed(2)}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Income</p>
            </div>
          </div>

          {/* Expense */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <img src={red_down} className="w-5 h-5" alt="" />
            </div>
            <div className="text-xs">
              <p className="whitespace-nowrap font-medium" style={{ color: '#f87171' }}>₹ {expense.toFixed(2)}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Expenses</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-5" style={{ borderTop: '1px solid var(--divider)' }} />

        {/* Income vs Expense ratio bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Income vs Expense</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: balance >= 0 ? '#34d399' : '#f87171',
                background: balance >= 0 ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                border: `1px solid ${balance >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
              }}
            >
              {income > 0 ? `${((balance / income) * 100).toFixed(1)}% saved` : '—'}
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(248,113,113,0.25)' }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full insight-bar"
              style={{
                width: income > 0 ? `${Math.min(100, (income / (income + expense)) * 100).toFixed(1)}%` : '0%',
                background: 'linear-gradient(90deg, #34d399aa, #34d399)',
                animationDelay: '800ms',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: '#34d39988' }}>Income</span>
            <span className="text-[10px]" style={{ color: '#f8717188' }}>Expense</span>
          </div>
        </div>
      </div>
    </div>
  );
}
