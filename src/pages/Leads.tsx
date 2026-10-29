import { useState } from 'react'
import {
  Building2,
  Copy,
  ExternalLink,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  CalendarDays,
} from 'lucide-react'
import { useDesk } from '../context'
import {
  leadMessage,
  leadSchema,
  stages,
  todayKey,
  uid,
  whatsappUrl,
  formatDate,
} from '../lib/data'
import type { Lead } from '../lib/data'
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
export default function Leads() {
  const { data, update, notify, confirm, copy } = useDesk()
  const [search, setSearch] = useState(''),
    [stage, setStage] = useState('All stages'),
    [dueOnly, setDueOnly] = useState(false),
    [editor, setEditor] = useState<Lead | null>(null),
    [error, setError] = useState('')
  const leads = data.leads
    .filter(
      (l) =>
        `${l.name} ${l.company} ${l.product}`.toLowerCase().includes(search.toLowerCase()) &&
        (stage === 'All stages' || l.stage === stage) &&
        (!dueOnly || (l.stage !== 'Completed' && l.followUp && l.followUp <= todayKey())),
    )
    .sort((a, b) => (a.followUp || '9999').localeCompare(b.followUp || '9999'))
  const create = () => {
    setError('')
    setEditor({
      id: uid(),
      demo: false,
      name: '',
      company: '',
      product: '',
      stage: 'New Lead',
      phone: '',
      followUp: '',
      message: '',
    })
  }
  const open = (lead: Lead) => {
    setError('')
    setEditor(lead)
  }
  const remove = async (lead: Lead) => {
    if (
      await confirm(
        'Delete this lead?',
        `The record and message for ${lead.name} will be permanently removed.`,
      )
    ) {
      if (update({ ...data, leads: data.leads.filter((l) => l.id !== lead.id) })) {
        setEditor(null)
        notify('Lead deleted')
      }
    }
  }
  const openWhatsApp = (lead: Lead) => {
    try {
      window.open(
        whatsappUrl(lead.phone, lead.message || leadMessage(lead)),
        '_blank',
        'noopener,noreferrer',
      )
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Check the phone number.', true)
    }
  }
  return (
    <div className="page-enter">
      <PageHeading
        eyebrow="GOOD CONVERSATIONS START HERE"
        title="WhatsApp lead helper"
        description="A personal touch for every follow-up."
      >
        <button className="btn btn-primary" onClick={create}>
          <Plus size={17} />
          New lead
        </button>
      </PageHeading>
      <div className="info-strip">
        <MessageCircle size={18} />
        <span>
          A manual workspace for your conversations. Messages open in WhatsApp for you to review and
          send. No Meta or WhatsApp API connection.
        </span>
      </div>
      <div className="lead-stage-summary">
        {stages.map((s) => (
          <button
            key={s}
            className={stage === s ? 'active-stage' : ''}
            onClick={() => setStage(stage === s ? 'All stages' : s)}
          >
            <span>{s}</span>
            <strong>{data.leads.filter((l) => l.stage === s).length}</strong>
          </button>
        ))}
      </div>
      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search leads…" />
        <div className="filter-group">
          <label className="filter-check">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(e) => setDueOnly(e.target.checked)}
            />
            Follow-ups due
          </label>
          <select
            aria-label="Filter by lead stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option>All stages</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {leads.length ? (
        <div className="lead-grid">
          {leads.map((l) => (
            <section className="panel lead-card" key={l.id}>
              <div className="lead-card-top">
                <div className="lead-avatar">{l.name.slice(0, 1).toUpperCase()}</div>
                <Badge>{l.stage}</Badge>
                <button className="icon-btn" aria-label={`Edit ${l.name}`} onClick={() => open(l)}>
                  <Pencil size={16} />
                </button>
              </div>
              <h2>
                {l.name} <DemoLabel demo={l.demo} />
              </h2>
              <p className="lead-company">
                <Building2 size={14} />
                {l.company || 'No company added'}
              </p>
              <div className="lead-product">
                <span>PRODUCT INTEREST</span>
                <strong>{l.product}</strong>
              </div>
              <div
                className={`lead-followup ${l.followUp && l.followUp <= todayKey() && l.stage !== 'Completed' ? 'overdue' : ''}`}
              >
                <CalendarDays size={14} />
                {l.followUp ? `Follow-up ${formatDate(l.followUp)}` : 'No follow-up scheduled'}
                {l.stage === 'Completed' && ' · Completed'}
              </div>
              <div className="lead-actions">
                <button className="btn btn-secondary btn-small" onClick={() => open(l)}>
                  <MessageCircle size={15} />
                  Prepare message
                </button>
                <button
                  className="icon-btn danger-icon"
                  aria-label={`Delete ${l.name}`}
                  onClick={() => void remove(l)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title={data.leads.length ? 'No leads match your filters' : 'Start with a conversation'}
            description="Keep customer details and thoughtful follow-ups together."
            action={create}
            label="Add a lead"
          />
        </section>
      )}
      {editor && (
        <Modal
          title={
            data.leads.some((l) => l.id === editor.id)
              ? 'Lead details & message'
              : 'A new connection'
          }
          onClose={() => setEditor(null)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const result = leadSchema.safeParse(editor)
              if (!result.success) {
                setError(result.error.issues[0].message)
                return
              }
              const leads = data.leads.some((l) => l.id === editor.id)
                ? data.leads.map((l) => (l.id === editor.id ? result.data : l))
                : [...data.leads, result.data]
              if (update({ ...data, leads })) {
                setEditor(null)
                notify('Lead saved')
              }
            }}
          >
            <div className="form-grid">
              <Field label="Customer name">
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={editor.name}
                  onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                />
              </Field>
              <Field label="Company">
                <input
                  maxLength={150}
                  value={editor.company}
                  onChange={(e) => setEditor({ ...editor, company: e.target.value })}
                />
              </Field>
              <Field label="Product interest">
                <input
                  required
                  maxLength={120}
                  placeholder="e.g. Autocutter"
                  value={editor.product}
                  onChange={(e) => setEditor({ ...editor, product: e.target.value })}
                />
              </Field>
              <Field label="Follow-up stage">
                <select
                  value={editor.stage}
                  onChange={(e) => setEditor({ ...editor, stage: e.target.value as Lead['stage'] })}
                >
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Phone number (optional)"
                hint="Include country code, e.g. +62…; 08… becomes 628…."
              >
                <input
                  type="tel"
                  maxLength={30}
                  value={editor.phone}
                  onChange={(e) => setEditor({ ...editor, phone: e.target.value })}
                  placeholder="Required only to open WhatsApp"
                />
              </Field>
              <Field label="Next follow-up (optional)">
                <input
                  type="date"
                  value={editor.followUp}
                  onChange={(e) => setEditor({ ...editor, followUp: e.target.value })}
                />
              </Field>
            </div>
            <div className="message-template-head">
              <strong>Message draft · Bahasa Indonesia</strong>
              <button
                type="button"
                className="text-button"
                onClick={async () => {
                  if (
                    editor.message &&
                    !(await confirm(
                      'Replace message edits?',
                      'Your current message will be replaced with the template for this lead and stage.',
                      'Use template',
                    ))
                  )
                    return
                  setEditor({ ...editor, message: leadMessage(editor) })
                }}
              >
                <RefreshCw size={13} />
                Use stage template
              </button>
            </div>
            <textarea
              className="message-textarea"
              aria-label="WhatsApp message draft"
              rows={8}
              maxLength={5000}
              value={editor.message || leadMessage(editor)}
              onChange={(e) => setEditor({ ...editor, message: e.target.value })}
            />
            <div className="message-buttons">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => void copy(editor.message || leadMessage(editor))}
              >
                <Copy size={14} />
                Copy message
              </button>
              <button
                type="button"
                className="btn btn-whatsapp btn-small"
                onClick={() => openWhatsApp(editor)}
              >
                <ExternalLink size={14} />
                Open WhatsApp
              </button>
            </div>
            <p className="helper-note">
              You review and send the message yourself. Opening WhatsApp does not save the lead or
              mark a follow-up complete.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <FormFooter onClose={() => setEditor(null)} label="Save lead" />
          </form>
        </Modal>
      )}
    </div>
  )
}
