# Gigflow - Smart Leads Dashboard

Gigflow is a full-stack smart leads dashboard for sales teams. It provides authenticated lead management, role-based actions, filtered search, pagination, CSV export, and an analytics view in a modern SaaS dashboard UI.

The project uses a Next.js frontend, a Node.js/Express API, and Supabase for Auth plus Postgres storage.

## Features

- User registration and login with Supabase Auth
- Admin and sales roles
- Protected dashboard routes
- Leads list with search, filters, sort, and pagination
- Create and update lead modals with Zod validation
- Delete lead action with backend-enforced admin RBAC
- Admin-only CSV export
- Lead detail page
- Analytics dashboard with charts and status/source summaries
- Dark glass SaaS dashboard theme with tilt cards and accent borders
- Supabase SQL migration with tables, enums, indexes, triggers, and RLS policies

## Tech Stack

Frontend:

- Next.js 15 App Router
- React 19
- TypeScript
- TailwindCSS
- React Query
- React Hook Form
- Zod
- Recharts
- Framer Motion
- Lucide React

Backend:

- Node.js 20+
- Express
- TypeScript
- Supabase JS SDK
- Zod
- Helmet
- CORS
- ws for Node 20 Supabase Realtime transport compatibility

Database/Auth:

- Supabase Auth
- Supabase Postgres
- Row Level Security policies

## Project Structure

```text
Gigflow/
├── backend/
│   ├── src/
│   │   ├── config/          # env and Supabase clients
│   │   ├── controllers/     # route handlers
│   │   ├── middleware/      # auth, RBAC, validation, errors
│   │   ├── routes/          # auth and lead routers
│   │   ├── schemas/         # Zod request schemas
│   │   ├── services/        # business logic and Supabase queries
│   │   ├── types/           # shared API/database types
│   │   └── utils/           # async handler, CSV, app errors
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── API.md               # OpenAPI/Swagger-style API documentation
├── src/
│   ├── app/                 # Next.js routes
│   ├── components/          # UI, layout, and lead components
│   ├── hooks/               # auth, leads, debounce hooks
│   ├── lib/                 # API client, Supabase client, schemas, utils
│   ├── store/               # theme store
│   └── types/               # frontend auth/lead/database types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- Supabase project URL, anon key, and service role key

## Supabase Setup

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Copy the SQL from:

   ```text
   supabase/migrations/001_initial_schema.sql
   ```

4. Paste it into the SQL editor and run it.

This creates:

- `profiles`
- `leads`
- `user_role`, `lead_status`, and `lead_source` enums
- indexes for filtering/search
- update timestamp triggers
- auth user profile trigger
- RLS policies

Important: the backend also explicitly upserts profiles during registration, so registration does not depend only on the database trigger.

## Environment Variables

Create a frontend env file:

```bash
cp .env.example .env.local
```

Root `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Create a backend env file:

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend env files.

## Installation

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev
```

URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Docker Deployment

The repository includes Dockerfiles for both services and a root `docker-compose.yml`.

Prepare Docker environment values:

```bash
cp .env.docker.example .env
```

Set these values in root `.env`:

```env
FRONTEND_PORT=3000
BACKEND_PORT=5000
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Also create `backend/.env` from `backend/.env.example` and set the backend Supabase keys, including `SUPABASE_SERVICE_ROLE_KEY`.

Build and run:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Deployment notes:

- `frontend` serves the Next.js production build on port `3000`.
- `backend` serves the Express API on port `5000`.
- The backend container includes a health check at `/health`.
- Supabase is external; this compose file does not run a local database.
- `NEXT_PUBLIC_*` values are baked into the frontend image during build, so rebuild the frontend image when those values change.

## Available Scripts

Frontend:

```bash
npm run dev
npm run typecheck
npm run build
npm run start
```

Backend:

```bash
cd backend
npm run dev
npm run typecheck
npm run build
npm run start
```

## Roles And Permissions

| Action | Admin | Sales |
| --- | --- | --- |
| Register/login | Yes | Yes |
| View leads | Yes | Yes |
| View lead detail | Yes | Yes |
| Create lead | Yes | Yes |
| Update lead | Yes | Own leads only |
| Delete lead | Yes | No |
| Export CSV | Yes | No |

The frontend hides or disables restricted actions where appropriate, but the backend is the source of truth for access control.

## API Documentation

See [docs/API.md](docs/API.md) for a Swagger/OpenAPI-style API reference.

Main API groups:

- Auth: `/api/auth`
- Leads: `/api/leads`

All protected routes require:

```http
Authorization: Bearer <supabase_access_token>
```

## Data Model

Profile:

- `id`
- `name`
- `email`
- `role`
- `created_at`
- `updated_at`

Lead:

- `id`
- `name`
- `email`
- `status`
- `source`
- `created_by`
- `created_at`
- `updated_at`

Allowed lead statuses:

- `New`
- `Contacted`
- `Qualified`
- `Lost`

Allowed lead sources:

- `Website`
- `Instagram`
- `Referral`

## Quality Checks

Run all checks before handing off changes:

```bash
npm run typecheck
npm run build
cd backend
npm run typecheck
npm run build
```

If `next build` fails on Windows with `.next/trace` permission errors, stop any running `next dev` process, delete `.next`, and rerun the build.

## Notes

- The frontend talks to the Express API through `NEXT_PUBLIC_API_BASE_URL`.
- Supabase service role access is only used inside the backend.
- CSV export is generated by the backend.
- Registration creates both the Supabase Auth user and the corresponding `profiles` row.
