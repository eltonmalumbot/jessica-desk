import { useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Pencil,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { useDesk } from '../context'
import { contentSchema, contentStatuses, pillars, todayKey, uid, formatDate } from '../lib/data'
import type { Content } from '../lib/data'
import {
  Badge,
  DemoLabel,
  Empty,
  Field,
  FormFooter,
  Modal,
  PageHeading,
  SearchBox,
} from '../components/ui'
export default function Planner() {
  const { data, update, notify, confirm } = useDesk()
  const [view, setView] = useState('Calendar'),
    [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [search, setSearch] = useState(''),
    [pillar, setPillar] = useState('All pillars'),
    [status, setStatus] = useState('All statuses')
  const [editor, setEditor] = useState<Content | null>(null),
    [error, setError] = useState('')
  const records = data.contents
    .filter(
      (c) =>
        `${c.title} ${c.product} ${c.notes}`.toLowerCase().includes(search.toLowerCase()) &&
        (pillar === 'All pillars' || c.pillar === pillar) &&
        (status === 'All statuses' || c.status === status),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  const first = new Date(month.getFullYear(), month.getMonth(), 1),
    offset = (first.getDay() + 6) % 7
  const days = Array.from(
    { length: 42 },
    (_, i) => new Date(month.getFullYear(), month.getMonth(), i - offset + 1),
  )
  const create = (date = todayKey()) => {
    setError('')
    setEditor({
      id: uid(),
      demo: false,
      title: '',
      date,
      platform: 'Instagram & Facebook',
      pillar: 'Education',
      status: 'Idea',
      product: '',
      notes: '',
      assets: '',
    })
  }
  const remove = async (record: Content) => {
    if (await confirm('Delete this content?', `“${record.title}” and its notes will be removed.`)) {
      if (update({ ...data, contents: data.contents.filter((c) => c.id !== record.id) })) {
        setEditor(null)
        notify('Content deleted')
      }
    }
  }
  return (
    <div className="page-enter">
      <PageHeading
        eyebrow="IDEAS WITH A LITTLE INTENTION"
        title="Content planner"
        description="Turn your next good idea into a moment of connection."
      >
        <button className="btn btn-primary" onClick={() => create()}>
          <Plus size={17} />
          New content
        </button>
      </PageHeading>
      <div className="planner-tip">
        <CalendarDays size={18} />
        <span>
          Your content rhythm: <strong>Tuesday · Thursday · Friday</strong>
        </span>
        <span className="muted">Plan on any day when you need to.</span>
      </div>
      <div className="toolbar planner-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search content…" />
        <div className="filter-group">
          <select
            aria-label="Filter by content pillar"
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
          >
            <option>All pillars</option>
            {pillars.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            aria-label="Filter by content status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All statuses</option>
            {contentStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="tabs compact">
            {[
              { name: 'Calendar', icon: CalendarDays },
              { name: 'List', icon: LayoutList },
            ].map(({ name, icon: Icon }) => (
              <button
                key={name}
                aria-label={`${name} view`}
                aria-pressed={view === name}
                className={view === name ? 'selected' : ''}
                onClick={() => setView(name)}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {view === 'Calendar' ? (
        <section className="panel calendar-panel">
          <div className="calendar-heading">
            <h2>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
            <div>
              <button
                className="btn btn-secondary btn-small"
                onClick={() =>
                  setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
                }
              >
                Today
              </button>
              <button
                className="icon-btn"
                aria-label="Previous month"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-btn"
                aria-label="Next month"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="calendar-scroll">
            <div className="calendar-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <div
                  key={d}
                  className={`calendar-weekday ${[1, 3, 4].includes(i) ? 'posting-day' : ''}`}
                >
                  {d}
                  {[1, 3, 4].includes(i) && <span />}
                </div>
              ))}
              {days.map((d) => {
                const key = todayKey(d)
                return (
                  <div
                    key={key}
                    className={`calendar-cell ${d.getMonth() !== month.getMonth() ? 'outside-month' : ''} ${key === todayKey() ? 'today-cell' : ''}`}
                  >
                    <button
                      className="calendar-day"
                      aria-label={`Add content on ${formatDate(key, { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      onClick={() => create(key)}
                    >
                      {d.getDate()}
                    </button>
                    {records
                      .filter((c) => c.date === key)
                      .map((c) => (
                        <button
                          key={c.id}
                          className={`calendar-event ${c.pillar.toLowerCase()}`}
                          onClick={() => {
                            setError('')
                            setEditor(c)
                          }}
                        >
                          <span className={`status-dot ${c.status.toLowerCase()}`} />
                          <span>{c.title}</span>
                          {c.demo && <small>DEMO</small>}
                        </button>
                      ))}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="calendar-legend">
            {pillars.map((p) => (
              <span key={p}>
                <i className={p.toLowerCase()} />
                {p}
              </span>
            ))}
          </div>
          {records.length === 0 && (
            <div className="calendar-empty-note">
              {search || pillar !== 'All pillars' || status !== 'All statuses'
                ? 'No content matches your filters.'
                : 'Your ideas belong here. Click a date to start planning.'}
            </div>
          )}
        </section>
      ) : (
        <section className="panel">
          {records.length ? (
            <div className="content-list">
              {records.map((c) => (
                <div className="content-list-row" key={c.id}>
                  <div className="content-list-icon">
                    <Video size={21} />
                  </div>
                  <button
                    className="content-title-button grow"
                    onClick={() => {
                      setError('')
                      setEditor(c)
                    }}
                  >
                    <strong>
                      {c.title} <DemoLabel demo={c.demo} />
                    </strong>
                    <span>
                      {formatDate(c.date)} · {c.platform} · {c.pillar}
                    </span>
                  </button>
                  <Badge>{c.status}</Badge>
                  <button
                    className="icon-btn"
                    aria-label={`Edit ${c.title}`}
                    onClick={() => {
                      setError('')
                      setEditor(c)
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn danger-icon"
                    aria-label={`Delete ${c.title}`}
                    onClick={() => void remove(c)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="A space for your next idea"
              description="Add a content idea or adjust your filters."
              action={() => create()}
              label="Plan content"
            />
          )}
        </section>
      )}
      {editor && (
        <Modal
          title={
            data.contents.some((c) => c.id === editor.id)
              ? 'Edit content'
              : 'Let’s plan something good'
          }
          onClose={() => setEditor(null)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const result = contentSchema.safeParse(editor)
              if (!result.success) {
                setError(result.error.issues[0].message)
                return
              }
              const contents = data.contents.some((c) => c.id === editor.id)
                ? data.contents.map((c) => (c.id === editor.id ? result.data : c))
                : [...data.contents, result.data]
              if (update({ ...data, contents })) {
                setEditor(null)
                notify('Content saved')
              }
            }}
          >
            <Field label="Content title">
              <input
                autoFocus
                required
                maxLength={160}
                placeholder="Give your idea a name"
                value={editor.title}
                onChange={(e) => setEditor({ ...editor, title: e.target.value })}
              />
            </Field>
            <div className="form-grid">
              <Field label="Schedule date">
                <input
                  required
                  type="date"
                  value={editor.date}
                  onChange={(e) => setEditor({ ...editor, date: e.target.value })}
                />
              </Field>
              <Field label="Platform">
                <select
                  value={editor.platform}
                  onChange={(e) =>
                    setEditor({ ...editor, platform: e.target.value as Content['platform'] })
                  }
                >
                  {['Instagram & Facebook', 'Instagram', 'Facebook'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Content pillar">
                <select
                  value={editor.pillar}
                  onChange={(e) =>
                    setEditor({ ...editor, pillar: e.target.value as Content['pillar'] })
                  }
                >
                  {pillars.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={editor.status}
                  onChange={(e) =>
                    setEditor({ ...editor, status: e.target.value as Content['status'] })
                  }
                >
                  {contentStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Product">
              <input
                maxLength={120}
                placeholder="e.g. Harmony Spreader"
                value={editor.product}
                onChange={(e) => setEditor({ ...editor, product: e.target.value })}
              />
            </Field>
            <Field label="Notes & content angle">
              <textarea
                rows={3}
                maxLength={5000}
                placeholder="What’s the story? What should your audience take away?"
                value={editor.notes}
                onChange={(e) => setEditor({ ...editor, notes: e.target.value })}
              />
            </Field>
            <Field label="Video & asset requirements">
              <textarea
                rows={2}
                maxLength={3000}
                placeholder="Machine close-ups, installation footage, cover image…"
                value={editor.assets}
                onChange={(e) => setEditor({ ...editor, assets: e.target.value })}
              />
            </Field>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="editor-bottom">
              {data.contents.some((c) => c.id === editor.id) && (
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={() => void remove(editor)}
                >
                  <Trash2 size={15} />
                  Delete content
                </button>
              )}
              <FormFooter onClose={() => setEditor(null)} label="Save content" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
