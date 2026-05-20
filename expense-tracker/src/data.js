export const CATEGORIES = [
  { id: 'food',      label: 'Comida',    emoji: '🍔', color: '#e07c3a' },
  { id: 'transport', label: 'Transporte',emoji: '🚗', color: '#3a7ce0' },
  { id: 'health',   label: 'Saúde',     emoji: '💊', color: '#e03a6b' },
  { id: 'shopping', label: 'Compras',   emoji: '🛍️', color: '#9b3ae0' },
  { id: 'home',     label: 'Casa',      emoji: '🏠', color: '#3ab8e0' },
  { id: 'leisure',  label: 'Lazer',     emoji: '🎮', color: '#3ae07a' },
  { id: 'edu',      label: 'Educação',  emoji: '📚', color: '#e0c93a' },
  { id: 'other',    label: 'Outro',     emoji: '💡', color: '#a0a0a0' },
]

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]

export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const formatDate = (iso) => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export const getMonthLabel = (year, month) =>
  new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
