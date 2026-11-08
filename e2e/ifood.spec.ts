import { test, expect, gotoRoute, pasteIntoEditor, readProgress } from './fixtures'
import { IFOOD, IFOOD_SECTIONS, ifoodSectionPath } from '../src/content/ifood'
import { CONCEPTS, CONCEPT_THEMES } from '../src/content/ifood/concepts'
import { IFOOD_PROBLEMS } from '../src/content/ifood/problems'
import { problemPath } from '../src/content/courses'

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
    // o card da seção no hub soma questões e aulas (as aulas ainda não foram marcadas)
    const lessons = IFOOD_SECTIONS.find((x) => x.id === 'conceitos')!.lessons.filter((l) => IFOOD.units.some((u) => u.id === l)).length
    await gotoRoute(page, IFOOD.basePath)
    await expect(page.locator('.ifood-section-card', { hasText: 'Conceitos' })).toContainText(`${CONCEPTS.length}/${CONCEPTS.length + lessons}`)
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

test.describe('seção 1 · problemas', () => {
  test('a seção mostra a aula e os problemas em ordem', async ({ page }) => {
    await gotoRoute(page, ifoodSectionPath('problemas'))
    await expect(page.locator('.ifood-lesson')).toHaveCount(1)
    await expect(page.locator('.ifood-problems .practice-item')).toHaveCount(IFOOD_PROBLEMS.length)
    await page.locator('.ifood-problems .practice-item').first().click()
    await expect(page.locator('.problem-title')).toContainText(IFOOD_PROBLEMS[0].title)
    await expect(page.getByRole('heading', { name: 'Formato de entrada' })).toBeVisible()
    await expect(page.locator('.problem-head')).toContainText('testes ocultos')
  })

  test('testes ocultos: só mostram se passaram, e dá para revelar o que falhou', async ({ page }) => {
    const p = IFOOD_PROBLEMS[0]
    const hidden = p.tests.filter((t) => t.hidden).length
    await gotoRoute(page, problemPath(IFOOD, p.id))
    await page.locator('.editor-toolbar .seg').getByRole('button', { name: 'JavaScript', exact: true }).click()

    // antes de rodar: os ocultos aparecem com cadeado e sem a entrada
    await expect(page.locator('.case-pending', { hasText: 'entrada oculta' })).toHaveCount(hidden)

    // uma solução errada: os ocultos falham, mas sem mostrar entrada nem esperado
    await pasteIntoEditor(page, `function ${p.fnName}() {\n  return null\n}`)
    await page.locator('.problem-right .cm-content').focus()
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(page.locator('.verdict-bad')).toContainText(`ocultos 0/${hidden}`)
    const locked = page.locator('.case-locked')
    await expect(locked).toHaveCount(hidden)
    await expect(locked.first().locator('.io-section')).toHaveCount(0)
    await locked.first().getByRole('button', { name: 'Revelar para estudar' }).click()
    await expect(page.locator('.case.open')).toContainText('Caso oculto revelado')
    await expect(page.locator('.case-locked')).toHaveCount(hidden - 1)

    // a solução de referência passa em tudo, com o placar separado
    await pasteIntoEditor(page, p.solution.js)
    await page.locator('.problem-right .cm-content').focus()
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(page.locator('.verdict-ok .verdict-title')).toHaveText('Aceito ✓', { timeout: 40_000 })
    await expect(page.locator('.verdict-ok')).toContainText(`ocultos ${hidden}/${hidden}`)
  })
})
