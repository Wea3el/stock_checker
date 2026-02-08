# CLAUDE.md - Project Conventions

## Project Structure
- `backend/` - FastAPI Python backend
- `frontend/` - React + TypeScript + Vite frontend
- `start.py` - Starts both servers

## Backend Conventions
- **Framework**: FastAPI with Pydantic models
- **Services pattern**: Business logic in `app/services/`. Routers are thin and delegate to services.
- **Caching**: `cachetools.TTLCache` with 15-minute TTL for external API calls
- **Config**: `pydantic-settings` with `.env` file. Access via `from app.config import settings`
- **Schemas**: All Pydantic models in `app/models/schemas.py`
- **OpenAI**: `openai>=1.55` SDK. Model via `settings.openai_model` (default gpt-4o-mini)
- **Error handling**: Routers catch exceptions and return `HTTPException(status_code=502)` for external service failures

## Frontend Conventions
- **React 19** + **TypeScript** + **Vite 7**
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin, `@import "tailwindcss"`)
- **Data fetching**: TanStack React Query v5. Custom hooks in `src/hooks/`. API functions in `src/api/client.ts`
- **Routing**: React Router with `<Routes>` / `<Route>` pattern
- **Icons**: `lucide-react`
- **Charts**: `recharts`
- **Components**: Feature folders under `src/components/` (Dashboard/, Stocks/, Chat/, etc.)
- **Types**: Shared TypeScript interfaces in `src/types/index.ts`

## Commands
- **Start both**: `python start.py` from project root
- **Backend only**: `cd backend && uvicorn app.main:app --reload`
- **Frontend only**: `cd frontend && npm run dev`
- **Build frontend**: `cd frontend && npm run build`

## Key Design Patterns
- Backend services are stateless functions (except portfolio_service with in-memory state)
- Frontend uses custom hooks wrapping TanStack Query for each data domain
- SSE streaming for the chat/agent endpoint; all other endpoints are standard REST
- The agentic loop in `agent_service.py` uses OpenAI function calling with a think-act-observe cycle
- Max 10 iterations safety limit on agent loops
