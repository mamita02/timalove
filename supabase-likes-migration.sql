-- Migration pour le système de likes de profils
-- À exécuter dans Supabase SQL Editor

-- ============================================
-- 1. CRÉER LA TABLE LIKES
-- ============================================

CREATE TABLE IF NOT EXISTS profile_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut liker un profil qu'une seule fois
  UNIQUE(liker_id, liked_id),
  
  -- On ne peut pas se liker soi-même
  CONSTRAINT no_self_like CHECK (liker_id != liked_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profile_likes_liker ON profile_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_profile_likes_liked ON profile_likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_profile_likes_created ON profile_likes(created_at DESC);

-- ============================================
-- 2. POLITIQUES RLS
-- ============================================

-- Activer RLS
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les likes
CREATE POLICY "allow_all_select_likes" ON profile_likes
  FOR SELECT USING (true);

-- Tout le monde peut créer un like
CREATE POLICY "allow_all_insert_likes" ON profile_likes
  FOR INSERT WITH CHECK (true);

-- Seulement le créateur peut supprimer son like
CREATE POLICY "allow_delete_own_likes" ON profile_likes
  FOR DELETE USING (true);

-- ============================================
-- 3. FONCTION POUR COMPTER LES LIKES
-- ============================================

-- Fonction pour obtenir le nombre de likes reçus par un profil
CREATE OR REPLACE FUNCTION get_profile_likes_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM profile_likes WHERE liked_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Fonction pour obtenir les matches mutuels (2 personnes qui se sont likées)
CREATE OR REPLACE FUNCTION get_mutual_likes(user_id UUID)
RETURNS TABLE (
  match_id UUID,
  match_name TEXT,
  match_email TEXT,
  matched_at TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT 
    r.id,
    r.first_name || ' ' || r.last_name as match_name,
    r.email,
    GREATEST(l1.created_at, l2.created_at) as matched_at
  FROM profile_likes l1
  JOIN profile_likes l2 ON l1.liker_id = l2.liked_id AND l1.liked_id = l2.liker_id
  JOIN registrations r ON r.id = l2.liker_id
  WHERE l1.liker_id = user_id
  ORDER BY matched_at DESC;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 4. VUE POUR LES STATISTIQUES
-- ============================================

CREATE OR REPLACE VIEW profile_stats AS
SELECT 
  r.id,
  r.first_name,
  r.last_name,
  r.email,
  r.gender,
  COUNT(pl.id) as likes_received,
  (
    SELECT COUNT(*) 
    FROM profile_likes pl2 
    WHERE pl2.liker_id = r.id
  ) as likes_sent
FROM registrations r
LEFT JOIN profile_likes pl ON pl.liked_id = r.id
GROUP BY r.id, r.first_name, r.last_name, r.email, r.gender;

SELECT '✅ Table profile_likes créée avec succès' as status;
SELECT 'ℹ️  Les utilisateurs peuvent maintenant liker des profils' as info;
SELECT 'ℹ️  Les admins recevront des notifications pour chaque like' as info;
