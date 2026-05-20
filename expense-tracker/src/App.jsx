import { useState, useMemo } from 'react'
import './App.css'
import { useExpenses } from './useExpenses'
import {
  CATEGORIES, getCategoryById,
  formatCurrency, formatDate, getMonthLabel,
} from './data'

const today = new Date()

function SummaryCard({ expenses, month, year }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const avgPerDay = expenses.length
    ? total / new Set(expenses.map((e) => e.date)).size
    : 0

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
      </div>
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

function ExpenseList({ expenses, onDelete, filter }) {
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
            ? 'Toque no botão + para registrar seu primeiro gasto.'
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
          <div
            className="expense-item"
            key={expense.id}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div
              className="expense-icon"
              style={{ background: cat.color + '18' }}
            >
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
            <button
              className="expense-delete"
              onClick={() => onDelete(expense.id)}
              title="Remover"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function AddModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [date, setDate] = useState(today.toISOString().slice(0, 10))

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
        <div className="modal-title">Novo gasto</div>
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
            Adicionar gasto
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const { expenses, addExpense, removeExpense } = useExpenses()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const monthExpenses = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date + 'T12:00:00')
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    }),
    [expenses, viewMonth, viewYear]
  )

  const categoriesInUse = useMemo(() => {
    const ids = new Set(monthExpenses.map((e) => e.category))
    return CATEGORIES.filter((c) => ids.has(c.id))
  }, [monthExpenses])

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const goForward = () => {
    const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()
    if (isCurrentMonth) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()

  return (
    <>
      <main className="app">
        <div className="header">
          <span className="header-label">Finanças</span>
        </div>

        <div className="month-nav">
          <button className="month-nav-btn" onClick={goBack}>‹</button>
          <span className="month-nav-label">{getMonthLabel(viewYear, viewMonth)}</span>
          <button
            className="month-nav-btn"
            onClick={goForward}
            disabled={isCurrentMonth}
            style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
          >
            ›
          </button>
        </div>

        <SummaryCard expenses={monthExpenses} month={viewMonth} year={viewYear} />

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
          onDelete={removeExpense}
          filter={filter}
        />
      </main>

      <button className="fab" onClick={() => setShowModal(true)}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar
      </button>

      {showModal && (
        <AddModal onClose={() => setShowModal(false)} onAdd={addExpense} />
      )}
    </>
  )
}
