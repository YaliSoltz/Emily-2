'use client'

import { createContext, useContext, useCallback, useRef, useState, ReactNode } from 'react'

interface AdminNavContextValue {
  registerNavigateAway: (fn: ((href: string) => boolean) | null) => void
  requestNavigate: (href: string) => boolean
  mobileTitle: string
  setMobileTitle: (title: string) => void
}

const AdminNavContext = createContext<AdminNavContextValue>({
  registerNavigateAway: () => {},
  requestNavigate: () => true,
  mobileTitle: '',
  setMobileTitle: () => {},
})

export function useAdminNav() {
  return useContext(AdminNavContext)
}

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((href: string) => boolean) | null>(null)
  const [mobileTitle, setMobileTitle] = useState('')

  const registerNavigateAway = useCallback((fn: ((href: string) => boolean) | null) => {
    handlerRef.current = fn
  }, [])

  const requestNavigate = useCallback((href: string): boolean => {
    return handlerRef.current ? handlerRef.current(href) : true
  }, [])

  return (
    <AdminNavContext.Provider value={{ registerNavigateAway, requestNavigate, mobileTitle, setMobileTitle }}>
      {children}
    </AdminNavContext.Provider>
  )
}
