# Nutriplan Monolithic

A monolithic version of the Nutriplan nutrition tracking application, combining frontend and backend into a single deployable unit.

## Project Structure

```
nutriplan-monolithic/
├── frontend/          # React/Vite frontend application
├── backend/           # Express.js backend API
├── shared/            # Shared utilities (if any)
├── package.json       # Monolithic package.json with scripts
└── README.md          # This file
```

## Setup

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Set up the database:
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the frontend (port 5173) and backend (port 4000) simultaneously.

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start both frontend and backend in production mode
- `npm run install:all` - Install dependencies for all workspaces

## Environment Variables

Backend environment variables are in `backend/.env`:

- `PORT` - Backend server port (default: 4000)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

## Architecture

This monolithic version maintains the same API endpoints and frontend functionality as the original microservice architecture, but combines everything into a single application for simpler deployment and development.

## Migration from Microservices

This version was converted from a microservice architecture that included:
- Separate frontend service
- Separate backend API service
- Next.js launcher application

All functionality has been preserved while simplifying the architecture.