import { useEffect, useState } from 'react'
import ApiService from '../services/apiService.js'
import styles from './Transactions.module.css'

const TYPES = ['All','income','expense','transfer']

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [catFilter,setCatFilter]= useState('All')
  const [typeFilter,setTypeFilter]= useState('All')
  const [editing,  setEditing]  = useState(null)   // transaction being edited
  const [page,     setPage]     = useState(1)
  const PER_PAGE = 25

  useEffect(() => {
    Promise.all([ApiService.getTransactions(), ApiService.getCategories()])
      .then(([txns, cats]) => { setTransactions(txns || []); setCategories(cats || []) })
      .catch(() => { setTransactions([]); setCategories([]) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = transactions.filter(t => {
    const matchSearch = !search ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.merchant || '').toLowerCase().includes(search.toLowerCase())
    const matchCat  = catFilter  === 'All' || t.category  === catFilter
    const matchType = typeFilter === 'All' || t.type      === typeFilter
    return matchSearch && matchCat && matchType
  })

  const pages    = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const saveEdit = async () => {
    try {
      await ApiService.updateTransaction(editing.id, { category: editing.category, notes: editing.notes })
      setTransactions(ts => ts.map(t => t.id === editing.id ? { ...t, ...editing } : t))
      setEditing(null)
    } catch { /* ignore */ }
  }

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
  const fmt = n => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  if (loading) return <div className={styles.loading}>Loading transactions…</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.sub}>{filtered.length} of {transactions.length} transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="🔍  Search description or merchant…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select className={styles.select} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
          <option>All</option>
          {categories.map(c => <option key={c.id || c.name}>{c.name}</option>)}
        </select>
        <select className={styles.select} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {transactions.length === 0
        ? (
          <div className={styles.empty}>
            <span>📂</span>
            <p>No transactions yet. <a href="/upload">Upload a statement</a> to get started.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th><th>Description</th><th>Category</th>
                    <th>Type</th><th style={{textAlign:'right'}}>Amount</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => (
                    <tr key={t.id}>
                      <td className={styles.date}>{formatDate(t.date)}</td>
                      <td>
                        <div className={styles.desc}>{t.description}</div>
                        {t.merchant && <div className={styles.merchant}>{t.merchant}</div>}
                      </td>
                      <td><span className={styles.badge}>{t.category || 'Other'}</span></td>
                      <td><span className={`${styles.type} ${styles[t.type]}`}>{t.type}</span></td>
                      <td className={`${styles.amount} ${t.type === 'income' ? styles.income : styles.expense}`}>
                        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                      </td>
                      <td>
                        <button className={styles.editBtn} onClick={() => setEditing({ ...t })}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className={styles.pagination}>
                <button disabled={page === 1}     onClick={() => setPage(p => p-1)}>← Prev</button>
                <span>Page {page} / {pages}</span>
                <button disabled={page === pages} onClick={() => setPage(p => p+1)}>Next →</button>
              </div>
            )}
          </>
        )
      }

      {/* Edit modal */}
      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Edit Transaction</h2>
            <p className={styles.modalDesc}>{editing.description}</p>

            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={editing.category}
              onChange={e => setEditing(ed => ({ ...ed, category: e.target.value }))}
            >
              {categories.map(c => <option key={c.name}>{c.name}</option>)}
            </select>

            <label className={styles.label}>Notes</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={editing.notes || ''}
              onChange={e => setEditing(ed => ({ ...ed, notes: e.target.value }))}
            />

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
              <button className={styles.saveBtn}   onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
