# [Concept Name] — codecrumbs.in

> TODO: One line explaining what concept this demo teaches.

## What is [Concept]?

TODO: 2–3 line explanation of the concept. What problem does it solve? Where is it used in the real world?

## What this demo shows

TODO:
- Bullet describing what the learner can do in the UI
- Bullet describing what they will observe in the response
- Bullet describing any edge cases or "aha" moments the demo surfaces

## Live Demo

TODO: https://codecrumbs.in/concept-name

## Run locally

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then edit .env if needed
uvicorn main:app --reload
```

The API will be available at http://localhost:8000.
Check http://localhost:8000/health to confirm it's running.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Requests to `/api/*` are automatically proxied to
the FastAPI backend — no CORS configuration needed during local development.

## How it works

TODO: Explain the architecture of this specific demo. How does the frontend
communicate with the backend? What does the backend actually do to illustrate
the concept? What would a learner trace through if they read the code?

## Tech used

- **FastAPI** — Python web framework for the backend API
- **React + Vite** — frontend UI with fast dev-server proxy
- **Nginx** — reverse proxy for production (see `nginx/demo.conf`)
- **systemd** — process manager for the backend in production (see `systemd/demo.service`)
- TODO: Add concept-specific libraries here (e.g. `pyjwt`, `slowapi`, `redis`)

## Part of codecrumbs.in

TODO: One line about the project — e.g. "This demo is part of [codecrumbs.in](https://codecrumbs.in), a collection of interactive CS concept demos."
