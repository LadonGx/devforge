import { test, expect, gotoRoute } from './fixtures'
import { COURSES } from '../src/content/courses'
import { EXAMS } from '../src/content/exams'

test('conteúdo importável e vitrine carrega', async ({ page }) => {
  expect(COURSES.length).toBeGreaterThan(0)
  expect(EXAMS.length).toBeGreaterThan(0)
  await gotoRoute(page, '/')
  await expect(page.getByRole('heading', { name: 'Sua vitrine de estudos' })).toBeVisible()
})
