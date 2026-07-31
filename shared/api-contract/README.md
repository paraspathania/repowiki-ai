# API Contract

This `openapi.yaml` is the **single source of truth** for every endpoint
between frontend and backend.

## Rule
If an endpoint's request or response shape needs to change:
1. Edit this file first, in its own PR.
2. Both @paraspathania and @KISHOR403 review and approve that PR.
3. Only then update the actual frontend/backend code to match.

This prevents "the backend renamed a field and the frontend broke" bugs.

## For Kishor (Frontend) — mock the backend before it exists

You don't have to wait for the real backend to be built. Use one of these:

### Option A — Mock Service Worker (recommended for Next.js/React)
```bash
npm install msw --save-dev
```
Define handlers matching the paths in `openapi.yaml` (e.g. `/repository/analyze`,
`/analysis/:id/summary`) and return fake data shaped exactly like the schema
above. Swap the mock for the real API base URL later — no other code changes.

### Option B — json-server (quick and dirty)
```bash
npm install -g json-server
```
Create a `db.json` with sample data matching the schemas, run:
```bash
json-server --watch db.json --port 4000
```
Point your frontend API calls at `http://localhost:4000` during development.

## For Paras (Backend)

Implement each path in `openapi.yaml` under FastAPI. FastAPI can auto-generate
interactive docs at `/docs` once routes are wired up — use that to sanity
check your responses match this contract before telling Kishor an endpoint
is "ready."

## Versioning

All routes are prefixed `/api/v1/...`. If a breaking change is unavoidable,
bump to `/api/v2/...` rather than silently changing `v1` — this way whichever
side hasn't updated yet doesn't break silently.
