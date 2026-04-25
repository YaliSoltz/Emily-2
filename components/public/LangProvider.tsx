'use client'

import { createContext, useContext, useState } from 'react'

type Lang = 'he' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'he', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'he'
    const stored = localStorage.getItem('lang')
    if (stored === 'he' || stored === 'en') return stored as Lang
    return 'he'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr'
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
