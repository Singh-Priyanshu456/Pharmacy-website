# CareKart 

A complete example inspired by Tata 1mg flows: **frontend + backend + MongoDB** in one project.

## What’s inside
- **client/**: HTML/CSS/JS (no build step). Talks to the API.
- **server/**: Node.js (Express, JWT auth, Multer uploads, MongoDB with Mongoose).
- **docker-compose.yml** for one‑command setup.

## Quick Start (Docker)
1. Copy `server/.env.example` to `server/.env` and change secrets if you like.
2. Run: `docker compose up --build`
3. Seed sample data (in another terminal): `docker compose exec server npm run seed`
4. Open: `http://localhost:8080`

## Quick Start (Local Node)
1. Install MongoDB and start it (default port 27017).
2. `cd server && cp .env.example .env && npm install`
3. `npm run seed` (populate products & lab tests)
4. `npm run dev` (or `npm start`)
5. Visit `http://localhost:8080`

## Features
- Browse products & product detail
- Cart (client-side), order placement (server-side)
- JWT login/register
- Lab test listing
- Prescription upload (saved under `server/uploads/prescriptions`)
- Orders list (user-scoped)


