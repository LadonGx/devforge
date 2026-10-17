import type { Difficulty } from '../content/types'

const CLS: Record<Difficulty, string> = { Fácil: 'badge-easy', Médio: 'badge-medium', Difícil: 'badge-hard' }

export function DifficultyBadge({ d }: { d: Difficulty }) {
  return <span className={'badge ' + CLS[d]}>{d}</span>
}
