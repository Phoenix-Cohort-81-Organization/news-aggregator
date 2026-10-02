# TheFeeds frontend

React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Axios, React Hook Form, and Zod client for the News Aggregator API.

## Local development

1. Install Node.js 20 or newer.
2. From this directory, install dependencies and configure the API:

   ```powershell
   npm install
   cp .env.example .env
   ```

3. Start the backend, then run:

   ```powershell
   npm run dev
   ```

The frontend expects the backend base URL in `VITE_API_BASE_URL` (default example: `http://localhost:5000/api/v1`). Never put news-provider keys or other server secrets in frontend environment variables.

## Implemented backend contract

- `GET /news?q=...&pageSize=...&from=...&to=...`
- News results use `data.articles` and `data.providers`.
- `POST /auth/register` and `POST /auth/login` return a user and a bearer token.

The frontend integrates health, registration, login, keyword search, country editions, editorial sections, and GNews category headlines. GNews supplies top-headlines categories `general`, `world`, `nation`, `business`, `technology`, `entertainment`, `sports`, `science`, and `health`. TheFeeds maps `culture` to `entertainment` and `earth` to `science`; `art`, `travel`, `audio`, `video`, and `live` use explicit keyword queries because the backend/provider does not expose those as dedicated categories or media formats.

The backend does not expose category/source filters for general search, article detail, bookmarks, user preferences, logout, or password-reset endpoints. The article view therefore displays only the summary and metadata returned by search and links to the original publisher. Login and registration return a bearer token in the response body, not an HttpOnly cookie. The token is held in memory only and is cleared on reload/sign-out; a secure persistent session requires backend cookie/session support.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run typecheck` runs the strict TypeScript project check.
- `npm run build` type-checks and creates the production bundle in `dist/`.
