import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { useExpenses } from './useExpenses'
import { useFixed, getFixedStatus, getInstallmentInfo } from './useFixed'
import { useBudget } from './useBudget'
import {
  CATEGORIES, getCategoryById,
  formatCurrency, formatDate, getMonthLabel,
} from './data'

const today = new Date()
const todayYear = today.getFullYear()
const todayMonth = today.getMonth()
const todayDay = today.getDate()

function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message, onUndo) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, onUndo, key: Date.now() })
    timerRef.current = setTimeout(() => setToast(null), 5000)
  }, [])

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  return { toast, showToast, dismissToast }
}

function Toast({ toast, onUndo, onDismiss }) {
  const [progress, setProgress] = useState(100)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()
    const tick = (now) => {
      const elapsed = now - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / 5000) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [toast.key])

  return (
    <div className="toast">
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-undo"
        onClick={() => {
          onUndo()
          onDismiss()
        }}
      >
        Desfazer
      </button>
      <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  )
}

function SummaryCard({ expenses, prevExpenses }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0)
  const avgPerDay = expenses.length
    ? total / new Set(expenses.map((e) => e.date)).size
    : 0

  let trendEl = null
  if (prevTotal > 0) {
    const pct = ((total - prevTotal) / prevTotal) * 100
    const sign = pct >= 0 ? '▲' : '▼'
    const cls = pct >= 0 ? 'trend-up' : 'trend-down'
    trendEl = (
      <div className={`summary-stat ${cls}`}>
        <span className="summary-stat-label">vs mês passado</span>
        <span className="summary-stat-value">{sign} {Math.abs(pct).toFixed(0)}%</span>
      </div>
    )
  } else if (total > 0 && prevTotal === 0) {
    trendEl = (
      <div className="summary-stat trend-up">
        <span className="summary-stat-label">vs mês passado</span>
        <span className="summary-stat-value">▲ novo</span>
      </div>
    )
  }

  return (
    <div className="summary-card">
      <div className="summary-total-label">Total do mês</div>
      <div className="summary-total-amount">{formatCurrency(total)}</div>
      <div className="summary-stats">
        <div className="summary-stat">
          <span className="summary-stat-label">Lançamentos</span>
          <span className="summary-stat-value">{expenses.length}</span>
        </div>
        {expenses.length > 0 && (
          <div className="summary-stat">
            <span className="summary-stat-label">Média / dia</span>
            <span className="summary-stat-value">{formatCurrency(avgPerDay)}</span>
          </div>
        )}
        {trendEl}
      </div>
    </div>
  )
}

function BudgetCard({ expenses, viewYear, viewMonth, getBudget, setBudget }) {
  const budget = getBudget(viewYear, viewMonth)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')

  const pct = budget ? Math.min((total / budget) * 100, 100) : 0
  const barColor = pct < 70 ? '#2d6a4f' : pct < 90 ? '#c47a1e' : '#c0392b'

  const handleSave = () => {
    const val = parseFloat(input)
    if (val > 0) {
      setBudget(viewYear, viewMonth, val)
    }
    setEditing(false)
  }

  if (!budget && !editing) {
    return (
      <div className="budget-card">
        <div className="budget-card-header">
          <span className="section-title">Orçamento</span>
          <button className="budget-set-btn" onClick={() => { setInput(''); setEditing(true) }}>
            Definir
          </button>
        </div>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="budget-card">
        <div className="budget-card-header">
          <span className="section-title">Orçamento</span>
          <div className="budget-edit-row">
            <input
              className="field-input budget-input"
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              min="1"
              step="0.01"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
            />
            <button className="budget-save-btn" onClick={handleSave}>Salvar</button>
            <button className="budget-cancel-btn" onClick={() => setEditing(false)}>×</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <span className="section-title">Orçamento</span>
        <button
          className="budget-set-btn"
          onClick={() => { setInput(String(budget)); setEditing(true) }}
        >
          Editar
        </button>
      </div>
      <div className="budget-amounts">
        <span className="budget-spent">{formatCurrency(total)}</span>
        <span className="budget-of">de {formatCurrency(budget)}</span>
      </div>
      <div className="budget-bar-bg">
        <div className="budget-bar" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="budget-pct" style={{ color: barColor }}>{pct.toFixed(0)}% utilizado</div>
    </div>
  )
}

function CategoryBreakdown({ expenses }) {
  if (!expenses.length) return null

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="breakdown-card">
      <div className="section-header">
        <span className="section-title">Por categoria</span>
      </div>
      <div className="breakdown-list">
        {byCategory.map((cat) => (
          <div className="breakdown-item" key={cat.id}>
            <div className="breakdown-item-header">
              <span className="breakdown-item-label">
                <span className="breakdown-item-emoji">{cat.emoji}</span>
                {cat.label}
              </span>
              <span className="breakdown-item-amount">{formatCurrency(cat.total)}</span>
            </div>
            <div className="breakdown-bar-bg">
              <div
                className="breakdown-bar"
                style={{
                  width: `${(cat.total / total) * 100}%`,
                  background: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SwipeItem({ children, onDelete }) {
  const [offset, setOffset] = useState(0)
  const [swiped, setSwiped] = useState(false)
  const contentRef = useRef(null)
  const startX = useRef(null)
  const startY = useRef(null)
  const direction = useRef(null)
  const THRESHOLD = 88

  const close = useCallback(() => { setSwiped(false); setOffset(0) }, [])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const onStart = (e) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
      direction.current = null
    }

    const onMove = (e) => {
      if (startX.current === null) return
      const dx = startX.current - e.touches[0].clientX
      const dy = Math.abs(startY.current - e.touches[0].clientY)
      if (direction.current === null) {
        direction.current = Math.abs(dx) > dy ? 'h' : 'v'
      }
      if (direction.current !== 'h') return
      e.preventDefault()
      if (dx > 0) setOffset(Math.min(dx, THRESHOLD + 16))
      else if (dx < -10) { setSwiped(false); setOffset(0) }
    }

    const onEnd = () => {
      setOffset((prev) => {
        if (prev >= THRESHOLD) { setSwiped(true); return THRESHOLD }
        setSwiped(false); return 0
      })
      startX.current = null
      direction.current = null
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [])

  return (
    <div className="swipe-wrapper">
      <div className="swipe-actions" style={{ opacity: offset > 0 ? 1 : 0 }}>
        <button className="swipe-action-delete" onClick={() => { close(); onDelete() }}>
          Remover
        </button>
      </div>
      <div
        ref={contentRef}
        className="swipe-content"
        style={{ transform: `translateX(-${offset}px)` }}
        onClick={swiped ? close : undefined}
      >
        {children}
      </div>
    </div>
  )
}

function ExpenseList({ expenses, onDelete, onEdit, filter }) {
  const filtered = filter === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filter)

  if (!filtered.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌿</div>
        <div className="empty-title">Nenhum gasto aqui</div>
        <div className="empty-subtitle">
          {filter === 'all'
            ? 'Arraste para a esquerda para remover. Toque + para adicionar.'
            : 'Sem gastos nessa categoria neste mês.'}
        </div>
      </div>
    )
  }

  return (
    <div className="expense-list">
      {filtered.map((expense, i) => {
        const cat = getCategoryById(expense.category)
        return (
          <SwipeItem
            key={expense.id}
            onDelete={() => onDelete(expense.id)}
          >
            <div
              className="expense-item"
              style={{ animationDelay: `${i * 30}ms`, cursor: 'pointer' }}
              onClick={() => onEdit(expense)}
            >
              <div className="expense-icon" style={{ background: cat.color + '18' }}>
                {cat.emoji}
              </div>
              <div className="expense-info">
                <div className="expense-name">{expense.name}</div>
                <div className="expense-meta">
                  <span>{cat.label}</span>
                  <span className="expense-meta-dot" />
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>
              <div className="expense-amount">{formatCurrency(expense.amount)}</div>
            </div>
          </SwipeItem>
        )
      })}
    </div>
  )
}

function AddModal({ onClose, onAdd, expense }) {
  const isEditing = !!expense
  const [name, setName] = useState(expense?.name ?? '')
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : '')
  const [category, setCategory] = useState(expense?.category ?? 'food')
  const [date, setDate] = useState(expense?.date ?? today.toISOString().slice(0, 10))

  const canSubmit = name.trim() && parseFloat(amount) > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onAdd({ name: name.trim(), amount: parseFloat(amount), category, date })
    onClose()
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <span className="modal-handle" />
        <div className="modal-title">{isEditing ? 'Editar gasto' : 'Novo gasto'}</div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Descrição</label>
            <input
              className="field-input"
              placeholder="Ex: Almoço, Uber, Mercado…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={60}
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Valor (R$)</label>
              <input
                className="field-input field-input-amount"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Data</label>
              <input
                className="field-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today.toISOString().slice(0, 10)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Categoria</label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-option${category === cat.id ? ' selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={category === cat.id ? { borderColor: cat.color, background: cat.color + '18', color: cat.color } : {}}
                >
                  <span className="category-option-emoji">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={!canSubmit}>
            {isEditing ? 'Salvar alterações' : 'Adicionar gasto'}
          </button>
        </form>
      </div>
    </div>
  )
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function AddFixedModal({ onClose, onAdd, item }) {
  const isEditing = !!item
  const [name, setName] = useState(item?.name ?? '')
  const [amount, setAmount] = useState(item?.amount ? String(item.amount) : '')
  const [dueDay, setDueDay] = useState(item?.dueDay ? String(item.dueDay) : '1')
  const [category, setCategory] = useState(item?.category ?? 'home')
  const [hasInstallments, setHasInstallments] = useState(!!(item?.installments))
  const [installmentCount, setInstallmentCount] = useState(item?.installments ? String(item.installments) : '12')
  const defaultStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const [startMonthValue, setStartMonthValue] = useState(
    item?.installmentStart
      ? `${item.installmentStart.year}-${String(item.installmentStart.month + 1).padStart(2, '0')}`
      : defaultStart
  )

  const parsedCount = parseInt(installmentCount)
  const endPreview = (() => {
    if (!hasInstallments || parsedCount < 2) return null
    const [sy, sm] = startMonthValue.split('-').map(Number)
    const endIdx = (sy * 12 + (sm - 1)) + parsedCount - 1
    return getMonthLabel(Math.floor(endIdx / 12), endIdx % 12)
  })()

  const canSubmit = name.trim() && parseFloat(amount) > 0 && parseInt(dueDay) >= 1 && parseInt(dueDay) <= 31
    && (!hasInstallments || (parsedCount >= 2 && parsedCount <= 120))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const data = { name: name.trim(), amount: parseFloat(amount), dueDay: parseInt(dueDay), category }
    if (hasInstallments) {
      const [sy, sm] = startMonthValue.split('-').map(Number)
      data.installments = parsedCount
      data.installmentStart = { year: sy, month: sm - 1 }
    } else {
      data.installments = null
      data.installmentStart = null
    }
    onAdd(data)
    onClose()
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <span className="modal-handle" />
        <div className="modal-title">{isEditing ? 'Editar despesa fixa' : 'Nova despesa fixa'}</div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Descrição</label>
            <input
              className="field-input"
              placeholder="Ex: Aluguel, Internet, Netflix…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={60}
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Valor (R$)</label>
              <input
                className="field-input field-input-amount"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Dia de vencimento</label>
              <input
                className="field-input"
                type="number"
                inputMode="numeric"
                placeholder="1-31"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Tipo</label>
            <div className="segment-control">
              <button
                type="button"
                className={`segment-btn${!hasInstallments ? ' segment-active' : ''}`}
                onClick={() => setHasInstallments(false)}
              >
                Recorrente
              </button>
              <button
                type="button"
                className={`segment-btn${hasInstallments ? ' segment-active' : ''}`}
                onClick={() => setHasInstallments(true)}
              >
                Parcelado
              </button>
            </div>
          </div>

          {hasInstallments && (
            <>
              <div className="form-row">
                <div className="field">
                  <label className="field-label">Nº de parcelas</label>
                  <input
                    className="field-input"
                    type="number"
                    inputMode="numeric"
                    placeholder="ex: 12"
                    min="2"
                    max="120"
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Início</label>
                  <select
                    className="field-input"
                    value={startMonthValue}
                    onChange={(e) => setStartMonthValue(e.target.value)}
                  >
                    {Array.from({ length: 49 }, (_, i) => {
                      const idx = (today.getFullYear() - 2) * 12 + today.getMonth() + i
                      const y = Math.floor(idx / 12)
                      const m = idx % 12
                      const val = `${y}-${String(m + 1).padStart(2, '0')}`
                      return <option key={val} value={val}>{MONTHS_PT[m]} {y}</option>
                    })}
                  </select>
                </div>
              </div>
              {endPreview && (
                <div className="installment-preview">
                  Total: {formatCurrency(parseFloat(amount) * parsedCount || 0)} em {parsedCount}x · término em {endPreview}
                </div>
              )}
            </>
          )}

          <div className="field">
            <label className="field-label">Categoria</label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-option${category === cat.id ? ' selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={category === cat.id ? { borderColor: cat.color, background: cat.color + '18', color: cat.color } : {}}
                >
                  <span className="category-option-emoji">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={!canSubmit}>
            {isEditing ? 'Salvar alterações' : 'Adicionar despesa fixa'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FixedSummary({ fixedExpenses, payments, viewYear, viewMonth }) {
  if (!fixedExpenses.length) return null
  const activeItems = fixedExpenses.filter((f) => {
    if (!f.installments || !f.installmentStart) return true
    return getInstallmentInfo(f, viewYear, viewMonth)?.active
  })
  if (!activeItems.length) return null
  const total = activeItems.reduce((s, f) => s + f.amount, 0)
  const paidItems = activeItems.filter((f) => payments[`${f.id}-${viewYear}-${viewMonth}`])
  const paid = paidItems.reduce((s, f) => s + f.amount, 0)
  const open = total - paid
  const pct = total > 0 ? (paid / total) * 100 : 0
  const allPaid = paidItems.length === activeItems.length

  return (
    <div className={`fixed-summary${allPaid ? ' fixed-summary-done' : ''}`}>
      <div className="fixed-summary-top">
        <div className="fixed-summary-open-block">
          <span className="fixed-summary-open-label">Em aberto</span>
          <span className="fixed-summary-open-amount">{formatCurrency(open)}</span>
        </div>
        <div className="fixed-summary-badge">
          {paidItems.length}/{activeItems.length} pagas
        </div>
      </div>

      <div className="fixed-summary-bar-bg">
        <div className="fixed-summary-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="fixed-summary-bottom">
        <div className="fixed-summary-stat">
          <span className="fixed-summary-stat-dot fixed-summary-stat-dot-paid" />
          <span className="fixed-summary-stat-label">Pago</span>
          <span className="fixed-summary-stat-val fixed-summary-stat-paid">{formatCurrency(paid)}</span>
        </div>
        <div className="fixed-summary-stat">
          <span className="fixed-summary-stat-dot fixed-summary-stat-dot-total" />
          <span className="fixed-summary-stat-label">Total fixo</span>
          <span className="fixed-summary-stat-val">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, dueDay }) {
  if (status === 'paid') return <span className="badge badge-paid">✓ Paga</span>
  if (status === 'done') return <span className="badge badge-done">Concluída</span>
  if (status === 'not-started') return <span className="badge badge-upcoming">Em breve</span>
  if (status === 'overdue') return <span className="badge badge-overdue">Vencida</span>
  if (status === 'due-today') return <span className="badge badge-due-today">Vence hoje</span>
  return <span className="badge badge-upcoming">Dia {dueDay}</span>
}

function FixedList({ fixedExpenses, payments, viewYear, viewMonth, onTogglePaid, onDelete, onEdit }) {
  if (!fixedExpenses.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <div className="empty-title">Sem despesas fixas</div>
        <div className="empty-subtitle">Arraste para a esquerda para remover. Toque + para adicionar.</div>
      </div>
    )
  }

  return (
    <div className="expense-list">
      {fixedExpenses.map((item, i) => {
        const cat = getCategoryById(item.category)
        const status = getFixedStatus(item, payments, viewYear, viewMonth)
        const paid = status === 'paid'
        const inactive = status === 'done' || status === 'not-started'
        const info = getInstallmentInfo(item, viewYear, viewMonth)
        return (
          <SwipeItem
            key={item.id}
            onDelete={() => onDelete(item)}
          >
            <div
              className={`expense-item fixed-item${inactive ? ' fixed-item-inactive' : ''}`}
              style={{ animationDelay: `${i * 30}ms`, cursor: 'pointer' }}
              onClick={() => onEdit(item)}
            >
              <div className="expense-icon" style={{ background: cat.color + '18' }}>
                {cat.emoji}
              </div>
              <div className="expense-info">
                <div className="expense-name">{item.name}</div>
                <div className="expense-meta">
                  <span>{cat.label}</span>
                  {info && (
                    <>
                      <span className="expense-meta-dot" />
                      <span className={`installment-pill${info.done ? ' installment-pill-done' : ''}`}>
                        {info.done ? 'Quitada' : `${Math.max(1, info.current)}ª/${info.total}`}
                      </span>
                    </>
                  )}
                  <span className="expense-meta-dot" />
                  <StatusBadge status={status} dueDay={item.dueDay} />
                </div>
              </div>
              <div className="fixed-item-right">
                <div className="expense-amount">{formatCurrency(item.amount)}</div>
                {!inactive && (
                  <button
                    className={`fixed-check-btn${paid ? ' fixed-check-btn-paid' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onTogglePaid(item) }}
                    aria-label={paid ? 'Desmarcar como pago' : 'Marcar como pago'}
                  >
                    {paid && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </SwipeItem>
        )
      })}
    </div>
  )
}

function InstallmentDetailRows({ item, payments, onTogglePaid, onNavigate }) {
  const startIdx = item.installmentStart.year * 12 + item.installmentStart.month
  return (
    <div className="installments-detail">
      {Array.from({ length: item.installments }, (_, i) => {
        const monthAbs = startIdx + i
        const iYear = Math.floor(monthAbs / 12)
        const iMonth = monthAbs % 12
        const isPaidEntry = !!payments[`${item.id}-${iYear}-${iMonth}`]
        const now = new Date()
        const detailStatus = isPaidEntry ? 'paid' : (() => {
          if (iYear > now.getFullYear() || (iYear === now.getFullYear() && iMonth > now.getMonth())) return 'upcoming'
          if (iYear === now.getFullYear() && iMonth === now.getMonth()) {
            if (now.getDate() === item.dueDay) return 'due-today'
            if (now.getDate() > item.dueDay) return 'overdue'
            return 'upcoming'
          }
          return 'overdue'
        })()
        const monthLabel = new Date(iYear, iMonth, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        return (
          <div
            key={i}
            className={`detail-row${isPaidEntry ? ' detail-row-paid' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate(iYear, iMonth)}
          >
            <span className="detail-num">{i + 1}ª</span>
            <span className="detail-month">{monthLabel}</span>
            <StatusBadge status={detailStatus} dueDay={item.dueDay} />
            <button
              className={`detail-check-btn${isPaidEntry ? ' detail-check-btn-paid' : ''}`}
              onClick={(e) => { e.stopPropagation(); onTogglePaid(item, iYear, iMonth) }}
              aria-label={isPaidEntry ? 'Desmarcar como pago' : 'Marcar como pago'}
            >
              {isPaidEntry && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function InstallmentsCard({ fixedExpenses, payments, viewYear, viewMonth, onTogglePaid, onDeleteFixed, onNavigate }) {
  const [expanded, setExpanded] = useState(null)
  const items = fixedExpenses.filter((f) => f.installments && f.installmentStart)
  if (!items.length) return null

  const monthlyTotal = items.reduce((s, f) => {
    const info = getInstallmentInfo(f, viewYear, viewMonth)
    return info?.active ? s + f.amount : s
  }, 0)

  const totalDebt = items.reduce((s, f) => {
    const info = getInstallmentInfo(f, viewYear, viewMonth)
    if (!info || info.done) return s
    const viewIdx = viewYear * 12 + viewMonth
    const startIdx = f.installmentStart.year * 12 + f.installmentStart.month
    const fromIdx = Math.max(viewIdx, startIdx)
    const endIdx = startIdx + info.total - 1
    return s + Math.max(0, endIdx - fromIdx + 1) * f.amount
  }, 0)

  const activeCount = items.filter((f) => getInstallmentInfo(f, viewYear, viewMonth)?.active).length

  return (
    <div className="installments-card">
      <div className="installments-card-header">
        <span className="section-title">Parcelas</span>
        <span className="installments-card-badge">{activeCount} em andamento</span>
      </div>

      <div className="installments-stats-row">
        <div className="installments-stat">
          <span className="installments-stat-label">Este mês</span>
          <span className="installments-stat-value">{formatCurrency(monthlyTotal)}</span>
        </div>
        <div className="installments-stat">
          <span className="installments-stat-label">Dívida restante</span>
          <span className="installments-stat-value">{formatCurrency(totalDebt)}</span>
        </div>
      </div>

      <div className="installments-item-list">
        {items.map((item) => {
          const info = getInstallmentInfo(item, viewYear, viewMonth)
          const cat = getCategoryById(item.category)
          const startIdx = item.installmentStart.year * 12 + item.installmentStart.month
          const paidCount = Array.from({ length: info.total }, (_, i) => {
            const monthAbs = startIdx + i
            return payments[`${item.id}-${Math.floor(monthAbs / 12)}-${monthAbs % 12}`] ? 1 : 0
          }).reduce((a, b) => a + b, 0)
          const pct = Math.min(100, (paidCount / info.total) * 100)

          const viewIdx = viewYear * 12 + viewMonth
          const fromIdx = Math.max(viewIdx, startIdx)
          const endIdx = startIdx + info.total - 1
          const remainingCount = Math.max(0, endIdx - fromIdx + 1)
          const remainingAmount = remainingCount * item.amount
          const isExpanded = expanded === item.id

          return (
            <div key={item.id}>
              <div
                className={`installments-item${info.done ? ' installments-item-done' : ''}`}
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="installments-item-top">
                  <div className="installments-item-icon" style={{ background: cat.color + '18' }}>
                    {cat.emoji}
                  </div>
                  <span className="installments-item-name">{item.name}</span>
                  <div className="installments-item-right">
                    <span className="installments-item-fraction">
                      {info.done ? '✓' : info.notStarted ? '—' : `${paidCount}/${info.total} pagas`}
                    </span>
                    <span className="installments-item-amount">{formatCurrency(item.amount)}/mês</span>
                  </div>
                  <span className="installments-chevron">{isExpanded ? '▲' : '▼'}</span>
                </div>
                <div className="installments-progress-bg">
                  <div
                    className={`installments-progress-bar${info.done ? ' installments-progress-done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="installments-item-footer">
                  {info.done
                    ? <span>Quitada</span>
                    : info.notStarted
                      ? <span>Inicia em {getMonthLabel(item.installmentStart.year, item.installmentStart.month)}</span>
                      : <span>{remainingCount}x restantes</span>
                  }
                  {!info.done && <span className="installments-item-remaining">{formatCurrency(remainingAmount)}</span>}
                </div>
              </div>
              {isExpanded && (
                <>
                  <InstallmentDetailRows
                    item={item}
                    payments={payments}
                    onTogglePaid={onTogglePaid}
                    onNavigate={onNavigate}
                  />
                  <button
                    className="installments-delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDeleteFixed(item) }}
                  >
                    Excluir parcelamento
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function MonthPicker({ viewYear, viewMonth, onSelect, onClose }) {
  const [pickerYear, setPickerYear] = useState(viewYear)
  return (
    <div className="month-picker-overlay" onClick={onClose}>
      <div className="month-picker" onClick={(e) => e.stopPropagation()}>
        <div className="month-picker-year-nav">
          <button className="month-nav-btn" onClick={() => setPickerYear((y) => y - 1)}>‹</button>
          <span className="month-picker-year">{pickerYear}</span>
          <button className="month-nav-btn" onClick={() => setPickerYear((y) => y + 1)}>›</button>
        </div>
        <div className="month-picker-grid">
          {MONTHS_SHORT.map((label, m) => {
            const isSelected = pickerYear === viewYear && m === viewMonth
            return (
              <button
                key={m}
                className={`month-picker-btn${isSelected ? ' month-picker-btn-active' : ''}`}
                onClick={() => { onSelect(pickerYear, m); onClose() }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AlertBanner({ fixedExpenses, payments, viewYear, viewMonth }) {
  const overdueItems = []
  const dueTodayItems = []

  fixedExpenses.forEach((item) => {
    const status = getFixedStatus(item, payments, viewYear, viewMonth)
    if (status === 'overdue') overdueItems.push(item)
    else if (status === 'due-today') dueTodayItems.push(item)
  })

  if (!overdueItems.length && !dueTodayItems.length) return null

  const isOverdue = overdueItems.length > 0
  const items = isOverdue ? overdueItems : dueTodayItems
  const names = items.map((i) => i.name).join(', ')
  const msg = items.length === 1
    ? isOverdue ? `${names} está vencida` : `${names} irá vencer hoje`
    : isOverdue ? `${names} estão vencidas` : `${names} irão vencer hoje`

  return (
    <div className={`alert-banner ${isOverdue ? 'alert-overdue' : 'alert-due-today'}`}>
      <span className="alert-icon">{isOverdue ? '⚠️' : '🔔'}</span>
      <span className="alert-text">{msg}</span>
    </div>
  )
}

export default function App() {
  const { expenses, addExpense, removeExpense, updateExpense } = useExpenses()
  const { fixedExpenses, payments, addFixed, removeFixed, updateFixed, markPaid, unmarkPaid, isPaid, getPaidExpenseId } = useFixed()
  const { getBudget, setBudget } = useBudget()
  const { toast, showToast, dismissToast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [showFixedModal, setShowFixedModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingFixed, setEditingFixed] = useState(null)
  const [filter, setFilter] = useState('all')
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [activeTab, setActiveTab] = useState('lancamentos')
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const handleMonthSelect = useCallback((year, month) => {
    setViewYear(year)
    setViewMonth(month)
  }, [])

  useEffect(() => {
    const asked = localStorage.getItem('notif_asked')
    if (!asked && 'Notification' in window) {
      localStorage.setItem('notif_asked', '1')
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          fireNotifications()
        }
      })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      fireNotifications()
    }
  }, [])

  const fireNotifications = () => {
    const currentPayments = (() => {
      try { return JSON.parse(localStorage.getItem('fixed_payments_v1') ?? '{}') } catch { return {} }
    })()
    const currentFixed = (() => {
      try { return JSON.parse(localStorage.getItem('fixed_v1') ?? '[]') } catch { return [] }
    })()
    currentFixed.forEach((item) => {
      const status = getFixedStatus(item, currentPayments, todayYear, todayMonth)
      if (status === 'due-today' || status === 'overdue') {
        const label = status === 'due-today' ? 'vence hoje' : 'está vencida'
        new Notification('Gastos — despesa fixa', { body: `${item.name} ${label}` })
      }
    })
  }

  const monthExpenses = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date + 'T12:00:00')
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    }),
    [expenses, viewMonth, viewYear]
  )

  const prevMonthExpenses = useMemo(() => {
    const pm = viewMonth === 0 ? 11 : viewMonth - 1
    const py = viewMonth === 0 ? viewYear - 1 : viewYear
    return expenses.filter((e) => {
      const d = new Date(e.date + 'T12:00:00')
      return d.getMonth() === pm && d.getFullYear() === py
    })
  }, [expenses, viewMonth, viewYear])

  const categoriesInUse = useMemo(() => {
    const ids = new Set(monthExpenses.map((e) => e.category))
    return CATEGORIES.filter((c) => ids.has(c.id))
  }, [monthExpenses])

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const goForward = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const handleDeleteExpense = useCallback((id) => {
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return
    removeExpense(id)
    showToast('Gasto removido', () => {
      addExpense(expense)
    })
  }, [expenses, removeExpense, addExpense, showToast])

  const handleDeleteFixed = useCallback((item) => {
    removeFixed(item.id)
    showToast('Despesa fixa removida', () => {
      addFixed(item)
    })
  }, [removeFixed, addFixed, showToast])

  const handleEditExpense = useCallback((expense) => {
    setEditingExpense(expense)
  }, [])

  const handleSaveExpense = useCallback((updates) => {
    updateExpense(editingExpense.id, updates)
    setEditingExpense(null)
  }, [updateExpense, editingExpense])

  const handleEditFixed = useCallback((item) => {
    setEditingFixed(item)
  }, [])

  const handleSaveFixed = useCallback((updates) => {
    updateFixed(editingFixed.id, updates)
    setEditingFixed(null)
  }, [updateFixed, editingFixed])

  const handleTogglePaid = useCallback((item, year, month) => {
    if (isPaid(item.id, year, month)) {
      const expenseId = getPaidExpenseId(item.id, year, month)
      const existingExpense = expenseId ? expenses.find((e) => e.id === expenseId) : null
      unmarkPaid(item.id, year, month)
      if (expenseId) removeExpense(expenseId)
      showToast('Pagamento desfeito', () => {
        markPaid(item.id, year, month, expenseId)
        if (existingExpense) addExpense(existingExpense)
      })
    } else {
      const maxDay = new Date(year, month + 1, 0).getDate()
      const day = Math.min(item.dueDay, maxDay)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const expenseId = crypto.randomUUID()
      const expenseData = {
        id: expenseId,
        createdAt: new Date().toISOString(),
        name: item.name,
        amount: item.amount,
        category: item.category,
        date: dateStr,
      }
      markPaid(item.id, year, month, expenseId)
      addExpense(expenseData)
      showToast('Marcado como pago', () => {
        unmarkPaid(item.id, year, month)
        removeExpense(expenseId)
      })
    }
  }, [isPaid, getPaidExpenseId, expenses, markPaid, unmarkPaid, addExpense, removeExpense, showToast])

  return (
    <>
      <main className="app">
        <div className="header">
          <span className="header-label">Finanças</span>
        </div>

        <div className="month-nav">
          <button className="month-nav-btn" onClick={goBack}>‹</button>
          <button className="month-nav-label-btn" onClick={() => setShowMonthPicker(true)}>
            {getMonthLabel(viewYear, viewMonth)}
            <span className="month-nav-chevron">▾</span>
          </button>
          <button className="month-nav-btn" onClick={goForward}>›</button>
        </div>

        <AlertBanner
          fixedExpenses={fixedExpenses}
          payments={payments}
          viewYear={viewYear}
          viewMonth={viewMonth}
        />

        <div className="tab-nav">
          <button
            className={`tab-btn${activeTab === 'lancamentos' ? ' tab-active' : ''}`}
            onClick={() => setActiveTab('lancamentos')}
          >
            Lançamentos
          </button>
          <button
            className={`tab-btn${activeTab === 'fixas' ? ' tab-active' : ''}`}
            onClick={() => setActiveTab('fixas')}
          >
            Fixas
          </button>
        </div>

        {activeTab === 'lancamentos' && (
          <>
            <SummaryCard expenses={monthExpenses} prevExpenses={prevMonthExpenses} />

            <BudgetCard
              expenses={monthExpenses}
              viewYear={viewYear}
              viewMonth={viewMonth}
              getBudget={getBudget}
              setBudget={setBudget}
            />

            {monthExpenses.length > 0 && (
              <div className="filter-bar">
                <button
                  className={`filter-chip${filter === 'all' ? ' active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Todos
                </button>
                {categoriesInUse.map((cat) => (
                  <button
                    key={cat.id}
                    className={`filter-chip${filter === cat.id ? ' active' : ''}`}
                    onClick={() => setFilter(cat.id)}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            )}

            <CategoryBreakdown expenses={monthExpenses} />

            <div className="section-header" style={{ marginTop: 4 }}>
              <span className="section-title">Lançamentos</span>
            </div>

            <ExpenseList
              expenses={monthExpenses}
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
              filter={filter}
            />
          </>
        )}

        {activeTab === 'fixas' && (
          <>
            <FixedSummary
              fixedExpenses={fixedExpenses}
              payments={payments}
              viewYear={viewYear}
              viewMonth={viewMonth}
            />

            <InstallmentsCard
              fixedExpenses={fixedExpenses}
              payments={payments}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onTogglePaid={handleTogglePaid}
              onDeleteFixed={handleDeleteFixed}
              onNavigate={handleMonthSelect}
            />

            <div className="section-header" style={{ marginTop: 4 }}>
              <span className="section-title">Despesas Fixas</span>
            </div>

            <FixedList
              fixedExpenses={fixedExpenses}
              payments={payments}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onTogglePaid={(item) => handleTogglePaid(item, viewYear, viewMonth)}
              onDelete={handleDeleteFixed}
              onEdit={handleEditFixed}
            />
          </>
        )}
      </main>

      <button
        className="fab"
        onClick={() => activeTab === 'fixas' ? setShowFixedModal(true) : setShowModal(true)}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar
      </button>

      {showMonthPicker && (
        <MonthPicker
          viewYear={viewYear}
          viewMonth={viewMonth}
          onSelect={handleMonthSelect}
          onClose={() => setShowMonthPicker(false)}
        />
      )}

      {showModal && (
        <AddModal onClose={() => setShowModal(false)} onAdd={addExpense} />
      )}

      {editingExpense && (
        <AddModal
          onClose={() => setEditingExpense(null)}
          onAdd={handleSaveExpense}
          expense={editingExpense}
        />
      )}

      {showFixedModal && (
        <AddFixedModal onClose={() => setShowFixedModal(false)} onAdd={addFixed} />
      )}

      {editingFixed && (
        <AddFixedModal
          onClose={() => setEditingFixed(null)}
          onAdd={handleSaveFixed}
          item={editingFixed}
        />
      )}

      {toast && (
        <Toast
          toast={toast}
          onUndo={toast.onUndo}
          onDismiss={dismissToast}
        />
      )}
    </>
  )
}
