# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Directory | Port | Run Command |
|---------|-----------|------|-------------|
| Backend (FastAPI) | `backend/` | 8000 | `uvicorn main:app --host 0.0.0.0 --port 8000 --reload` |
| Frontend (React/Vite) | `frontend/` | 5173 | `npx vite --host 0.0.0.0 --port 5173` |

### Running the application

1. Start the backend first (from `backend/` directory), then start the frontend (from `frontend/` directory).
2. The frontend Vite dev server proxies `/api` requests to the backend at `localhost:8000`.
3. After starting, load sample data via: `cd backend && curl -X POST http://localhost:8000/api/assets/upload -F "file=@sample_assets.xlsx"`

### Important notes

- ChromaDB telemetry warnings (`capture() takes 1 positional argument`) are harmless and can be ignored.
- The default embedding model (`all-MiniLM-L6-v2` via ChromaDB/onnxruntime) is English-centric. For better Chinese text matching, consider switching to a multilingual or Chinese-specific model (e.g. `paraphrase-multilingual-MiniLM-L12-v2`).
- ChromaDB data is persisted in `backend/chroma_data/` (gitignored). Deleting this directory resets the vector database.
- `~/.local/bin` must be on PATH for the `uvicorn` command to work. The update script handles this.

### Lint / Test / Build

- **Frontend lint**: `cd frontend && npx eslint .`
- **Frontend type check**: `cd frontend && npx tsc -b`
- **Frontend build**: `cd frontend && npx vite build`
- **Backend health check**: `curl http://localhost:8000/api/health`
