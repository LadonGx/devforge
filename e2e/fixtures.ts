import { test as base, expect, type Page } from '@playwright/test'

/**
 * `page` com duas garantias extras em todos os testes:
 * - no navegador do autor, scrollTo/scrollIntoView retornam Promise (isso já causou
 *   tela preta num useEffect sem chaves); o init script reproduz esse comportamento;
 * - o teste falha se a página disparar `pageerror` ou `console.error`.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      // erro HTTP da API do Groq (chave inválida, limite) é esperado e aparece na tela como aviso
      if (m.location().url.startsWith('https://api.groq.com/') && m.text().startsWith('Failed to load resource')) return
      errors.push(`console.error: ${m.text()}`)
    })
    await page.addInitScript(() => {
      const wrap = (obj: object, name: string) => {
        const target = obj as Record<string, unknown>
        const orig = target[name] as ((...a: unknown[]) => unknown) | undefined
        if (typeof orig !== 'function') return
        target[name] = function (this: unknown, ...args: unknown[]) {
          orig.apply(this, args)
          return Promise.resolve()
        }
      }
      wrap(window, 'scrollTo')
      wrap(window, 'scroll')
      wrap(window, 'scrollBy')
      wrap(Element.prototype, 'scrollTo')
      wrap(Element.prototype, 'scrollBy')
      wrap(Element.prototype, 'scrollIntoView')
    })
    await provide(page)
    expect(errors, 'erros no navegador (pageerror / console.error)').toEqual([])
  },
})

export { expect }

/** O app usa HashRouter: as rotas ficam depois do `#`. */
export async function gotoRoute(page: Page, route: string) {
  await page.goto('/#' + route)
  await expect(page.locator('main.page, main.page-wide').first()).toBeVisible()
}

/** Progresso salvo no navegador (mesma chave de src/lib/progress.ts). */
export const PROGRESS_KEY = 'devforge:progress:v1'
export const readProgress = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), PROGRESS_KEY)

/** Substitui todo o conteúdo do editor por `text` simulando um Ctrl+A + Ctrl+V real (evento `paste`). */
export async function pasteIntoEditor(page: Page, text: string) {
  const content = page.locator('.problem-right .cm-content')
  await content.click()
  await page.keyboard.press('ControlOrMeta+A')
  await content.evaluate((el, t) => {
    const dt = new DataTransfer()
    dt.setData('text/plain', t)
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
  }, text)
}
