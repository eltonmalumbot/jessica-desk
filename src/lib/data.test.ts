import { describe, expect, it } from 'vitest'
import {
  cleanText,
  contentSchema,
  defaultCTA,
  emptyWorkspace,
  generateCaption,
  leadMessage,
  makeDemo,
  normalizePhone,
  parseBackup,
  serializeWorkspace,
  shiftDate,
  templateKinds,
  todayKey,
  validPhone,
  whatsappUrl,
  workspaceSchema,
} from './data'

describe('backup boundary', () => {
  it('round-trips complete workspace data without losing user text', () => {
    const data = makeDemo()
    data.contents[0].notes = 'Line 1\nLine 2: <test> & quotation'
    expect(parseBackup(JSON.stringify(data))).toEqual(data)
  })
  it('rejects malformed JSON, unsupported versions, and unexpected fields', () => {
    expect(() => parseBackup('{')).toThrow('not valid JSON')
    expect(() => parseBackup(JSON.stringify({ ...emptyWorkspace(), version: 2 }))).toThrow(
      'Invalid Jessica',
    )
    expect(() => parseBackup(JSON.stringify({ ...emptyWorkspace(), secrets: 'injected' }))).toThrow(
      'Invalid Jessica',
    )
    expect(() =>
      parseBackup(JSON.stringify({ ...emptyWorkspace(), tasks: [{ title: 'Incomplete' }] })),
    ).toThrow('Invalid Jessica')
  })
  it('rejects oversize backups before parsing', () =>
    expect(() => parseBackup('a'.repeat(2 * 1024 * 1024 + 1))).toThrow('2 MB'))
  it('prevents saving a workspace that cannot be loaded or exported', () => {
    const data = makeDemo()
    data.contents = Array.from({ length: 500 }, () => ({
      ...data.contents[0],
      id: crypto.randomUUID(),
      notes: 'a'.repeat(5000),
    }))
    expect(() => serializeWorkspace(data)).toThrow('2 MB')
  })
  it('rejects duplicate IDs even across sections', () => {
    const data = makeDemo()
    data.tasks[0].id = data.contents[0].id
    expect(workspaceSchema.safeParse(data).success).toBe(false)
  })
  it('rejects impossible dates and invalid enum values', () => {
    const record = makeDemo().contents[0]
    for (const date of ['2026-02-30', '2026-13-01', 'tomorrow', '2026-1-01'])
      expect(contentSchema.safeParse({ ...record, date }).success).toBe(false)
    expect(contentSchema.safeParse({ ...record, date: '2028-02-29' }).success).toBe(true)
    expect(contentSchema.safeParse({ ...record, status: 'Scheduled' }).success).toBe(false)
  })
  it('rejects blank names, excessive text, and too many records', () => {
    const data = makeDemo()
    expect(contentSchema.safeParse({ ...data.contents[0], title: '  ' }).success).toBe(false)
    expect(contentSchema.safeParse({ ...data.contents[0], notes: 'a'.repeat(5001) }).success).toBe(
      false,
    )
    data.tasks = Array.from({ length: 1001 }, () => ({ ...data.tasks[0], id: crypto.randomUUID() }))
    expect(workspaceSchema.safeParse(data).success).toBe(false)
  })
  it('normalizes whitespace and removes control characters while preserving line breaks', () =>
    expect(cleanText('  Hello\u0000\nJessica\t ')).toBe('Hello\nJessica'))
  it('seeds only labeled fictional records with no customer phone numbers', () => {
    const data = makeDemo()
    expect([...data.contents, ...data.tasks, ...data.leads].every((r) => r.demo)).toBe(true)
    expect(data.leads.every((l) => l.phone === '')).toBe(true)
    expect(workspaceSchema.safeParse(data).success).toBe(true)
  })
})
describe('WhatsApp links and templates', () => {
  it('normalizes local Indonesian numbers and accepts international format', () => {
    expect(normalizePhone('0812 3456 7890')).toBe('6281234567890')
    expect(normalizePhone('+62 (812) 3456-7890')).toBe('6281234567890')
    expect(validPhone('+62 (812) 3456-7890')).toBe(true)
  })
  it('rejects missing, malformed, too short, and too long numbers', () => {
    for (const phone of ['', 'abc08123456789', '123', '1'.repeat(16), 'javascript:alert(1)']) {
      expect(validPhone(phone)).toBe(false)
      expect(() => whatsappUrl(phone, 'hi')).toThrow()
    }
  })
  it('encodes message content only in a fixed HTTPS destination', () => {
    const message = 'Hi & thanks\n#followup?'
    const url = new URL(whatsappUrl('+6281234567890', message))
    expect(url.origin).toBe('https://wa.me')
    expect(url.pathname).toBe('/6281234567890')
    expect(url.searchParams.get('text')).toBe(message)
  })
  it('personalizes stage messages without claiming automated sends', () => {
    const lead = {
      name: 'Demo',
      company: 'Example',
      product: 'Autocutter',
      stage: 'Qualification' as const,
    }
    expect(leadMessage(lead)).toContain('Demo dari Example')
    expect(leadMessage(lead)).toContain('kapasitas produksi')
    expect(leadMessage({ ...lead, stage: 'Quotation' })).toContain('penawaran Autocutter')
  })
})
describe('caption drafting', () => {
  it.each(templateKinds)(
    'generates editable bilingual %s templates with CTA and shared inputs',
    (kind) => {
      const result = generateCaption({
        kind,
        product: 'Harmony Spreader',
        angle: 'Production planning',
        benefits: 'Operator support',
        cta: defaultCTA,
      })
      for (const text of [result.idText, result.enText]) {
        expect(text).toContain('Harmony Spreader')
        expect(text).toContain('Production planning')
        expect(text).toContain('Operator support')
        expect(text).toContain('+62 856-9722-2520')
      }
      expect(result.idText).not.toBe(result.enText)
    },
  )
  it('does not invent benefits when none are entered', () => {
    const result = generateCaption({
      kind: 'Product education',
      product: 'Machine',
      angle: '',
      benefits: '',
      cta: defaultCTA,
    })
    expect(result.enText).not.toContain('Key benefits')
    expect(result.enText).not.toContain('undefined')
  })
})
describe('local calendar dates', () => {
  it('formats local dates without UTC date drift', () =>
    expect(todayKey(new Date(2026, 0, 2, 0, 10))).toBe('2026-01-02'))
  it('shifts across month and year boundaries', () => {
    expect(shiftDate(1, new Date(2026, 11, 31, 12))).toBe('2027-01-01')
    expect(shiftDate(-1, new Date(2026, 2, 1, 12))).toBe('2026-02-28')
  })
})
