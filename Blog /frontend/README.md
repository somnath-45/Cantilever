# Inkwell — Blog Frontend

A clean, responsive React + Vite frontend for the Blog API.

## Setup

```bash
cd blog-frontend
npm install
npm run dev
```

The dev server runs on **http://localhost:5173** and proxies `/api` requests to the backend at `http://localhost:8000`.

Make sure your FastAPI backend is running before starting the frontend.

## Pages

| Route | Description |
|-------|-------------|
| `/auth` | Login & sign-up |
| `/` | Dashboard — stats + recent posts |
| `/blogs` | My Blogs — full CRUD (create, edit, delete) |
| `/explore` | Search posts by topic |
| `/profile` | Edit username/email, delete account |

## API Endpoints Used

All endpoints from `/api/v1/user` and `/api/v1/blog` are connected:

- `POST /user/sign-up` — register
- `POST /user/token` — login (OAuth2 form)
- `GET /user/me` — current user
- `PATCH /user/update/{id}` — update profile
- `DELETE /user/delete/{id}` — delete account
- `POST /blog/` — create post
- `GET /blog/user_blog` — get my posts
- `GET /blog/{topic}` — search by topic
- `PATCH /blog/{id}` — edit post
- `DELETE /blog/{id}` — delete post
