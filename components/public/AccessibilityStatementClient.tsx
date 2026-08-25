'use client'

import { useSiteData } from '@/lib/context/SiteDataContext'

const content = {
  he: {
    badge: 'מחויבות לנגישות',
    title: 'הצהרת נגישות',
    updated: 'עודכן: אפריל 2026',
    intro: 'אמילי טל מחויבת לנגישות האתר עבור כלל המשתמשים, לרבות אנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998, ותקנות הנגישות הנגזרות ממנו.',
    sections: [
      {
        title: 'תקן הנגישות',
        body: 'האתר עומד בדרישות תקן ישראלי 5568 (המבוסס על WCAG 2.2) ברמה AA. הנגישות נבדקת באופן שוטף ומעודכנת בהתאם לשינויים בתקן.',
      },
      {
        title: 'כלי הנגישות',
        body: 'האתר מצויד בתפריט נגישות המופעל על ידי TabNav (tabnav.com) — ספק נגישות מורשה לפי התקן הישראלי 5568. התפריט מאפשר למשתמשים להתאים את חוויית הגלישה לצרכיהם.',
        tabnav: true,
      },
      {
        title: 'תכונות נגישות באתר',
        list: [
          'תפריט נגישות צף המאפשר התאמות תצוגה מגוונות (מסופק על ידי TabNav)',
          'קישור "דלג לתוכן הראשי" — מופיע בלחיצה ראשונה על Tab',
          'כל התמונות כוללות טקסט חלופי (alt text)',
          'היררכיית כותרות תקנית (H1–H3)',
          'מאפייני ARIA לכל הרכיבים האינטראקטיביים',
          'ניהול פוקוס במודאלים ובתפריטים',
          'תמיכה מלאה בכיוון RTL (עברית) ו-LTR (אנגלית)',
          'ניגודיות צבעים עומדת בדרישות WCAG 2.2 AA (מינימום 4.5:1 לטקסט רגיל)',
          'אין תנועה או הבהוב ללא אפשרות עצירה',
          'ניווט מקלדת מלא ללא עכבר',
          'כיבוד העדפת המערכת לצמצום תנועה (prefers-reduced-motion) — סרטון הפתיחה מוחלף בתמונה סטטית',
          'תצוגת הסיבוב (360°) של הסריגים ניתנת להפעלה במקשי החצים, ולצידה תמיד מוצגת תמונה סטטית של הסריג',
          'התצוגה התלת-ממדית החיה נפתחת רק בלחיצה יזומה, ניתנת לסיבוב ולזום במקשי החצים ובמקשי פלוס ומינוס, ונסגרת במקש Escape בחזרה לתמונה הסטטית',
        ],
      },
      {
        title: 'טכנולוגיות נתמכות',
        body: 'האתר נבדק ותואם לטכנולוגיות הסיוע הבאות:',
        list: [
          'קוראי מסך: NVDA, JAWS ו-VoiceOver (iOS/macOS)',
          'ניווט מקלדת מלא ללא עכבר',
          'תוכנות הגדלת מסך ושינוי ניגודיות',
          'דפדפנים: Chrome, Firefox, Safari, Edge — בגרסאות עדכניות',
        ],
      },
      {
        title: 'מגבלות נגישות ידועות',
        body: 'אנו עורכים מאמץ מתמיד לנגישות מלאה. ייתכנו מגבלות זמניות בתוכן חדש שמוסף לאתר. אנו פועלים לתיקונן בהקדם האפשרי.',
      },
      {
        title: 'יצירת קשר בנושא נגישות',
        body: 'נתקלתם בבעיית נגישות? אנא פנו אלינו — נשמח לסייע ולתקן:\n\nדוא"ל: emilytal22@gmail.com\nטלפון: 052-482-5858\n\nנשתדל להשיב תוך 5 ימי עסקים.',
      },
      {
        title: 'אכיפה',
        body: 'במקרה שאינכם מקבלים מענה הולם לבקשת הנגישות, ניתן לפנות לנציב שוויון זכויות לאנשים עם מוגבלות במשרד המשפטים.',
      },
    ],
  },
  en: {
    badge: 'Accessibility Commitment',
    title: 'Accessibility Statement',
    updated: 'Updated: April 2026',
    intro: 'Emily Tal is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.',
    sections: [
      {
        title: 'Conformance Status',
        body: 'This website conforms to Israeli Standard 5568 (based on WCAG 2.2) at Level AA. We regularly audit and update accessibility as standards evolve.',
      },
      {
        title: 'Accessibility Widget',
        body: 'The website is equipped with an accessibility menu powered by TabNav (tabnav.com) — a certified accessibility provider under Israeli Standard 5568. The menu allows users to customise their browsing experience to suit their needs.',
        tabnav: true,
      },
      {
        title: 'Accessibility Features',
        list: [
          'Floating accessibility menu with display adjustments (powered by TabNav)',
          '"Skip to main content" link — appears on first Tab press',
          'All images include descriptive alternative text (alt text)',
          'Proper heading hierarchy (H1–H3)',
          'ARIA attributes on all interactive components',
          'Focus management in modals and menus',
          'Full RTL (Hebrew) and LTR (English) direction support',
          'Colour contrast meets WCAG 2.2 AA requirements (minimum 4.5:1 for normal text)',
          'No motion or flashing content without a stop mechanism',
          'Full keyboard navigation without a mouse',
          'Respects the system reduced-motion preference — the opening video is replaced by a still image',
          'The 360° knit viewer is operable with the arrow keys, and a static image of the knit is always available alongside it',
          'The live 3D view opens only on an explicit request, orbits and zooms with the arrow keys and the plus and minus keys, and closes back to the static image with Escape',
        ],
      },
      {
        title: 'Supported Technologies',
        body: 'This website has been tested and is compatible with the following assistive technologies:',
        list: [
          'Screen readers: NVDA, JAWS, and VoiceOver (iOS/macOS)',
          'Full keyboard navigation without a mouse',
          'Screen magnification and contrast adjustment tools',
          'Browsers: Chrome, Firefox, Safari, Edge — current versions',
        ],
      },
      {
        title: 'Known Limitations',
        body: 'We make every effort to ensure full accessibility. There may be temporary limitations in newly added content. We work to resolve these as promptly as possible.',
      },
      {
        title: 'Contact for Accessibility',
        body: 'Encountered an accessibility issue? Please contact us — we are happy to help and resolve:\n\nEmail: emilytal22@gmail.com\nPhone: +972-52-482-5858\n\nWe aim to respond within 5 business days.',
      },
      {
        title: 'Enforcement',
        body: 'If you feel your accessibility request has not been adequately addressed, you may contact the Commissioner for Equal Rights of Persons with Disabilities at the Israeli Ministry of Justice.',
      },
    ],
  },
}

export default function AccessibilityStatementClient() {
  const { lang } = useSiteData()
  const t = content[lang]

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="pt-24 pb-10 px-6 text-center border-b border-[#5C3D2E]/10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/50 mb-3">{t.badge}</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519] mb-4">
          {t.title}
        </h1>
        <p className="text-xs text-[#5C3D2E]/40 tracking-wider">{t.updated}</p>
      </div>

      {/* WCAG badge */}
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#1B5299]/5 border border-[#1B5299]/20 rounded-lg">
          <span className="text-[#1B5299] text-sm font-semibold tracking-wide">AA</span>
          <div className="h-5 w-px bg-[#1B5299]/20" />
          <span className="text-[#1B5299]/80 text-xs">WCAG 2.2 Level AA</span>
          <div className="h-5 w-px bg-[#1B5299]/20" />
          <span className="text-[#1B5299]/80 text-xs">{lang === 'he' ? 'תקן ישראלי 5568' : 'Israeli Standard 5568'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-[#5C3D2E]/70 text-sm leading-relaxed mb-12">{t.intro}</p>

        <div className="flex flex-col gap-10">
          {t.sections.map((section) => (
            <div key={section.title} className="border-t border-[#5C3D2E]/10 pt-8">
              <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#3D2519] mb-4 tracking-wide">
                {section.title}
              </h2>
              {section.body && (
                <p className="text-[#5C3D2E]/70 text-sm leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              )}
              {section.list && (
                <ul className="mt-3 flex flex-col gap-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-[#5C3D2E]/70 leading-relaxed">
                      <span className="text-[#5C3D2E]/30 mt-0.5 shrink-0">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
