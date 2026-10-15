import { test, expect, type Page } from '@playwright/test'
import { a1Units } from '../src/data/levels/a1'
import { placementTest } from '../src/data/levels/placement'
import type { Exercise } from '../src/domain/types'

const shot = (page: Page, name: string) => page.screenshot({ path: `shots/${name}.png` })
const lesson1 = a1Units[0].lessons[0]

async function demoProfile(page: Page) {
  await page.goto('/')
  await page.waitForURL('**/welcome')
  await page.getByText(/perfil demo/i).click()
  await page.waitForURL(/localhost:4173\/$/)
}

async function startFirstLesson(page: Page) {
  await page.goto('/lesson/' + lesson1.id)
  await expect(page.getByRole('button', { name: 'Salir de la lección' })).toBeVisible()
}

async function solve(page: Page, ex: Exercise, wrong = false) {
  switch (ex.type) {
    case 'choose-translation':
    case 'listen-choose':
    case 'fill-blank': {
      const i = wrong ? (ex.correct + 1) % ex.options.length : ex.correct
      await page.getByRole('radio').nth(i).click()
      break
    }
    case 'choose-image': {
      const i = wrong ? (ex.correct + 1) % 4 : ex.correct
      await page.getByRole('radio', { name: ex.options[i].label }).click()
      break
    }
    case 'build-sentence': {
      const words = wrong ? ['zzz'] : ex.accepted[0].split(' ')
      if (wrong) { await page.getByRole('button', { name: ex.bank[0], exact: true }).first().click(); break }
      for (const w of words) await page.locator(`button[aria-label="${w}"]:not([disabled])`).first().click()
      break
    }
    case 'type-translation':
    case 'listen-type':
      await page.getByLabel('Tu respuesta').fill(wrong ? 'xyzxyz' : ex.accepted[0])
      break
    case 'match-pairs':
      if (wrong) {
        for (let k = 0; k < 1; k++) {
          await page.locator(`button[lang="en"][aria-label="${ex.pairs[0].en}"]`).click()
          await page.locator(`button[lang="es"][aria-label="${ex.pairs[1].es}"]`).click()
          await page.waitForTimeout(900)
        }
      }
      for (const p of ex.pairs) {
        await page.locator(`button[lang="en"][aria-label="${p.en}"]`).click()
        await page.locator(`button[lang="es"][aria-label="${p.es}"]`).click()
      }
      break
    case 'speak':
      await page.getByRole('button', { name: 'Tocá para hablar' }).click()
      await page.getByRole('button', { name: 'Listo' }).waitFor()
      break
  }
}

async function next(page: Page, ex: Exercise) {
  await page.getByRole('button', { name: 'Comprobar' }).click()
  await page.getByRole('button', { name: /^(Continuar|Terminar)$/ }).click()
}

test('splash, perfil demo y mapa', async ({ page }) => {
  await page.goto('/')
  await page.waitForURL('**/welcome')
  await shot(page, '01-splash')
  await page.getByText(/perfil demo/i).click()
  await page.waitForURL(/localhost:4173\/$/)
  await shot(page, '02-mapa')
  await expect(page.locator('body')).toContainText(/Hello!/i)
})

test('lección completa: 9 tipos de ejercicio, resultado, racha y vuelta al mapa', async ({ page }) => {
  await demoProfile(page)
  await startFirstLesson(page)
  for (const [i, ex] of lesson1.exercises.entries()) {
    await solve(page, ex)
    if (i === 3) await shot(page, `03-ej-${ex.type}`)
    await next(page, ex)
  }
  await expect(page.getByText(/Lección completada/i)).toBeVisible()
  await page.waitForTimeout(2500)
  await shot(page, '04-resultado')
  await page.getByRole('button', { name: 'Continuar' }).click()
  // Meta diaria (10 XP con meta 20 → puede no cumplirse) y racha extendida
  for (let k = 0; k < 1; k++) {
    const b = page.getByRole('button', { name: /continuar/i })
    if (await b.isVisible().catch(() => false)) { await page.waitForTimeout(2500); await shot(page, `05-extra-${k}`); await b.click() }
  }
  await page.waitForURL(/localhost:4173\/$/)
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('skills-go-v1')!).state)
  expect(state.streak.count).toBe(1)
  expect(state.xp).toBeGreaterThanOrEqual(10)
  expect(state.completed[lesson1.id].count).toBe(1)
  expect(state.hearts).toBe(5)
})

test('errores quitan corazones (unir pares y respuestas) y a 0 se corta la lección con el modal', async ({ page }) => {
  await demoProfile(page)
  await startFirstLesson(page)
  const hearts = () => page.evaluate(() => JSON.parse(localStorage.getItem('skills-go-v1')!).state.hearts)
  // Ejercicio 1 (unir pares): un par equivocado = -1 corazón, y completar avanza igual.
  await solve(page, lesson1.exercises[0], true)
  expect(await hearts()).toBe(4)
  await page.getByRole('button', { name: 'Comprobar' }).click()
  await page.getByRole('button', { name: /^(Continuar|Terminar)$/ }).click()
  // Los siguientes 4 errores dejan en 0.
  for (let n = 1; n <= 4; n++) {
    await solve(page, lesson1.exercises[n], true)
    await page.getByRole('button', { name: 'Comprobar' }).click()
    if (n === 1) await shot(page, '06-error')
    await page.getByRole('button', { name: /^(Continuar|Terminar)$/ }).click()
  }
  await expect(page.getByText('¡Te quedaste sin vidas!')).toBeVisible()
  expect(await hearts()).toBe(0)
})

test('tienda, misiones, liga, perfil y desafío de vacaciones cargan', async ({ page }) => {
  await demoProfile(page)
  for (const [path, name, text] of [
    ['/quests', '07-misiones', /misi/i],
    ['/league', '08-liga', /liga|bronce/i],
    ['/shop', '09-tienda', /gemas/i],
    ['/profile', '10-perfil', /racha/i],
    ['/vacation', '11-vacaciones', /21/],
    ['/profile/achievements', '12-logros', /logro/i],
    ['/practice', '13-practica', /error/i],
    ['/profile/friends', '14-amigos', /amig/i],
    ['/profile/stats', '15-stats', /lecciones/i],
  ] as const) {
    await page.goto(path)
    await expect(page.locator('body')).toContainText(text)
    await page.waitForTimeout(400)
    await shot(page, name)
  }
})

test('panel de demo y dashboard admin', async ({ page }) => {
  await demoProfile(page)
  await page.keyboard.press('Control+Shift+D')
  await page.waitForTimeout(500)
  await shot(page, '16-demo')
  await page.goto('/admin')
  await page.waitForURL('**/admin/login')
  await page.setViewportSize({ width: 1366, height: 768 })
  await shot(page, '17-admin-login')
  await page.getByRole('button', { name: /ingresar/i }).first().click()
  await page.waitForTimeout(800)
  await shot(page, '18-admin-resumen')
  await expect(page.locator('body')).toContainText(/retenci/i)
})

test('se instala como PWA: manifest e íconos', async ({ page, request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.ok()).toBe(true)
  const m = await res.json()
  expect(m.name).toBe('Skills Go')
  expect(m.display).toBe('standalone')
  for (const icon of m.icons) expect((await request.get('/' + icon.src)).ok()).toBe(true)
})

test('funciona offline después de la primera carga', async ({ page, context }) => {
  await demoProfile(page)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await page.waitForTimeout(1500)
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('body')).toContainText(/Hello!/i)
  await page.goto('/lesson/' + lesson1.id)
  await expect(page.getByRole('button', { name: 'Salir de la lección' })).toBeVisible()
})


for (const [label, wrong, expected] of [['todo bien → B1', false, 'B1'], ['todo mal → A1', true, 'A1']] as const) {
  test(`alumno nuevo: onboarding + test de nivel (${label})`, async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('**/welcome')
    await page.getByRole('button', { name: 'Empezar', exact: true }).click()
    await page.getByPlaceholder('Tu nombre').fill('Tomi')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('radio', { name: /Hacer test de nivel/ }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('radio', { name: /Serio/ }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: /Ahora no/ }).click()
    await page.waitForURL('**/placement')
    await shot(page, `20-placement-${expected}`)
    for (const ex of placementTest) {
      await solve(page, ex, wrong)
      await page.getByRole('button', { name: 'Comprobar' }).click()
    }
    await expect(page.getByText(new RegExp(expected))).toBeVisible()
    await page.waitForTimeout(800)
    await shot(page, `21-nivel-${expected}`)
    await page.getByRole('button', { name: /empezar/i }).click()
    await page.waitForURL(/localhost:4173\/$/)
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('skills-go-v1')!).state)
    expect(st.profile.level).toBe(expected)
    expect(st.settings.dailyGoal).toBe(30)
    expect(st.hearts).toBe(5)
    if (expected === 'B1') expect(Object.keys(st.completed).length).toBeGreaterThanOrEqual(16)
  })
}

test('sin corazones a mitad de la lección: recarga con gemas y retoma donde quedó', async ({ page }) => {
  await demoProfile(page)
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('skills-go-v1')!)
    raw.state.hearts = 1
    raw.state.gems = 500
    localStorage.setItem('skills-go-v1', JSON.stringify(raw))
  })
  await page.reload()
  await startFirstLesson(page)
  const first = lesson1.exercises[0]
  expect(first.type).toBe('match-pairs')
  if (first.type !== 'match-pairs') return
  // un par equivocado = un corazón menos, en el acto
  await page.locator(`button[lang="en"][aria-label="${first.pairs[0].en}"]`).click()
  await page.locator(`button[lang="es"][aria-label="${first.pairs[1].es}"]`).click()
  await expect(page.getByText('¡Te quedaste sin vidas!')).toBeVisible()
  await shot(page, '22-sin-vidas')
  await page.getByRole('button', { name: /Recargar con 350 gemas/ }).click()
  await expect(page.getByText('¡Te quedaste sin vidas!')).toBeHidden()
  await expect(page.getByRole('heading', { name: /Uní cada palabra/ })).toBeVisible()
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('skills-go-v1')!).state)
  expect(st.hearts).toBe(5)
  expect(st.gems).toBe(150)
})

test('en escritorio se ve dentro de un marco de teléfono', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await demoProfile(page)
  await page.waitForTimeout(500)
  await shot(page, '23-escritorio')
})
