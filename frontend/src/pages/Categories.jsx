import { useEffect, useState } from 'react'
import ApiService from '../services/apiService.js'
import styles from './Categories.module.css'

const ICONS = ['🛒','💡','🚗','🎮','💊','🏠','🍽️','🛍️','📱','📌','✈️','🎓','💼','🐾','🏋️']
const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#a855f7','#14b8a6','#f97316','#ec4899','#94a3b8']

const blank = () => ({ name:'', description:'', budget_limit:'', color:'#6366f1', icon:'📌', matching_keywords:'' })

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [form,       setForm]       = useState(null)   // null = closed, obj = open
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const load = () =>
    ApiService.getCategories()
      .then(c => setCategories(c || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        budget_limit: form.budget_limit ? +form.budget_limit : null,
        matching_keywords: form.matching_keywords
          ? form.matching_keywords.split(',').map(k => k.trim()).filter(Boolean)
          : [],
      }
      if (form.id) await ApiService.updateCategory(form.id, payload)
      else         await ApiService.createCategory(payload)
      setForm(null)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const del = async cat => {
    if (cat.is_system) { alert("System categories can't be deleted."); return }
    if (!confirm(`Delete "${cat.name}"?`)) return
    try { await ApiService.deleteCategory(cat.id); load() } catch { /* ignore */ }
  }

  if (loading) return <div className={styles.loading}>Loading categories…</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.sub}>{categories.length} categories — click any to edit keywords or budget</p>
        </div>
        <button className={styles.addBtn} onClick={() => { setForm(blank()); setError('') }}>+ New Category</button>
      </div>

      <div className={styles.grid}>
        {categories.map(cat => (
          <div key={cat.id || cat.name} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.icon} style={{ background: `${cat.color}25` }}>{cat.icon}</span>
              <div className={styles.info}>
                <span className={styles.name}>{cat.name}</span>
                {cat.is_system && <span className={styles.sys}>system</span>}
              </div>
              <div className={styles.actions}>
                <button onClick={() => {
                  setForm({
                    ...cat,
                    matching_keywords: (cat.matching_keywords || []).join(', ')
                  })
                  setError('')
                }}>✏️</button>
                {!cat.is_system && <button onClick={() => del(cat)}>🗑️</button>}
              </div>
            </div>

            {cat.budget_limit && (
              <div className={styles.budget}>Budget: ₹{cat.budget_limit.toLocaleString('en-IN')}/mo</div>
            )}
            {cat.matching_keywords?.length > 0 && (
              <div className={styles.keywords}>
                {cat.matching_keywords.slice(0,5).map(k => (
                  <span key={k} className={styles.kw}>{k}</span>
                ))}
                {cat.matching_keywords.length > 5 && (
                  <span className={styles.kwMore}>+{cat.matching_keywords.length - 5}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {form && (
        <div className={styles.overlay} onClick={() => setForm(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{form.id ? 'Edit Category' : 'New Category'}</h2>

            <label className={styles.label}>Name *</label>
            <input className={styles.input} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Dining" />

            <label className={styles.label}>Description</label>
            <input className={styles.input} value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Optional description" />

            <label className={styles.label}>Monthly Budget (₹)</label>
            <input className={styles.input} type="number" value={form.budget_limit || ''} onChange={e => setForm(f => ({...f, budget_limit: e.target.value}))} placeholder="Leave blank for no limit" />

            <label className={styles.label}>Matching Keywords <span className={styles.hint}>(comma-separated)</span></label>
            <input className={styles.input} value={form.matching_keywords || ''} onChange={e => setForm(f => ({...f, matching_keywords: e.target.value}))} placeholder="restaurant, cafe, swiggy, zomato" />

            <div className={styles.row}>
              <div>
                <label className={styles.label}>Color</label>
                <div className={styles.colorPicker}>
                  {COLORS.map(c => (
                    <button key={c} className={`${styles.colorSwatch} ${form.color===c ? styles.colorActive : ''}`}
                      style={{ background: c }} onClick={() => setForm(f => ({...f, color: c}))} />
                  ))}
                </div>
              </div>
              <div>
                <label className={styles.label}>Icon</label>
                <div className={styles.iconPicker}>
                  {ICONS.map(ic => (
                    <button key={ic} className={`${styles.iconBtn} ${form.icon===ic ? styles.iconActive : ''}`}
                      onClick={() => setForm(f => ({...f, icon: ic}))}>{ic}</button>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setForm(null)}>Cancel</button>
              <button className={styles.saveBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
