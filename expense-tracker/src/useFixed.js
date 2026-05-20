import { useState, useEffect, useCallback } from 'react'

const FIXED_KEY = 'fixed_v1'
const PAYMENTS_KEY = 'fixed_payments_v1'

const loadFixed = () => {
  try { return JSON.parse(localStorage.getItem(FIXED_KEY) ?? '[]') } catch { return [] }
}

const loadPayments = () => {
  try { return JSON.parse(localStorage.getItem(PAYMENTS_KEY) ?? '{}') } catch { return {} }
}

export function getFixedStatus(item, payments, year, month) {
  const today = new Date()
  const key = `${item.id}-${year}-${month}`
  if (payments[key]) return 'paid'

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  if (isCurrentMonth) {
    if (today.getDate() === item.dueDay) return 'due-today'
    if (today.getDate() > item.dueDay) return 'overdue'
    return 'upcoming'
  }

  const viewDate = new Date(year, month, 1)
  const nowDate = new Date(today.getFullYear(), today.getMonth(), 1)
  return viewDate < nowDate ? 'overdue' : 'upcoming'
}

export function useFixed() {
  const [fixedExpenses, setFixedExpenses] = useState(loadFixed)
  const [payments, setPayments] = useState(loadPayments)

  useEffect(() => { localStorage.setItem(FIXED_KEY, JSON.stringify(fixedExpenses)) }, [fixedExpenses])
  useEffect(() => { localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments)) }, [payments])

  const addFixed = useCallback((item) => {
    const newItem = { ...item, id: item.id ?? crypto.randomUUID() }
    setFixedExpenses((prev) => [...prev, newItem])
    return newItem
  }, [])

  const removeFixed = useCallback((id) => {
    setFixedExpenses((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const updateFixed = useCallback((id, updates) => {
    setFixedExpenses((prev) => prev.map((f) => f.id === id ? { ...f, ...updates } : f))
  }, [])

  // payments[key] stores the expense id that was auto-added, for undo support
  const markPaid = useCallback((fixedId, year, month, expenseId) => {
    setPayments((prev) => ({ ...prev, [`${fixedId}-${year}-${month}`]: expenseId }))
  }, [])

  const unmarkPaid = useCallback((fixedId, year, month) => {
    setPayments((prev) => {
      const next = { ...prev }
      delete next[`${fixedId}-${year}-${month}`]
      return next
    })
  }, [])

  const isPaid = useCallback((fixedId, year, month) => {
    return !!payments[`${fixedId}-${year}-${month}`]
  }, [payments])

  const getPaidExpenseId = useCallback((fixedId, year, month) => {
    const val = payments[`${fixedId}-${year}-${month}`]
    return val && val !== true ? val : null
  }, [payments])

  return { fixedExpenses, payments, addFixed, removeFixed, updateFixed, markPaid, unmarkPaid, isPaid, getPaidExpenseId }
}
