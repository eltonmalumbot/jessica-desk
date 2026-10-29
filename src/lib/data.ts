import { z } from 'zod'

export const STORAGE_KEY = 'jessica-desk:v1'
export const pillars = ['Education', 'Credibility', 'Customer-centric', 'Solution'] as const
export const contentStatuses = ['Idea', 'Editing', 'Ready', 'Published'] as const
export const stages = ['New Lead', 'Qualification', 'Follow-up', 'Quotation', 'Completed'] as const
export const priorities = ['Low', 'Medium', 'High'] as const
export const templateKinds = [
  'Product education',
  'Installation',
  'Machine testing',
  'Delivery',
  'Customer solution',
] as const
// Control characters are deliberately matched to sanitize saved/imported text.
export const cleanText = (text: string) => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
}
const text = (max: number) => z.string().max(max).transform(cleanText)
const required = (max: number) => text(max).refine((v) => v.length > 0, 'This field is required')
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T12:00:00Z')
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
  }, 'Use a valid calendar date')
const base = { id: z.string().uuid(), demo: z.boolean().default(false) }
export const contentSchema = z
  .object({
    ...base,
    title: required(160),
    date: dateSchema,
    platform: z.enum(['Instagram', 'Facebook', 'Instagram & Facebook']),
    pillar: z.enum(pillars),
    status: z.enum(contentStatuses),
    product: text(120),
    notes: text(5000),
    assets: text(3000),
  })
  .strict()
export const taskSchema = z
  .object({
    ...base,
    title: required(160),
    date: dateSchema,
    priority: z.enum(priorities),
    completed: z.boolean(),
  })
  .strict()
export const leadSchema = z
  .object({
    ...base,
    name: required(100),
    company: text(150),
    product: required(120),
    stage: z.enum(stages),
    phone: text(30).refine(
      (v) => v === '' || validPhone(v),
      'Use 8–15 digits, including the country code',
    ),
    followUp: z.union([dateSchema, z.literal('')]),
    message: text(5000),
  })
  .strict()
export const captionSchema = z
  .object({
    ...base,
    product: required(120),
    angle: text(300),
    benefits: text(1000),
    cta: required(300),
    kind: z.enum(templateKinds),
    idText: text(8000),
    enText: text(8000),
  })
  .strict()
export const workspaceSchema = z
  .object({
    version: z.literal(1),
    contents: z.array(contentSchema).max(1000),
    tasks: z.array(taskSchema).max(1000),
    leads: z.array(leadSchema).max(1000),
    captions: z.array(captionSchema).max(1000),
  })
  .strict()
  .superRefine((data, ctx) => {
    const ids = [...data.contents, ...data.tasks, ...data.leads, ...data.captions].map((r) => r.id)
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'Backup contains duplicate record IDs' })
  })
export type Content = z.infer<typeof contentSchema>
export type Task = z.infer<typeof taskSchema>
export type Lead = z.infer<typeof leadSchema>
export type Caption = z.infer<typeof captionSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export const emptyWorkspace = (): Workspace => ({
  version: 1,
  contents: [],
  tasks: [],
  leads: [],
  captions: [],
})
export const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export function shiftDate(days: number, from = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  return todayKey(date)
}
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
) {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-GB', options)
}
export const uid = () => crypto.randomUUID()
export function validPhone(phone: string) {
  return /^\+?[\d\s()-]+$/.test(phone) && /^\d{8,15}$/.test(normalizePhone(phone))
}
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('0') ? '62' + digits.slice(1) : digits
}
export function whatsappUrl(phone: string, message: string) {
  if (!validPhone(phone)) throw new Error('Add a valid international phone number first.')
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`
}
export function parseBackup(raw: string): Workspace {
  if (new TextEncoder().encode(raw).length > 2 * 1024 * 1024)
    throw new Error('Backup must be smaller than 2 MB.')
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('This file is not valid JSON.')
  }
  const result = workspaceSchema.safeParse(data)
  if (!result.success)
    throw new Error(
      'Invalid Jessica Desk backup. Check version, record fields, dates, and unique IDs.',
    )
  return result.data
}
export function serializeWorkspace(data: Workspace): string {
  const raw = JSON.stringify(workspaceSchema.parse(data))
  if (new TextEncoder().encode(raw).length > 2 * 1024 * 1024)
    throw new Error(
      'Workspace exceeds 2 MB. Export a backup and remove old records before adding more.',
    )
  return raw
}
export const defaultCTA = 'Pukka Indonusa · WhatsApp +62 856-9722-2520'
export function generateCaption(
  input: Pick<Caption, 'product' | 'angle' | 'benefits' | 'cta' | 'kind'>,
) {
  const p = cleanText(input.product),
    a = cleanText(input.angle),
    b = cleanText(input.benefits),
    c = cleanText(input.cta)
  const intros = {
    'Product education': [`Kenali ${p} lebih dekat.`, `Get to know ${p}.`],
    Installation: [
      `Instalasi ${p}: siap mendukung proses produksi Anda.`,
      `${p} installation: ready to support your production.`,
    ],
    'Machine testing': [`Melihat ${p} dalam pengujian.`, `A closer look at ${p} in testing.`],
    Delivery: [`${p} siap untuk pengiriman.`, `${p} is ready for delivery.`],
    'Customer solution': [
      `Solusi untuk kebutuhan cutting room Anda: ${p}.`,
      `A solution for your cutting-room needs: ${p}.`,
    ],
  }[input.kind]
  return {
    idText: [
      intros[0],
      a && `Fokus konten: ${a}`,
      b && `Manfaat utama:\n${b}`,
      `Diskusikan kebutuhan produksi Anda bersama kami.\n${c}`,
      '#PukkaIndonusa #MesinGarmen #CuttingRoom',
    ]
      .filter(Boolean)
      .join('\n\n'),
    enText: [
      intros[1],
      a && `Content focus: ${a}`,
      b && `Key benefits:\n${b}`,
      `Let’s discuss your production needs.\n${c}`,
      '#PukkaIndonusa #GarmentMachinery #CuttingRoom',
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}
export function leadMessage(lead: Pick<Lead, 'name' | 'company' | 'product' | 'stage'>) {
  const intro = `Halo ${lead.name || 'Bapak/Ibu'}${lead.company ? ` dari ${lead.company}` : ''}, saya Jessica dari Pukka Indonusa.`
  const lines = {
    'New Lead': `Terima kasih atas ketertarikan Anda pada ${lead.product || 'mesin kami'}. Boleh kami mengetahui kebutuhan produksi Anda?`,
    Qualification: `Untuk membantu memilih ${lead.product || 'mesin'} yang sesuai, boleh diinformasikan jenis bahan, kapasitas produksi, dan lokasi perusahaan Anda?`,
    'Follow-up': `Saya ingin menindaklanjuti diskusi mengenai ${lead.product || 'mesin kami'}. Apakah ada pertanyaan atau informasi tambahan yang Anda butuhkan?`,
    Quotation: `Terkait penawaran ${lead.product || 'mesin'}, apakah ada detail yang ingin didiskusikan? Kami siap membantu.`,
    Completed: `Terima kasih atas kepercayaan Anda kepada Pukka Indonusa untuk kebutuhan ${lead.product || 'mesin'}. Silakan hubungi kami jika membutuhkan bantuan lebih lanjut.`,
  }
  return `${intro}\n\n${lines[lead.stage]}\n\nSalam,\nJessica · Pukka Indonusa\nWhatsApp +62 856-9722-2520`
}
export function makeDemo(): Workspace {
  const content = (
    title: string,
    day: number,
    pillar: Content['pillar'],
    status: Content['status'],
    product: string,
  ): Content => ({
    id: uid(),
    demo: true,
    title,
    date: shiftDate(day),
    pillar,
    status,
    product,
    platform: 'Instagram & Facebook',
    notes: 'Fictional example for exploring your workspace.',
    assets: 'Product close-ups, vertical footage, and a cover image.',
  })
  return {
    version: 1,
    contents: [
      content('A smoother start to every cut', 0, 'Education', 'Ready', 'Harmony Spreader'),
      content('Precision you can see', 1, 'Solution', 'Editing', 'Autocutter'),
      content('Inside a cutting-room installation', 5, 'Credibility', 'Idea', 'Airblow Table'),
    ],
    tasks: [
      {
        id: uid(),
        demo: true,
        title: 'Prepare Harmony Spreader reel brief',
        date: todayKey(),
        priority: 'High',
        completed: false,
      },
      {
        id: uid(),
        demo: true,
        title: 'Review this week’s content captions',
        date: todayKey(),
        priority: 'Medium',
        completed: false,
      },
      {
        id: uid(),
        demo: true,
        title: 'Organize product video assets',
        date: todayKey(),
        priority: 'Low',
        completed: true,
      },
      {
        id: uid(),
        demo: true,
        title: 'Plan next week’s product spotlight',
        date: shiftDate(1),
        priority: 'Medium',
        completed: false,
      },
    ],
    leads: [
      {
        id: uid(),
        demo: true,
        name: 'Demo customer',
        company: 'Fictional Garment Studio',
        product: 'Harmony Spreader',
        stage: 'Follow-up',
        phone: '',
        followUp: todayKey(),
        message: '',
      },
    ],
    captions: [],
  }
}
