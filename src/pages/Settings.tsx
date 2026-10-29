import { useRef } from 'react'
import {
  Download,
  Upload,
  ShieldCheck,
  HardDrive,
  FlaskConical,
  Trash2,
  ArrowUpRight,
} from 'lucide-react'
import { useDesk } from '../context'
import { emptyWorkspace, makeDemo, parseBackup, STORAGE_KEY, todayKey } from '../lib/data'
import { PageHeading } from '../components/ui'
function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export default function Settings() {
  const { data, update, notify, confirm, storageError } = useDesk(),
    input = useRef<HTMLInputElement>(null)
  const total = data.contents.length + data.tasks.length + data.leads.length + data.captions.length
  const demoCount = [...data.contents, ...data.tasks, ...data.leads, ...data.captions].filter(
    (r) => r.demo,
  ).length
  return (
    <div className="page-enter settings-page">
      <PageHeading
        eyebrow="A LITTLE HOUSEKEEPING"
        title="Settings & backup"
        description="Keep your workspace safe, simple, and yours."
      />
      <section className="privacy-card">
        <span className="stat-icon sage">
          <ShieldCheck size={23} />
        </span>
        <div>
          <h2>Your work stays on this device.</h2>
          <p>
            No accounts, servers, or background syncing. Your records are saved in this browser’s
            local storage. Clearing browser data, changing browsers, or using private mode can erase
            or separate your workspace.
          </p>
        </div>
      </section>
      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="settings-icon">
            <HardDrive size={22} />
          </div>
          <h2>A backup is a little peace of mind.</h2>
          <p>
            Export regularly, especially before switching devices or clearing browser data. Backups
            include all content, tasks, leads, and saved caption drafts.
          </p>
          <div className="backup-summary">
            {total} records <span>Version 1 · JSON format</span>
          </div>
          <div className="settings-actions">
            <button
              className="btn btn-primary"
              disabled={!!storageError}
              onClick={() => {
                download(`jessica-desk-${todayKey()}.json`, JSON.stringify(data, null, 2))
                notify('Backup download started')
              }}
            >
              <Download size={16} />
              Export backup
            </button>
            <button className="btn btn-secondary" onClick={() => input.current?.click()}>
              <Upload size={16} />
              Import backup
            </button>
          </div>
          <input
            ref={input}
            hidden
            aria-label="Import JSON backup"
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              try {
                if (file.size > 2 * 1024 * 1024)
                  throw new Error('Backup must be smaller than 2 MB.')
                const imported = parseBackup(await file.text())
                const count =
                  imported.contents.length +
                  imported.tasks.length +
                  imported.leads.length +
                  imported.captions.length
                if (
                  await confirm(
                    'Replace workspace with this backup?',
                    `This valid backup contains ${count} records (${imported.contents.length} content, ${imported.tasks.length} tasks, ${imported.leads.length} leads, ${imported.captions.length} captions). Import replaces all current records. Export your current workspace first if you want to keep it.`,
                    'Replace workspace',
                  )
                ) {
                  if (update(imported, true)) notify('Backup imported successfully')
                }
              } catch (error) {
                notify(error instanceof Error ? error.message : 'Unable to read backup.', true)
              }
            }}
          />
          <p className="helper-note">
            Import replaces, rather than merges, your workspace. Only version 1 Jessica Desk backups
            up to 2 MB and 1,000 records per section are accepted.
          </p>
          <div className="security-note">
            <ShieldCheck size={16} />
            <span>
              Backup files are plain text, not encrypted. They may contain customer details. Store
              them securely and never commit them to Git.
            </span>
          </div>
        </section>
        <div className="settings-stack">
          <section className="panel settings-card">
            <div className="settings-icon peach">
              <FlaskConical size={21} />
            </div>
            <h2>A safe place to explore</h2>
            <p>
              Try fictional records without adding real customer information. Demo leads have no
              phone numbers.
            </p>
            <div className="settings-actions">
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  if (demoCount) {
                    notify(
                      'Demo records are already present. Remove them before adding a fresh set.',
                    )
                    return
                  }
                  const demo = makeDemo()
                  if (
                    update({
                      ...data,
                      contents: [...data.contents, ...demo.contents],
                      tasks: [...data.tasks, ...demo.tasks],
                      leads: [...data.leads, ...demo.leads],
                    })
                  )
                    notify('Fictional demo records added')
                }}
              >
                Add demo records
                <ArrowUpRight size={14} />
              </button>
              {demoCount > 0 && (
                <button
                  className="text-button danger-text"
                  onClick={async () => {
                    if (
                      await confirm(
                        'Remove demo records?',
                        `Remove ${demoCount} labeled demo records? Your other work will stay.`,
                        'Remove demos',
                      )
                    ) {
                      if (
                        update({
                          ...data,
                          contents: data.contents.filter((r) => !r.demo),
                          tasks: data.tasks.filter((r) => !r.demo),
                          leads: data.leads.filter((r) => !r.demo),
                          captions: data.captions.filter((r) => !r.demo),
                        })
                      )
                        notify('Demo records removed')
                    }
                  }}
                >
                  Remove demos
                </button>
              )}
            </div>
          </section>
          <section className="panel settings-card danger-zone">
            <h2>Start fresh</h2>
            <p>
              Clear all records from this browser. Export a backup first — this cannot be undone
              without one.
            </p>
            {storageError && (
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  try {
                    download(
                      `jessica-desk-recovery-${todayKey()}.txt`,
                      localStorage.getItem(STORAGE_KEY) || '',
                      'text/plain',
                    )
                    notify('Original stored data download started')
                  } catch {
                    notify('Browser storage cannot be accessed.', true)
                  }
                }}
              >
                <Download size={14} />
                Download original stored data
              </button>
            )}
            <button
              className="text-button danger-text"
              onClick={async () => {
                if (
                  await confirm(
                    'Clear your entire workspace?',
                    'All content, tasks, leads, and saved captions will be permanently removed from this browser. Download a backup first.',
                    'Clear all data',
                  )
                ) {
                  if (update(emptyWorkspace(), true)) notify('Workspace cleared')
                }
              }}
            >
              <Trash2 size={15} />
              Clear all workspace data
            </button>
          </section>
        </div>
      </div>
      <div className="about-line">
        <span className="brand-mark small">
          j<span>·</span>
        </span>
        <span>
          Jessica Desk <strong>1.0</strong>
          <small>A thoughtful daily workspace for Pukka Indonusa.</small>
        </span>
      </div>
    </div>
  )
}
