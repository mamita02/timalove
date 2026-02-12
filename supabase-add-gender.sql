-- Migration pour ajouter le champ gender à la table registrations
-- À exécuter dans Supabase SQL Editor

-- Vérifier si la colonne existe déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='registrations' AND column_name='gender'
  ) THEN
    -- Ajouter la colonne gender avec valeur par défaut
    ALTER TABLE registrations 
    ADD COLUMN gender TEXT DEFAULT 'male' 
    CHECK (gender IN ('male', 'female'));
    
    -- Créer un index pour les recherches par genre
    CREATE INDEX IF NOT EXISTS idx_registrations_gender 
    ON registrations(gender);
    
    RAISE NOTICE 'Colonne gender ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne gender existe déjà';
  END IF;
END $$;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'registrations' 
ORDER BY ordinal_position;
