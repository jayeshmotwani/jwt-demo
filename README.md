# JWT Authentication — codecrumbs.in

> An interactive demo that teaches how JSON Web Tokens work by letting you sign in, inspect the token, call a protected route, and tamper with the token to see exactly how verification fails.

## What is JWT?

JSON Web Tokens (JWTs) solve the problem of stateless authentication: instead of storing session data on the server, all the information needed to verify a user's identity is encoded directly in a signed token. The server issues the token at login, the client stores it, and every subsequent request carries the token — the server just verifies the signature. JWTs are used everywhere: REST APIs, single-page apps, mobile backends, and microservices.

## What this demo shows

- **Sign in and receive a token** — submit credentials and watch the backend issue a real JWT; the token is decoded on the spot so you can read the header, payload, and signature.
- **Use the token to access a protected route** — see how the `Authorization: Bearer` header works and what the backend returns when the token is valid.
- **Tamper with the token and observe the failure** — edit any character in the token, hit Verify, and get a precise error (`SignatureVerificationError`, `TokenExpiredError`, `MalformedToken`) with a plain-English explanation of why it failed.

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

1. **Login** — the frontend posts `{ username, password }` to `POST /api/login`. The backend checks the hardcoded demo credentials and, if they match, creates a JWT signed with `HS256` containing `sub`, `iat`, and `exp` claims.
2. **Token issued** — the raw token string is displayed and split into its three base64-encoded parts so you can see the header (algorithm), payload (user + timestamps), and signature side-by-side.
3. **Bearer auth** — clicking "Call Protected Route" sends `Authorization: Bearer <token>` to `GET /api/protected`. The backend decodes and verifies the signature before returning the protected resource.
4. **Tamper detection** — `POST /api/verify` accepts any string. If the signature doesn't match the header + payload (because you changed something), PyJWT raises `InvalidSignatureError`. If the token is structurally broken, it raises `DecodeError`. Each exception maps to a labelled, human-readable error shown in the UI.

## Tech used

- **FastAPI** — Python web framework for the backend API
- **PyJWT** — JWT encoding, decoding, and signature verification
- **passlib** — password hashing utilities (available for extension)
- **React + Vite** — frontend UI with fast dev-server proxy
- **Nginx** — reverse proxy for production (see `nginx/demo.conf`)
- **systemd** — process manager for the backend in production (see `systemd/demo.service`)

## Part of codecrumbs.in

This demo is part of [codecrumbs.in](https://codecrumbs.in), a collection of interactive CS concept demos that let you learn by doing rather than just reading.
