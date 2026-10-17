import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'
const KEY = 'devforge:theme'

function initial(): Theme {
  try {
    const t = localStorage.getItem(KEY)
    if (t === 'dark' || t === 'light') return t
  } catch {
    /* noop */
  }
  return 'dark'
}

let theme: Theme = initial()
document.documentElement.dataset.theme = theme
const listeners = new Set<() => void>()

export function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l())
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => theme,
  )
}
