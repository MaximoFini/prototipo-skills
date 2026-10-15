import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function demo(page: Page) {
  await page.goto('/')
  await page.waitForURL('**/welcome')
  await page.getByText(/perfil demo/i).click()
  await page.waitForURL(/localhost:4173\/$/)
}

const screens = ['/', '/league', '/quests', '/profile', '/shop', '/vacation', '/profile/achievements', '/profile/stats', '/profile/friends', '/profile/rewards', '/practice', '/practice/vocabulary', '/settings', '/settings/reminders']

test('accesibilidad (axe) de las pantallas del alumno', async ({ page }) => {
  await demo(page)
  const report: string[] = []
  for (const path of screens) {
    await page.goto(path)
    await page.waitForTimeout(600)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    for (const v of r.violations) report.push(`${path} :: ${v.id} (${v.impact}) x${v.nodes.length} :: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
  }
  console.log('\n' + (report.join('\n') || 'SIN VIOLACIONES'))
  expect(report.filter((l) => /\((serious|critical)\)/.test(l))).toEqual([])
})

test('accesibilidad (axe) de la landing y el dashboard', async ({ page }) => {
  const report: string[] = []
  await page.goto('/welcome')
  let r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  for (const v of r.violations) report.push(`welcome :: ${v.id} (${v.impact}) x${v.nodes.length} :: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/admin/login')
  await page.getByRole('button', { name: /ingresar/i }).first().click()
  for (const path of ['/admin', '/admin/alumnos', '/admin/riesgo', '/admin/comisiones', '/admin/campana']) {
    await page.goto(path)
    await page.waitForTimeout(800)
    r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    for (const v of r.violations) report.push(`${path} :: ${v.id} (${v.impact}) x${v.nodes.length} :: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
  }
  console.log('\n' + (report.join('\n') || 'SIN VIOLACIONES'))
  expect(report.filter((l) => /\((serious|critical)\)/.test(l))).toEqual([])
})
