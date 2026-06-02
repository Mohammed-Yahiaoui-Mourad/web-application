# BloodMatch 🩸

Plateforme de don de sang en temps réel — React + Vite + FastAPI.

## Démarrage rapide

### 1. Backend (Amal)

Consultez le dossier `Amal` pour les instructions de démarrage du backend.

### 2. Frontend

```bash
cd web-application
npm install
npm run dev
```

Setup rapide admin : **http://localhost:5175/dev-setup**

## Rôles

| Rôle | Accès |
|------|--------|
| `admin_hopital` | Gestion des demandes, broadcast, et création d'autres admins |
| `patient` | Demande de sang → hôpital de sa wilaya |
| `donneur` | Alertes temps réel |

## Stack

React 19 · Vite 8 · Tailwind 4 · FastAPI · SQLModel · Zustand
