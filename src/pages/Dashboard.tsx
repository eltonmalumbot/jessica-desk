import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MessageCircle,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useDesk } from '../context'
import { Badge, DemoLabel, Empty } from '../components/ui'
import { formatDate, makeDemo, shiftDate, todayKey } from '../lib/data'
export default function Dashboard() {
  const { data, update, navigate, notify } = useDesk(),
    today = todayKey()
  const tasks = data.tasks
    .filter((t) => t.date <= today && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
  const dayTasks = data.tasks.filter((t) => t.date === today),
    done = dayTasks.filter((t) => t.completed).length
  const content = data.contents
    .filter((c) => c.date >= today && c.status !== 'Published')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
  const leads = data.leads.filter(
    (l) => l.stage !== 'Completed' && l.followUp && l.followUp <= today,
  )
  const isEmpty =
    !data.contents.length && !data.tasks.length && !data.leads.length && !data.captions.length
  const published = data.contents.filter((c) => c.status === 'Published').length
  const demo = [...data.contents, ...data.tasks, ...data.leads].some((r) => r.demo)
  const publishingRhythm = [
    { label: 'Tuesday', day: 2 },
    { label: 'Thursday', day: 4 },
    { label: 'Friday', day: 5 },
  ].map(({ label, day }) => {
    const date = shiftDate((day - new Date().getDay() + 7) % 7)
    const planned = data.contents.filter((item) => item.date === date).length
    return { label, date, planned }
  })
  return (
    <div className="dashboard page-enter">
      <div className="welcome-heading">
        <div>
          <div className="eyebrow">
            <span className="small-red-line" />
            YOUR DAY, A LITTLE MORE ORGANIZED
          </div>
          <h1>
            Hello, Jessica! <span className="greeting-flower">✳</span>
          </h1>
          <p>Let’s make room for good work today.</p>
        </div>
        <div className="date-chip">
          <CalendarDays size={17} />
          <span>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>
      </div>
      <section className="focus-banner taste-focus" aria-label="Today's priorities">
        <div className="focus-copy">
          <span className="banner-kicker">THE WORK THAT MATTERS NOW</span>
          <h2>
            {leads.length
              ? 'Pick up the conversation.'
              : tasks.length
                ? 'Move the work forward.'
                : 'Plan your next content day.'}
          </h2>
          <p>
            {leads.length
              ? `${leads.length} follow-up${leads.length === 1 ? '' : 's'} due. Start with ${leads[0].name}.`
              : tasks.length
                ? `${tasks.length} unfinished task${tasks.length === 1 ? '' : 's'} need attention.`
                : 'Keep your Tuesday, Thursday, Friday posting rhythm in view.'}
          </p>
          <button
            className="btn btn-dark"
            onClick={() => navigate(leads.length ? 'leads' : tasks.length ? 'tasks' : 'planner')}
          >
            {leads.length ? 'Review follow-ups' : tasks.length ? 'Open daily tasks' : 'Open content planner'}
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="taste-cadence">
          <div className="taste-cadence-heading">
            <span>UPCOMING CONTENT DAYS</span>
            <strong>3 / WEEK</strong>
          </div>
          <div className="taste-cadence-days">
            {publishingRhythm.map(({ label, date, planned }) => (
              <div className="taste-cadence-day" key={label}>
                <span className="taste-day-name">{label}</span>
                <strong>{formatDate(date, { month: 'short', day: 'numeric' })}</strong>
                <small>{planned ? `${planned} planned` : 'Nothing scheduled'}</small>
              </div>
            ))}
          </div>
          <span className="taste-cadence-footer">
            Dates and counts reflect your saved content planner.
          </span>
        </div>
      </section>
      {isEmpty && (
        <div className="demo-prompt">
          <div>
            <Sparkles size={18} />
            <span>
              <strong>A clean slate, just for you.</strong> Start adding your work, or explore with
              fictional examples.
            </span>
          </div>
          <button
            className="text-button"
            onClick={() => {
              if (update(makeDemo()))
                notify('Fictional demo records added. Remove them anytime in Settings.')
            }}
          >
            Explore demo
            <ArrowRight size={15} />
          </button>
        </div>
      )}
      {demo && (
        <div className="demo-notice">
          You’re viewing some fictional demo records. They’re labeled DEMO and can be removed in
          Settings.
        </div>
      )}
      <div className="stats-grid" aria-label="Workspace overview">
        {[
          {
            label: 'Content in progress',
            value: data.contents.filter((item) => item.status !== 'Published').length,
            note: `${published} published`,
            page: 'planner' as const,
          },
          {
            label: 'Today’s tasks',
            value: `${done}/${dayTasks.length}`,
            note: dayTasks.length ? `${dayTasks.length - done} remaining` : 'No tasks scheduled today',
            page: 'tasks' as const,
          },
          {
            label: 'Follow-ups due',
            value: leads.length,
            note: leads.length ? 'Open conversation queue' : 'Nothing due right now',
            page: 'leads' as const,
          },
          {
            label: 'Caption drafts',
            value: data.captions.length,
            note: 'Saved bilingual drafts',
            page: 'captions' as const,
          },
        ].map((stat) => (
          <button
            className={`stat-card ${stat.page === 'leads' && leads.length ? 'taste-needs-attention' : ''}`}
            key={stat.label}
            onClick={() => navigate(stat.page)}
          >
            <div className="stat-top">
              <span className="stat-label">{stat.label}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </div>
            <strong className="stat-value">{stat.value}</strong>
            <small>{stat.note}</small>
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel today-panel">
          <div className="panel-heading">
            <div>
              <h2>
                Your focus today <span className="count-pill">{tasks.length}</span>
              </h2>
              <p>A little structure for a productive day.</p>
            </div>
            <button className="text-button" onClick={() => navigate('tasks')}>
              View all
              <ChevronRight size={14} />
            </button>
          </div>
          {tasks.length ? (
            <div className="task-preview">
              {tasks.slice(0, 4).map((t) => (
                <div className="task-preview-row" key={t.id}>
                  <button
                    className="checkbox"
                    aria-label={`Complete ${t.title}`}
                    onClick={() =>
                      update({
                        ...data,
                        tasks: data.tasks.map((x) =>
                          x.id === t.id ? { ...x, completed: true } : x,
                        ),
                      })
                    }
                  />
                  <div className="grow">
                    <strong>{t.title}</strong>
                    <span>
                      {t.date < today ? (
                        <span className="overdue">Overdue · {formatDate(t.date)}</span>
                      ) : (
                        'Today'
                      )}{' '}
                      <DemoLabel demo={t.demo} />
                    </span>
                  </div>
                  <Badge>{t.priority}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="A little breathing room"
              description="Add a task to give your day a clear next step."
              action={() => navigate('tasks')}
              label="Plan a task"
            />
          )}
          <button className="panel-add" onClick={() => navigate('tasks')}>
            <Plus size={16} />
            Add a task
          </button>
        </section>
        <section className="panel upcoming-panel">
          <div className="panel-heading">
            <div>
              <h2>Coming up in content</h2>
              <p>Your next moments to connect.</p>
            </div>
            <CalendarDays size={19} className="muted" />
          </div>
          {content.length ? (
            <div className="content-preview">
              {content.map((c) => (
                <button
                  className="content-preview-row"
                  key={c.id}
                  onClick={() => navigate('planner')}
                >
                  <div className="date-tile">
                    <small>{formatDate(c.date, { month: 'short' })}</small>
                    <strong>{formatDate(c.date, { day: 'numeric' })}</strong>
                  </div>
                  <div className="grow">
                    <strong>{c.title}</strong>
                    <span>
                      {c.pillar} <DemoLabel demo={c.demo} />
                    </span>
                  </div>
                  <span className={`status-dot ${c.status.toLowerCase()}`} title={c.status} />
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          ) : (
            <Empty
              title="Your next idea belongs here"
              description="Make a plan for Tuesday, Thursday, or Friday."
            />
          )}
          <button className="panel-add" onClick={() => navigate('planner')}>
            Open content planner
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>
      <div className="bottom-grid">
        <section className="quick-card">
          <div className="section-label">MAKE A LITTLE PROGRESS</div>
          <h2>What’s on your mind?</h2>
          <div className="quick-actions">
            <button onClick={() => navigate('captions')}>
              <span className="quick-icon peach">
                <Sparkles size={19} />
              </span>
              <span>
                Write a caption<small>Find the right words</small>
              </span>
              <ArrowUpRight size={16} />
            </button>
            <button onClick={() => navigate('leads')}>
              <span className="quick-icon sage">
                <MessageCircle size={19} />
              </span>
              <span>
                Follow up a lead<small>Build a connection</small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
        <section className="reminder-card">
          <div className="reminder-top">
            <Clock3 size={18} />
            <span>A FRIENDLY REMINDER</span>
          </div>
          <h3>
            {leads.length
              ? `${leads.length} conversation${leads.length > 1 ? 's' : ''} to pick up.`
              : 'Great relationships take a little care.'}
          </h3>
          <p>
            {leads.length
              ? `${leads[0].name} is due for a follow-up. A thoughtful message goes a long way.`
              : 'Keep your leads close, and your follow-ups a little closer.'}
          </p>
          <button className="text-button" onClick={() => navigate('leads')}>
            Visit lead helper
            <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
    </div>
  )
}
