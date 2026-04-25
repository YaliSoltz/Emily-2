'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  hint?: string
  folder?: string
}

export default function ImageUpload({ currentUrl, onUpload, onRemove, hint, folder = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('יש להעלות קובץ תמונה')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('הקובץ גדול מדי (מקסימום 5MB)')
      return
    }

    setUploading(true)
    setError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('public-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('שגיאה בהעלאה: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('public-images').getPublicUrl(path)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      {currentUrl ? (
        <div className="relative w-full aspect-video bg-[#E8E0D5] overflow-hidden group">
          <Image src={currentUrl} alt="Uploaded" fill className="object-cover" />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 left-2 bg-white/90 text-[#5C3D2E] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="הסר תמונה"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 left-2 bg-white/90 text-[#5C3D2E] px-3 py-1 text-xs tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
          >
            החלף תמונה
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-[#5C3D2E]/20 p-8 text-center cursor-pointer hover:border-[#5C3D2E]/40 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <Upload size={20} className="mx-auto text-[#5C3D2E]/30 mb-2" />
          <p className="text-xs text-[#5C3D2E]/50">
            {uploading ? 'מעלה...' : 'לחץ להעלאת תמונה או גרור לכאן'}
          </p>
          {hint && <p className="text-[10px] text-[#5C3D2E]/30 mt-1">{hint}</p>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
