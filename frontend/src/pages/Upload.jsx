import { useState, useRef } from 'react'
import ApiService from '../services/apiService.js'
import styles from './Upload.module.css'

const ACCEPT = '.csv,.xlsx,.xls'

export default function Upload() {
  const [file,       setFile]       = useState(null)
  const [password,   setPassword]   = useState('')
  const [encrypt,    setEncrypt]    = useState(false)
  const [dragging,   setDragging]   = useState(false)
  const [status,     setStatus]     = useState(null)   // null | 'uploading' | 'done' | 'error'
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState('')
  const [history,    setHistory]    = useState([])
  const inputRef = useRef()

  const pick = f => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['csv','xlsx','xls'].includes(ext)) {
      setError('Only CSV and Excel files are supported.')
      return
    }
    setFile(f)
    setError('')
    setResult(null)
    setStatus(null)
  }

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files[0])
  }

  const submit = async () => {
    if (!file) return
    setStatus('uploading')
    setError('')
    try {
      const res = await ApiService.uploadFile(file, password || null)
      setResult(res)
      setStatus('done')
      setHistory(h => [{ name: file.name, count: res.transaction_count, ts: new Date().toLocaleString() }, ...h])
      setFile(null)
      setPassword('')
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed. Check the server is running.')
      setStatus('error')
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Upload Statement</h1>
      <p className={styles.sub}>Supports CSV and Excel (.xlsx) bank statements</p>

      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={e => pick(e.target.files[0])} />
        {file
          ? <><span className={styles.fileIcon}>📄</span><strong>{file.name}</strong><span className={styles.fileSize}>{(file.size/1024).toFixed(1)} KB</span></>
          : <><span className={styles.dropIcon}>⬆️</span><strong>Drag & drop or click to select</strong><span className={styles.dropHint}>CSV, XLSX · Max 50 MB</span></>
        }
      </div>

      {/* Security options */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>🔒 Security Options</h2>

        <label className={styles.fieldLabel}>Password protect this file <span className={styles.optional}>(optional)</span></label>
        <input
          type="password"
          className={styles.input}
          placeholder="Leave blank for no password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <p className={styles.hint}>Password is hashed with bcrypt — never stored in plain text.</p>

        <label className={styles.toggle}>
          <input type="checkbox" checked={encrypt} onChange={e => setEncrypt(e.target.checked)} />
          <span>Encrypt file on server (Fernet AES-128)</span>
        </label>
      </div>

      {/* Error */}
      {error && <div className={styles.errorBox}>⚠️ {error}</div>}

      {/* Success */}
      {status === 'done' && result && (
        <div className={styles.successBox}>
          <strong>✅ Upload successful!</strong>
          <p>Imported <strong>{result.transaction_count}</strong> transactions from <em>{result.original_filename}</em></p>
          {result.errors?.length > 0 && <p className={styles.warn}>{result.errors.length} rows skipped due to errors.</p>}
        </div>
      )}

      {/* Submit */}
      <button
        className={styles.btn}
        disabled={!file || status === 'uploading'}
        onClick={submit}
      >
        {status === 'uploading' ? '⏳ Processing…' : '⬆️ Upload & Import'}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Recent Uploads (this session)</h2>
          <table className={styles.table}>
            <thead><tr><th>File</th><th>Transactions</th><th>Time</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>📄 {h.name}</td>
                  <td>{h.count}</td>
                  <td className={styles.muted}>{h.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Format guide */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>📋 Expected Format</h2>
        <p className={styles.hint}>Your CSV/Excel should have at least these columns (names are auto-detected):</p>
        <table className={styles.table}>
          <thead><tr><th>Column</th><th>Example</th><th>Required</th></tr></thead>
          <tbody>
            <tr><td>Date</td><td>2024-01-15 or 15/01/2024</td><td>✅ Yes</td></tr>
            <tr><td>Amount</td><td>2500.00 or -1200</td><td>✅ Yes</td></tr>
            <tr><td>Description / Narration</td><td>AMAZON PAYMENT</td><td>✅ Yes</td></tr>
            <tr><td>Debit / Credit</td><td>1200.00</td><td>Optional</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
