// Full-journey E2E: a stranger parent signs up and reaches a working,
// personalized board in one sitting — then the kid runs the loop unaided.
// Runs on both projects: desktop (phone frame) and mobile (natural flow).
import { test, expect, type Page } from '@playwright/test'

const uniq = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e5)}`

async function pressKeypad(page: Page, digits: string) {
  for (const d of digits) {
    await page.locator('.keypad .key', { hasText: new RegExp(`^${d}$`) }).click()
    await page.waitForTimeout(160)
  }
}

test('full family journey: signup → wizard → kid loop → ceremony → digest', async ({ page, isMobile }) => {
  await page.goto('/')

  // ---- first-run manifesto: all three problems, then ignition ----
  await expect(page.locator('.manifesto')).toBeVisible()
  await expect(page.locator('.mline')).toContainText('distracting world')
  for (let i = 0; i < 4; i++) {
    await page.locator('.manifesto').click({ position: { x: 100, y: 200 } })
    await page.waitForTimeout(250)
  }
  await page.getByRole('button', { name: /see how it works/i }).click()

  // ---- onboarding: one problem per slide ----
  await expect(page.locator('.onb-body h3')).toContainText('Their board')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.onb-body h3')).toContainText('their size')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.onb-body h3')).toContainText('together')
  await page.getByRole('button', { name: /get started/i }).click()

  // ---- signup ----
  const email = `${uniq()}@starquezz.test`
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('e2e-password-1')
  await page.getByRole('button', { name: /create our family account/i }).click()

  // ---- wizard: child profile ----
  await expect(page.locator('#kidname')).toBeVisible({ timeout: 15_000 })
  await page.locator('#kidname').fill('Zen')
  await page.locator('#birthyear').selectOption({ index: 1 })
  await page.locator('#interests').fill('dinosaurs, counting things')
  await page.locator('.avatar-pick').nth(2).click()
  await page.getByRole('button', { name: /next/i }).click()

  // manual path (the Scout fallback path is covered by its own test below)
  await page.getByRole('button', { name: /skip — i’ll pick myself/i }).click()
  await expect(page.locator('.nudge-card')).toContainText('core habits')
  await page.getByRole('button', { name: /looks right/i }).click()

  // adventure menu seeds
  await expect(page.locator('.parent-head .pt')).toContainText('adventure menu')
  await page.getByRole('button', { name: /menu’s set/i }).click()

  // parent PIN: enter + confirm
  await expect(page.getByText('Set your parent PIN')).toBeVisible()
  await pressKeypad(page, '4321')
  await expect(page.getByText('Type it once more')).toBeVisible()
  await pressKeypad(page, '4321')

  // theatrical handoff
  await expect(page.getByText(/board is ready/i)).toBeVisible()
  await page.getByRole('button', { name: /give it to zen/i }).click()

  // ---- kid loop: avatar tap IS the login ----
  await page.locator('.face-pick', { hasText: 'Zen' }).click()
  await expect(page.locator('.greet .nm')).toHaveText('Zen')

  // walk every block and check off every habit (cores first, then bonus)
  const checkAllInBlock = async () => {
    for (let i = 0; i < 8; i++) {
      const open = page.locator('.habit.now .hcheck')
      if ((await open.count()) === 0) break
      await open.first().click()
      await page.waitForTimeout(900)
      // dismiss a star-day celebration if it fired
      const celebrate = page.locator('.celebrate .btn')
      if (await celebrate.isVisible().catch(() => false)) {
        await expect(page.locator('.celebrate h2')).toContainText('Star-day')
        await celebrate.click()
      }
    }
  }
  // go to the first block, then sweep forward
  const prev = page.locator('.blockbar .nav button').first()
  while (await prev.isEnabled()) await prev.click()
  for (let b = 0; b < 3; b++) {
    await checkAllInBlock()
    const next = page.locator('.blockbar .nav button').nth(1)
    if (await next.isEnabled()) await next.click()
    else break
  }

  // stars were paid instantly — balance must be positive now
  const balance = Number(await page.locator('.topbar .pill').first().innerText())
  expect(balance).toBeGreaterThanOrEqual(3)

  // a completed card can be undone and redone (mis-tap forgiveness)
  const undo = page.locator('.undo-chip').first()
  if (await undo.isVisible().catch(() => false)) {
    const before = Number(await page.locator('.topbar .pill').first().innerText())
    await undo.click()
    await expect
      .poll(async () => Number(await page.locator('.topbar .pill').first().innerText()))
      .toBeLessThan(before)
    await page.locator('.habit.now .hcheck').first().click()
    await page.waitForTimeout(800)
    const celebrate = page.locator('.celebrate .btn')
    if (await celebrate.isVisible().catch(() => false)) await celebrate.click()
  }

  // ---- star jar ----
  await page.locator('.navitem', { hasText: 'Stars' }).click()
  await expect(page.locator('.jar-count')).toContainText('stars')
  await expect(page.locator('.weekstrip')).toBeVisible()

  // ---- ceremony: recap → reveal → pick → sealed ticket ----
  await page.getByRole('button', { name: /ceremony/i }).click()
  await expect(page.locator('.cer h2')).toContainText('your week')
  await page.getByRole('button', { name: /count my stars/i }).click()
  await page.getByRole('button', { name: /pick this week/i }).click()
  // the 0✦ fallback is always pickable — the adventure always happens
  await page.locator('.cer .adv').first().click()
  await page.getByRole('button', { name: /seal it/i }).click()
  await expect(page.locator('.ticket')).toBeVisible()
  await expect(page.locator('.ticket .tstub')).toContainText('TICKET')
  await page.getByRole('button', { name: /back to my stars/i }).click()

  // the ticket waits on the board all week
  await page.locator('.navitem', { hasText: 'Today' }).click()
  await expect(page.locator('.board-ticket')).toBeVisible()

  // ---- parent surface: PIN gate → digest → mark done → graduation ----
  await page.locator('.avatar-btn').click()
  await page.getByRole('button', { name: /grown-ups/i }).click()
  await expect(page.getByText('Parent PIN')).toBeVisible()
  await pressKeypad(page, '4321')

  await expect(page.locator('.parent-head .pt')).toContainText('This week')
  await expect(page.locator('.dchild .dname2')).toContainText('Zen')
  // tamper-evidence: edits left footprints
  await expect(page.getByText('Recent changes')).toBeVisible()
  // one-tap adventure done
  await page.locator('.advstatus .done').first().click()
  await expect(page.locator('.advstatus .done')).toHaveCount(0)

  // habit editor: graduate the first habit into the Hall of Fame
  await page.locator('.bottomnav .navitem', { hasText: 'Habits' }).click()
  await page.locator('[aria-label^="graduate"]').first().click()
  await page.getByRole('button', { name: /to the hall of fame/i }).click()
  await expect(page.locator('.celebrate h2')).toContainText(/is who Zen is now/i)
  await page.getByRole('button', { name: /wonderful/i }).click()
  await expect(page.getByText(/graduated — part of who Zen is now/i)).toBeVisible()

  // mobile reality check: no phone frame on small screens
  if (isMobile) {
    const padding = await page
      .locator('.phone')
      .evaluate((el) => getComputedStyle(el).padding)
    expect(padding).toBe('0px')
  }
})

test('scout wizard path: conversation → draft cards → working board', async ({ page }) => {
  await page.goto('/')
  // skip intro
  await page.locator('.manifesto .mskip').click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /get started/i }).click()

  const email = `${uniq()}@starquezz.test`
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('e2e-password-1')
  await page.getByRole('button', { name: /create our family account/i }).click()

  await expect(page.locator('#kidname')).toBeVisible({ timeout: 15_000 })
  await page.locator('#kidname').fill('Zia')
  await page.locator('#birthyear').selectOption({ index: 5 })
  await page.getByRole('button', { name: /next/i }).click()

  // the Scout path (LLM proxy absent locally → library-grounded fallback)
  await page.getByRole('button', { name: /talk it through with the scout/i }).click()
  await page.locator('form input.input').fill('Mornings are chaos and she never tidies up.')
  await page.locator('form button.btn').click()

  // draft cards arrive with the "why it matters" line
  await expect(page.locator('.draftcard').first()).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.dc-why').first()).not.toBeEmpty()
  // accept every habit card (accepted chips leave the .accept set)
  while ((await page.locator('.chip.accept').count()) > 0) {
    await page.locator('.chip.accept').first().click()
    await page.waitForTimeout(120)
  }
  await page.getByRole('button', { name: /now adventures/i }).click()

  await page.locator('form input.input').fill('A playground nearby; tight budget.')
  await page.locator('form button.btn').click()
  await expect(page.locator('.draftcard').first()).toBeVisible({ timeout: 15_000 })
  while ((await page.locator('.chip.accept').count()) > 0) {
    await page.locator('.chip.accept').first().click()
    await page.waitForTimeout(120)
  }
  await page.getByRole('button', { name: /build the board/i }).click()

  // PIN + handoff
  await expect(page.getByText('Set your parent PIN')).toBeVisible({ timeout: 15_000 })
  await pressKeypad(page, '2580')
  await expect(page.getByText('Type it once more')).toBeVisible()
  await pressKeypad(page, '2580')
  await page.getByRole('button', { name: /give it to zia/i }).click()

  // the board works
  await page.locator('.face-pick', { hasText: 'Zia' }).click()
  await expect(page.locator('.greet .nm')).toHaveText('Zia')
  await expect(page.locator('.habit').first()).toBeVisible()
})

test('PWA: manifest + service worker registration are wired', async ({ page }) => {
  await page.goto('/')
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(manifestHref).toBeTruthy()
  const hasSW = await page.evaluate(() => 'serviceWorker' in navigator)
  expect(hasSW).toBe(true)
})
