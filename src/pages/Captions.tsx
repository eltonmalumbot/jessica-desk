import { useState } from 'react'
import { Copy, FileText, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { useDesk } from '../context'
import { captionSchema, defaultCTA, generateCaption, templateKinds, uid } from '../lib/data'
import type { Caption } from '../lib/data'
import { Badge, Empty, Field, PageHeading } from '../components/ui'
const fresh = (): Caption => ({
  id: uid(),
  demo: false,
  product: '',
  angle: '',
  benefits: '',
  cta: defaultCTA,
  kind: 'Product education',
  idText: '',
  enText: '',
})
export default function Captions() {
  const { data, update, notify, copy, confirm } = useDesk()
  const [draft, setDraft] = useState<Caption>(fresh),
    [error, setError] = useState(''),
    [dirty, setDirty] = useState(false)
  const patch = (value: Partial<Caption>) => {
    setDraft({ ...draft, ...value })
    setDirty(true)
  }
  const switchDraft = async (next: Caption) => {
    if (
      dirty &&
      !(await confirm(
        'Leave this unsaved draft?',
        'Your unsaved caption changes will be lost.',
        'Continue',
      ))
    )
      return
    setDraft(next)
    setDirty(false)
    setError('')
  }
  const save = () => {
    const result = captionSchema.safeParse(draft)
    if (!result.success) {
      setError('Add a product and CTA, and keep your text within the field limits.')
      return
    }
    if (!draft.idText.trim() && !draft.enText.trim()) {
      setError('Generate or write a caption before saving.')
      return
    }
    const captions = data.captions.some((c) => c.id === draft.id)
      ? data.captions.map((c) => (c.id === draft.id ? result.data : c))
      : [...data.captions, result.data]
    if (update({ ...data, captions })) {
      setDirty(false)
      setError('')
      notify('Caption draft saved')
    }
  }
  return (
    <div className="page-enter">
      <PageHeading
        eyebrow="THE RIGHT WORDS, IN TWO LANGUAGES"
        title="Caption studio"
        description="A thoughtful starting point for your next post."
      >
        <button className="btn btn-secondary" onClick={() => void switchDraft(fresh())}>
          <Plus size={17} />
          New draft
        </button>
      </PageHeading>
      <div className="studio-layout">
        <section className="panel studio-input">
          <div className="panel-heading">
            <div>
              <h2>A little direction</h2>
              <p>Tell your template what you have in mind.</p>
            </div>
            <Sparkles size={20} className="red-text" />
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!draft.product.trim()) {
                setError('Add a product to get started.')
                return
              }
              if (
                (draft.idText || draft.enText) &&
                !(await confirm(
                  'Replace caption text?',
                  'Generating again will replace both caption texts, including your edits.',
                  'Generate',
                ))
              )
                return
              patch(generateCaption(draft))
              setError('')
              notify('Template drafts generated — ready for your edits')
            }}
          >
            <Field label="Template">
              <select
                value={draft.kind}
                onChange={(e) => patch({ kind: e.target.value as Caption['kind'] })}
              >
                {templateKinds.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Product">
              <input
                required
                maxLength={120}
                placeholder="e.g. Harmony Spreader"
                value={draft.product}
                onChange={(e) => patch({ product: e.target.value })}
              />
            </Field>
            <Field label="Content angle">
              <input
                maxLength={300}
                placeholder="What makes this story worth sharing?"
                value={draft.angle}
                onChange={(e) => patch({ angle: e.target.value })}
              />
            </Field>
            <Field label="Key benefits">
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="One benefit per line works nicely"
                value={draft.benefits}
                onChange={(e) => patch({ benefits: e.target.value })}
              />
            </Field>
            <Field label="Call to action">
              <textarea
                required
                rows={2}
                maxLength={300}
                value={draft.cta}
                onChange={(e) => patch({ cta: e.target.value })}
              />
            </Field>
            <button className="btn btn-primary full-width" type="submit">
              <Sparkles size={17} />
              Generate template drafts
            </button>
            <p className="helper-note">
              Local templates, no AI. Shared inputs appear as entered in both drafts. Edit each
              language for natural phrasing and verify product claims.
            </p>
          </form>
        </section>
        <div className="studio-output">
          <div className="output-top">
            <span>
              <span className={`status-dot ${dirty ? 'editing' : 'ready'}`} />
              {dirty
                ? 'Unsaved changes'
                : data.captions.some((c) => c.id === draft.id)
                  ? 'Saved draft'
                  : 'Your writing space'}
            </span>
            <button className="btn btn-primary btn-small" onClick={save}>
              <Save size={15} />
              Save draft
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {[
            {
              key: 'idText' as const,
              label: 'Bahasa Indonesia',
              code: 'ID',
              placeholder: 'Your Indonesian draft will appear here. You can also start writing.',
            },
            {
              key: 'enText' as const,
              label: 'English',
              code: 'EN',
              placeholder: 'Your English draft will appear here. Make it sound like you.',
            },
          ].map((lang) => (
            <section key={lang.key} className="panel caption-output">
              <div className="caption-heading">
                <h2>
                  <span className="language-code">{lang.code}</span>
                  {lang.label}
                </h2>
                <button
                  className="text-button"
                  disabled={!draft[lang.key]}
                  onClick={() => void copy(draft[lang.key])}
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <textarea
                aria-label={`${lang.label} caption`}
                maxLength={8000}
                value={draft[lang.key]}
                onChange={(e) => patch({ [lang.key]: e.target.value })}
                placeholder={lang.placeholder}
              />
              <div className="caption-bottom">
                Editable draft<span>{draft[lang.key].length.toLocaleString()} characters</span>
              </div>
            </section>
          ))}
          <button
            className="btn btn-secondary full-width"
            disabled={!draft.idText && !draft.enText}
            onClick={() =>
              void copy(`BAHASA INDONESIA\n${draft.idText}\n\nENGLISH\n${draft.enText}`)
            }
          >
            <Copy size={16} />
            Copy both languages
          </button>
        </div>
      </div>
      <section className="panel saved-drafts">
        <div className="panel-heading">
          <div>
            <h2>
              Your saved drafts <span className="count-pill">{data.captions.length}</span>
            </h2>
            <p>A few good words, kept for later.</p>
          </div>
          <FileText size={19} className="muted" />
        </div>
        {data.captions.length ? (
          <div className="draft-grid">
            {data.captions.map((c) => (
              <div className={`draft-card ${c.id === draft.id ? 'active-draft' : ''}`} key={c.id}>
                <button className="draft-open" onClick={() => void switchDraft(c)}>
                  <Badge>{c.kind}</Badge>
                  <h3>{c.product}</h3>
                  <p>{c.idText || c.enText}</p>
                  <span>Edit draft →</span>
                </button>
                <button
                  className="icon-btn danger-icon"
                  aria-label={`Delete ${c.product} caption`}
                  onClick={async () => {
                    if (
                      await confirm(
                        'Delete this caption draft?',
                        `The saved draft for ${c.product} will be removed.`,
                      )
                    ) {
                      if (
                        update({ ...data, captions: data.captions.filter((x) => x.id !== c.id) })
                      ) {
                        if (draft.id === c.id) {
                          setDraft(fresh())
                          setDirty(false)
                        }
                        notify('Draft deleted')
                      }
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Keep your good words close"
            description="Save a draft and come back to it whenever you’re ready."
          />
        )}
      </section>
    </div>
  )
}
