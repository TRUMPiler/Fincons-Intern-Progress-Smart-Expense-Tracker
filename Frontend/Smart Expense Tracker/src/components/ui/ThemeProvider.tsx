import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    const PRIME_REACT_VERSION = '10.9.7' // match package.json; used for CDN fallback
    const getThemeHref = (applied: "light" | "dark") => {
      // using lara theme family as before
      const themeName = applied === "dark" ? 'lara-dark-blue' : 'lara-light-blue'
      return `https://unpkg.com/primereact@${PRIME_REACT_VERSION}/resources/themes/${themeName}/theme.css`
    }

    const applyTheme = (applied: "light" | "dark") => {
      root.classList.add(applied)

      const linkId = 'primereact-theme'
      let link = document.getElementById(linkId) as HTMLLinkElement | null
      const href = getThemeHref(applied)

      if (!link) {
        link = document.createElement('link')
        link.rel = 'stylesheet'
        link.id = linkId
        link.href = href
        document.head.appendChild(link)
      } else if (link.getAttribute('href') !== href) {
        link.setAttribute('href', href)
      }
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    if (theme === 'system') {
      const systemTheme: "light" | "dark" = mq.matches ? 'dark' : 'light'
      applyTheme(systemTheme)

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')

      if (mq.addEventListener) mq.addEventListener('change', listener)
      else mq.addListener(listener)

      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', listener)
        else mq.removeListener(listener)
      }
    }

    applyTheme(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}