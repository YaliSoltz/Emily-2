'use client'

import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeMediaQuery(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }
}

const subscribeReducedMotion = subscribeMediaQuery(REDUCED_MOTION_QUERY)
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches

/**
 * Tracks the user's reduced-motion preference.
 * Server-renders as `false` so markup matches, then corrects on hydration.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
}

interface NetworkInformation extends EventTarget {
  saveData?: boolean
  effectiveType?: string
}

function connection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection
}

function subscribeConnection(onChange: () => void) {
  const conn = connection()
  if (!conn) return () => {}
  conn.addEventListener('change', onChange)
  return () => conn.removeEventListener('change', onChange)
}

function getSavesData(): boolean {
  const conn = connection()
  if (!conn) return false
  return Boolean(conn.saveData) || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g'
}

/**
 * True when the browser reports Data Saver or a 2G-class connection.
 * Used to skip autoplaying video and fall back to its poster frame.
 */
export function useSavesData(): boolean {
  return useSyncExternalStore(subscribeConnection, getSavesData, () => false)
}
