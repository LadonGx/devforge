import type { Problem } from '../types'
import { sleep, predictOrder, promisify, after, postTitles, promiseAll, dashboard, retry, allSettled, withTimeout, mapLimit, debounce } from './problems'

export { ASYNC_UNITS } from './units'

export const ASYNC_PROBLEMS: Problem[] = [
  sleep,
  predictOrder,
  promisify,
  after,
  postTitles,
  promiseAll,
  dashboard,
  retry,
  allSettled,
  withTimeout,
  mapLimit,
  debounce,
]
