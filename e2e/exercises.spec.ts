import type { Page } from '@playwright/test'
import { test, expect, gotoRoute, readProgress } from './fixtures'
import { COURSES, problemPath } from '../src/content/courses'

/**
 * Para cada exercício de cada curso: abre a página, alterna JS/TS (par = JS, ímpar = TS),
 * cola a solução de referência no CodeMirror, roda os testes, espera "Aceito" e abre o
 * visualizador passo a passo com o código colado.
 */

/** Substitui todo o conteúdo do editor por `text` simulando um Ctrl+A + Ctrl+V real (evento `paste`). */
async function pasteIntoEditor(page: Page, text: string) {
  const content = page.locator('.problem-right .cm-content')
  await content.click()
  await page.keyboard.press('ControlOrMeta+A')
  await content.evaluate((el, t) => {
    const dt = new DataTransfer()
    dt.setData('text/plain', t)
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
  }, text)
}

for (const course of COURSES) {
  test.describe(course.title, () => {
    course.problems.forEach((problem, i) => {
      const lang = i % 2 === 0 ? 'js' : 'ts'
      const langLabel = lang === 'js' ? 'JavaScript' : 'TypeScript'

      test(`${problem.id} [${lang.toUpperCase()}]: cola a solução, é aceito e dá para visualizar`, async ({ page }) => {
        await gotoRoute(page, problemPath(course, problem.id))
        await expect(page.locator('.problem-title')).toContainText(problem.title)

        // 2. alterna a linguagem
        const toggle = page.locator('.editor-toolbar .seg').getByRole('button', { name: langLabel, exact: true })
        await toggle.click()
        await expect(toggle).toHaveClass(/active/)

        // 3. cola a solução de referência
        const solution = problem.solution[lang]
        await expect(page.locator('.problem-right .cm-content')).toBeVisible()
        await pasteIntoEditor(page, solution)
        // o app salva o código (debounce de 500 ms) em code["<id>:<lang>"]: tem que ser idêntico ao colado
        await expect
          .poll(async () => (await readProgress(page))?.code?.[`${problem.id}:${lang}`], { message: 'código salvo = código colado' })
          .toBe(solution)

        // 4. roda os testes (Ctrl+Enter com o foco no editor) e espera "Aceito"
        await page.locator('.problem-right .cm-content').focus()
        await page.keyboard.press('ControlOrMeta+Enter')
        // problemas com `perf` ainda medem o desempenho depois dos testes: "Aceito" só aparece no fim
        await expect(page.locator('.verdict-ok .verdict-title')).toHaveText('Aceito ✓', { timeout: problem.perf || problem.io ? 40_000 : 20_000 })
        await expect(page.locator('.tests')).toContainText(`${problem.tests.length}/${problem.tests.length} testes passaram`)
        await expect(page.locator('.verdict-bad, .verdict-warn')).toHaveCount(0)
        await expect.poll(async () => (await readProgress(page))?.solved?.[problem.id], { message: 'marcado como resolvido' }).toBeTruthy()

        // 5. visualização do meu código
        await page.getByRole('button', { name: 'Visualização', exact: true }).click()
        await page.getByRole('button', { name: 'Meu código', exact: true }).click()
        const count = page.locator('.viz-count')
        await expect(count).toBeVisible({ timeout: 20_000 })
        await expect(count).toHaveText(/Passo \d+ \/ \d+/)
        const total = Number(/\/\s*(\d+)/.exec((await count.textContent()) ?? '')?.[1])
        expect(total).toBeGreaterThan(1)
      })
    })
  })
}
