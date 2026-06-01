-- Nettoyer les doublons déjà en base (même nom + wilaya)
-- Garde la ligne la plus complète (adresse, osm_id)

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY region, lower(trim(name))
      ORDER BY
        (CASE WHEN osm_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
        (CASE WHEN address IS NOT NULL AND length(address) > 3 THEN 1 ELSE 0 END) DESC,
        length(name) DESC,
        created_at NULLS LAST
    ) AS rn
  FROM hopitals
),
to_delete AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM hopitals WHERE id IN (SELECT id FROM to_delete);

-- Réassigner les admins orphelins vers le CHU principal de leur wilaya
UPDATE profiles p
SET hopital_id = sub.id
FROM (
  SELECT DISTINCT ON (region)
    region, id
  FROM hopitals
  WHERE name ILIKE '%CHU%' OR name ILIKE '%hospitalier universitaire%'
  ORDER BY region, length(name) DESC
) sub
WHERE p.role = 'admin_hopital'
  AND p.region = sub.region
  AND (p.hopital_id IS NULL OR p.hopital_id NOT IN (SELECT id FROM hopitals));
