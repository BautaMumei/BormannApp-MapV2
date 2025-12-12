/*
  # Création du schéma de base de données pour le plan de cirque

  1. Nouvelles Tables
    - `seat_reservations`
      - `id` (uuid, clé primaire)
      - `seat_id` (text, identifiant unique du siège au format "sectorId-row-seatNum")
      - `status` (text, statut: 'free', 'reserved', 'occupied')
      - `group_name` (text, nom du groupe si applicable)
      - `created_at` (timestamptz, date de création)
      - `updated_at` (timestamptz, date de modification)
  
  2. Sécurité
    - Activer RLS sur la table `seat_reservations`
    - Ajouter une politique pour permettre la lecture publique (l'application est publique)
    - Ajouter une politique pour permettre les modifications publiques (gestion de places)
  
  3. Index
    - Index unique sur `seat_id` pour des recherches rapides
    - Index sur `status` et `group_name` pour les filtres

  Notes importantes:
  - Cette application de gestion de places de cirque est conçue pour être publique
  - Un seul état global partagé pour tous les utilisateurs
  - Les modifications sont en temps réel
*/

-- Créer la table des réservations de sièges
CREATE TABLE IF NOT EXISTS seat_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'free',
  group_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter un index unique sur seat_id pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_seat_reservations_seat_id ON seat_reservations(seat_id);

-- Index pour filtrer par statut
CREATE INDEX IF NOT EXISTS idx_seat_reservations_status ON seat_reservations(status);

-- Index pour filtrer par groupe
CREATE INDEX IF NOT EXISTS idx_seat_reservations_group_name ON seat_reservations(group_name);

-- Contrainte pour vérifier que le statut est valide
ALTER TABLE seat_reservations DROP CONSTRAINT IF EXISTS check_valid_status;
ALTER TABLE seat_reservations ADD CONSTRAINT check_valid_status 
  CHECK (status IN ('free', 'reserved', 'occupied'));

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_seat_reservations_updated_at ON seat_reservations;
CREATE TRIGGER update_seat_reservations_updated_at
  BEFORE UPDATE ON seat_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE seat_reservations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous (application publique)
CREATE POLICY "Tout le monde peut lire les réservations"
  ON seat_reservations
  FOR SELECT
  TO anon
  USING (true);

-- Politique pour permettre l'insertion à tous
CREATE POLICY "Tout le monde peut créer des réservations"
  ON seat_reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique pour permettre la mise à jour à tous
CREATE POLICY "Tout le monde peut modifier les réservations"
  ON seat_reservations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Politique pour permettre la suppression à tous
CREATE POLICY "Tout le monde peut supprimer les réservations"
  ON seat_reservations
  FOR DELETE
  TO anon
  USING (true);