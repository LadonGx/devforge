import { STAGES, checkKey, type GuideStage, type GuideStep } from '../content/guide'
import { courseById, unitPath } from '../content/courses'
import { examById } from '../content/exams'
import { MODULES } from '../content/modules'
import type { ProgressState } from './progress'
import { unitProgress } from './stats'

/** pending = prova feita, mas abaixo da nota mínima (não bloqueia o guia) */
export type GuideStatus = 'done' | 'progress' | 'todo' | 'pending' | 'soon'

export interface StepInfo {
  status: GuideStatus
  title: string
  /** etiqueta curta do tipo: JS, Async, LeetCode, Prova... */
  tag: string
  tagClass: string
  detail?: string
  to?: string
  /** "3/4 exercícios", "melhor nota 82%"... */
  meta?: string
}

const COURSE_TAG: Record<string, { tag: string; cls: string }> = {
  'js-fundamentos': { tag: 'JavaScript', cls: 'tag-js' },
  'js-async': { tag: 'Async', cls: 'tag-async' },
  leetcode: { tag: 'LeetCode', cls: 'tag-lc' },
}

export function stepInfo(step: GuideStep, s: ProgressState): StepInfo {
  switch (step.kind) {
    case 'unit': {
      const c = courseById(step.course)
      const u = c?.units.find((x) => x.id === step.unit)
      const t = COURSE_TAG[step.course] ?? { tag: step.course, cls: '' }
      if (!c || !u) return { status: 'soon', title: step.unit, tag: t.tag, tagClass: t.cls }
      const pr = unitProgress(c, u, s)
      return {
        status: pr.complete ? 'done' : pr.started ? 'progress' : 'todo',
        title: u.title,
        tag: t.tag,
        tagClass: t.cls,
        detail: step.why ?? u.short,
        to: unitPath(c, u.id),
        meta: `${pr.lessonDone ? 'aula ✓' : 'aula'} · ${pr.solved}/${pr.total} exercícios`,
      }
    }
    case 'exam': {
      const e = examById(step.exam)
      if (!e) return { status: 'soon', title: 'Prova', tag: 'Prova', tagClass: 'tag-exam' }
      const rec = s.exams[e.id]
      return {
        status: rec ? (rec.passed ? 'done' : 'pending') : 'todo',
        title: e.title,
        tag: 'Prova',
        tagClass: 'tag-exam',
        detail: `${e.questions.length} questões · ~${e.minutes} min · mínimo ${e.passPct}%`,
        to: '/prova/' + e.id,
        meta: rec ? `melhor nota ${rec.best}%${rec.passed ? '' : ' · refaça quando quiser'}` : 'não feita',
      }
    }
    case 'soon': {
      const m = MODULES.find((x) => x.id === step.module)
      return {
        status: 'soon',
        title: step.label,
        tag: 'Em breve',
        tagClass: 'tag-soon',
        detail: step.why ?? (step.label.startsWith('Prova') ? 'Chega junto com os módulos da etapa.' : m?.summary),
        to: m ? `/modulo/${m.id}` : undefined,
      }
    }
    case 'check':
      return {
        status: s.lessons[checkKey(step.id)] ? 'done' : 'todo',
        title: step.label,
        tag: 'Checklist',
        tagClass: 'tag-check',
        detail: step.why,
      }
  }
}

export function stageProgress(stage: GuideStage, s: ProgressState) {
  const infos = stage.steps.map((st) => stepInfo(st, s))
  const active = infos.filter((i) => i.status !== 'soon')
  const done = active.filter((i) => i.status === 'done').length
  return { infos, done, total: active.length, complete: active.length > 0 && done === active.length, hasSoon: infos.some((i) => i.status === 'soon') }
}

export function guideProgress(s: ProgressState) {
  let done = 0
  let total = 0
  for (const st of STAGES) {
    const p = stageProgress(st, s)
    done += p.done
    total += p.total
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

/** Próximo passo do guia: o primeiro que não foi feito (provas reprovadas não bloqueiam). */
export function nextGuideStep(s: ProgressState): { stage: GuideStage; info: StepInfo } | null {
  for (const stage of STAGES) {
    for (const step of stage.steps) {
      const info = stepInfo(step, s)
      if ((info.status === 'todo' || info.status === 'progress') && info.to) return { stage, info }
    }
  }
  return null
}
