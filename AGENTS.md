# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Directory | Port | Run Command |
|---------|-----------|------|-------------|
| Backend (FastAPI) | `backend/` | 8000 | `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` |
| Frontend (React/Vite) | `frontend/` | 5173 | `npx vite --host 0.0.0.0 --port 5173` |

### Running the application

1. Start the backend first (from `backend/` directory), then the frontend (from `frontend/` directory).
2. Vite proxies `/api` to `localhost:8000` automatically.
3. Register users via `/login` page (role: VIP客户 or 管理员).
4. Upload sample data: admin login → 资产管理 → drag `backend/sample_assets.xlsx` to the upload area.

### Authentication

- JWT-based auth with `PyJWT`. Tokens expire in 7 days.
- `passlib` requires `bcrypt==4.0.1` (newer bcrypt versions are incompatible).
- Admin-only endpoints require `role=admin` in the JWT payload.

### DashScope integration

- When `DASHSCOPE_API_KEY` is set in `backend/.env`, the system uses qwen-max for intent parsing/rerank and text-embedding-v3 for vectorization.
- Without the API key, the system falls back to ChromaDB's built-in embedding and a structured (non-LLM) thinking chain. All features still work, but matching quality is reduced.

### Important notes

- ChromaDB telemetry warnings (`capture() takes 1 positional argument`) are harmless.
- SQLite database at `backend/data/app.db` — delete to reset users/chat history.
- ChromaDB data at `backend/data/chroma_db/` — delete to reset vector store.
- `~/.local/bin` must be on PATH for `uvicorn`.

### Build / Lint

- **Frontend build**: `cd frontend && npx vite build`
- **Backend health**: `curl http://localhost:8000/api/v1/health`
