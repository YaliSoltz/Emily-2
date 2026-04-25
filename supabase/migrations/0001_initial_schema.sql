-- Emily Tal Portfolio — Initial Schema
-- Run this in Supabase Dashboard → SQL Editor

-- ─────────────────────────────────────────
-- PAGES (Home, About, Contact content)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name    text NOT NULL,          -- 'home' | 'about' | 'contact'
  language     text NOT NULL DEFAULT 'he', -- 'he' | 'en'
  content_json jsonb NOT NULL DEFAULT '{}',
  images_json  jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (page_name, language)
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pages" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write pages" ON pages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────
-- GALLERY ITEMS (Portfolio pieces)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  image_url   text,
  category    text,               -- 'textile' | 'knitting' | 'screen-printing'
  order_index integer DEFAULT 0,
  language    text NOT NULL DEFAULT 'he',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write gallery" ON gallery_items
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────
-- MESSAGES (Contact form submissions)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text NOT NULL,
  message      text NOT NULL,
  read_status  boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit message" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read messages" ON messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated update messages" ON messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated delete messages" ON messages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────
-- CONTACT INFO
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_info (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      text,
  email      text,
  address    text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read contact_info" ON contact_info
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write contact_info" ON contact_info
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────
-- SOCIAL LINKS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform    text NOT NULL,    -- 'instagram' | 'whatsapp'
  url         text NOT NULL,
  order_index integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read social_links" ON social_links
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write social_links" ON social_links
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────
-- UPDATED_AT trigger function
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER gallery_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contact_info_updated_at
  BEFORE UPDATE ON contact_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- SEED: Default contact info & social links
-- ─────────────────────────────────────────
INSERT INTO contact_info (phone, email)
VALUES ('0524825858', 'emilytal22@gmail.com')
ON CONFLICT DO NOTHING;

INSERT INTO social_links (platform, url, order_index)
VALUES
  ('instagram', 'https://instagram.com/emily_kryzewski', 1),
  ('whatsapp',  'https://wa.me/972524825858',            2)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- SEED: Default page content (Hebrew + English)
-- ─────────────────────────────────────────
INSERT INTO pages (page_name, language, content_json, images_json) VALUES
('home', 'he', '{
  "hero_title": "עיצוב שמדבר בשקט",
  "hero_subtitle": "תיק עבודות — עיצוב טקסטיל, סריגה והדפסי רשת",
  "hero_cta": "צפייה בעבודות",
  "intro_text": "ברוכים הבאים לעולם של אמילי טל — מעצבת טקסטיל עם עין חדה לפרטים ואהבה לחומרים."
}', '{}'),

('home', 'en', '{
  "hero_title": "Design That Speaks Quietly",
  "hero_subtitle": "Portfolio — Textile Design, Knitting & Screen Printing",
  "hero_cta": "View Work",
  "intro_text": "Welcome to Emily Tal''s world — a textile designer with a sharp eye for detail and a love for materials."
}', '{}'),

('about', 'he', '{
  "title": "אודות",
  "bio": "אני אמילי טל, מעצבת טקסטיל בוגרת תואר ראשון. העבודות שלי עוסקות בחקירת חומרים, מרקמים וטכניקות — מסריגה ביד ועד הדפסת מסך. אני מחפשת שיתופי פעולה עם מותגים ועסקים שמחפשים נגיעה ייחודית ומעוצבת.",
  "disciplines_title": "תחומי עיסוק",
  "disciplines": ["עיצוב טקסטיל", "סריגה", "הדפסי רשת"]
}', '{}'),

('about', 'en', '{
  "title": "About",
  "bio": "I''m Emily Tal, a textile design graduate. My work explores materials, textures and techniques — from hand knitting to screen printing. I''m looking for collaborations with brands and businesses seeking a unique, crafted touch.",
  "disciplines_title": "Disciplines",
  "disciplines": ["Textile Design", "Knitting", "Screen Printing"]
}', '{}'),

('contact', 'he', '{
  "title": "יצירת קשר",
  "subtitle": "מעוניינים בשיתוף פעולה? שלחו הודעה.",
  "name_label": "שם",
  "email_label": "אימייל",
  "message_label": "הודעה",
  "submit_label": "שליחה",
  "success_message": "ההודעה נשלחה בהצלחה. אחזור אליך בהקדם!"
}', '{}'),

('contact', 'en', '{
  "title": "Contact",
  "subtitle": "Interested in collaborating? Send a message.",
  "name_label": "Name",
  "email_label": "Email",
  "message_label": "Message",
  "submit_label": "Send",
  "success_message": "Message sent successfully. I will get back to you soon!"
}', '{}')

ON CONFLICT (page_name, language) DO NOTHING;
