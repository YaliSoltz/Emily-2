'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import AdminModal from '@/components/admin/AdminModal'
import ImageUpload from '@/components/admin/ImageUpload'
import MultiImageUpload from '@/components/admin/MultiImageUpload'
import Generate360Panel from '@/components/admin/Generate360Panel'
import { AdminField, AdminInput, AdminTextarea } from '@/components/admin/AdminField'
import { Plus, Pencil, Trash2, GripVertical, RotateCw, EyeOff } from 'lucide-react'
import { invalidateKnits } from '@/lib/actions'
import { MIN_ROTATION_FRAMES } from '@/lib/knit'
import Image from 'next/image'

interface KnitRow {
  id: string
  slug: string
  title_he: string
  title_en: string
  description_he: string
  description_en: string
  alt_he: string
  alt_en: string
  cover_image: string
  images: string[]
  rotation_frames: string[]
  model_3d: string | null
  use_model_3d: boolean
  order_index: number
  is_published: boolean
}

const empty: KnitRow = {
  id: '', slug: '', title_he: '', title_en: '',
  description_he: '', description_en: '', alt_he: '', alt_en: '',
  cover_image: '', images: [], rotation_frames: [], model_3d: null, use_model_3d: false,
  order_index: 0, is_published: true,
}

/** Latin/digit/dash slug — Hebrew titles cannot be transliterated automatically. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function SortableKnit({ knit, onEdit, onDelete }: {
  knit: KnitRow
  onEdit: (k: KnitRow) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: knit.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative bg-white border border-[#5C3D2E]/10 overflow-hidden cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-40 shadow-xl z-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-2 right-2 z-10 bg-white/90 text-[#5C3D2E]/40 p-1.5 pointer-events-none" aria-hidden="true">
        <GripVertical size={12} />
      </div>

      <div className="aspect-square bg-white relative">
        {knit.cover_image ? (
          <Image src={knit.cover_image} alt={knit.title_he || knit.slug} fill className="object-contain p-3" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#E8E0D5]">
            <span className="text-[#5C3D2E]/20 text-xs">ללא תמונה</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs font-medium text-[#3D2519] truncate">{knit.title_he || knit.slug}</p>
        <p className="text-[10px] text-[#5C3D2E]/50 mt-0.5 truncate" dir="ltr">/{knit.slug}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {knit.rotation_frames.length >= MIN_ROTATION_FRAMES && (
            <span className="inline-flex items-center gap-1 text-[9px] text-[#5C3D2E]/60">
              <RotateCw size={9} /> {knit.rotation_frames.length}
            </span>
          )}
          {!knit.is_published && (
            <span className="inline-flex items-center gap-1 text-[9px] text-amber-700">
              <EyeOff size={9} /> מוסתר
            </span>
          )}
        </div>
      </div>

      <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={() => onEdit(knit)}
          aria-label="ערוך"
          className="bg-white/90 text-[#5C3D2E] p-1.5 hover:bg-[#5C3D2E] hover:text-white transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={() => onDelete(knit.id)}
          aria-label="מחק"
          className="bg-white/90 text-red-500 p-1.5 hover:bg-red-500 hover:text-white transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export default function AdminKnitsPage() {
  const [items, setItems] = useState<KnitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  // False until 0005_knits_model_viewer.sql has been run — see load().
  const [supportsModelFlag, setSupportsModelFlag] = useState(false)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<KnitRow>(empty)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = useCallback(async () => {
    const supabase = createClient()
    const [{ data, error }, flagProbe] = await Promise.all([
      supabase.from('knits').select('*').order('order_index'),
      // Cheapest way to ask Postgres whether the 0005 column exists. Probing
      // beats inferring from the rows, which says nothing when the table is empty.
      supabase.from('knits').select('use_model_3d').limit(1),
    ])
    if (error) setTableMissing(true)
    setSupportsModelFlag(!flagProbe.error)
    setItems((data ?? []).map(row => ({
      ...empty,
      ...row,
      images: Array.isArray(row.images) ? row.images : [],
      rotation_frames: Array.isArray(row.rotation_frames) ? row.rotation_frames : [],
    })))
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount; state is set from the awaited response, not synchronously
  useEffect(() => { void load() }, [load])

  const openAdd = () => {
    setEditing({ ...empty, order_index: items.length })
    setSaveError('')
    setModal('add')
  }

  const openEdit = (knit: KnitRow) => {
    setEditing({ ...knit })
    setSaveError('')
    setModal('edit')
  }

  const handleSaveItem = async () => {
    const slug = slugify(editing.slug)
    if (!slug) {
      setSaveError('נדרשת כתובת (slug) באותיות לטיניות — למשל sea-wrap')
      return
    }
    if (!editing.title_he.trim() && !editing.title_en.trim()) {
      setSaveError('נדרשת כותרת בעברית או באנגלית')
      return
    }

    setSaving(true)
    setSaveError('')
    const supabase = createClient()
    const { id, use_model_3d, ...rest } = editing
    // Sending a column Postgres does not have fails the whole write.
    const payload = supportsModelFlag ? { ...rest, use_model_3d, slug } : { ...rest, slug }

    const { error } = modal === 'add'
      ? await supabase.from('knits').insert(payload)
      : await supabase.from('knits').update(payload).eq('id', id)

    if (error) {
      setSaveError(
        error.code === '23505'
          ? 'כתובת (slug) זו כבר קיימת. בחר כתובת אחרת.'
          : 'שגיאה בשמירה: ' + error.message
      )
      setSaving(false)
      return
    }

    await invalidateKnits()
    await load()
    setModal(null)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('knits').delete().eq('id', id)
    await invalidateKnits()
    setItems(prev => prev.filter(i => i.id !== id))
    setDeleteId(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = items.findIndex(i => i.id === String(active.id))
    const newIdx = items.findIndex(i => i.id === String(over.id))
    const reordered = arrayMove(items, oldIdx, newIdx).map((item, i) => ({ ...item, order_index: i }))
    setItems(reordered)

    const supabase = createClient()
    await Promise.all(
      reordered.map(item =>
        supabase.from('knits').update({ order_index: item.order_index }).eq('id', item.id)
      )
    )
    await invalidateKnits()
  }

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  const frameCount = editing.rotation_frames.length

  return (
    <AdminTabLayout title="סריגים" hasChanges={false} onSave={async () => {}} onCancel={() => {}} hideSaveCancel>
      {tableMissing && (
        <div className="mb-6 border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed" role="alert">
          <strong>טבלת הסריגים לא נמצאה.</strong> יש להריץ את הקובץ{' '}
          <code className="bg-amber-100 px-1" dir="ltr">supabase/migrations/0004_knits.sql</code>{' '}
          ב־Supabase Dashboard → SQL Editor, ואז לרענן את הדף.
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-[#5C3D2E]/60">{items.length} סריגים</p>
        <button
          onClick={openAdd}
          disabled={tableMissing}
          className="flex items-center gap-2 bg-[#5C3D2E] text-[#F5F0E8] px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#3D2519] transition-colors disabled:opacity-30"
        >
          <Plus size={14} /> הוסף סריג
        </button>
      </div>

      {items.length === 0 ? (
        !tableMissing && (
          <div className="text-center py-16 text-[#5C3D2E]/40 text-sm">
            אין סריגים עדיין. לחץ על &ldquo;הוסף סריג&rdquo; כדי להתחיל.
          </div>
        )
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(knit => (
                <SortableKnit key={knit.id} knit={knit} onEdit={openEdit} onDelete={setDeleteId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add / Edit */}
      {modal && (
        <AdminModal
          title={modal === 'add' ? 'הוספת סריג' : 'עריכת סריג'}
          onClose={() => setModal(null)}
          width="max-w-2xl"
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
            {saveError && <p className="text-xs text-red-600" role="alert">{saveError}</p>}

            <AdminField label="תמונה ראשית" hint="מומלץ: רקע לבן אחיד או PNG/WebP עם רקע שקוף, יחס 3:4">
              <ImageUpload
                currentUrl={editing.cover_image}
                onUpload={url => setEditing(p => ({ ...p, cover_image: url }))}
                onRemove={() => setEditing(p => ({ ...p, cover_image: '' }))}
                folder="knits"
              />
            </AdminField>

            <AdminField label="כתובת בכתובת האתר (slug)" hint="אותיות לטיניות בלבד — למשל sea-wrap. משפיע על הקישור לעמוד הסריג.">
              <AdminInput
                dir="ltr"
                value={editing.slug}
                onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
                onBlur={e => setEditing(p => ({ ...p, slug: slugify(e.target.value) }))}
                placeholder="sea-wrap"
              />
            </AdminField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminField label="כותרת (עברית)">
                <AdminInput value={editing.title_he} onChange={e => setEditing(p => ({ ...p, title_he: e.target.value }))} />
              </AdminField>
              <AdminField label="כותרת (אנגלית)">
                <AdminInput dir="ltr" value={editing.title_en} onChange={e => setEditing(p => ({ ...p, title_en: e.target.value }))} />
              </AdminField>
            </div>

            <AdminField label="תיאור (עברית)">
              <AdminTextarea rows={3} value={editing.description_he} onChange={e => setEditing(p => ({ ...p, description_he: e.target.value }))} />
            </AdminField>
            <AdminField label="תיאור (אנגלית)">
              <AdminTextarea dir="ltr" rows={3} value={editing.description_en} onChange={e => setEditing(p => ({ ...p, description_en: e.target.value }))} />
            </AdminField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminField label="טקסט חלופי לתמונה (עברית)" hint="תיאור קצר לקוראי מסך. ריק = הכותרת.">
                <AdminInput value={editing.alt_he} onChange={e => setEditing(p => ({ ...p, alt_he: e.target.value }))} />
              </AdminField>
              <AdminField label="טקסט חלופי (אנגלית)">
                <AdminInput dir="ltr" value={editing.alt_en} onChange={e => setEditing(p => ({ ...p, alt_en: e.target.value }))} />
              </AdminField>
            </div>

            <AdminField label="תמונות נוספות" hint="מוצגות בגלריה בעמוד הסריג.">
              <MultiImageUpload
                urls={editing.images}
                onChange={images => setEditing(p => ({ ...p, images }))}
                folder={`knits/${slugify(editing.slug) || 'untitled'}/gallery`}
              />
            </AdminField>

            <AdminField
              label="תמונות 360°"
              hint={`רצף תמונות סביב הסריג, לפי סדר הזוויות. מומלץ 24–36 תמונות בשמות frame-01 … frame-36. הצפייה בסיבוב נפתחת רק מ-${MIN_ROTATION_FRAMES} תמונות ומעלה.`}
            >
              <MultiImageUpload
                urls={editing.rotation_frames}
                onChange={frames => setEditing(p => ({ ...p, rotation_frames: frames }))}
                folder={`knits/${slugify(editing.slug) || 'untitled'}/360`}
                sortByFilename
              />
              <div className="mt-3">
                <Generate360Panel
                  coverImage={editing.cover_image}
                  slug={slugify(editing.slug) || 'untitled'}
                  onComplete={({ frames, modelUrl }) =>
                    setEditing(p => ({ ...p, rotation_frames: frames, model_3d: modelUrl }))
                  }
                />
              </div>
              <p className={`text-[11px] mt-1 ${frameCount === 0 || frameCount >= MIN_ROTATION_FRAMES ? 'text-[#5C3D2E]/50' : 'text-amber-700'}`}>
                {frameCount === 0
                  ? 'אין תמונות 360° — בעמוד הסריג תוצג התמונה הראשית בלבד, ללא פקד סיבוב.'
                  : frameCount < MIN_ROTATION_FRAMES
                    ? `${frameCount} תמונות — מעט מדי לסיבוב חלק. נדרשות לפחות ${MIN_ROTATION_FRAMES}.`
                    : `${frameCount} תמונות — תצוגת הסיבוב תופעל.`}
              </p>
            </AdminField>

            <AdminField
              label="תצוגה תלת-ממדית חיה"
              hint="מציגה את מודל ה-GLB עצמו במקום רצף התמונות: המבקרת יכולה לסובב לכל כיוון ולהתקרב. הקובץ כבד (מגה-בייטים), ולכן הוא נטען רק אחרי לחיצה על „צפייה תלת-ממדית“ בעמוד הסריג."
            >
              <label className="flex items-center gap-2 text-sm text-[#3D2519]">
                <input
                  type="checkbox"
                  checked={editing.use_model_3d}
                  disabled={!supportsModelFlag || !editing.model_3d}
                  onChange={e => setEditing(p => ({ ...p, use_model_3d: e.target.checked }))}
                  className="w-4 h-4 accent-[#5C3D2E] disabled:opacity-40"
                />
                הפעלת תצוגה תלת-ממדית לסריג זה
              </label>
              <p className="text-[11px] mt-1 text-[#5C3D2E]/50">
                {!supportsModelFlag
                  ? 'נדרשת הרצת המיגרציה 0005_knits_model_viewer.sql ב-Supabase כדי להפעיל אפשרות זו.'
                  : !editing.model_3d
                    ? 'אין עדיין קובץ מודל לסריג זה. הפעילי „יצירת 360° אוטומטית“ למעלה, והקובץ ייווצר וישמר.'
                    : editing.use_model_3d
                      ? 'בעמוד הסריג תוצג התמונה הראשית עם כפתור „צפייה תלת-ממדית“.'
                      : 'כבוי — בעמוד הסריג יוצג רצף התמונות של 360°.'}
              </p>
            </AdminField>

            <label className="flex items-center gap-2 text-sm text-[#3D2519]">
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={e => setEditing(p => ({ ...p, is_published: e.target.checked }))}
                className="w-4 h-4 accent-[#5C3D2E]"
              />
              מוצג באתר
            </label>
          </div>
        </AdminModal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <AdminModal
          title="מחיקת סריג"
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-xs tracking-widest uppercase border border-[#5C3D2E]/20 text-[#5C3D2E]">ביטול</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-xs tracking-widest uppercase bg-red-600 text-white">מחק</button>
            </>
          }
        >
          <p className="text-sm text-[#5C3D2E]/70" dir="rtl">האם למחוק את הסריג? פעולה זו אינה ניתנת לביטול.</p>
        </AdminModal>
      )}
    </AdminTabLayout>
  )
}
