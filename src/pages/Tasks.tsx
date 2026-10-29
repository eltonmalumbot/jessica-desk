import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, CalendarDays } from 'lucide-react'
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
import { useDesk } from '../context'
import { formatDate, priorities, taskSchema, todayKey, uid } from '../lib/data'
import type { Task } from '../lib/data'
export default function Tasks() {
  const { data, update, notify, confirm } = useDesk()
  const [filter, setFilter] = useState('Today'),
    [search, setSearch] = useState(''),
    [editor, setEditor] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const today = todayKey(),
    done = data.tasks.filter((t) => t.completed).length
  const tasks = data.tasks
    .filter(
      (t) =>
        (filter === 'Completed'
          ? t.completed
          : !t.completed && (filter === 'Today' ? t.date <= today : t.date > today)) &&
        t.title.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        priorities.indexOf(b.priority) - priorities.indexOf(a.priority),
    )
  const create = () => {
    setError('')
    setEditor({
      id: uid(),
      demo: false,
      title: '',
      date: today,
      priority: 'Medium',
      completed: false,
    })
  }
  const remove = async (task: Task) => {
    if (await confirm('Delete this task?', `“${task.title}” will be permanently removed.`)) {
      if (update({ ...data, tasks: data.tasks.filter((t) => t.id !== task.id) }))
        notify('Task deleted')
    }
  }
  return (
    <div className="page-enter">
      <PageHeading
        eyebrow="ONE THING AT A TIME"
        title="Daily tasks"
        description="A clear head starts with a clear list."
      >
        <button className="btn btn-primary" onClick={create}>
          <Plus size={17} />
          New task
        </button>
      </PageHeading>
      <div className="progress-card">
        <span className="stat-icon sage">
          <Check size={20} />
        </span>
        <div className="grow">
          <strong>
            {done} of {data.tasks.length} tasks complete
          </strong>
          <p>Every small step counts.</p>
        </div>
        <div className="progress-track">
          <span style={{ width: `${data.tasks.length ? (done / data.tasks.length) * 100 : 0}%` }} />
        </div>
        <strong>{data.tasks.length ? Math.round((done / data.tasks.length) * 100) : 0}%</strong>
      </div>
      <div className="toolbar">
        <div className="tabs" aria-label="Task filters">
          {['Today', 'Upcoming', 'Completed'].map((f) => (
            <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search tasks…" />
      </div>
      <section className="panel task-list">
        {tasks.length ? (
          tasks.map((t) => (
            <div className={`task-row ${t.completed ? 'is-complete' : ''}`} key={t.id}>
              <button
                className={`checkbox ${t.completed ? 'checked' : ''}`}
                aria-label={`${t.completed ? 'Reopen' : 'Complete'} ${t.title}`}
                onClick={() =>
                  update({
                    ...data,
                    tasks: data.tasks.map((x) =>
                      x.id === t.id ? { ...x, completed: !x.completed } : x,
                    ),
                  })
                }
              >
                {t.completed && <Check size={14} />}
              </button>
              <div className="grow">
                <strong>
                  {t.title} <DemoLabel demo={t.demo} />
                </strong>
                <span className={t.date < today && !t.completed ? 'overdue' : ''}>
                  <CalendarDays size={13} />
                  {formatDate(t.date)}
                  {t.date < today && !t.completed ? ' · Overdue' : ''}
                </span>
              </div>
              <Badge>{t.priority}</Badge>
              <button
                className="icon-btn"
                aria-label={`Edit ${t.title}`}
                onClick={() => {
                  setError('')
                  setEditor(t)
                }}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-btn danger-icon"
                aria-label={`Delete ${t.title}`}
                onClick={() => void remove(t)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <Empty
            title={
              search
                ? 'No matching tasks'
                : filter === 'Completed'
                  ? 'Good things take small steps'
                  : 'Your list is looking clear'
            }
            description={
              search ? 'Try a different search.' : 'Add a task and make a little progress.'
            }
            action={create}
            label="Add a task"
          />
        )}
      </section>
      {editor && (
        <Modal
          title={data.tasks.some((t) => t.id === editor.id) ? 'Edit task' : 'A new little to-do'}
          onClose={() => setEditor(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const result = taskSchema.safeParse(editor)
              if (!result.success) {
                setError(result.error.issues[0].message)
                return
              }
              const tasks = data.tasks.some((t) => t.id === editor.id)
                ? data.tasks.map((t) => (t.id === editor.id ? result.data : t))
                : [...data.tasks, result.data]
              if (update({ ...data, tasks })) {
                setEditor(null)
                notify('Task saved')
              }
            }}
          >
            <Field label="Task name">
              <input
                required
                maxLength={160}
                autoFocus
                value={editor.title}
                onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                placeholder="What would you like to get done?"
              />
            </Field>
            <div className="form-grid">
              <Field label="Deadline">
                <input
                  required
                  type="date"
                  value={editor.date}
                  onChange={(e) => setEditor({ ...editor, date: e.target.value })}
                />
              </Field>
              <Field label="Priority">
                <select
                  value={editor.priority}
                  onChange={(e) =>
                    setEditor({ ...editor, priority: e.target.value as Task['priority'] })
                  }
                >
                  {priorities.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <FormFooter onClose={() => setEditor(null)} label="Save task" />
          </form>
        </Modal>
      )}
    </div>
  )
}
