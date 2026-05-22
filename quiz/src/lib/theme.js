// Theme is applied to <html> via data-theme. The initial value is set by an
// inline script in index.html (before React mounts) to avoid a flash of the
// wrong theme on page load.

const STORAGE_KEY = 'quiz-theme'

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function getActiveTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function toggleTheme() {
  const next = getActiveTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
