import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'expenses_v1'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  }, [expenses])

  const addExpense = useCallback((expense) => {
    setExpenses((prev) => [
      { ...expense, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const removeExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { expenses, addExpense, removeExpense }
}
