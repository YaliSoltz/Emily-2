import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center text-center px-6">
      <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/40 mb-4">404</p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#3D2519] mb-4">
        Page not found
      </h1>
      <p className="text-[#5C3D2E]/60 text-sm mb-8">הדף שחיפשת לא קיים</p>
      <Link
        href="/"
        className="text-xs tracking-widest uppercase text-[#5C3D2E] border-b border-[#5C3D2E]/40 pb-0.5 hover:border-[#5C3D2E] transition-colors"
      >
        חזרה לדף הבית
      </Link>
    </div>
  )
}
