interface AdminFieldProps {
  label: string
  children: React.ReactNode
  hint?: string
}

export function AdminField({ label, children, hint }: AdminFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs tracking-[0.15em] uppercase text-[#5C3D2E]/60">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#5C3D2E]/40">{hint}</p>}
    </div>
  )
}

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function AdminInput(props: AdminInputProps) {
  return (
    <input
      {...props}
      className={`w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40 transition-colors ${props.className ?? ''}`}
    />
  )
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function AdminTextarea(props: AdminTextareaProps) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`w-full bg-white border border-[#5C3D2E]/15 px-3 py-2 text-sm text-[#3D2519] focus:outline-none focus:border-[#5C3D2E]/40 transition-colors resize-none ${props.className ?? ''}`}
    />
  )
}
