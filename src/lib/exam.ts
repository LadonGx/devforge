import { useSyncExternalStore } from 'react'
import type { Exam, ExamQuestion } from '../content/types'
import type { Lang, TestRun } from '../engine/types'

/* ======================= Correção (funções puras) ======================= */

export type Answer = number | string | { code: string; lang: Lang }

export type QStatus = 'right' | 'partial' | 'wrong' | 'blank' | 'pending'

export interface Graded {
  /** 0 a 1 */
  score: number
  status: QStatus
  run?: TestRun
}

export const weightOf = (q: ExamQuestion) => (q.kind === 'code' ? (q.weight ?? 2) : 1)

/** Normaliza uma linha de console digitada: espaços, aspas em volta. */
export function normalizeLine(line: string) {
  let s = line.trim().replace(/\s+/g, ' ')
  if (s.length >= 2 && (s[0] === '"' || s[0] === "'" || s[0] === '`') && s[s.length - 1] === s[0]) s = s.slice(1, -1)
  return s
}

export function outputLines(text: string) {
  return text
    .split('\n')
    .map(normalizeLine)
    .filter((l) => l !== '')
}

export function gradeOutput(expected: string[], typed: string): boolean {
  const got = outputLines(typed)
  const exp = expected.map(normalizeLine)
  return got.length === exp.length && got.every((l, i) => l === exp[i])
}

export function statusFromScore(score: number): QStatus {
  return score >= 0.999 ? 'right' : score <= 0 ? 'wrong' : 'partial'
}

/** Corrige as questões que não precisam rodar código. Código e discursivas vêm de fora. */
export function gradeSimple(q: ExamQuestion, a: Answer | undefined): Graded | null {
  if (q.kind === 'choice') {
    if (typeof a !== 'number') return { score: 0, status: 'blank' }
    return a === q.answer ? { score: 1, status: 'right' } : { score: 0, status: 'wrong' }
  }
  if (q.kind === 'output') {
    if (typeof a !== 'string' || a.trim() === '') return { score: 0, status: 'blank' }
    return gradeOutput(q.expected, a) ? { score: 1, status: 'right' } : { score: 0, status: 'wrong' }
  }
  return null
}

export function gradeEssay(q: Extract<ExamQuestion, { kind: 'essay' }>, a: Answer | undefined, check: EssayCheck | undefined): Graded {
  if (typeof a !== 'string' || a.trim() === '') return { score: 0, status: 'blank' }
  if (!check?.confirmed) return { score: 0, status: 'pending' }
  const n = check.checked.filter(Boolean).length
  const score = n / q.checklist.length
  return { score, status: statusFromScore(score) }
}

export function isAnswered(q: ExamQuestion, a: Answer | undefined) {
  if (a === undefined) return false
  if (q.kind === 'choice') return typeof a === 'number'
  if (q.kind === 'code') return typeof a === 'object' && a.code.trim() !== '' && a.code !== q.problem.starter[a.lang]
  return typeof a === 'string' && a.trim() !== ''
}

/** Nota final em 0..100 (discursivas pendentes contam como 0 até a autoavaliação). */
export function examScore(exam: Exam, graded: Record<string, Graded>) {
  let total = 0
  let got = 0
  for (const q of exam.questions) {
    const w = weightOf(q)
    total += w
    got += w * (graded[q.id]?.score ?? 0)
  }
  return total ? Math.round((got / total) * 100) : 0
}

/* ======================= Rascunho salvo no navegador ======================= */

export interface EssayCheck {
  checked: boolean[]
  confirmed: boolean
}

export interface ExamDraft {
  startedAt: number
  current: number
  answers: Record<string, Answer>
  submittedAt?: number
  /** correção das questões objetivas e de código, feita na entrega */
  graded?: Record<string, Graded>
  essays?: Record<string, EssayCheck>
  /** nota já registrada no progresso */
  saved?: boolean
}

const KEY = 'devforge:exam-drafts:v1'
type Store = Record<string, ExamDraft>

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    return {}
  }
}

let store: Store = load()
const listeners = new Set<() => void>()

function commit(next: Store) {
  store = next
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* sem storage: segue em memória */
  }
  listeners.forEach((l) => l())
}

export const drafts = {
  get: () => store,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  start(id: string) {
    commit({ ...store, [id]: { startedAt: Date.now(), current: 0, answers: {} } })
  },
  update(id: string, fn: (d: ExamDraft) => ExamDraft) {
    const d = store[id]
    if (!d) return
    commit({ ...store, [id]: fn(d) })
  },
  discard(id: string) {
    const next = { ...store }
    delete next[id]
    commit(next)
  },
}

export function useDraft(id: string): ExamDraft | undefined {
  return useSyncExternalStore(drafts.subscribe, () => store[id], () => store[id])
}
