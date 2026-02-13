-- ============================================================
-- SETUP RAPIDE : MATCHS + LIKES + NOTIFICATIONS
-- Copiez et collez ce code dans Supabase SQL Editor
-- ============================================================

-- 1. TABLE DES MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  man_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  woman_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  man_name TEXT NOT NULL,
  woman_name TEXT NOT NULL,
  man_email TEXT NOT NULL,
  woman_email TEXT NOT NULL,
  meet_link TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  CONSTRAINT unique_match UNIQUE(man_id, woman_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_scheduled_date ON matches(scheduled_date DESC);

-- 2. TABLE DES LIKES
CREATE TABLE IF NOT EXISTS profile_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  liker_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT unique_like UNIQUE(liker_id, liked_id),
  CONSTRAINT no_self_like CHECK (liker_id != liked_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_liker ON profile_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_profile_likes_liked ON profile_likes(liked_id);

-- 3. FONCTION POUR NOTIFIER L'ADMIN D'UN NOUVEAU LIKE
-- (Stocké dans localStorage côté client, mais on peut aussi logger ici)
CREATE OR REPLACE FUNCTION notify_new_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Log pour l'admin (optionnel - pourrait être utilisé pour un système de notif temps réel)
  RAISE NOTICE 'Nouveau like: % a liké %', NEW.liker_id, NEW.liked_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_like ON profile_likes;
CREATE TRIGGER on_new_like
AFTER INSERT ON profile_likes
FOR EACH ROW
EXECUTE FUNCTION notify_new_like();

-- 4. RLS (Row Level Security)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;

-- Politique: lecture publique pour demo (à restreindre en prod)
CREATE POLICY "Allow read access to all users" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated" ON matches FOR UPDATE USING (true);

CREATE POLICY "Allow read likes" ON profile_likes FOR SELECT USING (true);
CREATE POLICY "Allow insert likes" ON profile_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete own likes" ON profile_likes FOR DELETE USING (true);

-- ✅ TERMINÉ ! Les tables sont créées.
