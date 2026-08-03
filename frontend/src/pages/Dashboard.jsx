import { useEffect, useState } from 'react'
import { Doughnut, Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler,
} from 'chart.js'
import ApiService from '../services/apiService.js'
import styles from './Dashboard.module.css'

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler,
)

const CATEGORY_COLORS = [
  '#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6',
  '#a855f7','#14b8a6','#f97316','#ec4899','#94a3b8',
]

export default function Dashboard() {
  const now   = new Date()
  const [year,  setYear]    = useState(now.getFullYear())
  const [month, setMonth]   = useState(now.getMonth() + 1)
  const [data,  setData]    = useState(null)
  const [yearly, setYearly] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [monthly, yr, ins] = await Promise.all([
          ApiService.getMonthlySummary(year, month),
          ApiService.getYearlySummary(year),
          ApiService.getInsights(),
        ])
        setData(monthly)
        setYearly(yr)
        setInsights(ins)
      } catch {
        // API not ready yet — show empty state
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year, month])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  /* Chart configs */
  const doughnutData = data?.category_breakdown
    ? {
        labels: Object.keys(data.category_breakdown),
        datasets: [{
          data: Object.values(data.category_breakdown),
          backgroundColor: CATEGORY_COLORS,
          borderWidth: 0,
          hoverOffset: 6,
        }],
      }
    : null

  const lineData = yearly
    ? {
        labels: months,
        datasets: [
          {
            label: 'Expense',
            data: months.map((_, i) => yearly.monthly_breakdown[String(i+1).padStart(2,'0')]?.expense || 0),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,.15)',
            tension: .4, fill: true,
          },
          {
            label: 'Income',
            data: months.map((_, i) => yearly.monthly_breakdown[String(i+1).padStart(2,'0')]?.income || 0),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,.1)',
            tension: .4, fill: true,
          },
        ],
      }
    : null

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', boxRadius: 4 } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
    },
  }

  if (loading) return <div className={styles.loading}>Loading dashboard…</div>

  const noData = !data || data.transaction_count === 0

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Your financial overview</p>
        </div>
        <div className={styles.controls}>
          <select value={month} onChange={e => setMonth(+e.target.value)} className={styles.select}>
            {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className={styles.select}>
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {noData && (
        <div className={styles.emptyBanner}>
          <span>📂</span>
          <div>
            <strong>No data yet</strong>
            <p>Upload a bank statement to see your financial insights here.</p>
          </div>
          <a href="/upload" className={styles.uploadBtn}>Upload Statement →</a>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className={styles.kpiGrid}>
        <KpiCard label="Total Income"   value={data?.total_income   || 0} color="var(--green)"  icon="💚" />
        <KpiCard label="Total Expenses" value={data?.total_expense  || 0} color="var(--red)"    icon="🔴" />
        <KpiCard label="Net Cash Flow"  value={data?.net_cash_flow  || 0} color="var(--accent)" icon="💰" signed />
        <KpiCard label="Transactions"   value={data?.transaction_count || 0} color="var(--yellow)" icon="📋" count />
      </div>

      {/* ── Charts ── */}
      <div className={styles.chartRow}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Spending by Category</h2>
          {doughnutData
            ? <div className={styles.chartWrap}><Doughnut data={doughnutData} options={{ ...chartOpts, scales: undefined }} /></div>
            : <EmptyChart />}
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <h2 className={styles.cardTitle}>Monthly Trend — {year}</h2>
          {lineData
            ? <div className={styles.chartWrap}><Line data={lineData} options={chartOpts} /></div>
            : <EmptyChart />}
        </div>
      </div>

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Smart Insights</h2>
          <div className={styles.insightList}>
            {insights.map((ins, i) => (
              <div key={i} className={`${styles.insight} ${styles[ins.type]}`}>
                <p className={styles.insightMsg}>{ins.message}</p>
                <p className={styles.insightSug}>{ins.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Categories table ── */}
      {data?.category_breakdown && Object.keys(data.category_breakdown).length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Category Breakdown — {months[month-1]} {year}</h2>
          <table className={styles.table}>
            <thead>
              <tr><th>Category</th><th>Amount (₹)</th><th>Share</th></tr>
            </thead>
            <tbody>
              {Object.entries(data.category_breakdown)
                .sort((a,b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const pct = ((amt / data.total_expense) * 100).toFixed(1)
                  return (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td>₹{amt.toLocaleString('en-IN')}</td>
                      <td>
                        <div className={styles.bar}>
                          <div className={styles.barFill} style={{ width: `${pct}%` }} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, color, icon, signed, count }) {
  const display = count
    ? value.toLocaleString()
    : `₹${Math.abs(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const prefix = signed && value < 0 ? '−' : signed && value > 0 ? '+' : ''
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon} style={{ background: `${color}20` }}>{icon}</div>
      <div>
        <div className={styles.kpiValue} style={{ color }}>{prefix}{display}</div>
        <div className={styles.kpiLabel}>{label}</div>
      </div>
    </div>
  )
}

function EmptyChart() {
  return <div className={styles.emptyChart}>Upload statements to see charts</div>
}
