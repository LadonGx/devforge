import { MODULES } from '../content/modules'
import { PATTERNS, PROBLEMS } from '../content/leetcode'
import type { Pattern, TrailStep } from '../content/types'
import type { ProgressState } from './progress'

export const lessonKey = (patternId: string) => `leetcode:${patternId}`

export function patternProgress(p: Pattern, s: ProgressState) {
  const solved = p.problems.filter((id) => s.solved[id]).length
  const lessonDone = !!s.lessons[lessonKey(p.id)]
  const total = p.problems.length + 1
  const done = solved + (lessonDone ? 1 : 0)
  return { solved, total: p.problems.length, lessonDone, pct: Math.round((done / total) * 100), complete: done === total, started: done > 0 }
}

export function moduleProgress(moduleId: string, s: ProgressState) {
  if (moduleId === 'leetcode') {
    const items = PROBLEMS.length + PATTERNS.length
    const done = PROBLEMS.filter((p) => s.solved[p.id]).length + PATTERNS.filter((p) => s.lessons[lessonKey(p.id)]).length
    return { pct: Math.round((done / items) * 100), done, items }
  }
  return { pct: 0, done: 0, items: 0 }
}

export type StepStatus = 'done' | 'progress' | 'todo' | 'soon'

export function stepStatus(step: TrailStep, s: ProgressState): StepStatus {
  const mod = MODULES.find((m) => m.id === step.module)
  if (!mod || mod.status === 'soon') return 'soon'
  if (step.module === 'leetcode' && step.ref) {
    const p = PATTERNS.find((x) => x.id === step.ref)
    if (!p) return 'todo'
    const pr = patternProgress(p, s)
    return pr.complete ? 'done' : pr.started ? 'progress' : 'todo'
  }
  const mp = moduleProgress(step.module, s)
  return mp.pct === 100 ? 'done' : mp.pct > 0 ? 'progress' : 'todo'
}

export function stepRoute(step: TrailStep): string {
  if (step.module === 'leetcode') return step.ref ? `/leetcode/padrao/${step.ref}` : '/leetcode'
  const mod = MODULES.find((m) => m.id === step.module)
  return mod?.route || `/modulo/${step.module}`
}

/** Próxima coisa a fazer: o primeiro problema não resolvido do primeiro padrão incompleto. */
export function nextAction(s: ProgressState): { label: string; detail: string; to: string } {
  for (const p of PATTERNS) {
    const pr = patternProgress(p, s)
    if (pr.complete) continue
    if (!pr.lessonDone) return { label: `Aula: ${p.title}`, detail: p.short, to: `/leetcode/padrao/${p.id}` }
    const next = p.problems.find((id) => !s.solved[id])
    const prob = PROBLEMS.find((x) => x.id === next)
    if (prob) return { label: prob.title, detail: `${p.title} · ${prob.difficulty}`, to: `/leetcode/p/${prob.id}` }
  }
  return { label: 'Tudo concluído por aqui!', detail: 'Novos módulos chegam em breve.', to: '/leetcode' }
}
