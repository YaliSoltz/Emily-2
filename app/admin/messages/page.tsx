'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTabLayout from '@/components/admin/AdminTabLayout'
import { Trash2, Download, Mail, MailOpen } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  message: string
  read_status: boolean
  submitted_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('messages').select('*').order('submitted_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.from('messages').select('*').order('submitted_at', { ascending: false })
      setMessages(data ?? [])
      setLoading(false)
      supabase.channel('messages-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load)
        .subscribe()
    })()
  }, [])

  const toggleRead = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('messages').update({ read_status: !current }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read_status: !current } : m))
  }

  const deleteMsg = async (id: string) => {
    const supabase = createClient()
    await supabase.from('messages').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const exportCSV = () => {
    const rows = [
      ['שם', 'אימייל', 'הודעה', 'תאריך', 'נקרא'],
      ...messages.map(m => [m.name, m.email, m.message.replace(/\n/g, ' '), new Date(m.submitted_at).toLocaleDateString('he-IL'), m.read_status ? 'כן' : 'לא']),
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `messages-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = messages.filter(m =>
    search === '' || m.name.includes(search) || m.email.includes(search) || m.message.includes(search)
  )

  const unread = messages.filter(m => !m.read_status).length

  if (loading) return <div className="p-8 text-sm text-[#5C3D2E]/50">טוען...</div>

  return (
    <AdminTabLayout title="הודעות" hasChanges={false} onSave={async () => {}} onCancel={() => {}} hideSaveCancel>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#5C3D2E]/60">{messages.length} הודעות</p>
          {unread > 0 && (
            <span className="bg-[#5C3D2E] text-[#F5F0E8] text-xs px-2 py-0.5 rounded-full">{unread} לא נקראו</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="חיפוש..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-[#5C3D2E]/15 px-3 py-1.5 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40 w-44"
          />
          <button onClick={exportCSV} className="flex items-center gap-2 border border-[#5C3D2E]/20 text-[#5C3D2E] px-3 py-1.5 text-xs tracking-wide hover:border-[#5C3D2E]/50 transition-colors">
            <Download size={13} /> ייצוא CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#5C3D2E]/40 text-sm">אין הודעות</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(m => (
            <div key={m.id} className={`border transition-colors ${m.read_status ? 'border-[#5C3D2E]/10 bg-white' : 'border-[#5C3D2E]/25 bg-[#F5F0E8]'}`}>
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {m.read_status ? <MailOpen size={14} className="text-[#5C3D2E]/30 shrink-0" /> : <Mail size={14} className="text-[#5C3D2E] shrink-0" />}
                  <span className={`text-sm truncate ${m.read_status ? 'text-[#5C3D2E]/60' : 'text-[#3D2519] font-medium'}`}>{m.name}</span>
                  <span className="text-xs text-[#5C3D2E]/40 truncate hidden sm:block">{m.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#5C3D2E]/40">{new Date(m.submitted_at).toLocaleDateString('he-IL')}</span>
                  <button onClick={e => { e.stopPropagation(); toggleRead(m.id, m.read_status) }} className="p-1 text-[#5C3D2E]/40 hover:text-[#5C3D2E] transition-colors" title={m.read_status ? 'סמן כלא-נקרא' : 'סמן כנקרא'}>
                    {m.read_status ? <Mail size={13} /> : <MailOpen size={13} />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteMsg(m.id) }} className="p-1 text-[#5C3D2E]/40 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {expanded === m.id && (
                <div className="px-4 pb-4 border-t border-[#5C3D2E]/10" dir="rtl">
                  <p className="text-xs text-[#5C3D2E]/50 mb-1 mt-3">{m.email}</p>
                  <p className="text-sm text-[#3D2519] leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  <a href={`mailto:${m.email}`} className="inline-block mt-3 text-xs text-[#5C3D2E] border-b border-[#5C3D2E]/30 pb-0.5 hover:border-[#5C3D2E] transition-colors">
                    השב למייל
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminTabLayout>
  )
}
