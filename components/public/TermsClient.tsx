'use client'

import { useLang } from './LangProvider'

const content = {
  he: {
    badge: 'מסמך משפטי',
    title: 'תקנון ותנאי שימוש',
    updated: 'עודכן לאחרונה: אפריל 2026',
    intro: 'ברוכים הבאים לאתר של אמילי טל (להלן: "האתר"). בגישה לאתר זה או בשימוש בו, הנך מסכים לתנאי השימוש המפורטים להלן. אנא קרא אותם בעיון לפני השימוש באתר.',
    sections: [
      {
        title: '1. קניין רוחני',
        body: 'כל התכנים באתר זה, לרבות אך לא רק תמונות, צילומים, עיצובים, יצירות אמנות, איורים, גרפיקה, טקסטים ולוגו (להלן: "התכנים"), הינם רכושה הבלעדי של אמילי טל ומוגנים על פי חוקי זכויות היוצרים והקניין הרוחני החלים בישראל ובינלאומית, לרבות חוק זכות יוצרים, תשס"ח–2007, ואמנות בינלאומיות. כל הזכויות שמורות.',
      },
      {
        title: '2. שימוש מותר',
        body: 'מותר לך לגשת ולצפות בתכנים באתר זה לצרכים אישיים ולא מסחריים בלבד. מותר לשתף קישורים לאתר ברשתות חברתיות ובפלטפורמות אחרות, בתנאי שהקרדיט לאמילי טל נשמר.',
      },
      {
        title: '3. שימוש אסור',
        body: 'ללא הסכמה מראש ובכתב של אמילי טל, אינך רשאי:',
        list: [
          'להעתיק, לשכפל, להפיץ, לפרסם, להעביר או לשנות תכנים כלשהם מהאתר',
          'לעשות שימוש מסחרי כלשהו בתכנים, לרבות מכירה, רישוי או שימוש פרסומי',
          'ליצור יצירות נגזרות המבוססות על התכנים',
          'להסיר, לטשטש או לשנות הודעות זכויות יוצרים, ייחוסים או סימנים מסחריים',
          'לעשות שימוש בתכנים בכל דרך הפוגעת בזכויותיה של אמילי טל או שעלולה להטעות לגבי מקורם',
        ],
      },
      {
        title: '4. רישוי ושיתוף פעולה',
        body: 'לפניות בנוגע לרישוי, שיתוף פעולה מסחרי או שימוש בתכנים לכל מטרה שאינה אישית, אנא צור קשר בכתב: emilytal22@gmail.com. כל שימוש ללא אישור מפורש בכתב מהווה הפרת זכויות יוצרים.',
      },
      {
        title: '5. פרטיות',
        body: 'אתר זה אינו אוסף מידע אישי מעבר למה שאתה מוסר מרצונך דרך טופס יצירת הקשר. המידע שתספק ישמש אך ורק למתן מענה לפנייתך, ולא יועבר לצדדים שלישיים ללא הסכמתך, למעט במקרים הנדרשים על פי חוק.',
      },
      {
        title: '6. הגבלת אחריות',
        body: 'האתר ותכניו מסופקים "כפי שהם" (AS IS), ללא כל אחריות, מפורשת או משתמעת, לרבות אחריות לסחירות, התאמה למטרה מסוימת, או אי-הפרה. אמילי טל אינה מתחייבת שהאתר יפעל ללא שגיאות, הפרעות או שהתכנים מדויקים בכל עת.',
      },
      {
        title: '7. הגבלת חבות',
        body: 'במידה המרבית המותרת על פי הדין החל, אמילי טל, שותפיה, נציגיה ומנהליה לא יישאו בכל אחריות לנזקים ישירים, עקיפים, מקריים, מיוחדים, עונשיים או תוצאתיים הנובעים מגישתך לאתר, שימושך בו, או אי-יכולתך להשתמש בו.',
      },
      {
        title: '8. קישורים לצדדים שלישיים',
        body: 'האתר עשוי להכיל קישורים לאתרים חיצוניים כגון אינסטגרם. קישורים אלה מסופקים לנוחיותך בלבד. אמילי טל אינה שולטת בתכנים של אתרים אלה ואינה אחראית לתכניהם, לפרקטיקות הפרטיות שלהם, או לכל נזק שעלול לנבוע מהשימוש בהם.',
      },
      {
        title: '9. שינויים בתנאים',
        body: 'אמילי טל שומרת לעצמה את הזכות לעדכן תנאים אלה בכל עת, לפי שיקול דעתה הבלעדי. שינויים מהותיים יפורסמו באתר. המשך השימוש באתר לאחר פרסום שינויים מהווה הסכמה לתנאים המעודכנים. מומלץ לבקר בדף זה מעת לעת.',
      },
      {
        title: '10. דין חל וסמכות שיפוט',
        body: 'תנאים אלה כפופים לדיני מדינת ישראל בלעדית, מבלי להתחשב בכללי ברירת הדין. כל מחלוקת הנובעת מתנאים אלה או מהשימוש באתר תידון בלעדית בבתי המשפט המוסמכים בישראל, ואתה מסכים בזאת לסמכות השיפוט הבלעדית שלהם.',
      },
      {
        title: '11. יצירת קשר',
        body: 'לשאלות, הערות או בקשות בנוגע לתנאים אלה, אנא פנה אלינו:\nדוא"ל: emilytal22@gmail.com\nטלפון: 052-482-5858',
      },
    ],
  },
  en: {
    badge: 'Legal Document',
    title: 'Terms of Use',
    updated: 'Last updated: April 2026',
    intro: 'Welcome to the website of Emily Tal (hereinafter: "the Website"). By accessing or using this Website, you agree to the following Terms of Use. Please read them carefully before using the Website.',
    sections: [
      {
        title: '1. Intellectual Property',
        body: 'All content on this Website, including but not limited to images, photographs, designs, artworks, illustrations, graphics, text, and logo (collectively, "Content"), is the exclusive property of Emily Tal and is protected by applicable copyright and intellectual property laws in Israel and internationally, including the Israeli Copyright Act 2007 and international conventions to which Israel is a party. All rights reserved.',
      },
      {
        title: '2. Permitted Use',
        body: 'You may access and view the Content on this Website for personal, non-commercial purposes only. You may share links to this Website on social media or other platforms, provided that proper credit to Emily Tal is maintained.',
      },
      {
        title: '3. Prohibited Use',
        body: 'Without the prior written consent of Emily Tal, you may not:',
        list: [
          'Copy, reproduce, distribute, publish, transmit, or modify any Content from this Website',
          'Use the Content for any commercial purpose, including sale, licensing, or advertising',
          'Create derivative works based on the Content',
          'Remove, obscure, or alter any copyright notices, attributions, or trademarks',
          'Use the Content in any manner that infringes upon the rights of Emily Tal or that may mislead as to its origin',
        ],
      },
      {
        title: '4. Licensing & Collaboration',
        body: 'For licensing inquiries, commercial collaborations, or use of Content for any non-personal purpose, please contact in writing: emilytal22@gmail.com. Any use without explicit written permission constitutes copyright infringement.',
      },
      {
        title: '5. Privacy',
        body: 'This Website does not collect personal information beyond what you voluntarily provide through the contact form. Information you submit will be used solely to respond to your inquiry and will not be shared with third parties without your consent, except as required by law.',
      },
      {
        title: '6. Disclaimer of Warranties',
        body: 'This Website and its Content are provided "as is" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Emily Tal does not warrant that the Website will be error-free, uninterrupted, or that the Content is accurate at all times.',
      },
      {
        title: '7. Limitation of Liability',
        body: 'To the fullest extent permitted by applicable law, Emily Tal, her affiliates, representatives, and officers shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages arising from your access to, use of, or inability to use this Website.',
      },
      {
        title: '8. Third-Party Links',
        body: 'This Website may contain links to external websites such as Instagram. These links are provided for your convenience only. Emily Tal does not control the content of these websites and is not responsible for their content, privacy practices, or any damage that may result from your use of them.',
      },
      {
        title: '9. Changes to Terms',
        body: 'Emily Tal reserves the right to update these Terms at any time at her sole discretion. Material changes will be posted on the Website. Your continued use of the Website following any changes constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.',
      },
      {
        title: '10. Governing Law & Jurisdiction',
        body: 'These Terms are governed exclusively by the laws of the State of Israel, without regard to its conflict of law principles. Any dispute arising out of or relating to these Terms or the use of this Website shall be subject exclusively to the jurisdiction of the competent courts of Israel, and you hereby consent to such exclusive jurisdiction.',
      },
      {
        title: '11. Contact',
        body: 'For questions, comments, or requests regarding these Terms, please contact us:\nEmail: emilytal22@gmail.com\nPhone: +972-52-482-5858',
      },
    ],
  },
}

export default function TermsClient() {
  const { lang } = useLang()
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

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[#5C3D2E]/70 text-sm leading-relaxed mb-12">{t.intro}</p>

        <div className="flex flex-col gap-10">
          {t.sections.map((section) => (
            <div key={section.title} className="border-t border-[#5C3D2E]/10 pt-8">
              <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#3D2519] mb-4 tracking-wide">
                {section.title}
              </h2>
              <p className="text-[#5C3D2E]/70 text-sm leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
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
