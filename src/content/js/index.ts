import type { Problem } from '../types'
import { getType, sumNumeric, sameValue, createCounter, once, memoize, calculator, myBind } from './problems1'
import {
  myMap,
  myReduce,
  groupBy,
  orderSummary,
  deepClone,
  deepEqual,
  updateImmutable,
  uniqueBy,
  wordFrequency,
  intersection,
  getCity,
  mergeSettings,
  summarize,
} from './problems2'

import { CORE_UNITS } from './units'
import { BASICO_UNITS } from './units-basico'
import { BASICO_PROBLEMS } from './problems-basico'
import { EXTRA_UNITS } from './units-extra'
import { EXTRA_PROBLEMS } from './problems-extra'
import { ENRICH } from './units-enrich'

const ORDER = [
  // Parte 1 · Primeiros passos
  'variaveis',
  'condicionais',
  'loops',
  'funcoes',
  'strings',
  // Parte 2 · Trabalhando com dados
  'arrays',
  'arrays-metodos',
  'objetos',
  'map-set',
  // Parte 3 · Como o JavaScript pensa
  'tipos-coercao',
  'escopo-closures',
  'this-funcoes',
  'objetos-referencias',
  'sintaxe-moderna',
  // Parte 4 · Indo além
  'classes',
  'erros',
  'recursao',
]
const ALL_UNITS = [...BASICO_UNITS, ...EXTRA_UNITS, ...CORE_UNITS]
export const JS_UNITS = ORDER.map((id) => {
  const u = ALL_UNITS.find((x) => x.id === id)
  if (!u) throw new Error('Aula não encontrada: ' + id)
  const extra = ENRICH[id]
  return extra ? { ...u, lesson: [...extra.before, ...u.lesson, ...extra.after] } : u
})

/** id da aula → título da parte que começa nela */
export const JS_PARTS: Record<string, string> = {
  variaveis: 'Parte 1 · Primeiros passos',
  arrays: 'Parte 2 · Trabalhando com dados',
  'tipos-coercao': 'Parte 3 · Como o JavaScript pensa',
  classes: 'Parte 4 · Indo além',
}

export const JS_PROBLEMS: Problem[] = [
  ...BASICO_PROBLEMS,
  ...EXTRA_PROBLEMS,
  getType,
  sumNumeric,
  sameValue,
  createCounter,
  once,
  memoize,
  calculator,
  myBind,
  myMap,
  myReduce,
  groupBy,
  orderSummary,
  deepClone,
  deepEqual,
  updateImmutable,
  uniqueBy,
  wordFrequency,
  intersection,
  getCity,
  mergeSettings,
  summarize,
]
