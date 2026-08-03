# Smart Car Rental Management System

A full-stack car rental platform: customers browse and book vehicles online; admins manage the fleet,
customers, and bookings from a dashboard.

**Stack:** React + TypeScript + Vite (client) · Node.js + Express + TypeScript (server) · PostgreSQL via
Prisma (Neon-ready) · JWT auth · Cloudinary image uploads.

## Project structure

```
car-rental-system/
├── client/     React + TypeScript + Vite + Tailwind frontend
├── server/     Express + TypeScript + Prisma backend
└── README.md
```

## Prerequisites

- Node.js 18+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works well)
- A [Cloudinary](https://cloudinary.com) account (free tier) for vehicle image uploads

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — your Neon/PostgreSQL connection string
- `JWT_SECRET` — any long random string
- `CLOUDINARY_*` — from your Cloudinary dashboard

Then create the database tables and seed sample data:

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

The seed script creates a sample admin account:
- **Email:** `admin@carrental.com`
- **Password:** `Admin@12345`

Start the API:

```bash
npm run dev
```

The server runs at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

`VITE_API_URL` defaults to `http://localhost:5000/api`, which matches the backend above.

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## What's scaffolded

**Backend**
- JWT authentication (register/login/logout) with bcrypt password hashing
- Role-based authorization middleware (`CUSTOMER` / `ADMIN`)
- Full CRUD for cars (with search/filter query params and Cloudinary image upload), bookings
  (with overlap/double-booking prevention), and users
- Payments endpoint tied to bookings
- Admin reports endpoint (`/api/reports/summary`) with fleet, customer, and revenue KPIs
- Centralized error handling and request validation (Zod)
- Prisma schema matching the Users / Cars / Bookings / Payments data model

**Frontend**
- Public site: home, car browsing with search/filter, car details with a live booking form, about,
  contact, login, register
- Customer dashboard: overview, bookings (with cancel), profile editing
- Admin dashboard: KPI overview, car management (create/delete with image upload), customer list,
  booking approval/cancellation
- Auth context + protected routes gated by role
- Axios client with automatic JWT attachment and 401 handling
- Tailwind design system (navy/amber palette) shared across pages

## What's intentionally left for you to build out

This is a working scaffold, not a finished product. Natural next steps:

- Pagination on car/booking/customer lists
- Payment flow UI (the `/api/payments` endpoint exists but isn't wired to a checkout screen)
- Charts on the admin dashboard (e.g. `recharts`, already a common pairing with this stack)
- Toast notifications instead of inline text for success/error states
- Automated tests (Jest/Vitest + Supertest for the API, React Testing Library for the client)
- Rate limiting and helmet-style security headers on the API
- CI/CD pipeline for the Vercel (client) and Render/Railway (server) deployment described in the spec

## Deployment (per the original spec)

- **Database:** Neon PostgreSQL
- **Backend:** Render or Railway — set the same env vars as `.env`, run `npm run build && npm start`
- **Frontend:** Vercel — set `VITE_API_URL` to your deployed backend's `/api` URL, build command
  `npm run build`, output directory `dist`
