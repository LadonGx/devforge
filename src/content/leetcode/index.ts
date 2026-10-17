import type { Problem } from '../types'
import { containsDuplicate, validAnagram, twoSum, groupAnagrams, topKFrequent } from './problems/arraysHashing'
import { validPalindrome, twoSumII, containerWater } from './problems/twoPointers'
import { bestTimeStock, longestSubstring, charReplacement } from './problems/slidingWindow'
import { validParentheses, evalRPN, dailyTemperatures } from './problems/stack'
import { binarySearch, search2DMatrix, kokoBananas } from './problems/binarySearch'

export { PATTERNS, patternById } from './patterns'

export const PROBLEMS: Problem[] = [
  containsDuplicate,
  validAnagram,
  twoSum,
  groupAnagrams,
  topKFrequent,
  validPalindrome,
  twoSumII,
  containerWater,
  bestTimeStock,
  longestSubstring,
  charReplacement,
  validParentheses,
  evalRPN,
  dailyTemperatures,
  binarySearch,
  search2DMatrix,
  kokoBananas,
]

export const problemById = (id: string) => PROBLEMS.find((p) => p.id === id)
