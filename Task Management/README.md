# Cantilever

A task manager with two clearance levels: **managers** create and assign tasks; **contributors**
see and progress only what's assigned to them. The frontend's visual design is a direct clone of
the reference mock-up (sidebar nav, indigo/slate UI, dashboard stat cards, task list with
status pills, create/edit modal) — rebuilt against the real FastAPI backend instead of mock state,
and styled with hand-written, plain CSS (no Tailwind, no CSS framework).

```
cantilever/
├── backend/   FastAPI + MongoDB (unchanged — same endpoints throughout)
└── frontend/  React + Vite client (plain CSS, lucide-react)
```

## Run the backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in MONGO_URL / SECRET_KEY
uvicorn main:app --reload --port 8000
```

You need a running MongoDB instance (local or Atlas) reachable at `MONGO_URL`.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env        # default already points at the Vite proxy, fine for local dev
npm run dev
```

Open the printed localhost URL. Vite proxies `/api/*` to `http://localhost:8000`.

## Using it

1. **Sign up** twice — once as Manager, once as Contributor (role picked at signup).
2. Log in with **email** + password (the reference design's login form, now wired for real).
3. As manager: Team Tasks → Assign New Task → enter the contributor's **username** as assignee.
4. As contributor: My Tasks shows only what's assigned to you; move its status along.
5. As manager: edit, delete (→ Deleted Tasks), or restore a task from the archive.

## Backend changes I made

| File | What | Why |
|---|---|---|
| `main.py` | Added `CORSMiddleware` | The browser blocks cross-origin requests from the Vite dev server without this. |
| `Apis/user_api.py`, `User/schema.py` | Added `GET /user/me`, added `role` to `PublicUser` | `/token` only returns a JWT, and `PublicUser` didn't expose `role` — there was no way for the frontend to tell a manager from a contributor after login. |
| `User/crud.py`, `User/service.py` | Login now authenticates by **email** (`get_user_by_email`) | The reference design's login form collects an email, not a username; `OAuth2PasswordRequestForm`'s `username` field now carries the email value. |
| `User/schema.py` | Made `UpdateUser` fields actually optional (`= None`) | Partial profile updates were rejected by validation despite being typed `Optional`. |
| `Tasks/service.py` | Fixed `current_user.role` → `current_user["role"]` in `update_task` | `current_user` is a dict; the attribute access raised `AttributeError` on every manager task edit. |
| `Tasks/crud.py` | Fixed `get_task_assigned_to` to filter by `assigned_to` instead of `owner_id` | `owner_id` is the *manager* who created the task; contributors were matched against the wrong field, so "my tasks" silently returned nothing. |
| `Tasks/service.py` | Empty results (`get_task_assigned_to`, `filter_task`, `get_deleted_tasks`) now return `[]` instead of `404` | An empty list is a normal dashboard state, not an error. |
| `Tasks/crud.py`, `Tasks/service.py`, `Apis/task_api.py` | Added `restore_task` (crud function, service function, `PATCH /task/restore_task/{task_id}`) | Soft-delete existed with no way back — the design's "Restore Task" button needed an endpoint. |
| `User/crud.py` | Fixed `is_delete` → `is_deleted` typo | The delete flag was written under one name and read back under another. |
| `.env.example` (backend) | Rewritten to match the variable names the code reads | The original sample (`DATABASE_URL`, `ACCESS_TOKEN_EXPIRE_MINUTES`) didn't match what `Core/db.py` / `Core/auth.py` actually call `config()` with. |
| `requirements.txt` | Added (didn't exist) | For a runnable backend. |

No other endpoint behavior, URL paths, or role rules changed beyond what's listed above.

## Where the frontend had to diverge from the mock-up

The reference UI is built on mock data, so a couple of spots needed real adaptation:

- **Assignee picker → free-text username.** The mock had a `<select>` of all contributors because
  it kept a full in-memory user list. There's no "list users" endpoint on the real backend, so
  "Assign To" is a text field where the manager types the contributor's username.
- **Task statuses: 3 → 4.** The backend's `TaskStatus` enum is `todo / in_progress / review / done`,
  not the mock's `PENDING / IN_PROGRESS / COMPLETED`. Filter pills, status badges, and the dashboard
  stat cards were extended to the real four states (added "In Review").
- **Priority and due date.** The backend requires `priority` and accepts `due_date` on every task;
  the mock didn't have these fields, so they were added to the create/edit modal and shown as a
  badge + meta line on each task row, in the same visual language as the rest of the card.
- Everything else — layout, components, copy, interaction patterns — mirrors the reference as closely
  as the real API contract allows.

## Styling: Tailwind → plain CSS

This frontend was converted from a Tailwind-based build to hand-written CSS with no framework.

- All utility classes (`bg-indigo-600`, `flex`, `rounded-lg`, `sm:hidden`, ...) were replaced with
  semantic, component-scoped class names (`.btn-primary`, `.sidebar`, `.task-row`, ...) defined once
  in `src/index.css`.
- `src/index.css` defines the full design system as plain CSS custom properties (color palette,
  radii, shadows) plus the component rules and the two responsive breakpoints (`640px` / `1024px`)
  the original Tailwind `sm:` / `lg:` variants relied on.
- `tailwind.config.js`, `postcss.config.js`, and the `tailwindcss`/`postcss`/`autoprefixer` dev
  dependencies were removed from the project; nothing else in the build pipeline changed.
- Icon sizing (previously `h-4 w-4` etc. on `lucide-react` icons) now uses the icons' own `size` prop
  directly instead of utility classes.
- No JS logic, component structure, file layout, or API calls changed — every file in `src/api/` and
  `src/context/` is byte-for-byte identical to the Tailwind version, so all endpoints and behavior
  are unchanged.

