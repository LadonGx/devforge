import { test, expect, gotoRoute } from './fixtures'
import { COURSES, unitPath } from '../src/content/courses'

/** Cada aula carrega e todos os demos (blocos `demo`) renderizam o visualizador com passos. */
for (const course of COURSES) {
  test.describe(`aulas · ${course.id}`, () => {
    for (const unit of course.units) {
      test(unit.id, async ({ page }) => {
        const expected = unit.lesson.filter((b) => b.type === 'demo').length
        await gotoRoute(page, unitPath(course, unit.id))
        await expect(page.getByRole('heading', { level: 1, name: unit.title })).toBeVisible()

        const demos = page.locator('.demo')
        await expect(demos).toHaveCount(expected)
        for (let i = 0; i < expected; i++) {
          const demo = demos.nth(i)
          await demo.scrollIntoViewIfNeeded()
          await expect(demo.locator('.viz'), `demo ${i + 1} sem visualizador`).toBeVisible()
          const count = (await demo.locator('.viz-count').first().innerText()).trim()
          const total = Number(count.match(/\/\s*(\d+)/)?.[1] ?? 0)
          expect(total, `demo ${i + 1} ("${count}") sem passos`).toBeGreaterThan(0)
        }
      })
    }
  })
}
