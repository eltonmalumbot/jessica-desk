import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  MessageCircle,
  ListChecks,
  Settings as SettingsIcon,
  ArrowUpRight,
  Menu,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  Heart,
  Monitor,
} from 'lucide-react'
import { Desk } from './context'
import type { Page } from './context'
import { useWorkspace } from './lib/useWorkspace'
import { Modal } from './components/ui'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Captions from './pages/Captions'
import Leads from './pages/Leads'
import Tasks from './pages/Tasks'
import Settings from './pages/Settings'
const nav = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'planner', label: 'Content planner', icon: CalendarDays },
  { id: 'captions', label: 'Caption studio', icon: Sparkles },
  { id: 'leads', label: 'Lead helper', icon: MessageCircle },
  { id: 'tasks', label: 'Daily tasks', icon: ListChecks },
] as const
const pageFromHash = (): Page => {
  const id = location.hash.slice(1)
  return [...nav.map((n) => n.id), 'settings'].includes(id) ? (id as Page) : 'dashboard'
}
export default function App() {
  const { data, save, storageError } = useWorkspace()
  const [page, setPage] = useState<Page>(pageFromHash),
    [mobile, setMobile] = useState(false)
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null)
  const [confirmation, setConfirmation] = useState<{
    title: string
    description: string
    label: string
    resolve: (value: boolean) => void
  } | null>(null)
  useEffect(() => {
    const listener = () => {
      setPage(pageFromHash())
      setMobile(false)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), toast.error ? 9000 : 3500)
    return () => clearTimeout(timer)
  }, [toast])
  const notify = (message: string, error = false) => setToast({ message, error })
  const navigate = (next: Page) => {
    location.hash = next
    setPage(next)
    setMobile(false)
  }
  const confirm = (title: string, description: string, label = 'Delete') =>
    new Promise<boolean>((resolve) => setConfirmation({ title, description, label, resolve }))
  const finishConfirm = (value: boolean) => {
    confirmation?.resolve(value)
    setConfirmation(null)
  }
  const value = {
    data,
    storageError,
    navigate,
    notify,
    confirm,
    update: (next: typeof data, reset = false) => {
      try {
        save(next, reset)
        return true
      } catch (e) {
        notify(e instanceof Error ? e.message : 'Unable to save changes.', true)
        return false
      }
    },
    copy: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        notify('Copied to clipboard')
      } catch {
        notify('Clipboard unavailable. Select and copy the text manually.', true)
      }
    },
  }
  const activeLabel = nav.find((n) => n.id === page)?.label || 'Settings & backup'
  const pages = {
    dashboard: <Dashboard />,
    planner: <Planner />,
    captions: <Captions />,
    leads: <Leads />,
    tasks: <Tasks />,
    settings: <Settings />,
  }
  return (
    <Desk.Provider value={value}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to workspace
      </a>
      <div className="app-shell">
        {mobile && (
          <button
            className="sidebar-overlay"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <aside className={`sidebar ${mobile ? 'is-open' : ''}`}>
          <a href="#dashboard" className="brand" onClick={() => setMobile(false)}>
            <span className="brand-mark">
              j<span>·</span>
            </span>
            <span>
              jessica<span className="brand-light">desk</span>
              <small>A LITTLE SPACE. A LOT OF POSSIBILITIES.</small>
            </span>
          </a>
          <div className="workspace-label">YOUR WORKSPACE</div>
          <nav aria-label="Main navigation">
            {nav.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={page === id ? 'page' : undefined}
                className={`nav-link ${page === id ? 'active' : ''}`}
                onClick={() => setMobile(false)}
              >
                <Icon size={19} strokeWidth={1.7} />
                {label}
                {page === id && <span className="nav-dot" />}
              </a>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="note-spark">✳</span>
            <p>
              Good work starts
              <br />
              with a little clarity.
            </p>
            <span>One thing at a time, Jessica.</span>
          </div>
          <div className="sidebar-bottom">
            <a
              href="#settings"
              onClick={() => setMobile(false)}
              className={`nav-link ${page === 'settings' ? 'active' : ''}`}
            >
              <SettingsIcon size={18} />
              Settings & backup
            </a>
            <div className="profile">
              <div className="avatar">J</div>
              <div>
                <strong>Jessica</strong>
                <small>Marketing & Sales Admin</small>
              </div>
              <span className="online-dot" />
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-btn menu-toggle"
                aria-label="Open navigation"
                aria-expanded={mobile}
                onClick={() => setMobile(!mobile)}
              >
                <Menu size={21} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{activeLabel}</strong>
            </div>
            <div className="topbar-right">
              <span className="local-indicator">
                <span />
                {storageError ? 'Storage needs attention' : 'Stored on this device'}
              </span>
              <span className="top-divider" />
              <span className="company-label">
                PUKKA<span>INDONUSA</span>
              </span>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            {storageError && (
              <div className="alert" role="alert">
                <AlertCircle size={18} />
                <p>{storageError}</p>
                <button className="text-button" onClick={() => navigate('settings')}>
                  Open settings
                </button>
              </div>
            )}
            {pages[page]}
          </main>
          <footer>
            <span>
              Made for your everyday momentum <Heart size={12} />
            </span>
            <span>
              <Monitor size={13} />
              Private workspace · Local storage
            </span>
          </footer>
        </div>
      </div>
      {toast && (
        <div
          className={`toast ${toast.error ? 'toast-error' : ''}`}
          role={toast.error ? 'alert' : 'status'}
        >
          {toast.error ? <AlertCircle size={19} /> : <Check size={19} />}
          <span>{toast.message}</span>
          <button
            className="icon-btn"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {confirmation && (
        <Modal title={confirmation.title} onClose={() => finishConfirm(false)}>
          <p className="confirm-description">{confirmation.description}</p>
          <div className="form-footer">
            <button className="btn btn-secondary" onClick={() => finishConfirm(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={() => finishConfirm(true)}>
              {confirmation.label}
              <ArrowUpRight size={15} />
            </button>
          </div>
        </Modal>
      )}
    </Desk.Provider>
  )
}
