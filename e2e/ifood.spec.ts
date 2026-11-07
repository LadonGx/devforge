import { test, expect, gotoRoute, readProgress } from './fixtures'
import { IFOOD, IFOOD_SECTIONS, ifoodSectionPath } from '../src/content/ifood'
import { CONCEPTS, CONCEPT_THEMES } from '../src/content/ifood/concepts'

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

test.describe('seção 4 · conceitos', () => {
  test('responder todas certo conta 100% e fica salvo', async ({ page }) => {
    await gotoRoute(page, ifoodSectionPath('conceitos'))
    for (const q of CONCEPTS) {
      const card = page.locator(`article#${q.id}`)
      await card.locator(`[data-option="${q.answer}"]`).click()
      await expect(card).toHaveClass(/is-right/)
    }
    const progress = await readProgress(page)
    const concepts = (progress?.concepts ?? {}) as Record<string, { right: boolean }>
    expect(CONCEPTS.every((q) => concepts[q.id]?.right)).toBe(true)
    await expect(page.locator('.concepts-score .lc-progress-num')).toHaveText(`${CONCEPTS.length}/${CONCEPTS.length}`)
    // o card da seção no hub mostra o total
    await gotoRoute(page, IFOOD.basePath)
    await expect(page.locator('.ifood-section-card', { hasText: 'Conceitos' })).toContainText(`${CONCEPTS.length}/${CONCEPTS.length}`)
  })

  test('errar mostra o porquê de cada alternativa e o filtro "Erradas"', async ({ page }) => {
    await gotoRoute(page, ifoodSectionPath('conceitos'))
    const q = CONCEPTS[0]
    const wrong = q.answer === 0 ? 1 : 0
    const card = page.locator(`article#${q.id}`)
    await card.locator(`[data-option="${wrong}"]`).click()
    await expect(card).toHaveClass(/is-wrong/)
    await expect(card.locator('.concept-why')).toHaveCount(q.options.length)
    await expect(card.locator('.concept-opt.is-answer')).toHaveCount(1)
    await page.locator('.concepts-toolbar .seg button', { hasText: 'Erradas' }).click()
    await expect(page.locator('article.concept')).toHaveCount(1)
    // responder de novo, agora certo: sai da lista de erradas
    await card.getByRole('button', { name: 'Responder de novo' }).click()
    await card.locator(`[data-option="${q.answer}"]`).click()
    await expect(page.locator('article.concept')).toHaveCount(0)
  })

  test('filtro por tema mostra só as questões do tema', async ({ page }) => {
    await gotoRoute(page, ifoodSectionPath('conceitos'))
    for (const t of CONCEPT_THEMES) {
      await page.locator('.concepts-theme', { hasText: t.title }).click()
      await expect(page.locator('article.concept')).toHaveCount(CONCEPTS.filter((q) => q.theme === t.id).length)
    }
  })
})
