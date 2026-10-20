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

export { JS_UNITS } from './units'

export const JS_PROBLEMS: Problem[] = [
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
