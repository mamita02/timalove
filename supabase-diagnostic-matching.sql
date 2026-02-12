-- Script de diagnostic complet pour le matching
-- À exécuter dans Supabase SQL Editor

-- ============================================
-- 1. VÉRIFIER LES DONNÉES
-- ============================================
SELECT '=== INSCRIPTIONS ===' as section;
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN gender = 'male' THEN 1 END) as hommes,
       COUNT(CASE WHEN gender = 'female' THEN 1 END) as femmes
FROM registrations;

SELECT '=== 5 DERNIÈRES INSCRIPTIONS ===' as section;
SELECT id, first_name, last_name, email, gender, status, created_at 
FROM registrations 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================
-- 2. VÉRIFIER LES POLITIQUES RLS
-- ============================================
SELECT '=== POLITIQUES RLS ACTUELLES ===' as section;
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'registrations'
ORDER BY policyname;

-- ============================================
-- 3. CORRIGER LES POLITIQUES SI NÉCESSAIRE
-- ============================================

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Inscription publique" ON registrations;
DROP POLICY IF EXISTS "Lecture publique développement" ON registrations;
DROP POLICY IF EXISTS "Admin lecture" ON registrations;
DROP POLICY IF EXISTS "Admin mise à jour" ON registrations;
DROP POLICY IF EXISTS "Admin suppression" ON registrations;
DROP POLICY IF EXISTS "Tout le monde peut créer inscription" ON registrations;
DROP POLICY IF EXISTS "Tout le monde peut lire inscriptions" ON registrations;
DROP POLICY IF EXISTS "Tout le monde peut modifier inscriptions" ON registrations;
DROP POLICY IF EXISTS "Tout le monde peut supprimer inscriptions" ON registrations;

-- Créer des politiques PERMISSIVES (pour développement)
CREATE POLICY "allow_all_insert" ON registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_select" ON registrations
  FOR SELECT USING (true);

CREATE POLICY "allow_all_update" ON registrations
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_delete" ON registrations
  FOR DELETE USING (true);

SELECT '=== POLITIQUES APRÈS CORRECTION ===' as section;
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'registrations'
ORDER BY policyname;

SELECT '✅ Configuration terminée' as status;
