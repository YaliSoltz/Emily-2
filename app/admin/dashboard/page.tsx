export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#3D2519] mb-2">
        ברוכה הבאה, Emily
      </h1>
      <p className="text-[#5C3D2E]/60 text-sm">ממשק ניהול תיק העבודות</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {[
          { label: 'דף הבית', href: '/admin/home', desc: 'ערוך כותרת, תת-כותרת וטקסט פתיחה' },
          { label: 'גלריה', href: '/admin/gallery', desc: 'הוסף, ערוך ומחק עבודות' },
          { label: 'הודעות', href: '/admin/messages', desc: 'צפה בפניות שהתקבלו' },
        ].map(card => (
          <a
            key={card.href}
            href={card.href}
            className="border border-[#5C3D2E]/10 bg-white p-6 hover:border-[#5C3D2E]/30 transition-colors group"
          >
            <h2 className="text-sm tracking-widest uppercase text-[#5C3D2E] mb-2 group-hover:text-[#3D2519] transition-colors">
              {card.label}
            </h2>
            <p className="text-xs text-[#5C3D2E]/50">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
