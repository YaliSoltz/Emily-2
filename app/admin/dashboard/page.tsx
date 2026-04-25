'use client'

import AdminTabLayout from '@/components/admin/AdminTabLayout'

export default function DashboardPage() {
  return (
    <AdminTabLayout
      title="דשבורד"
      hasChanges={false}
      onSave={async () => {}}
      onCancel={() => {}}
      hideSaveCancel
    >
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#3D2519] mb-2">
          ברוכה הבאה, Emily
        </h2>
        <p className="text-[#5C3D2E]/60 text-sm mb-10">ממשק ניהול תיק העבודות</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'דף הבית',    href: '/admin/home',        desc: 'ערוך כותרת, תת-כותרת וטקסט פתיחה' },
            { label: 'גלריה',      href: '/admin/gallery',     desc: 'הוסף, ערוך ומחק עבודות' },
            { label: 'הודעות',     href: '/admin/messages',    desc: 'צפה בפניות שהתקבלו' },
            { label: 'אודות',      href: '/admin/about',       desc: 'ערוך את הביוגרפיה שלך' },
            { label: 'פרטי קשר',  href: '/admin/contact-info',desc: 'טלפון, מייל וכתובת' },
            { label: 'הגדרות',     href: '/admin/settings',    desc: 'שינוי סיסמה והתנתקות' },
          ].map(card => (
            <a
              key={card.href}
              href={card.href}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="border border-[#5C3D2E]/10 bg-white p-6 hover:border-[#5C3D2E]/30 transition-colors group"
            >
              <h3 className="text-sm tracking-widest uppercase text-[#5C3D2E] mb-2 group-hover:text-[#3D2519] transition-colors">
                {card.label}
              </h3>
              <p className="text-xs text-[#5C3D2E]/50">{card.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </AdminTabLayout>
  )
}
