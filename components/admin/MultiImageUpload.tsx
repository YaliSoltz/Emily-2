'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface MultiImageUploadProps {
  urls: string[]
  onChange: (urls: string[]) => void
  folder: string
  hint?: string
  /** Order is meaningful (360° frames) — files are sorted by filename on upload. */
  sortByFilename?: boolean
}

/**
 * Uploads several images at once and keeps them in an explicit order.
 * Used for a knit's detail shots and for its 360° rotation frames, where the
 * array index is the rotation angle.
 */
export default function MultiImageUpload({ urls, onChange, folder, hint, sortByFilename }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) {
      setError('יש לבחור קובצי תמונה')
      return
    }
    const tooBig = files.find(f => f.size > 5 * 1024 * 1024)
    if (tooBig) {
      setError(`הקובץ "${tooBig.name}" גדול מדי (מקסימום 5MB לתמונה)`)
      return
    }

    if (sortByFilename) {
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    }

    setUploading(true)
    setError('')
    setProgress({ done: 0, total: files.length })

    const supabase = createClient()
    const uploaded: string[] = []

    for (const [i, file] of files.entries()) {
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${String(i).padStart(3, '0')}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('public-images')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError('שגיאה בהעלאה: ' + uploadError.message)
        break
      }
      uploaded.push(supabase.storage.from('public-images').getPublicUrl(path).data.publicUrl)
      setProgress({ done: i + 1, total: files.length })
    }

    if (uploaded.length > 0) onChange([...urls, ...uploaded])
    setUploading(false)
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= urls.length) return
    const next = [...urls]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {urls.length > 0 && (
        <ul className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {urls.map((url, i) => (
            <li key={url} className="relative group">
              <div className="relative aspect-square bg-[#E8E0D5] overflow-hidden">
                <Image src={url} alt={`תמונה ${i + 1}`} fill sizes="120px" className="object-cover" />
                <span className="absolute bottom-0 start-0 bg-black/60 text-white text-[9px] px-1 tabular-nums">
                  {i + 1}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <button
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`הזז את תמונה ${i + 1} אחורה`}
                  className="text-[#5C3D2E]/50 hover:text-[#5C3D2E] disabled:opacity-20 p-0.5"
                >
                  <ChevronRight size={12} />
                </button>
                <button
                  onClick={() => onChange(urls.filter((_, j) => j !== i))}
                  aria-label={`מחק את תמונה ${i + 1}`}
                  className="text-red-500/70 hover:text-red-600 p-0.5"
                >
                  <X size={12} />
                </button>
                <button
                  onClick={() => move(i, i + 1)}
                  disabled={i === urls.length - 1}
                  aria-label={`הזז את תמונה ${i + 1} קדימה`}
                  className="text-[#5C3D2E]/50 hover:text-[#5C3D2E] disabled:opacity-20 p-0.5"
                >
                  <ChevronLeft size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        className="border-2 border-dashed border-[#5C3D2E]/20 p-6 text-center cursor-pointer hover:border-[#5C3D2E]/40 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
        onDragOver={e => e.preventDefault()}
      >
        <Upload size={18} className="mx-auto text-[#5C3D2E]/30 mb-2" />
        <p className="text-xs text-[#5C3D2E]/50">
          {uploading ? `מעלה ${progress.done}/${progress.total}...` : 'לחץ לבחירת תמונות (אפשר כמה יחד) או גרור לכאן'}
        </p>
        {hint && <p className="text-[10px] text-[#5C3D2E]/40 mt-1">{hint}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }}
      />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}
