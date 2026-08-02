# Backend — Owner: @paraspathania

Stack: FastAPI

## Module Checklist (build in this order — see Phase plan)

### Phase 1
- [ ] B2 — Repository Service — validate, clone, cleanup
- [ ] B3 — File Scanner — reads files, builds tree + metadata
- [ ] B4 — Language Detector — detects framework/stack
- [ ] B5 — Documentation Generator — AI-generated wiki content

### Phase 2
- [ ] B6 — Diagram Generator — Mermaid / React Flow JSON
- [ ] B7 — API Detector — finds routes/endpoints in scanned code

### Phase 3
- [ ] B8 — Vector Engine — chunk, embed, store (LangChain + ChromaDB)
- [ ] B9 — Chat Service — RAG over vector DB
- [ ] B10 — Export Service — PDF / Markdown / DOCX generation

### Phase 4
- [ ] B1 — Auth Service — register / login / JWT / profile
- [ ] Queue system (Redis + Celery) for long-running analysis jobs
- [ ] Caching
- [ ] Analytics

## Contract compliance
Every endpoint you build must match `/shared/api-contract/openapi.yaml`
exactly. Check FastAPI's auto-generated `/docs` against it before marking
an endpoint "ready" for Kishor to switch off his mocks.

## Folder structure
```
backend/
├── app/
│   ├── api/
│   ├── auth/
│   ├── repository/
│   ├── scanner/
│   ├── parser/
│   ├── analyzer/
│   ├── ai/
│   ├── diagrams/
│   ├── chat/
│   ├── export/
│   └── database/
├── models/
├── schemas/
├── services/
├── workers/
├── prompts/
├── utils/
└── config/
```
