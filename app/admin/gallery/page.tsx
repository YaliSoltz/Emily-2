'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import AdminModal from '@/components/admin/AdminModal'
import ImageUpload from '@/components/admin/ImageUpload'
import { AdminField, AdminInput, AdminTextarea } from '@/components/admin/AdminField'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import Image from 'next/image'

interface GalleryItem {
  id: string
  title: string
  description: string
  image_url: string
  category: string
  order_index: number
  language: string
}

const empty = { id: '', title: '', description: '', image_url: '', category: 'textile', order_index: 0, language: 'he' }

const categories = [
  { value: 'textile', label: 'עיצוב טקסטיל' },
  { value: 'knitting', label: 'סריגה' },
  { value: 'screen-printing', label: 'הדפסי רשת' },
]

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<GalleryItem>(empty as GalleryItem)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('gallery_items').select('*').eq('language', 'he').order('order_index')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.from('gallery_items').select('*').eq('language', 'he').order('order_index')
      setItems(data ?? [])
      setLoading(false)
    })()
  }, [])

  const openAdd = () => {
    setEditing({ ...empty, order_index: items.length } as GalleryItem)
    setModal('add')
  }

  const openEdit = (item: GalleryItem) => { setEditing({ ...item }); setModal('edit') }

  const handleSaveItem = async () => {
    setSaving(true)
    const supabase = createClient()
    const { id, ...rest } = editing

    if (modal === 'add') {
      await supabase.from('gallery_items').insert({ ...rest, language: 'he' })
    } else {
      await supabase.from('gallery_items').update(rest).eq('id', id)
    }
    await load()
    setModal(null)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('gallery_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDeleteId(null)
  }

  const moveItem = async (id: string, dir: -1 | 1) => {
    const idx = items.findIndex(i => i.id === id)
    if (idx + dir < 0 || idx + dir >= items.length) return
    const updated = [...items]
    const tmp = updated[idx]; updated[idx] = updated[idx + dir]; updated[idx + dir] = tmp
    const reindexed = updated.map((item, i) => ({ ...item, order_index: i }))
    setItems(reindexed)
    const supabase = createClient()
    await Promise.all(reindexed.map(item => supabase.from('gallery_items').update({ order_index: item.order_index }).eq('id', item.id)))
  }

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="גלריה" hasChanges={false} onSave={async () => {}} onCancel={() => {}} hideSaveCancel>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-[#5C3D2E]/60">{items.length} עבודות</p>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#5C3D2E] text-[#F5F0E8] px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#3D2519] transition-colors">
          <Plus size={14} /> הוסף עבודה
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-[#5C3D2E]/40 text-sm">
          אין עבודות עדיין. לחץ על &ldquo;הוסף עבודה&rdquo; כדי להתחיל.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative bg-white border border-[#5C3D2E]/10 overflow-hidden">
              <div className="aspect-square bg-[#E8E0D5] relative">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#5C3D2E]/20 text-xs">ללא תמונה</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-[#3D2519] truncate">{item.title}</p>
                <p className="text-[10px] text-[#5C3D2E]/50 mt-0.5">
                  {categories.find(c => c.value === item.category)?.label ?? item.category}
                </p>
              </div>
              {/* Actions */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveItem(item.id, -1)} className="bg-white/90 text-[#5C3D2E] p-1.5" title="הזז למעלה">
                  <GripVertical size={12} />
                </button>
              </div>
              <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="bg-white/90 text-[#5C3D2E] p-1.5 hover:bg-[#5C3D2E] hover:text-white transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="bg-white/90 text-red-500 p-1.5 hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <AdminModal
          title={modal === 'add' ? 'הוספת עבודה' : 'עריכת עבודה'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className="px-4 py-2 text-xs tracking-widest uppercase border border-[#5C3D2E]/20 text-[#5C3D2E]">ביטול</button>
              <button onClick={handleSaveItem} disabled={saving} className="px-4 py-2 text-xs tracking-widest uppercase bg-[#5C3D2E] text-[#F5F0E8] disabled:opacity-50">
                {saving ? 'שומר...' : 'שמירה'}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-5" dir="rtl">
            <AdminField label="תמונה" hint="מומלץ: 800×800px, יחס 1:1">
              <ImageUpload
                currentUrl={editing.image_url}
                onUpload={url => setEditing(p => ({ ...p, image_url: url }))}
                onRemove={() => setEditing(p => ({ ...p, image_url: '' }))}
                folder="gallery"
              />
            </AdminField>
            <AdminField label="כותרת">
              <AdminInput value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
            </AdminField>
            <AdminField label="תיאור">
              <AdminTextarea rows={3} value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
            </AdminField>
            <AdminField label="קטגוריה">
              <select
                value={editing.category}
                onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </AdminField>
          </div>
        </AdminModal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <AdminModal title="מחיקת עבודה" onClose={() => setDeleteId(null)}
          footer={
            <>
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-xs tracking-widest uppercase border border-[#5C3D2E]/20 text-[#5C3D2E]">ביטול</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-xs tracking-widest uppercase bg-red-600 text-white">מחק</button>
            </>
          }
        >
          <p className="text-sm text-[#5C3D2E]/70" dir="rtl">האם אתה בטוח שברצונך למחוק עבודה זו? פעולה זו אינה ניתנת לביטול.</p>
        </AdminModal>
      )}
    </AdminTabLayout>
  )
}
