-- Lier un admin hôpital (après import OSM + création user Auth)
-- Remplacer COLLER_UUID_ICI et ajuster le nom d'hôpital si besoin

INSERT INTO profiles (id, role, first_name, last_name, region, hopital_id, phone)
SELECT
  'COLLER_UUID_ICI'::uuid,
  'admin_hopital',
  'Admin',
  'CHU',
  h.region,
  h.id,
  NULL
FROM hopitals h
WHERE h.region = 'Oran'
  AND (h.name ILIKE '%CHU%' OR h.name ILIKE '%Centre Hospitalier Universitaire%')
ORDER BY length(h.name) DESC
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  hopital_id = EXCLUDED.hopital_id,
  region = EXCLUDED.region;
