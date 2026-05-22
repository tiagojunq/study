import { useEffect, useState } from 'react'
import { getActiveTheme, toggleTheme } from '../lib/theme.js'

export default function ThemeToggle() {
  const [theme, setLocalTheme] = useState(() =>
    typeof document !== 'undefined' ? getActiveTheme() : 'light',
  )

  useEffect(() => {
    setLocalTheme(getActiveTheme())
  }, [])

  const onClick = () => {
    setLocalTheme(toggleTheme())
  }

  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
