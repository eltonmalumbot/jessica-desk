import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
async function go(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name, exact: true })
    .click()
}

test('content and task CRUD persists and reflects on dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Hello, Jessica!' })).toBeVisible()
  await go(page, 'Content planner')
  await page.getByRole('button', { name: 'New content', exact: true }).click()
  await page.getByLabel('Content title').fill('Test machine reel')
  await page.getByLabel('Product', { exact: true }).fill('Harmony Spreader')
  await page.getByLabel('Notes & content angle').fill('Show setup and operation')
  await page.getByLabel('Video & asset requirements').fill('Vertical footage')
  await page.getByRole('button', { name: 'Save content' }).click()
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.getByRole('button', { name: 'Edit Test machine reel' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit Test machine reel' }).click()
  await page.getByLabel('Status', { exact: true }).selectOption('Ready')
  await page.getByRole('button', { name: 'Save content' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.content-list .badge').filter({ hasText: /^Ready$/ })).toBeVisible()
  await page.getByPlaceholder('Search content…').fill('no-such-content')
  await expect(page.getByRole('heading', { name: 'A space for your next idea' })).toBeVisible()
  await page.getByPlaceholder('Search content…').clear()
  await page.getByRole('button', { name: 'Delete Test machine reel' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('button', { name: /Test machine reel/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Delete Test machine reel' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Edit Test machine reel' })).toHaveCount(0)
  await go(page, 'Daily tasks')
  await page.getByRole('button', { name: 'New task', exact: true }).click()
  await page.getByLabel('Task name').fill('Review caption brief')
  await page.getByLabel('Priority', { exact: true }).selectOption('High')
  await page.getByRole('button', { name: 'Save task' }).click()
  await page.getByRole('button', { name: 'Edit Review caption brief' }).click()
  await page.getByLabel('Task name').fill('Review final caption')
  await page.getByRole('button', { name: 'Save task' }).click()
  await page.getByRole('button', { name: 'Complete Review final caption', exact: true }).click()
  await page.getByRole('button', { name: 'Completed', exact: true }).click()
  await expect(page.getByText('Review final caption', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reopen Review final caption', exact: true }).click()
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await expect(page.getByText('Review final caption', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Delete Review final caption' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByText('Review final caption', { exact: true })).toHaveCount(0)
})

test('caption templates produce editable saved bilingual drafts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#captions')
  await page.getByLabel('Product', { exact: true }).fill('Autocutter')
  await page.getByLabel('Content angle').fill('A better cutting workflow')
  await page.getByLabel('Key benefits').fill('Careful material handling')
  await page.getByRole('button', { name: 'Generate template drafts' }).click()
  await expect(page.getByLabel('Bahasa Indonesia caption')).toHaveValue(/Kenali Autocutter/)
  await expect(page.getByLabel('English caption')).toHaveValue(/Get to know Autocutter/)
  await page.getByLabel('English caption').fill('Reviewed English draft · Pukka Indonusa')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.getByRole('button', { name: 'Copy both languages' }).click()
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('Reviewed English draft')
  await page.reload()
  await page.getByRole('button', { name: /Product education Autocutter/ }).click()
  await expect(page.getByLabel('English caption')).toHaveValue(
    'Reviewed English draft · Pukka Indonusa',
  )
  await page.getByRole('button', { name: 'Delete Autocutter caption' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Keep your good words close' })).toBeVisible()
})

test('lead CRUD, stage templates, missing-phone errors and due filters', async ({ page }) => {
  await page.goto('/#leads')
  await page.getByRole('button', { name: 'New lead', exact: true }).click()
  await page.getByLabel('Customer name').fill('Fictional QA contact')
  await page.getByLabel('Company', { exact: true }).fill('Fictional QA company')
  await page.getByLabel('Product interest', { exact: true }).fill('Airblow Table')
  await page.getByLabel('Follow-up stage').selectOption('Qualification')
  await page.getByRole('button', { name: 'Use stage template' }).click()
  await expect(page.getByLabel('WhatsApp message draft')).toHaveValue(/kapasitas produksi/)
  await page.getByRole('button', { name: 'Open WhatsApp', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('valid international phone')
  await page.getByRole('button', { name: 'Save lead' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Fictional QA contact' })).toBeVisible()
  await page.getByLabel('Follow-ups due', { exact: true }).check()
  await expect(page.getByRole('heading', { name: 'No leads match your filters' })).toBeVisible()
  await page.getByLabel('Follow-ups due', { exact: true }).uncheck()
  await page.getByRole('button', { name: 'Edit Fictional QA contact' }).click()
  await page.getByLabel('Follow-up stage').selectOption('Completed')
  await page.getByRole('button', { name: 'Save lead' }).click()
  await page.getByRole('button', { name: 'Delete Fictional QA contact' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Start with a conversation' })).toBeVisible()
})

test('backup export, import validation, replacement confirmation, and reset', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore demo' }).click()
  await page.getByRole('link', { name: 'Settings & backup' }).click()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export backup' }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toMatch(/^jessica-desk-.*\.json$/)
  const filePath = await download.path()
  const before = await page.evaluate(() => localStorage.getItem('jessica-desk:v1'))
  await page.getByLabel('Import JSON backup').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  })
  await expect(page.getByRole('alert')).toContainText('Invalid Jessica Desk backup')
  expect(await page.evaluate(() => localStorage.getItem('jessica-desk:v1'))).toBe(before)
  await page.getByLabel('Import JSON backup').setInputFiles(filePath!)
  await expect(
    page.getByRole('heading', { name: 'Replace workspace with this backup?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(await page.evaluate(() => localStorage.getItem('jessica-desk:v1'))).toBe(before)
  await page.getByLabel('Import JSON backup').setInputFiles(filePath!)
  await page.getByRole('button', { name: 'Replace workspace', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Backup imported successfully')
  await page.getByRole('button', { name: 'Remove demos', exact: true }).click()
  await page.getByRole('button', { name: 'Remove demos', exact: true }).last().click()
  await expect(page.locator('.backup-summary')).toContainText('0 records')
  await page.getByRole('button', { name: 'Clear all workspace data' }).click()
  await page.getByRole('button', { name: 'Clear all data', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Workspace cleared')
})

test('corrupted saved data is protected until explicit reset', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('initialized')) {
      localStorage.setItem('jessica-desk:v1', '{broken')
      sessionStorage.setItem('initialized', 'yes')
    }
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Saved data could not be read')
  await page.getByRole('button', { name: 'Explore demo' }).click()
  expect(await page.evaluate(() => localStorage.getItem('jessica-desk:v1'))).toBe('{broken')
  await page.getByRole('link', { name: 'Settings & backup' }).click()
  await expect(page.getByRole('button', { name: 'Export backup' })).toBeDisabled()
  await page.getByRole('button', { name: 'Clear all workspace data' }).click()
  await page.getByRole('button', { name: 'Clear all data', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('responsive dashboard and navigation have no page overflow or runtime errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore demo' }).click()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: '/tmp/jessica-desktop.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: '/tmp/jessica-mobile.png', fullPage: true, animations: 'disabled' })
  for (const name of ['Content planner', 'Caption studio', 'Lead helper', 'Daily tasks']) {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
    await go(page, name)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
  expect(errors).toEqual([])
})

test('failed browser writes keep existing data and the unsaved form intact', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore demo' }).click()
  const before = await page.evaluate(() => localStorage.getItem('jessica-desk:v1'))
  await go(page, 'Daily tasks')
  await page.getByRole('button', { name: 'New task', exact: true }).click()
  await page.getByLabel('Task name').fill('Unsaved quota task')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage quota reached', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Save task' }).click()
  await expect(page.getByRole('alert')).toContainText('Storage quota reached')
  await expect(page.getByLabel('Task name')).toHaveValue('Unsaved quota task')
  expect(await page.evaluate(() => localStorage.getItem('jessica-desk:v1'))).toBe(before)
})

test('another tab cannot silently overwrite a newer workspace', async ({ page, context }) => {
  await page.goto('/#tasks')
  const other = await context.newPage()
  await other.goto('/#tasks')
  await other.getByRole('button', { name: 'New task', exact: true }).click()
  await other.getByLabel('Task name').fill('Newer task from another tab')
  await other.getByRole('button', { name: 'Save task' }).click()
  await page.getByRole('button', { name: 'New task', exact: true }).click()
  await page.getByLabel('Task name').fill('Stale tab task')
  await page.getByRole('button', { name: 'Save task' }).click()
  await expect(page.getByRole('alert')).toContainText('changed in another tab')
  await page.reload()
  await expect(page.getByText('Newer task from another tab', { exact: true })).toBeVisible()
  await expect(page.getByText('Stale tab task', { exact: true })).toHaveCount(0)
})

test('taste dashboard keeps the publishing rhythm truthful across viewports', async ({ page }) => {
  await page.goto('/')
  const focus = page.getByRole('region', { name: "Today's priorities" })
  await expect(focus).toBeVisible()
  await expect(focus.getByRole('button', { name: 'Open content planner' })).toBeVisible()
  await expect(page.locator('.taste-cadence-day')).toHaveCount(3)
  await expect(page.locator('.taste-cadence-day')).toContainText([
    /Tuesday.*Nothing scheduled/,
    /Thursday.*Nothing scheduled/,
    /Friday.*Nothing scheduled/,
  ])
  await expect(page.getByRole('button', { name: /Follow-ups due/ })).toContainText('0')
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
})
