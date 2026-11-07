import { test, expect, gotoRoute } from './fixtures'
import { IFOOD, IFOOD_SECTIONS, ifoodSectionPath } from '../src/content/ifood'

test('vitrine mostra o módulo do iFood e leva para a página do treino', async ({ page }) => {
  await gotoRoute(page, '/')
  await page.locator('.module-card', { hasText: 'Treinamento iFood GenAI' }).click()
  await expect(page).toHaveURL(new RegExp(`#${IFOOD.basePath}$`))
  await expect(page.locator('h1')).toHaveText('Treinamento iFood GenAI · Desafio Técnico')
  await expect(page.locator('.ifood-section-card')).toHaveCount(IFOOD_SECTIONS.length)
})

test('trilha do desafio lista as seções e abre cada uma', async ({ page }) => {
  await gotoRoute(page, '/trilhas')
  const trail = page.locator('#ifood')
  await expect(trail.locator('h2')).toHaveText('Desafio técnico iFood GenAI')
  await trail.locator('.trail-step', { hasText: 'SQL' }).locator('a').click()
  await expect(page).toHaveURL(/#\/ifood\/sql$/)
  await expect(page.locator('h1')).toHaveText('SQL')
})

for (const [i, sec] of IFOOD_SECTIONS.entries()) {
  test(`seção ${i + 1} · ${sec.id}`, async ({ page }) => {
    await gotoRoute(page, ifoodSectionPath(sec.id))
    await expect(page.locator('h1')).toHaveText(sec.title)
    await expect(page.locator('.breadcrumb')).toContainText(IFOOD.title)
    const next = IFOOD_SECTIONS[i + 1]
    if (next) {
      await page.locator('.ifood-section-link.is-next').click()
      await expect(page.locator('h1')).toHaveText(next.title)
    }
  })
}

test('seção inexistente mostra aviso', async ({ page }) => {
  await gotoRoute(page, '/ifood/nao-existe')
  await expect(page.getByRole('heading', { name: 'Seção não encontrada' })).toBeVisible()
})
