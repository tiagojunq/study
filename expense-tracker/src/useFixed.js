import { useState, useEffect, useCallback } from 'react'

const FIXED_KEY = 'fixed_v1'
const PAYMENTS_KEY = 'fixed_payments_v1'

const loadFixed = () => {
  try {
    return JSON.parse(localStorage.getItem(FIXED_KEY) ?? '[]')
  } catch {
    return []
  }
}

const loadPayments = () => {
  try {
    return JSON.parse(localStorage.getItem(PAYMENTS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function getFixedStatus(item, payments, year, month) {
  const today = new Date()
  const todayDay = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()
  const key = `${item.id}-${year}-${month}`

  if (payments[key]) return 'paid'

  const isCurrentViewMonth = year === todayYear && month === todayMonth

  if (isCurrentViewMonth) {
    if (todayDay === item.dueDay) return 'due-today'
    if (todayDay > item.dueDay) return 'overdue'
    return 'upcoming'
  }

  const viewDate = new Date(year, month, 1)
  const currentDate = new Date(todayYear, todayMonth, 1)
  if (viewDate < currentDate) return 'overdue'

  return 'upcoming'
}

export function useFixed() {
  const [fixedExpenses, setFixedExpenses] = useState(loadFixed)
  const [payments, setPayments] = useState(loadPayments)

  useEffect(() => {
    localStorage.setItem(FIXED_KEY, JSON.stringify(fixedExpenses))
  }, [fixedExpenses])

  useEffect(() => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments))
  }, [payments])

  const addFixed = useCallback((item) => {
    const newItem = { ...item, id: crypto.randomUUID() }
    setFixedExpenses((prev) => [...prev, newItem])
    return newItem
  }, [])

  const removeFixed = useCallback((id) => {
    setFixedExpenses((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const updateFixed = useCallback((id, updates) => {
    setFixedExpenses((prev) => prev.map((f) => f.id === id ? { ...f, ...updates } : f))
  }, [])

  const markPaid = useCallback((fixedId, year, month) => {
    const key = `${fixedId}-${year}-${month}`
    setPayments((prev) => ({ ...prev, [key]: true }))
  }, [])

  const unmarkPaid = useCallback((fixedId, year, month) => {
    const key = `${fixedId}-${year}-${month}`
    setPayments((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const isPaid = useCallback((fixedId, year, month) => {
    return !!payments[`${fixedId}-${year}-${month}`]
  }, [payments])

  return { fixedExpenses, payments, addFixed, removeFixed, updateFixed, markPaid, unmarkPaid, isPaid }
}
