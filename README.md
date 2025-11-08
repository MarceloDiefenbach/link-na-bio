# React SaaS Starter (Bun + MySQL)

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

# About the template

Starter project for building a software-as-a-service (SaaS) platform in React. Ships with:

- Bun runtime for fast dev server and API.
- Minimal landing page already wired to auth routes.
- Login/Register screens backed by a Bun API using MySQL + JWT.

This project was created using `bun init` in bun v1.2.20. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Configuration

Database credentials and the JWT secret are defined directly in the source for simplicity.
Update `src/server/db/pool.ts` and `src/index.tsx` to match your environment before running in production.

On first run with valid credentials, the server will create a `users` table if it doesn't exist.

## API endpoints

- POST `/api/auth/register`: `{ name, email, password }` → creates user, sets httpOnly `token` cookie, returns `{ id, name, email }`.
- POST `/api/auth/login`: `{ email, password }` → authenticates, sets cookie, returns `{ id, name, email }`.
- GET `/api/auth/me`: returns the authenticated user using the `token` cookie or `Authorization: Bearer <token>` header.

Passwords are hashed via `Bun.password` and tokens are signed as JWT (HS256) with the `JWT_SECRET` constant.
