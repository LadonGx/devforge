import type { Problem } from '../types'
import { containsDuplicate, validAnagram, twoSum, groupAnagrams, topKFrequent } from './problems/arraysHashing'
import { validPalindrome, twoSumII, containerWater } from './problems/twoPointers'
import { bestTimeStock, longestSubstring, charReplacement } from './problems/slidingWindow'
import { validParentheses, evalRPN, dailyTemperatures } from './problems/stack'
import { binarySearch, search2DMatrix, kokoBananas } from './problems/binarySearch'

import { reverseList, mergeTwoLists, linkedListCycle, removeNthFromEnd } from './problems/linkedList'
import { invertTree, maxDepth, levelOrder, validateBST } from './problems/trees'
import { kthLargestStream, lastStoneWeight, kClosest } from './problems/heap'
import { subsets, permutations, combinationSum } from './problems/backtracking'
import { numIslands, rottingOranges, courseSchedule } from './problems/graphs'
import { climbingStairs, houseRobber, coinChange } from './problems/dp'
import { PATTERNS as PATTERNS_1 } from './patterns'
import { PATTERNS_2 } from './patterns2'

export const PATTERNS = [...PATTERNS_1, ...PATTERNS_2]
export const patternById = (id: string) => PATTERNS.find((p) => p.id === id)

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
  reverseList,
  mergeTwoLists,
  linkedListCycle,
  removeNthFromEnd,
  invertTree,
  maxDepth,
  levelOrder,
  validateBST,
  kthLargestStream,
  lastStoneWeight,
  kClosest,
  subsets,
  permutations,
  combinationSum,
  numIslands,
  rottingOranges,
  courseSchedule,
  climbingStairs,
  houseRobber,
  coinChange,
]

export const problemById = (id: string) => PROBLEMS.find((p) => p.id === id)
