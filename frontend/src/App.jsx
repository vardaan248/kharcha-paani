import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Dashboard    from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Upload       from './pages/Upload.jsx'
import Categories   from './pages/Categories.jsx'
import Analytics    from './pages/Analytics.jsx'
import styles       from './App.module.css'

const NAV = [
  { to: '/',             icon: '📊', label: 'Dashboard'    },
  { to: '/upload',       icon: '⬆️',  label: 'Upload'       },
  { to: '/transactions', icon: '📋', label: 'Transactions' },
  { to: '/categories',   icon: '🏷️',  label: 'Categories'   },
  { to: '/analytics',    icon: '📈', label: 'Analytics'    },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.shell}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>💰</span>
            <span className={styles.brandName}>Finance<br/>Manager</span>
          </div>
          <nav className={styles.nav}>
            {NAV.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>v0.1.0 · MongoDB</div>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>
          <Routes>
            <Route path="/"             element={<Dashboard />}    />
            <Route path="/upload"       element={<Upload />}       />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories"   element={<Categories />}   />
            <Route path="/analytics"    element={<Analytics />}    />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
