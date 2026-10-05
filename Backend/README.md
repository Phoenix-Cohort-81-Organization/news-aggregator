# TheFeeds — News Aggregator API

A REST API for a news aggregator that combines live external news (GNews, The Guardian)
with editorial articles written by editors and admins.

**Base URL (local):** `http://localhost:5000/api/v1`

The backend is built with Node.js and Express and uses MongoDB through Mongoose.
External news API keys are kept on the server and are never exposed to the frontend.

---

## Project Structure

```text
Backend/
├── app.js
├── server.js
├── package.json
├── .env.example
├── README.md
└── src/
    ├── config/
    │   ├── database.js
    │   └── env.js
    ├── controllers/
    │   ├── articleController.js
    │   ├── authController.js
    │   └── newsController.js
    ├── middleware/
    │   ├── articleValidation.js
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── models/
    │   ├── article.js
    │   └── User.js
    ├── routes/
    │   ├── articleRoutes.js
    │   ├── authRoutes.js
    │   └── newsRoutes.js
    └── services/
        └── newsService.js
```

---

## Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (Bearer tokens)
- **External APIs:** GNews, The Guardian Open Platform

---

## Requirements

- Node.js 20 or newer
- MongoDB Community Server or MongoDB Atlas
- GNews API key and/or The Guardian Open Platform API key

---

## Response Format

All endpoints return a consistent JSON shape.

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

---

## Authentication

Protected endpoints require a JWT sent in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued on register/login, expire in **24 hours**, and encode:

```json
{ "userId": "<mongo id>", "role": "user" | "editor" | "admin" }
```

### Role-based access

| Role | Can do |
|---|---|
| `user` | Read public content |
| `editor` | Everything `user` can, plus create/update articles |
| `admin` | Everything `editor` can, plus delete articles |

New registrations default to `user`. To create an editor or admin, promote the user manually in MongoDB (change the `role` field).

---

## Endpoints

### Health

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Verify the API is running |

**Success response:**
```json
{ "success": true, "message": "News Aggregator API is running" }
```

---

### Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new user |
| POST | `/auth/login` | No | Authenticate and receive a JWT |

#### POST `/auth/register`

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

**Errors:**
- `400` — Missing/invalid fields
- `409` — Email already registered

#### POST `/auth/login`

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Success response (200):** same shape as register.

**Errors:**
- `400` — Missing fields
- `401` — Invalid credentials

---

### News (external aggregation)

Live news fetched from GNews and The Guardian. **No authentication required.**

| Method | Path | Purpose |
|---|---|---|
| GET | `/news/filters` | List available sections and countries |
| GET | `/news/headlines` | Top headlines by category and country |
| GET | `/news/sections/:section` | Fetch a named section (e.g. `sport`, `technology`) |
| GET | `/news` | Search across providers |

#### GET `/news/filters`

**Success response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      { "slug": "news", "label": "News", "mode": "headlines", "category": "general" },
      { "slug": "sport", "label": "Sport", "mode": "headlines", "category": "sports" }
    ],
    "countries": [ { "code": "us", "name": "United States" } ],
    "gnewsCategories": ["general", "world", "business", "technology"]
  }
}
```

#### GET `/news/headlines`

**Query parameters:**

| Name | Type | Default | Notes |
|---|---|---|---|
| `category` | string | `general` | Must be a valid GNews category |
| `country` | string | – | ISO 2-letter country code |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `10` | Max 50 |

**Success response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "title": "...",
        "description": "...",
        "url": "https://...",
        "imageUrl": "https://...",
        "publishedAt": "2026-10-05T12:00:00Z",
        "author": "...",
        "section": "general",
        "provider": "gnews"
      }
    ],
    "providers": { "succeeded": ["gnews"], "failed": [] },
    "pagination": { "page": 1, "pageSize": 10, "totalArticles": 1000, "totalPages": 100 }
  }
}
```

**Errors:**
- `400` — Unsupported category or country
- `500` — Provider unavailable

#### GET `/news/sections/:section`

Named sections defined in the backend (see `/news/filters`). Same query params and response shape as `/news/headlines`, plus a `section` object.

**Errors:**
- `404` — Unknown section slug

#### GET `/news`

**Query parameters:**

| Name | Type | Required | Notes |
|---|---|---|---|
| `q` | string | Yes | Min 2 characters |
| `country` | string | No | ISO 2-letter code |
| `pageSize` | number | No | Max 50 |
| `from` | date | No | ISO date |
| `to` | date | No | ISO date |

Aggregates results from **all configured providers**, deduplicates by URL, and sorts by most recent.

**Success response:**
```json
{
  "success": true,
  "data": {
    "articles": [ "...same shape..." ],
    "providers": { "succeeded": ["gnews", "guardian"], "failed": [] }
  }
}
```

**Errors:**
- `400` — Missing or too-short query
- `502`/`503` — All providers unavailable

---

### Articles (editorial CRUD)

Original articles written by editors/admins. Publicly readable, protected for writes.

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/articles` | No | – |
| GET | `/articles/:id` | No | – |
| POST | `/articles` | Yes | editor, admin |
| PUT | `/articles/:id` | Yes | editor, admin |
| DELETE | `/articles/:id` | Yes | admin |

#### GET `/articles`

**Query parameters:**

| Name | Type | Default | Notes |
|---|---|---|---|
| `category` | string | – | Filter by category slug |
| `search` | string | – | Full-text search across title/description/content |
| `page` | number | `1` | 1-based |
| `limit` | number | `20` | Max 100 |

**Success response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "_id": "...",
        "title": "...",
        "description": "...",
        "content": "...",
        "url": "https://...",
        "imageUrl": null,
        "author": "Jane Doe",
        "source": null,
        "section": null,
        "category": "technology",
        "language": "en",
        "publishedAt": "2026-10-05T10:00:00.000Z",
        "author_user": "<user id>",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

#### GET `/articles/:id`

**Success response:**
```json
{ "success": true, "data": { "article": { "...": "..." } } }
```

**Errors:**
- `400` — Invalid Mongo ObjectId
- `404` — Article not found

#### POST `/articles` *(editor, admin)*

**Request body:**
```json
{
  "title": "How AI is reshaping newsrooms",
  "description": "A short summary.",
  "content": "Full article text...",
  "url": "https://example.com/ai-newsrooms",
  "imageUrl": "https://example.com/cover.jpg",
  "author": "Jane Doe",
  "source": "TheFeeds",
  "section": "technology",
  "category": "technology",
  "language": "en",
  "publishedAt": "2026-10-05T10:00:00.000Z"
}
```

**Required:** `title`, `url`, `publishedAt`.

**Success response (201):**
```json
{ "success": true, "message": "Article created successfully", "data": { "article": { "...": "..." } } }
```

**Errors:**
- `400` — Validation failure (invalid field, missing required, bad date)
- `401` — Missing/invalid token
- `403` — Not an editor/admin

#### PUT `/articles/:id` *(editor, admin)*

Same body as POST (partial updates allowed). Returns the updated article.

#### DELETE `/articles/:id` *(admin only)*

**Success response:**
```json
{ "success": true, "message": "Article deleted successfully", "data": null }
```

**Errors:**
- `401` — Missing/invalid token
- `403` — Not an admin
- `404` — Not found

---

## Article Validation

Article creation and update requests are validated before reaching the controller.

The validation middleware checks that:

- The request body is a JSON object.
- Required fields are present (`title`, `url`, `publishedAt`).
- String fields contain string values.
- `publishedAt` contains a valid date.
- Only supported article fields are submitted.
- The article ID is a valid MongoDB ObjectId when supplied.

### Validation error example

```json
{
  "success": false,
  "message": "Invalid article data",
  "errors": ["title is required"]
}
```

---

## Error codes summary

| Status | Meaning |
|---|---|
| 400 | Validation error / bad input |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, duplicate URL) |
| 500 | Server error |
| 502/503 | External provider unavailable |

---

## Setup

1. Install the project dependencies:

```bash
npm install
```

2. Create a `.env` file using `.env.example` as a guide.

3. Add the required environment variables:

```text
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_gnews_key
GUARDIAN_API_KEY=your_guardian_key
```

4. Start the development server:

```bash
npm run dev
```

Server listens on `http://localhost:5000`.

**Never commit `.env` or expose API keys in the frontend application.**

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Defaults to 5000 |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `GNEWS_API_KEY` | Yes* | GNews API key |
| `GUARDIAN_API_KEY` | No | Guardian API key (adds second provider) |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |

\* At least one news provider key is required for `/news/*` endpoints.

---

## Testing

Run the test command:

```bash
npm test
```

Test files live in `Backend/test/`:
- `auth.test.js`
- `newsService.test.js`
- `userValidation.test.js`

---

## Promoting a user to editor or admin

New registrations always get role `user`. To promote:

1. Open MongoDB Atlas → Browse Collections → `users`
2. Find the user by email
3. Edit `role` to `"editor"` or `"admin"`
4. Save
5. Log in again to receive a fresh token with the new role

---

## Dependencies

### Runtime dependencies

- Express
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- Helmet
- CORS

### Development dependencies

- Nodemon
- Supertest

---

## Security

The backend follows several security practices:

- Passwords are hashed before storage (bcrypt, cost 12).
- JWT is used for authentication.
- Protected routes require authentication.
- Role-based authorization for write operations.
- Helmet is used for HTTP security headers.
- CORS is configured through environment settings.
- API keys and secrets are stored in environment variables.
- Passwords and secrets are not exposed in API responses.
- User input is validated on the backend regardless of frontend validation.

---

## Delivery Phases

1. **Backend foundation** — API setup, authentication, news providers, article model, routes, and validation.
2. **Frontend integration** — React frontend connected to the backend API.
3. **Personalization** — Saved articles and user preferences.
4. **Quality and production readiness** — Testing, validation improvements, rate limiting, logging, deployment, and CI checks.

---

## API Endpoint Summary

| Method | Endpoint | Auth | Role | Purpose |
| ------ | -------- | ---- | ---- | ------- |
| GET | `/api/v1/health` | No | – | Check API status |
| POST | `/api/v1/auth/register` | No | – | Register a user |
| POST | `/api/v1/auth/login` | No | – | Log in a user |
| GET | `/api/v1/news` | No | – | Search news |
| GET | `/api/v1/news/filters` | No | – | Get news filters |
| GET | `/api/v1/news/headlines` | No | – | Get top headlines |
| GET | `/api/v1/news/sections/:section` | No | – | Get section news |
| GET | `/api/v1/articles` | No | – | List articles |
| GET | `/api/v1/articles/:id` | No | – | Get an article by ID |
| POST | `/api/v1/articles` | Yes | editor, admin | Create an article |
| PUT | `/api/v1/articles/:id` | Yes | editor, admin | Update an article |
| DELETE | `/api/v1/articles/:id` | Yes | admin | Delete an article |