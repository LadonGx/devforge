import { MODULES } from '../content/modules'
import { COURSES, courseById, courseOfProblem, lessonKey, problemPath, unitPath } from '../content/courses'
import type { Course, Pattern, TrailStep } from '../content/types'
import type { ProgressState } from './progress'

export function unitProgress(c: Course, p: Pattern, s: ProgressState) {
  const solved = p.problems.filter((id) => s.solved[id]).length
  const lessonDone = !!s.lessons[lessonKey(c, p.id)]
  const total = p.problems.length + 1
  const done = solved + (lessonDone ? 1 : 0)
  return { solved, total: p.problems.length, lessonDone, pct: Math.round((done / total) * 100), complete: done === total, started: done > 0 }
}

export function moduleProgress(moduleId: string, s: ProgressState) {
  const c = courseById(moduleId)
  if (!c || c.units.length === 0) return { pct: 0, done: 0, items: 0 }
  const items = c.problems.length + c.units.length
  const done = c.problems.filter((p) => s.solved[p.id]).length + c.units.filter((u) => s.lessons[lessonKey(c, u.id)]).length
  return { pct: Math.round((done / items) * 100), done, items }
}

export type StepStatus = 'done' | 'progress' | 'todo' | 'soon'

export function stepStatus(step: TrailStep, s: ProgressState): StepStatus {
  const mod = MODULES.find((m) => m.id === step.module)
  if (!mod || mod.status === 'soon') return 'soon'
  const c = courseById(step.module)
  if (c && step.ref) {
    const u = c.units.find((x) => x.id === step.ref)
    if (!u) return 'todo'
    const pr = unitProgress(c, u, s)
    return pr.complete ? 'done' : pr.started ? 'progress' : 'todo'
  }
  const mp = moduleProgress(step.module, s)
  return mp.pct === 100 ? 'done' : mp.pct > 0 ? 'progress' : 'todo'
}

export function stepRoute(step: TrailStep): string {
  const c = courseById(step.module)
  if (c) return step.ref ? unitPath(c, step.ref) : c.basePath
  const mod = MODULES.find((m) => m.id === step.module)
  return mod?.route || `/modulo/${step.module}`
}

export interface NextAction {
  label: string
  detail: string
  to: string
  course?: string
}

/** Próxima coisa a fazer num curso: aula não lida ou primeiro exercício não resolvido. */
export function nextInCourse(c: Course, s: ProgressState): NextAction | null {
  for (const u of c.units) {
    const pr = unitProgress(c, u, s)
    if (pr.complete) continue
    if (!pr.lessonDone) return { label: `${c.unitLabel}: ${u.title}`, detail: u.short, to: unitPath(c, u.id), course: c.title }
    const next = u.problems.find((id) => !s.solved[id])
    const prob = c.problems.find((x) => x.id === next)
    if (prob) return { label: prob.title, detail: `${u.title} · ${prob.difficulty}`, to: problemPath(c, prob.id), course: c.title }
  }
  return null
}

/** Sugestão da vitrine: continua o curso com a atividade mais recente (ou começa pelos fundamentos). */
export function nextAction(s: ProgressState): NextAction {
  let latest: { at: string; course: string } | null = null
  for (const [id, at] of Object.entries(s.solved)) {
    const c = courseOfProblem(id)
    if (c && (!latest || at > latest.at)) latest = { at, course: c.id }
  }
  for (const [key, at] of Object.entries(s.lessons)) {
    const cid = key.split(':')[0]
    if (courseById(cid) && (!latest || at > latest.at)) latest = { at, course: cid }
  }
  const order = latest ? [courseById(latest.course)!, ...COURSES.filter((c) => c.id !== latest!.course)] : COURSES
  for (const c of order) {
    const n = nextInCourse(c, s)
    if (n) return n
  }
  return { label: 'Tudo concluído por aqui!', detail: 'Novos módulos chegam em breve.', to: '/' }
}
