import { useState, useEffect, useCallback } from 'react'

const BUDGET_KEY = 'budgets_v1'

const loadBudgets = () => {
  try {
    return JSON.parse(localStorage.getItem(BUDGET_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function useBudget() {
  const [budgets, setBudgets] = useState(loadBudgets)

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets))
  }, [budgets])

  const getBudget = useCallback((year, month) => {
    return budgets[`${year}-${month}`] ?? null
  }, [budgets])

  const setBudget = useCallback((year, month, amount) => {
    setBudgets((prev) => ({ ...prev, [`${year}-${month}`]: amount }))
  }, [])

  return { getBudget, setBudget }
}
