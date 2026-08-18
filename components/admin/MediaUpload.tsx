'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

const MAX_MB = 25
const ACCEPT = 'video/mp4,video/webm'

interface MediaUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  hint?: string
  folder?: string
}

/**
 * Video counterpart to ImageUpload — used for the home-page hero.
 * Kept separate so ImageUpload's 5 MB / image-only limits stay untouched.
 */
export default function MediaUpload({ currentUrl, onUpload, onRemove, hint, folder = 'hero' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('יש להעלות קובץ וידאו (MP4 או WebM)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`הקובץ גדול מדי (מקסימום ${MAX_MB}MB). מומלץ לדחוס את הסרטון לפני ההעלאה.`)
      return
    }

    setUploading(true)
    setError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('public-images')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError('שגיאה בהעלאה: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('public-images').getPublicUrl(path)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {currentUrl ? (
        <div className="relative w-full aspect-video bg-[#E8E0D5] overflow-hidden">
          <video src={currentUrl} muted playsInline controls className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex gap-1">
            {onRemove && (
              <button onClick={onRemove} aria-label="הסר סרטון" className="bg-white/90 text-[#5C3D2E] p-1 rounded">
                <X size={14} />
              </button>
            )}
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 text-[#5C3D2E] px-3 py-1 text-xs tracking-wide"
            >
              החלף סרטון
            </button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-[#5C3D2E]/20 p-8 text-center cursor-pointer hover:border-[#5C3D2E]/40 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onDragOver={e => e.preventDefault()}
        >
          <Upload size={20} className="mx-auto text-[#5C3D2E]/30 mb-2" />
          <p className="text-xs text-[#5C3D2E]/50">
            {uploading ? 'מעלה...' : 'לחץ להעלאת סרטון או גרור לכאן'}
          </p>
          <p className="text-[10px] text-[#5C3D2E]/30 mt-1">{hint ?? `MP4 או WebM · עד ${MAX_MB}MB`}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}
