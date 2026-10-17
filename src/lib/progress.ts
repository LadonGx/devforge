import { useSyncExternalStore } from 'react'
import type { Lang } from '../engine/types'

/** Progresso salvo no navegador (localStorage). */
export interface ProgressState {
  solved: Record<string, string> // id -> data ISO
  attempted: Record<string, true>
  lessons: Record<string, string> // id da aula -> data ISO
  code: Record<string, string> // `${problemId}:${lang}` -> código
  lang: Lang
}

const KEY = 'devforge:progress:v1'

const empty: ProgressState = { solved: {}, attempted: {}, lessons: {}, code: {}, lang: 'ts' }

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty
    return { ...empty, ...JSON.parse(raw) }
  } catch {
    return empty
  }
}

let state: ProgressState = load()
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* sem storage: segue em memória */
  }
  listeners.forEach((l) => l())
}

function update(fn: (s: ProgressState) => ProgressState) {
  state = fn(state)
  save()
}

export const progress = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  markSolved(id: string) {
    if (state.solved[id]) return
    update((s) => ({ ...s, solved: { ...s.solved, [id]: new Date().toISOString() } }))
  },
  markAttempted(id: string) {
    if (state.attempted[id]) return
    update((s) => ({ ...s, attempted: { ...s.attempted, [id]: true } }))
  },
  toggleLesson(id: string) {
    update((s) => {
      const lessons = { ...s.lessons }
      if (lessons[id]) delete lessons[id]
      else lessons[id] = new Date().toISOString()
      return { ...s, lessons }
    })
  },
  saveCode(id: string, lang: Lang, code: string) {
    update((s) => ({ ...s, code: { ...s.code, [`${id}:${lang}`]: code } }))
  },
  clearCode(id: string, lang: Lang) {
    update((s) => {
      const code = { ...s.code }
      delete code[`${id}:${lang}`]
      return { ...s, code }
    })
  },
  setLang(lang: Lang) {
    update((s) => ({ ...s, lang }))
  },
  reset() {
    state = empty
    save()
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}
