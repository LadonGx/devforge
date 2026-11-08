import { test, expect, gotoRoute, pasteIntoEditor, PROGRESS_KEY } from './fixtures'
import { IFOOD } from '../src/content/ifood'
import { RAG_PROBLEM_LIST } from '../src/content/ifood/problems'
import { problemPath, unitPath } from '../src/content/courses'

const GROQ_KEY = 'gsk_teste_e2e_1234567890'

test.describe('seção 2 · RAG', () => {
  test('a seção mostra as aulas, o laboratório e os exercícios', async ({ page }) => {
    await gotoRoute(page, '/ifood/rag')
    await expect(page.locator('.ifood-lesson')).toHaveCount(2)
    await expect(page.locator('.raglab')).toBeVisible()
    await expect(page.locator('.practice-item')).toHaveCount(RAG_PROBLEM_LIST.length)
  })

  test('laboratório: responde citando o trecho e recusa quando não está no documento', async ({ page }) => {
    await gotoRoute(page, '/ifood/rag')
    const lab = page.locator('.raglab')
    const extractive = lab.locator('.raglab-answer').first().locator('.raglab-response')

    await lab.getByRole('button', { name: 'Em quanto tempo o reembolso cai no Pix?' }).click()
    await expect(extractive).toContainText('1 hora')
    await expect(extractive).toContainText(/\[\d+\]/)
    // o prompt leva os trechos numerados e a pergunta no fim
    await expect(lab.locator('.raglab-step').nth(3)).toContainText('Pergunta: Em quanto tempo o reembolso cai no Pix?')

    await lab.getByRole('button', { name: 'Qual o horário de atendimento do suporte?' }).click()
    await expect(extractive).toHaveText('Não encontrei essa informação no contexto.')
    await expect(lab.locator('.raglab-warn')).toContainText('abaixo do limiar')
    await expect(lab.locator('.raglab-step').nth(3)).toContainText('(vazio)')
  })

  test('laboratório: tamanho do chunk e overlap mudam os chunks', async ({ page }) => {
    await gotoRoute(page, '/ifood/rag')
    const chunks = page.locator('.raglab-chunk')
    const before = await chunks.count()
    await page.getByLabel('Tamanho do chunk').fill('10')
    await expect.poll(() => chunks.count()).toBeGreaterThan(before)
    await page.getByLabel('Overlap').fill('0')
    await expect(page.locator('.raglab-overlap')).toHaveCount(0)
  })

  test('Groq (mock): a chave fica só no localStorage próprio, a resposta é conferida e dá para esquecer a chave', async ({ page }) => {
    let auth = ''
    let body: { model?: string; messages?: { content: string }[] } = {}
    await page.route('https://api.groq.com/openai/v1/chat/completions', async (route) => {
      auth = route.request().headers()['authorization'] ?? ''
      body = route.request().postDataJSON()
      await route.fulfill({
        json: { choices: [{ message: { content: '```json\n{"reasoning": "Usei o trecho [3].", "response": "No Pix, cai em até 1 hora [3]."}\n```' } }] },
      })
    })
    await gotoRoute(page, '/ifood/rag')
    const lab = page.locator('.raglab')
    await lab.getByRole('button', { name: 'Em quanto tempo o reembolso cai no Pix?' }).click()
    await lab.getByLabel('Chave do Groq').fill(GROQ_KEY)
    await lab.getByRole('button', { name: 'Salvar neste navegador' }).click()
    await expect(lab.locator('.raglab-groq')).toContainText('gsk_')
    await expect(lab.locator('.raglab-groq')).not.toContainText(GROQ_KEY)

    await lab.getByRole('button', { name: 'Gerar resposta com o Groq' }).click()
    const card = lab.locator('.raglab-groq .raglab-answer')
    await expect(card.locator('.raglab-response')).toHaveText('No Pix, cai em até 1 hora [3].')
    await expect(card.locator('.rag-checks .is-ok')).toHaveCount(3)
    expect(auth).toBe(`Bearer ${GROQ_KEY}`)
    expect(body.messages?.at(-1)?.content).toContain('Pergunta: Em quanto tempo o reembolso cai no Pix?')

    // a chave não vai para o progresso (que pode ser exportado)
    const progress = await page.evaluate((k) => localStorage.getItem(k) ?? '', PROGRESS_KEY)
    expect(progress).not.toContain(GROQ_KEY)

    await lab.getByRole('button', { name: 'Esquecer a chave' }).click()
    await expect(lab.getByLabel('Chave do Groq')).toBeVisible()
    const stored = await page.evaluate(() => Object.values(localStorage).join('\n'))
    expect(stored).not.toContain(GROQ_KEY)
  })

  test('Groq (mock): erro da API aparece como aviso, sem quebrar a página', async ({ page }) => {
    await page.route('https://api.groq.com/openai/v1/chat/completions', (route) =>
      route.fulfill({ status: 401, json: { error: { message: 'Invalid API Key' } } }),
    )
    await gotoRoute(page, '/ifood/rag')
    const lab = page.locator('.raglab')
    await lab.getByLabel('Chave do Groq').fill('gsk_errada')
    await lab.getByRole('button', { name: 'Salvar neste navegador' }).click()
    await lab.getByRole('button', { name: 'Gerar resposta com o Groq' }).click()
    await expect(lab.locator('.raglab-groq .callout-warn')).toContainText('Invalid API Key')
    await expect(lab.locator('.raglab-groq .callout-warn')).toContainText('confira a chave')
  })

  test('a aula do pipeline tem o laboratório', async ({ page }) => {
    await gotoRoute(page, unitPath(IFOOD, 'rag-pipeline'))
    await expect(page.locator('.raglab')).toBeVisible()
  })
  test('exercício no formato HackerRank: os critérios aparecem no caso que falhou e a referência é aceita', async ({ page }) => {
    const p = RAG_PROBLEM_LIST.find((e) => e.problem.id === 'ifood-rag-answer')!.problem
    expect(p.compare).toBe('rag')
    await gotoRoute(page, problemPath(IFOOD, p.id))
    await page.locator('.editor-toolbar .seg').getByRole('button', { name: 'JavaScript', exact: true }).click()

    // sempre recusa: passa nos casos sem resposta e reprova nos que tinham resposta
    await pasteIntoEditor(
      page,
      ['function answerQuestion(input) {', "  return { reasoning: 'nada', response: 'Não encontrei essa informação no contexto.' }", '}'].join('\n'),
    )
    await page.locator('.problem-right .cm-content').focus()
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(page.locator('.verdict-bad')).toBeVisible()
    const open = page.locator('.case.open')
    await expect(open.locator('.io-title', { hasText: 'Critérios da avaliação' })).toBeVisible()
    await expect(open.locator('.rag-checks .is-bad')).not.toHaveCount(0)
    await expect(open.locator('.rag-checks')).toContainText('Não recusa quando a resposta está no contexto')

    await pasteIntoEditor(page, p.solution.js)
    await page.locator('.problem-right .cm-content').focus()
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(page.locator('.verdict-ok .verdict-title')).toHaveText('Aceito ✓', { timeout: 40_000 })
  })
})
