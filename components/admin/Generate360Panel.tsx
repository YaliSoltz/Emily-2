'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Sparkles, X, AlertTriangle } from 'lucide-react'
import { imageToGlb, TrellisError, type TrellisStage } from '@/lib/trellis'
import { renderTurntableFrames } from '@/lib/glb-frames'
import { uploadBlob, uploadOrdered } from '@/lib/storage'
import { getHuggingFaceToken } from '@/app/admin/knits/actions'

const FRAME_COUNT = 36

interface Generate360PanelProps {
  /** Source photo. The button stays disabled until one exists. */
  coverImage: string
  /** Used for the storage folder — must already be slugified. */
  slug: string
  onComplete: (result: { frames: string[]; modelUrl: string }) => void
}

const stageLabels: Record<TrellisStage, string> = {
  connecting: 'מתחבר ל-Hugging Face...',
  preprocessing: 'מסיר רקע ומיישר את התמונה...',
  generating: 'בונה מודל תלת-ממדי — זה החלק הארוך, כמה דקות...',
  extracting: 'מחלץ את קובץ המודל...',
  downloading: 'מוריד את המודל...',
}

export default function Generate360Panel({ coverImage, slug, onComplete }: Generate360PanelProps) {
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('')
  const [detail, setDetail] = useState('')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setStatus('')
    setDetail('')
    setProgress(null)
  }, [])

  const run = useCallback(async () => {
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setError('')
    setProgress(null)

    try {
      setStatus('טוען את תמונת המקור...')
      const sourceResponse = await fetch(coverImage, { signal: controller.signal })
      if (!sourceResponse.ok) throw new Error('לא הצלחתי לטעון את התמונה הראשית')
      const source = await sourceResponse.blob()

      const token = await getHuggingFaceToken()

      const { glb } = await imageToGlb(source, {
        token: token ?? undefined,
        signal: controller.signal,
        onProgress: (stage, stageDetail) => {
          setStatus(stageLabels[stage])
          setDetail(stageDetail ?? '')
        },
      })

      setDetail('')
      setStatus('מרנדר 36 זוויות מהמודל...')
      const { frames, ext } = await renderTurntableFrames(glb, {
        frameCount: FRAME_COUNT,
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      })

      setStatus('מעלה את המודל והפריימים...')
      setProgress(null)
      const modelUrl = await uploadBlob(`knits/${slug}/model.glb`, glb, 'model/gltf-binary')
      const frameUrls = await uploadOrdered(
        `knits/${slug}/360`,
        frames,
        ext,
        (done, total) => setProgress({ done, total })
      )

      onComplete({ frames: frameUrls, modelUrl })
      setStatus('')
      setDetail('')
      setProgress(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(
        err instanceof TrellisError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'אירעה שגיאה לא צפויה'
      )
      setStatus('')
      setDetail('')
      setProgress(null)
    } finally {
      abortRef.current = null
      setRunning(false)
    }
  }, [coverImage, slug, onComplete])

  return (
    <div className="border border-[#5C3D2E]/15 bg-[#FAF7F2] p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <Sparkles size={15} className="text-[#5C3D2E]/50 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-xs font-medium text-[#3D2519]">יצירת 360° מהתמונה הראשית (ניסיוני)</p>
          <p className="text-[11px] text-[#5C3D2E]/60 leading-relaxed mt-1">
            שולח את התמונה למודל TRELLIS.2 של Microsoft ב-Hugging Face, בונה ממנה מודל תלת-ממדי,
            ומרנדר ממנו {FRAME_COUNT} זוויות. התוצאה מחליפה את תמונות ה-360° הקיימות.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 leading-relaxed">
        <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          הצד האחורי של הסריג <strong>מומצא על ידי המודל</strong> — הוא לא צולם.
          סריגה היא גם מהחומרים הקשים ביותר לשחזור תלת-ממדי. בדקי את התוצאה לפני פרסום,
          ואם היא לא נאמנה לעבודה — צלמי את הרצף ידנית.
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-600 leading-relaxed" role="alert">{error}</p>
      )}

      {running ? (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="text-xs text-[#5C3D2E]">{status}</p>
          {detail && <p className="text-[11px] text-[#5C3D2E]/50">{detail}</p>}
          {progress && (
            <>
              <div className="h-1 w-full bg-[#5C3D2E]/10">
                <div
                  className="h-full bg-[#5C3D2E]/50 transition-[width] duration-150"
                  style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#5C3D2E]/50 tabular-nums">{progress.done} / {progress.total}</p>
            </>
          )}
          <button
            type="button"
            onClick={cancel}
            className="self-start flex items-center gap-1.5 text-[11px] text-[#5C3D2E]/60 hover:text-red-600 transition-colors"
          >
            <X size={12} /> ביטול
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={run}
          disabled={!coverImage}
          className="self-start flex items-center gap-2 border border-[#5C3D2E]/30 text-[#5C3D2E] px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#5C3D2E] hover:text-[#F5F0E8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#5C3D2E]"
        >
          <Sparkles size={13} />
          צור 360° אוטומטית
        </button>
      )}

      {!coverImage && (
        <p className="text-[11px] text-[#5C3D2E]/40">יש להעלות תמונה ראשית תחילה.</p>
      )}
    </div>
  )
}
