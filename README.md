# JWT Authentication — codecrumbs.in

> An interactive demo that teaches how JSON Web Tokens work by letting you sign in, inspect the token, call a protected route, and tamper with the token to see exactly how verification fails.

## What is JWT?

JSON Web Tokens (JWTs) solve the problem of stateless authentication: instead of storing session data on the server, all the information needed to verify a user's identity is encoded directly in a signed token. The server issues the token at login, the client stores it, and every subsequent request carries the token — the server just verifies the signature. JWTs are used everywhere: REST APIs, single-page apps, mobile backends, and microservices.

## What this demo shows

- **Stage 1 — Sign in and receive a token** — submit credentials and watch the backend issue a real JWT; the token is decoded on the spot so you can read the header, payload, and signature.
- **Stage 2 — Use the token to access a protected route** — see how the `Authorization: Bearer` header works and what the backend returns when the token is valid.
- **Stage 3 — Tamper with the token and observe the failure** — edit any character in the token, hit Verify, and get a precise error (`SignatureVerificationError`, `TokenExpiredError`, `MalformedToken`) with a plain-English explanation of why it failed.
- **Stage 4 — Refresh Token Flow** — watch a live countdown as the short-lived access token (2 minutes) approaches expiry, then use the long-lived refresh token to silently get a new access token without re-logging in. A side-by-side comparison shows the old vs new `iat`/`exp`/`jti` claims.
- **Stage 5 — Token Revocation: The JWT Tradeoff** — experience the stateless gotcha: a naive client-side logout leaves the token technically valid. Then see the blocklist fix in action — the backend stores each token's unique `jti` claim and rejects revoked tokens even before they expire.

## Live Demo

https://codecrumbs.in/jwt

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
cp .env.example .env
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

Open http://localhost:5173. Requests to `/api/*` are automatically proxied to the FastAPI backend — no CORS configuration needed during local development.

## How it works

1. **Login** — the frontend posts `{ username, password }` to `POST /api/login`. The backend issues two tokens: a short-lived **access token** (2 minutes, with a `jti` UUID claim) and a long-lived **refresh token** (7 days).
2. **Token issued** — the raw access token is displayed and split into its three base64-encoded parts so you can see the header (algorithm), payload (user + timestamps + jti), and signature side-by-side.
3. **Bearer auth** — clicking "Call Protected Route" sends `Authorization: Bearer <token>` to `GET /api/protected`. The backend decodes and verifies the signature before returning the protected resource.
4. **Tamper detection** — `POST /api/verify` accepts any string. If the signature doesn't match the header + payload (because you changed something), PyJWT raises `InvalidSignatureError`. If the token is structurally broken, it raises `DecodeError`. Each exception maps to a labelled, human-readable error shown in the UI.
5. **Refresh flow** — `POST /api/refresh` accepts a refresh token, verifies its `type: "refresh"` claim, and returns a brand-new access token. The countdown timer resets; the learner can compare old vs new `iat`/`exp`/`jti` claims to confirm a genuinely different token was issued.
6. **Revocation** — `POST /api/logout` extracts the `jti` from the bearer token and adds it to an in-memory denylist. `GET /api/protected` checks this denylist on every request; a match returns `401 RevokedToken` even if the token's expiry hasn't been reached. In production, use Redis so the denylist survives restarts.

## Tech used

- **FastAPI** — Python web framework for the backend API
- **PyJWT** — JWT encoding, decoding, and signature verification
- **passlib** — password hashing utilities (available for extension)
- **React + Vite** — frontend UI with fast dev-server proxy
- **Nginx** — reverse proxy for production (see `nginx/demo.conf`)
- **systemd** — process manager for the backend in production (see `systemd/demo.service`)

## Part of codecrumbs.in

This demo is part of [codecrumbs.in](https://codecrumbs.in), a collection of interactive CS concept demos that let you learn by doing rather than just reading.
