# Makina Masters Inventory Platform

A full-stack inventory management system for hardware clubs. Members authenticate via 42 Intra OAuth, browse components, submit requests, and admins manage stock — all with a dark-themed glassmorphism UI and animated starfield background.

## Architecture

```
┌───────────────────────────────────────────────────┐
│  Frontend (React + Vite)      Hosted on Vercel    │
│  SPA with react-router-dom                          │
│  Vercel rewrites proxy /api/* → Render backend      │
└────────────────────┬──────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│  Backend (Node.js + Express)   Hosted on Render    │
│  42 OAuth + JWT (HTTP-only cookies)                 │
│  Email notifications via nodemailer                 │
│  Image uploads via multer                           │
└────────────────────┬──────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│  Database (PostgreSQL / SQLite)                     │
│  Prisma ORM for type-safe queries & migrations      │
│  Models: User, Item, Request, RequestItem           │
└───────────────────────────────────────────────────┘
```

The frontend rewrites `/api/*` to the Render backend via Vercel rewrites, so the browser treats everything as same-origin. HTTP-only auth cookies work without CORS issues.

## Tech Stack

| Layer     | Tech                                        |
|-----------|---------------------------------------------|
| Frontend  | React 19, Vite, React Router, Vanilla CSS   |
| Backend   | Node.js, Express, Prisma, bcrypt, JWT       |
| Auth      | 42 Intra OAuth 2.0, JWT (HTTP-only cookies) |
| Database  | PostgreSQL (Docker) / SQLite (local dev)    |
| Email     | Nodemailer via SMTP                         |
| Infra     | Docker Compose, Vercel, Render              |

## Quick Start

**Prerequisites:** Docker, Node.js 18+, a 42 Intra API application (for OAuth).

```bash
# Clone
git clone https://github.com/your-username/Inventory.git
cd Inventory

# Configure environment
cp .env.example .env
# Edit .env with your 42 API credentials and SMTP config

# One-command start
chmod +x start.sh
./start.sh
```

This builds and starts all containers. Access at:

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:3001/health`

## Development (without Docker)

```bash
# Backend
cd back
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev

# Frontend (new terminal)
cd front
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3001`.

## Database

Prisma manages schema and migrations. Key models:

- **User** — 42 Intra students and local admins (roles: `ADMIN`, `MEMBER`)
- **Item** — Hardware components with quantities and images
- **Request** — Member submissions with status (`PENDING`, `APPROVED`, `REJECTED`, `RETURNED`)
- **RequestItem** — Join table linking items to requests with quantities

```bash
cd back
npx prisma migrate dev --name init   # Run migrations
node prisma/seed.js                   # Seed with default inventory
npx prisma studio                     # Browse data in browser
```

## How It Works

1. **Member logs in** via 42 Intra OAuth → backend verifies, issues HTTP-only JWT cookie
2. **Member browses** inventory, adds items to cart (React state)
3. **Member submits request** → backend creates Request + RequestItem records, decrements stock, sends email notification to admins
4. **Admin reviews** pending requests on dashboard → approves (keeps stock decremented) or reject (restores stock)

## Project Structure

```
Inventory/
├── back/                   # Express backend
│   ├── src/                # Routes, middleware, controllers
│   ├── prisma/             # Schema, migrations, seed
│   ├── uploads/            # Uploaded component images
│   └── Dockerfile
├── front/                  # React frontend
│   ├── src/                # Components, pages, context
│   ├── public/             # Static assets
│   ├── vercel.json         # Proxy rewrites to backend
│   └── Dockerfile
├── docker-compose.yml      # PostgreSQL + backend + frontend
├── render.yaml             # Render deployment config
├── start.sh                # One-command launcher
├── .env.example            # Environment template
└── TECHNICAL_DOCS.md       # Detailed architecture docs
```

## Deployment

The production setup splits across two platforms:

- **Frontend** → Vercel (with rewrites proxying API calls to backend)
- **Backend** → Render (Docker web service with persistent disk for SQLite/uploads)

Update `render.yaml` and `vercel.json` with your actual domains before deploying.

## License

MIT
