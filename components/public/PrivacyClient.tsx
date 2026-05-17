'use client'

import { useSiteData } from '@/lib/context/SiteDataContext'

const content = {
  he: {
    badge: 'שקיפות ואמון',
    title: 'מדיניות פרטיות',
    updated: 'עודכן: אפריל 2026 | בהתאם לחוק הגנת הפרטיות תשמ"א-1981 ותיקון 13 (בתוקף מ-14.8.2025)',
    intro: 'מדיניות פרטיות זו מסבירה כיצד אמילי טל (להלן: "אנו") אוספת, משתמשת ומגינה על המידע האישי שלך בעת השימוש באתר emily-tal.com. אנא קרא מדיניות זו בעיון.',
    sections: [
      {
        title: '1. מי אחראי על המידע',
        body: 'בעל האתר ומחזיק מאגר המידע: אמילי טל\nדוא"ל: emilytal22@gmail.com\nטלפון: 052-482-5858\n\nבכל שאלה הנוגעת לפרטיותך, ניתן לפנות ישירות לכתובות אלה.',
      },
      {
        title: '2. מהו המידע שאנו אוספים',
        body: 'אנו אוספים אך ורק את המידע שאתה מספק מרצונך דרך טופס יצירת הקשר:',
        list: [
          'שם מלא',
          'כתובת דוא"ל',
          'תוכן ההודעה',
        ],
        footer: 'אנו אינם אוספים מידע נוסף — לא כתובת IP לצורכי שמירה, לא נתוני גלישה, לא מיקום גאוגרפי, לא נתוני מכשיר, ואין שימוש בכלי ניתוח (Analytics) כלשהו.',
      },
      {
        title: '3. מטרת איסוף המידע',
        body: 'המידע נאסף לצורך אחד בלבד: מענה לפנייתך ויצירת קשר חוזר בנושא שהעלית בהודעה. המידע לא ישמש לשיווק, פרסום, פילוח, או כל מטרה אחרת מלבד מענה לפנייתך.',
      },
      {
        title: '4. בסיס חוקי לעיבוד המידע',
        body: 'עיבוד המידע מבוסס על הסכמתך המפורשת, הניתנת עם שליחת הטופס, ועל האינטרס הלגיטימי שלנו לענות לפניות המופנות אלינו.',
      },
      {
        title: '5. כיצד ולאיפה המידע נשמר',
        body: 'ההודעות נשמרות בשירות Supabase (www.supabase.com), ספק תשתית בסיסי נתונים מאובטח. השרתים עשויים להיות ממוקמים מחוץ לישראל (באיחוד האירופי או בארצות הברית). Supabase פועלת בהתאם לתקנות הגנת הנתונים האירופאיות (GDPR) ומפעילה אמצעי אבטחה ברמה גבוהה.\n\nהמידע מאובטח בהצפנה בעת העברה (TLS) ובמנוחה, ומוגן באמצעות בקרת גישה מחמירה.',
      },
      {
        title: '6. תקופת שמירת המידע',
        body: 'הודעות שנשלחו דרך טופס יצירת הקשר נשמרות לתקופה של עד 24 חודשים ממועד קבלתן, ולאחר מכן נמחקות. בקשות מחיקה לפני תום תקופה זו יטופלו בהתאם לסעיף 9 להלן.',
      },
      {
        title: '7. העברת מידע לצדדים שלישיים',
        body: 'אנו אינם מוכרים, משכירים, מעבירים או חולקים את פרטיך עם צדדים שלישיים, למעט:',
        list: [
          'Supabase — ספק אחסון הנתונים (מעבד נתונים), הפועל מכוח הסכם עיבוד נתונים תקני',
          'גורמים המוסמכים לכך על פי דין, אם נדרש כך על פי חוק',
        ],
      },
      {
        title: '8. עוגיות (Cookies)',
        body: 'האתר משתמש בעוגייה פונקציונלית אחת בלבד:\n\nשם: lang | מטרה: שמירת העדפת השפה (עברית/אנגלית) | תוקף: שנה אחת | סוג: פונקציונלי — אינו מעקב\n\nעוגייה זו אינה מזהה אותך, אינה עוקבת אחר הגלישה שלך, ואינה משותפת עם צדדים שלישיים. האתר אינו משתמש בעוגיות פרסומיות, ניתוח התנהגות, או כל עוגיית מעקב.',
      },
      {
        title: '9. זכויותיך כנושא מידע',
        body: 'בהתאם לחוק הגנת הפרטיות תשמ"א-1981 ותיקון 13, יש לך הזכויות הבאות:',
        list: [
          'זכות עיון — לקבל עותק של המידע האישי שנשמר עליך',
          'זכות תיקון — לדרוש תיקון מידע שגוי, חלקי, או מטעה',
          'זכות מחיקה — לדרוש מחיקת המידע שלך ממאגר הנתונים שלנו',
          'זכות התנגדות — להתנגד לעיבוד מסוים של המידע שלך',
        ],
        footer: 'לממש זכויות אלה, פנה אלינו בדוא"ל: emilytal22@gmail.com. נשיב תוך 30 יום.',
      },
      {
        title: '10. אבטחת מידע',
        body: 'אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע שלך, לרבות הצפנת SSL/TLS לכל תקשורת, בקרת גישה לבסיס הנתונים, ואחסון מאובטח אצל ספק מוסמך.',
      },
      {
        title: '11. שינויים במדיניות',
        body: 'אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו. שינויים מהותיים יפורסמו באתר עם עדכון תאריך "עודכן" בראש הדף. המשך השימוש לאחר שינוי כזה מהווה הסכמה למדיניות המעודכנת.',
      },
      {
        title: '12. פנייה לרשות להגנת הפרטיות',
        body: 'אם אינך מרוצה מהטיפול בבקשתך, ביכולתך לפנות לרשות להגנת הפרטיות במשרד המשפטים:\nwww.gov.il/he/departments/privacy_protection_authority',
      },
    ],
  },
  en: {
    badge: 'Transparency & Trust',
    title: 'Privacy Policy',
    updated: 'Updated: April 2026 | In accordance with the Israeli Privacy Protection Law 1981 and Amendment 13 (effective 14.8.2025)',
    intro: 'This Privacy Policy explains how Emily Tal ("we") collects, uses, and protects your personal information when you use the website. Please read this policy carefully.',
    sections: [
      {
        title: '1. Data Controller',
        body: 'Website owner and data controller: Emily Tal\nEmail: emilytal22@gmail.com\nPhone: +972-52-482-5858\n\nFor any questions about your privacy, please contact us directly at the above.',
      },
      {
        title: '2. What Data We Collect',
        body: 'We collect only the information you voluntarily provide through the contact form:',
        list: [
          'Full name',
          'Email address',
          'Message content',
        ],
        footer: 'We do not collect any additional data — no IP addresses for storage, no browsing data, no geolocation, no device data, and we use no analytics tools of any kind.',
      },
      {
        title: '3. Purpose of Collection',
        body: 'Data is collected for one purpose only: to respond to your inquiry and follow up on the subject of your message. Your data will not be used for marketing, advertising, profiling, or any other purpose beyond responding to your contact.',
      },
      {
        title: '4. Legal Basis for Processing',
        body: 'Processing is based on your explicit consent, given when you submit the form, and on our legitimate interest in responding to inquiries directed to us.',
      },
      {
        title: '5. Where Data Is Stored',
        body: 'Messages are stored with Supabase (www.supabase.com), a secure database infrastructure provider. Servers may be located outside Israel (in the European Union or the United States). Supabase operates in accordance with European data protection regulations (GDPR) and maintains high-level security standards.\n\nAll data is encrypted in transit (TLS) and at rest, and is protected by strict access controls.',
      },
      {
        title: '6. Data Retention',
        body: 'Messages submitted through the contact form are retained for up to 24 months from the date of receipt and then deleted. Deletion requests submitted before the end of this period will be handled as per Section 9 below.',
      },
      {
        title: '7. Sharing with Third Parties',
        body: 'We do not sell, rent, transfer, or share your personal data with any third party, except:',
        list: [
          'Supabase — our data storage provider (data processor), operating under a standard data processing agreement',
          'Entities legally authorised to receive it, where required by applicable law',
        ],
      },
      {
        title: '8. Cookies',
        body: 'The website uses one functional cookie only:\n\nName: lang | Purpose: saves your language preference (Hebrew/English) | Duration: 1 year | Type: Functional — not tracking\n\nThis cookie does not identify you, does not track your browsing, and is not shared with third parties. The website uses no advertising cookies, behavioural analytics, or any tracking cookies.',
      },
      {
        title: '9. Your Rights',
        body: 'Under the Israeli Privacy Protection Law 1981 and Amendment 13, you have the following rights:',
        list: [
          'Right of access — to receive a copy of the personal data we hold about you',
          'Right of rectification — to request correction of inaccurate, incomplete, or misleading data',
          'Right of erasure — to request deletion of your data from our records',
          'Right to object — to object to certain processing of your data',
        ],
        footer: 'To exercise these rights, contact us at: emilytal22@gmail.com. We will respond within 30 days.',
      },
      {
        title: '10. Data Security',
        body: 'We implement reasonable security measures to protect your data, including SSL/TLS encryption for all communications, access controls on the database, and secure storage with a certified provider.',
      },
      {
        title: '11. Changes to This Policy',
        body: 'We reserve the right to update this policy. Material changes will be published on the website with an updated "Updated" date at the top. Continued use after such a change constitutes acceptance of the updated policy.',
      },
      {
        title: '12. Supervisory Authority',
        body: 'If you are not satisfied with how your request was handled, you may contact the Israeli Privacy Protection Authority at the Ministry of Justice:\nwww.gov.il/he/departments/privacy_protection_authority',
      },
    ],
  },
}

export default function PrivacyClient() {
  const { lang } = useSiteData()
  const t = content[lang]

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="pt-24 pb-10 px-6 text-center border-b border-[#5C3D2E]/10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#5C3D2E]/50 mb-3">{t.badge}</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#3D2519] mb-4">
          {t.title}
        </h1>
        <p className="text-xs text-[#5C3D2E]/40 tracking-wider">{t.updated}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
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
              {section.footer && (
                <p className="mt-3 text-[#5C3D2E]/70 text-sm leading-relaxed">{section.footer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
