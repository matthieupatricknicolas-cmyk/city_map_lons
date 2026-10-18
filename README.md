# City Map Lons

Application cartographique web de la collectivité (frontend React + MapLibre GL, backend FastAPI).

## Structure

- `frontend/` : application React (Create React App + CRACO, Tailwind, MapLibre GL)
- `backend/` : API FastAPI (MongoDB via Motor)
- `tests/` : tests automatisés

## Prérequis

- Node.js 18+ et Yarn 1.x
- Python 3.11+
- MongoDB (si le backend est utilisé)

## Lancer le frontend

```bash
cd frontend
yarn install
# créer un fichier .env si besoin, ex. : REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

Build de production :

```bash
yarn build
```

Le dossier `frontend/build/` peut être publié sur n'importe quel serveur statique (GitHub Pages, Nginx, serveur Lizmap…).

## Lancer le backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# variables attendues dans backend/.env : MONGO_URL, DB_NAME, CORS_ORIGINS
uvicorn server:app --reload --port 8001
```

## Branches

- `main` : version stable
- `dev1` : environnement de travail
