# Frontend — Owner: @KISHOR403

Stack: Next.js

## Module Checklist (build in this order — see Phase plan)

### Phase 1
- [ ] F2 — Repository Input (`/`) — URL input, validate, recent repos
- [ ] F4 — Dashboard — overview, stats, tech stack cards
- [ ] F6 — Wiki Viewer — markdown rendering, TOC

### Phase 2
- [ ] F5 — File Explorer — tree view, code preview
- [ ] F7 — Diagram Viewer — Mermaid / React Flow

### Phase 3
- [ ] F8 — AI Chat — chat UI, streaming responses
- [ ] F9 — Export — PDF / Markdown / DOCX download buttons

### Phase 4
- [ ] F1 — Auth — login / signup / profile / JWT storage
- [ ] F3 — Loading Screen — progress bar during analysis

## Working against the backend before it's ready
See `/shared/api-contract/README.md` — use MSW or json-server to mock
responses shaped exactly like `openapi.yaml` so you're never blocked
waiting on the backend.

## Folder structure
```
frontend/
├── app/
├── components/
│   ├── auth/
│   ├── repository/
│   ├── dashboard/
│   ├── fileTree/
│   ├── diagrams/
│   ├── chat/
│   ├── wiki/
│   └── export/
├── services/
├── hooks/
├── types/
├── utils/
└── lib/
```
