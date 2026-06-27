// Guest-first funnel: no signup wall. Start anonymously, build the board,
// earn stars — then claim the account with an email and prove the family
// survives a fresh sign-in.
import { test, expect, type Page } from '@playwright/test'

async function pressKeypad(page: Page, digits: string) {
  for (const d of digits) {
    await page.locator('.keypad .key', { hasText: new RegExp(`^${d}$`) }).click()
    await page.waitForTimeout(160)
  }
}

test('guest → working board → claim with email → data intact', async ({ page }) => {
  await page.goto('/')

  // skip intro to the auth screen
  await page.locator('.manifesto .mskip').click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /get started/i }).click()

  // the new front door: no account needed
  await page.getByRole('button', { name: /start now — no account needed/i }).click()

  // wizard works exactly as for a signed-up parent
  await expect(page.locator('#kidname')).toBeVisible({ timeout: 15_000 })
  await page.locator('#kidname').fill('Nova')
  await page.getByRole('button', { name: /next/i }).click()
  await page.getByRole('button', { name: /skip — i’ll pick myself/i }).click()
  await page.getByRole('button', { name: /looks right/i }).click()
  await page.getByRole('button', { name: /menu’s set/i }).click()
  await pressKeypad(page, '7711')
  await expect(page.getByText('Type it once more')).toBeVisible()
  await pressKeypad(page, '7711')
  await page.getByRole('button', { name: /give it to nova/i }).click()

  // kid earns a star as a guest
  await page.locator('.face-pick', { hasText: 'Nova' }).click()
  const prev = page.locator('.blockbar .nav button').first()
  while (await prev.isEnabled()) await prev.click()
  await page.locator('.habit.now .hcheck').first().click()
  await page.waitForTimeout(900)
  const celebrate = page.locator('.celebrate .btn')
  if (await celebrate.isVisible().catch(() => false)) await celebrate.click()
  const balance = Number(await page.locator('.topbar .pill').first().innerText())
  expect(balance).toBeGreaterThanOrEqual(1)

  // parent side shows the save-your-family nudge
  await page.locator('.avatar-btn').click()
  await page.getByRole('button', { name: /grown-ups/i }).click()
  await pressKeypad(page, '7711')
  await expect(page.getByText(/save your family with an email/i)).toBeVisible()

  // claim the account
  await page.getByText(/save your family with an email/i).click()
  const email = `guest-claim-${Date.now()}@starquezz.test`
  await page.locator('#claim-email').fill(email)
  await page.locator('#claim-password').fill('claimed-password-1')
  await page.getByRole('button', { name: /save our family/i }).click()
  await expect(page.getByText(/family saved/i)).toBeVisible({ timeout: 15_000 })
  // the banner is gone — no longer a guest
  await expect(page.getByText(/save your family with an email/i)).toHaveCount(0)

  // sign out (no guest guard anymore) and sign back in with the credential
  await page.locator('.bottomnav .navitem', { hasText: 'More' }).click()
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page.getByRole('button', { name: /start now — no account needed/i })).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('claimed-password-1')
  await page.getByRole('button', { name: /^sign in$/i }).click()

  // the family is right there — same rows, nothing migrated. The app may
  // remember the active kid and land straight on Nova's board, or show the
  // avatar picker — handle both.
  const novaFace = page.locator('.face-pick', { hasText: 'Nova' })
  if (await novaFace.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await novaFace.click()
  }
  await expect(page.locator('.greet .nm')).toHaveText('Nova', { timeout: 15_000 })
  const balanceAfter = Number(await page.locator('.topbar .pill').first().innerText())
  expect(balanceAfter).toBe(balance)
})

test('guest sign-out is guarded against accidental data loss', async ({ page }) => {
  await page.goto('/')
  await page.locator('.manifesto .mskip').click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: /get started/i }).click()
  await page.getByRole('button', { name: /start now — no account needed/i }).click()

  await expect(page.locator('#kidname')).toBeVisible({ timeout: 15_000 })
  await page.locator('#kidname').fill('Pip')
  await page.getByRole('button', { name: /next/i }).click()
  await page.getByRole('button', { name: /skip — i’ll pick myself/i }).click()
  await page.getByRole('button', { name: /looks right/i }).click()
  await page.getByRole('button', { name: /menu’s set/i }).click()
  await pressKeypad(page, '9999')
  await expect(page.getByText('Type it once more')).toBeVisible()
  await pressKeypad(page, '9999')
  await page.getByRole('button', { name: /give it to pip/i }).click()

  await page.locator('.face-pick', { hasText: 'Pip' }).click()
  await page.locator('.avatar-btn').click()
  await page.getByRole('button', { name: /grown-ups/i }).click()
  await pressKeypad(page, '9999')
  await page.locator('.bottomnav .navitem', { hasText: 'More' }).click()

  // guest sign-out triggers the loud warning, with save-first as the default
  await page.getByRole('button', { name: /^sign out$/i }).click()
  await expect(page.getByText(/your family isn’t saved/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /save it with an email first/i })).toBeVisible()
  await page.getByText('never mind').click()
  await expect(page.getByText(/your family isn’t saved/i)).toHaveCount(0)
})
