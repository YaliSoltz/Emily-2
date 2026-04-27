'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useLang } from './LangProvider'

/* ── Types ─────────────────────────────────────────────────── */
type TextSize = 0 | 1 | 2

interface Settings {
  textSize: TextSize
  highContrast: boolean
  negativeContrast: boolean
  grayscale: boolean
  highlightLinks: boolean
  highlightHeadings: boolean
  readableFont: boolean
  stopAnimations: boolean
  letterSpacing: boolean
}

const DEFAULT_SETTINGS: Settings = {
  textSize: 0,
  highContrast: false,
  negativeContrast: false,
  grayscale: false,
  highlightLinks: false,
  highlightHeadings: false,
  readableFont: false,
  stopAnimations: false,
  letterSpacing: false,
}

const STORAGE_KEY = 'a11y-settings'

/* ── Apply settings to DOM ──────────────────────────────────── */
function applySettings(s: Settings) {
  const html = document.documentElement

  // Text size
  html.classList.remove('a11y-text-lg', 'a11y-text-xl')
  if (s.textSize === 1) html.classList.add('a11y-text-lg')
  if (s.textSize === 2) html.classList.add('a11y-text-xl')

  // Toggle classes
  html.classList.toggle('a11y-links',    s.highlightLinks)
  html.classList.toggle('a11y-headings', s.highlightHeadings)
  html.classList.toggle('a11y-font',     s.readableFont)
  html.classList.toggle('a11y-no-anim',  s.stopAnimations)
  html.classList.toggle('a11y-spacing',  s.letterSpacing)

  // Visual filters — combine on body to avoid stacking context issues
  const filters: string[] = []
  if (s.highContrast)     filters.push('contrast(1.6)')
  if (s.negativeContrast) filters.push('invert(1) hue-rotate(180deg)')
  if (s.grayscale)        filters.push('grayscale(1)')
  document.body.style.filter = filters.length ? filters.join(' ') : ''
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

/* ── Accessibility person icon ──────────────────────────────── */
function A11yPersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M15.5 8.5h-7L7 15h3v6h4v-6h3z" />
      <path d="M16.5 10l2.5-1.5" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}

/* ── Feature button ─────────────────────────────────────────── */
interface FeatureBtnProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}
function FeatureBtn({ icon, label, active, onClick }: FeatureBtnProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg text-center transition-all duration-150 text-[11px] leading-tight border ${
        active
          ? 'bg-[#1B5299] text-white border-[#1B5299]'
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#1B5299]/40 hover:bg-[#1B5299]/5'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}

/* ── Labels ─────────────────────────────────────────────────── */
const labels = {
  he: {
    openBtn: 'פתח תפריט נגישות',
    title: 'כלי נגישות',
    close: 'סגור',
    textIncrease: 'הגדלת טקסט',
    highContrast: 'ניגודיות גבוהה',
    negative: 'ניגודיות שלילית',
    grayscale: 'גווני אפור',
    links: 'הדגשת קישורים',
    headings: 'הדגשת כותרות',
    readableFont: 'גופן קריא',
    stopAnim: 'עצירת אנימציות',
    spacing: 'ריווח מוגדל',
    reset: 'אפס הכל',
    statement: 'הצהרת נגישות',
    textSizeLabels: ['רגיל', 'גדול', 'גדול מאוד'],
    wcag: 'עומד בתקן WCAG 2.2 ותקן ישראלי 5568 ברמה AA',
  },
  en: {
    openBtn: 'Open accessibility menu',
    title: 'Accessibility Tools',
    close: 'Close',
    textIncrease: 'Text Size',
    highContrast: 'High Contrast',
    negative: 'Negative Contrast',
    grayscale: 'Grayscale',
    links: 'Highlight Links',
    headings: 'Highlight Headings',
    readableFont: 'Readable Font',
    stopAnim: 'Stop Animations',
    spacing: 'Letter Spacing',
    reset: 'Reset All',
    statement: 'Accessibility Statement',
    textSizeLabels: ['Normal', 'Large', 'X-Large'],
    wcag: 'Compliant with WCAG 2.2 & Israeli Standard 5568 Level AA',
  },
}

/* ── Widget ─────────────────────────────────────────────────── */
export default function AccessibilityWidget() {
  const { lang } = useLang()
  const t = labels[lang]

  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  // Mount: load saved settings
  useEffect(() => {
    const saved = loadSettings()
    setSettings(saved)
    applySettings(saved)
    setMounted(true)
  }, [])

  // Focus into panel when it opens, return to trigger on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => panelRef.current?.focus(), 50)
    } else if (mounted) {
      triggerRef.current?.focus()
    }
  }, [isOpen, mounted])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    if (!panel) return
    const focusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      )).filter(el => !el.hasAttribute('disabled'))

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const els = focusable()
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      saveSettings(next)
      applySettings(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
    applySettings(DEFAULT_SETTINGS)
  }, [])

  const anyActive = Object.entries(settings).some(([k, v]) =>
    k === 'textSize' ? v !== 0 : v === true
  )

  const textSizeLabel = t.textSizeLabels[settings.textSize]

  return (
    <>
      {/* ── Trigger tab ── */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(v => !v)}
        aria-label={t.openBtn}
        aria-expanded={isOpen}
        aria-controls="a11y-panel"
        aria-haspopup="dialog"
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-[#1B5299] text-white rounded-r-xl shadow-lg flex flex-col items-center justify-center gap-1 w-10 h-16 hover:bg-[#154080] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B5299]"
      >
        <A11yPersonIcon />
        {anyActive && (
          <span className="w-2 h-2 rounded-full bg-yellow-400 absolute top-1.5 end-1.5" aria-hidden="true" />
        )}
      </button>

      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Panel ── */}
      {isOpen && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          tabIndex={-1}
          className="fixed left-12 top-4 bottom-4 z-50 w-72 bg-white shadow-2xl rounded-r-xl overflow-y-auto flex flex-col outline-none"
        >
          {/* Header */}
          <div className="bg-[#1B5299] text-white px-4 py-3 flex items-center justify-between shrink-0 rounded-tr-xl">
            <div className="flex items-center gap-2">
              <A11yPersonIcon />
              <span className="font-semibold text-sm tracking-wide">{t.title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t.close}
              className="p-1 rounded hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Features grid */}
          <div className="p-4 flex flex-col gap-4 flex-1">

            {/* Text size — special 3-state control */}
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">{t.textIncrease}</p>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {([0, 1, 2] as TextSize[]).map(level => (
                  <button
                    key={level}
                    onClick={() => update('textSize', level)}
                    aria-pressed={settings.textSize === level}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      settings.textSize === level
                        ? 'bg-[#1B5299] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.textSizeLabels[level]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3×2 grid of toggle features */}
            <div className="grid grid-cols-3 gap-2">
              <FeatureBtn
                icon="🔆" label={t.highContrast}
                active={settings.highContrast}
                onClick={() => update('highContrast', !settings.highContrast)}
              />
              <FeatureBtn
                icon="◐" label={t.negative}
                active={settings.negativeContrast}
                onClick={() => update('negativeContrast', !settings.negativeContrast)}
              />
              <FeatureBtn
                icon="◧" label={t.grayscale}
                active={settings.grayscale}
                onClick={() => update('grayscale', !settings.grayscale)}
              />
              <FeatureBtn
                icon="🔗" label={t.links}
                active={settings.highlightLinks}
                onClick={() => update('highlightLinks', !settings.highlightLinks)}
              />
              <FeatureBtn
                icon="H" label={t.headings}
                active={settings.highlightHeadings}
                onClick={() => update('highlightHeadings', !settings.highlightHeadings)}
              />
              <FeatureBtn
                icon="Aa" label={t.readableFont}
                active={settings.readableFont}
                onClick={() => update('readableFont', !settings.readableFont)}
              />
              <FeatureBtn
                icon="⏸" label={t.stopAnim}
                active={settings.stopAnimations}
                onClick={() => update('stopAnimations', !settings.stopAnimations)}
              />
              <FeatureBtn
                icon="↔" label={t.spacing}
                active={settings.letterSpacing}
                onClick={() => update('letterSpacing', !settings.letterSpacing)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 shrink-0 flex flex-col gap-2 border-t border-gray-100 pt-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={12} />
              {t.reset}
            </button>
            <a
              href="/accessibility"
              className="text-center text-xs text-[#1B5299] hover:underline py-1"
              onClick={() => setIsOpen(false)}
            >
              {t.statement}
            </a>
            <p className="text-center text-[10px] text-gray-400 leading-tight">{t.wcag}</p>
          </div>
        </div>
      )}
    </>
  )
}
