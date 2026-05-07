# IT Planner

A Microsoft Planner-style IT Project Management web app. IT Managers and PMO create and manage plans with tasks organised into buckets. Dev Operation members view plans in read-only mode.

## Quick Start

### 1. Server (Backend)

```bash
cd server
npm install
npm run seed      # creates SQLite DB and inserts demo data
npm run dev       # starts on http://localhost:3001
```

### 2. Client (Frontend)

```bash
cd client
npm install
npm run dev       # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| IT Manager | admin@company.com | password123 |
| PMO | pmo@company.com | password123 |
| Dev Operation | dev@company.com | password123 |

## Features by Role

**IT Manager** — full access: create/edit/delete plans, tasks, buckets, and manage users

**PMO** — create/edit/delete plans and tasks, manage buckets

**Dev Operation** — read-only: view plans, tasks, and progress

## Views

- **My Plans** — table view: Source, Plan Name, Owner, Progress %, Dates, Status badge
- **Grid View** — task table with checkbox completion, inline assignee/bucket/date editing, keyword filter
- **Board View** — Kanban board grouped by bucket with drag-and-drop (powered by @hello-pangea/dnd)
- **Reports** — task completion summary (total / completed / remaining)
- **Charts** — progress bar breakdown by bucket

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Tailwind CSS v4, React Router v7, @hello-pangea/dnd |
| Backend | Node.js, Express 5 |
| Database | SQLite (better-sqlite3, WAL mode, foreign_keys=ON) |
| Auth | JWT (HS256, 8h expiry, stored in localStorage) |

## Project Structure

```
it-pm-app/
├── client/
│   └── src/
│       ├── api/         # Axios API helpers (plans, tasks, buckets, users, auth)
│       ├── components/  # UI: layout/, common/, plans/, tasks/
│       ├── context/     # AuthContext (JWT + user state)
│       ├── pages/       # dashboard/, plans/, admin/, auth/
│       └── routes/      # AppRouter, ProtectedRoute
└── server/
    └── src/
        ├── config/      # SQLite init (WAL, FK), JWT helpers
        ├── middleware/  # authenticate, requireRole, errorHandler
        ├── modules/     # auth / users / plans / buckets / tasks
        └── db/          # schema.sql, seed.js
```

## API Endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/api/auth/login` | — | Login → JWT + user |
| GET | `/api/auth/me` | all | Current user info |
| GET | `/api/plans` | all | List all plans |
| POST | `/api/plans` | it_manager, pmo | Create plan |
| GET | `/api/plans/:id` | all | Plan detail with buckets & tasks |
| PUT | `/api/plans/:id` | it_manager, pmo | Update plan |
| DELETE | `/api/plans/:id` | it_manager, pmo | Delete plan + cascade |
| GET | `/api/plans/:id/buckets` | all | List buckets for plan |
| POST | `/api/plans/:id/buckets` | it_manager, pmo | Create bucket |
| PUT | `/api/plans/:planId/buckets/:id` | it_manager, pmo | Update bucket |
| DELETE | `/api/plans/:planId/buckets/:id` | it_manager, pmo | Delete bucket |
| GET | `/api/plans/:id/tasks` | all | List tasks (filterable) |
| POST | `/api/plans/:id/tasks` | it_manager, pmo | Create task |
| PUT | `/api/tasks/:id` | it_manager, pmo | Update task fields |
| PATCH | `/api/tasks/:id/complete` | it_manager, pmo | Toggle completion |
| DELETE | `/api/tasks/:id` | it_manager, pmo | Delete task |
| GET | `/api/users` | it_manager | List all users |
| POST | `/api/users` | it_manager | Create user |
| DELETE | `/api/users/:id` | it_manager | Delete user |

## Environment Variables

**server/.env**
```
PORT=3001
JWT_SECRET=your_secret_here        # required — startup fails if missing
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173  # optional
```

## Running Tests

```bash
cd server
npm test          # Jest + supertest, 50 tests, in-memory SQLite
```

## Docker

```bash
docker-compose up --build
```

App available at **http://localhost:5173**, API at **http://localhost:3001**.
