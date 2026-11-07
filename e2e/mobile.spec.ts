import { test, expect, gotoRoute } from './fixtures'
import { COURSES, problemPath, unitPath } from '../src/content/courses'
import { EXAMS } from '../src/content/exams'

const WIDTH = 390

const routes = [
  '/',
  '/guia',
  '/trilhas',
  '/provas',
  `/prova/${EXAMS[0].id}`,
  ...COURSES.flatMap((c) => [c.basePath, unitPath(c, c.units[0].id), problemPath(c, c.problems[0].id)]),
]

test.use({ viewport: { width: WIDTH, height: 844 }, isMobile: true, hasTouch: true })

/** Celular: nenhuma rota principal pode ter rolagem horizontal. */
for (const route of routes) {
  test(`sem rolagem horizontal em ${WIDTH}px · ${route}`, async ({ page }) => {
    await gotoRoute(page, route)
    await expect(page.locator('h1').first()).toBeVisible()
    await page.waitForLoadState('networkidle')
    const { scrollWidth, culprits } = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const culprits = [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((el) => el.getBoundingClientRect().right > vw + 1)
        .filter((el) => !el.parentElement || el.parentElement.getBoundingClientRect().right <= vw + 1)
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (right=${Math.round(el.getBoundingClientRect().right)})`)
      return { scrollWidth: document.documentElement.scrollWidth, culprits }
    })
    expect(scrollWidth, `scrollWidth ${scrollWidth} > ${WIDTH}; elementos que vazam: ${culprits.join(', ')}`).toBeLessThanOrEqual(WIDTH)
  })
}
