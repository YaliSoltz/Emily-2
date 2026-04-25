'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'he' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'he', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'he' || stored === 'en') setLangState(stored)
  }, [])

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
