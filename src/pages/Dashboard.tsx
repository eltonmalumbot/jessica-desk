import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  MessageCircle,
  Plus,
  Sparkles,
  Video,
  ArrowRight,
  Leaf,
} from 'lucide-react'
import { useDesk } from '../context'
import { Badge, DemoLabel, Empty } from '../components/ui'
import { formatDate, makeDemo, todayKey } from '../lib/data'
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
      <section className="focus-banner">
        <div className="focus-copy">
          <span className="banner-kicker">A FRESH PERSPECTIVE</span>
          <h2>
            Small steps.
            <br />
            Meaningful momentum.
          </h2>
          <p>
            Your ideas, conversations, and to-dos.
            <br />
            All in one thoughtful space.
          </p>
          <button className="btn btn-dark" onClick={() => navigate('planner')}>
            Plan something good
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun">✳</div>
          <div className="art-card back">
            <div className="art-tiny-label">A LITTLE PROGRESS</div>
            <div className="art-line" />
            <div className="art-line short" />
            <div className="art-progress">
              <span />
            </div>
          </div>
          <div className="art-card front">
            <span className="art-check">
              <Check size={22} />
            </span>
            <div>
              <strong>Make it happen.</strong>
              <span>One good thing at a time.</span>
            </div>
            <span className="art-star">✧</span>
          </div>
          <div className="art-pill">
            <Leaf size={14} />
            room to grow
          </div>
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
      <div className="stats-grid">
        {[
          {
            label: 'Content in the works',
            value: data.contents.filter((c) => c.status !== 'Published').length,
            note: `${published} published`,
            icon: Video,
            tone: 'peach',
            page: 'planner' as const,
          },
          {
            label: 'Today’s tasks',
            value: `${done}/${dayTasks.length}`,
            note: dayTasks.length ? `${dayTasks.length - done} left to go` : 'A fresh start awaits',
            icon: CheckCheck,
            tone: 'sage',
            page: 'tasks' as const,
          },
          {
            label: 'Follow-ups due',
            value: leads.length,
            note: 'Keep the conversation going',
            icon: MessageCircle,
            tone: 'sand',
            page: 'leads' as const,
          },
          {
            label: 'Caption drafts',
            value: data.captions.length,
            note: 'Ideas, ready for words',
            icon: Sparkles,
            tone: 'lavender',
            page: 'captions' as const,
          },
        ].map((s) => (
          <button className="stat-card" key={s.label} onClick={() => navigate(s.page)}>
            <div className="stat-top">
              <span className={`stat-icon ${s.tone}`}>
                <s.icon size={19} strokeWidth={1.6} />
              </span>
              <ArrowUpRight size={16} className="muted" />
            </div>
            <strong className="stat-value">{s.value}</strong>
            <span className="stat-label">{s.label}</span>
            <small>{s.note}</small>
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
