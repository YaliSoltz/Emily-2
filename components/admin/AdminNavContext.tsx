'use client'

import { createContext, useContext, useCallback, useRef, ReactNode } from 'react'

interface AdminNavContextValue {
  registerNavigateAway: (fn: ((href: string) => boolean) | null) => void
  requestNavigate: (href: string) => boolean
}

const AdminNavContext = createContext<AdminNavContextValue>({
  registerNavigateAway: () => {},
  requestNavigate: () => true,
})

export function useAdminNav() {
  return useContext(AdminNavContext)
}

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((href: string) => boolean) | null>(null)

  const registerNavigateAway = useCallback((fn: ((href: string) => boolean) | null) => {
    handlerRef.current = fn
  }, [])

  const requestNavigate = useCallback((href: string): boolean => {
    return handlerRef.current ? handlerRef.current(href) : true
  }, [])

  return (
    <AdminNavContext.Provider value={{ registerNavigateAway, requestNavigate }}>
      {children}
    </AdminNavContext.Provider>
  )
}
