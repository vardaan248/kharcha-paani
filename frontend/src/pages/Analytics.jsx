import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import ApiService from '../services/apiService.js'
import styles from './Analytics.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function Analytics() {
  const now = new Date()
  const [year,    setYear]    = useState(now.getFullYear())
  const [yearly,  setYearly]  = useState(null)
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([ApiService.getYearlySummary(year), ApiService.getRecurringTransactions()])
      .then(([yr, rec]) => { setYearly(yr); setRecurring(rec || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const barData = yearly ? {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: months.map((_,i) => yearly.monthly_breakdown[String(i+1).padStart(2,'0')]?.income  || 0),
        backgroundColor: 'rgba(34,197,94,.7)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: months.map((_,i) => yearly.monthly_breakdown[String(i+1).padStart(2,'0')]?.expense || 0),
        backgroundColor: 'rgba(239,68,68,.7)',
        borderRadius: 4,
      },
    ],
  } : null

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', boxRadius: 4 } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' },
           title: { display: true, text: '₹ Amount', color: '#94a3b8' } },
    },
  }

  if (loading) return <div className={styles.loading}>Loading analytics…</div>

  const noData = !yearly || yearly.transaction_count === 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.sub}>Year-over-year view and recurring expense detection</p>
        </div>
        <select value={year} onChange={e => setYear(+e.target.value)} className={styles.select}>
          {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {noData && (
        <div className={styles.empty}>
          <span>📈</span>
          <p>No data for {year}. <a href="/upload">Upload a statement</a> to see analytics.</p>
        </div>
      )}

      {/* KPIs */}
      {yearly && (
        <div className={styles.kpiRow}>
          {[
            { label: 'Total Income',        value: `₹${(yearly.total_income||0).toLocaleString('en-IN', {maximumFractionDigits:0})}`,  color: 'var(--green)'  },
            { label: 'Total Expense',       value: `₹${(yearly.total_expense||0).toLocaleString('en-IN', {maximumFractionDigits:0})}`, color: 'var(--red)'    },
            { label: 'Net Cash Flow',       value: `₹${(yearly.net_cash_flow||0).toLocaleString('en-IN', {maximumFractionDigits:0})}`, color: 'var(--accent)' },
            { label: 'Avg Monthly Expense', value: `₹${(yearly.average_monthly_expense||0).toLocaleString('en-IN', {maximumFractionDigits:0})}`, color: 'var(--yellow)' },
          ].map(k => (
            <div key={k.label} className={styles.kpiCard}>
              <div className={styles.kpiValue} style={{ color: k.color }}>{k.value}</div>
              <div className={styles.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bar chart */}
      {barData && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Monthly Income vs Expense — {year}</h2>
          <div className={styles.chartWrap}><Bar data={barData} options={chartOpts} /></div>
        </div>
      )}

      {/* Recurring */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🔄 Recurring Expenses Detected</h2>
        {recurring.length === 0
          ? <p className={styles.muted}>No recurring patterns found yet. Upload more months for better detection.</p>
          : (
            <table className={styles.table}>
              <thead><tr><th>Merchant</th><th>Amount</th><th>Occurrences</th><th>Avg Interval</th><th>Last Seen</th></tr></thead>
              <tbody>
                {recurring.map((r,i) => (
                  <tr key={i}>
                    <td>{r.merchant || '—'}</td>
                    <td>₹{r.amount.toLocaleString('en-IN')}</td>
                    <td>{r.occurrences}×</td>
                    <td>{r.average_interval_days} days</td>
                    <td className={styles.muted}>{r.last_transaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}
