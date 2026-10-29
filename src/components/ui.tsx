import { cloneElement, useEffect, useId, useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { X, Plus, Search, Inbox } from 'lucide-react'
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId()
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect()
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose()
        }
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  const id = useId()
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {cloneElement(children as ReactElement<{ id?: string; 'aria-describedby'?: string }>, {
        id,
        'aria-describedby': hint ? id + '-hint' : undefined,
      })}
      {hint && <small id={id + '-hint'}>{hint}</small>}
    </div>
  )
}
export function Empty({
  title,
  description,
  action,
  label = 'Add your first item',
}: {
  title: string
  description: string
  action?: () => void
  label?: string
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Inbox size={25} strokeWidth={1.4} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="btn btn-secondary" onClick={action}>
          <Plus size={16} />
          {label}
        </button>
      )}
    </div>
  )
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={`badge ${
        tone ||
        String(children)
          .toLowerCase()
          .replace(/[^a-z]+/g, '-')
      }`}
    >
      {children}
    </span>
  )
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  )
}
export function SearchBox({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
export function DemoLabel({ demo }: { demo?: boolean }) {
  return demo ? <span className="demo-tag">DEMO</span> : null
}
export function FormFooter({
  onClose,
  label = 'Save changes',
}: {
  onClose: () => void
  label?: string
}) {
  return (
    <div className="form-footer">
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button type="submit" className="btn btn-primary">
        {label}
      </button>
    </div>
  )
}
