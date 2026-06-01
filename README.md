# BloodMatch 🩸

Plateforme de don de sang en temps réel — React + Vite + Supabase.

## Démarrage rapide

### 1. Supabase (SQL Editor, dans l’ordre)

| Fichier | Rôle |
|---------|------|
| `supabase/schema.sql` | Tables, RLS, fonctions (tout-en-un) |
| `supabase/import-hopitals-osm.sql` | Hôpitaux Algérie (CSV OSM, `amenity=hospital`, dédupliqués) |
| `supabase/seed-admin.sql` | Lier un admin à un CHU (optionnel) |
| `supabase/dedupe-hopitals.sql` | Nettoyer doublons si import partiel (optionnel) |

Super admin (une fois) :

```sql
INSERT INTO profiles (id, role, first_name, last_name, region)
VALUES ('UUID_AUTH', 'super_admin', 'Admin', 'BloodMatch', 'Alger');
```

**Auth** : désactiver **Confirm email** pour les tests.

### 2. Frontend

```bash
cd bloodmatch
cp .env.example .env
npm install
npm run dev
```

Setup rapide admin : **http://localhost:5175/dev-setup**

### 3. Régénérer les hôpitaux (CSV recommandé)

Fichier par défaut : `Desktop\algeria_health_facilities_dataset.csv` (hôpitaux uniquement).

```bash
npm run import:hospitals
# ou avec chemin explicite :
npm run import:hospitals -- "C:\Users\Click\Desktop\algeria_health_facilities_dataset.csv"
```

KML (ancienne source, inclut aussi cliniques nommées « hospital ») :

```bash
npm run import:hospitals:kml -- "C:\chemin\hotosm_dza_health_facilities_polygons_kml.kml"
```

Puis ré-exécuter `import-hopitals-osm.sql` dans Supabase.

## Rôles

| Rôle | Accès |
|------|--------|
| `super_admin` | Créer admins hôpital (liste OSM) |
| `admin_hopital` | Demandes, broadcast |
| `patient` | Demande de sang → hôpital de sa wilaya |
| `donneur` | Alertes temps réel |

## Stack

React 19 · Vite 8 · Tailwind 4 · Supabase · React Router 7 · Zustand
