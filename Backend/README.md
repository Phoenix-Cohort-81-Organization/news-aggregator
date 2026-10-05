# News Aggregator Backend

A backend API for a news aggregation application. The API provides user authentication, news search, news filtering, and article management. It integrates with external news providers such as GNews and The Guardian Open Platform.

## Architecture

The backend is built with Node.js and Express and uses MongoDB through Mongoose.

External news API keys are kept on the server and should never be exposed in the frontend application.

### Project Structure

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

## Requirements

* Node.js 20 or newer
* MongoDB Community Server or MongoDB Atlas
* GNews API key and/or The Guardian Open Platform API key

## Setup

1. Install the project dependencies:

```bash
npm install
```

2. Create a `.env` file using `.env.example` as a guide.

3. Add the required environment variables, including:

```text
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add the news provider API keys that are required by the application.

4. Start the development server:

```bash
npm run dev
```

The API runs on the configured server port.

**Never commit `.env` or expose API keys in the frontend application.**

---

# API

## Base URL

```text
/api/v1
```

All API responses use a consistent structure.

### Successful response

```json
{
  "success": true,
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# Health Check

## GET `/api/v1/health`

Checks whether the API is running.

### Authentication

Not required.

### Example response

```json
{
  "success": true,
  "message": "News Aggregator API is running"
}
```

---

# Authentication

## POST `/api/v1/auth/register`

Creates a new user account.

### Authentication

Not required.

### Request body

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "a-long-password"
}
```

### Method

```text
POST
```

---

## POST `/api/v1/auth/login`

Authenticates an existing user.

### Authentication

Not required.

### Request body

```json
{
  "email": "ada@example.com",
  "password": "a-long-password"
}
```

### Method

```text
POST
```

---

# News Endpoints

News endpoints retrieve and search articles from configured external news providers.

## GET `/api/v1/news`

Searches for news articles.

### Authentication

Not required.

### Query parameters

| Parameter  | Required | Description                                      |
| ---------- | -------- | ------------------------------------------------ |
| `q`        | Yes      | Search term. Must contain at least 2 characters. |
| `pageSize` | No       | Number of results. Limited to 1–50.              |
| `from`     | No       | Start date for the search.                       |
| `to`       | No       | End date for the search.                         |
| `country`  | No       | GNews country code.                              |

### Example

```text
GET /api/v1/news?q=climate&pageSize=10&from=2026-09-01&to=2026-09-30&country=gb
```

The response contains normalized articles from the configured providers.

---

## GET `/api/v1/news/filters`

Returns the available editorial sections and supported country codes.

### Authentication

Not required.

---

## GET `/api/v1/news/headlines`

Retrieves top headlines from GNews.

### Authentication

Not required.

### Query parameters

| Parameter  | Required | Description                   |
| ---------- | -------- | ----------------------------- |
| `category` | No       | News category.                |
| `country`  | No       | Supported GNews country code. |
| `page`     | No       | Page number.                  |
| `pageSize` | No       | Number of results per page.   |

### Supported categories

```text
general
world
nation
business
technology
entertainment
sports
science
health
```

### Example

```text
GET /api/v1/news/headlines?category=business&country=gb&page=1&pageSize=10
```

---

## GET `/api/v1/news/sections/:section`

Retrieves news for a configured editorial section.

### Authentication

Not required.

### Query parameters

| Parameter  | Required | Description                 |
| ---------- | -------- | --------------------------- |
| `country`  | No       | GNews country code.         |
| `page`     | No       | Page number.                |
| `pageSize` | No       | Number of results per page. |

### Example

```text
GET /api/v1/news/sections/sports?country=gb&page=1&pageSize=10
```

Some editorial sections use keyword searches when there is no directly matching GNews category.

---

# Article Endpoints

Article endpoints provide database-backed article management.

## POST `/api/v1/articles`

Creates a new article.

### Authentication

**Required.**

The request must include a valid JWT:

```text
Authorization: Bearer <token>
```

### Request body

```json
{
  "title": "Example News Article",
  "description": "A short description of the article.",
  "content": "Article content.",
  "url": "https://example.com/article",
  "imageUrl": "https://example.com/image.jpg",
  "author": "Author Name",
  "source": "Example Source",
  "name": "Example News",
  "section": "world",
  "provider": "gnews",
  "category": "world",
  "language": "en",
  "publishedAt": "2026-10-05T10:00:00.000Z",
  "externalId": "example-123"
}
```

### Required fields

The following fields are required:

```text
title
url
name
provider
publishedAt
```

### Supported providers

```text
gnews
guardian
```

### Supported categories

```text
politics
business
entertainment
general
health
science
sports
technology
world
lifestyle
fashion
travel
food
culture
education
environment
opinion
other
```

---

## GET `/api/v1/articles`

Returns all stored articles.

### Authentication

Not required.

### Example

```text
GET /api/v1/articles
```

---

## GET `/api/v1/articles/:id`

Returns a single article by its MongoDB ID.

### Authentication

Not required.

### Example

```text
GET /api/v1/articles/68c123456789abcdef123456
```

If the ID is invalid, the API returns:

```json
{
  "success": false,
  "message": "Invalid article ID"
}
```

If the article does not exist:

```json
{
  "success": false,
  "message": "Article not found"
}
```

---

# Article Validation

Article creation requests are validated before reaching the controller.

The validation middleware checks that:

* The request body is a JSON object.
* Required fields are present.
* String fields contain string values.
* `publishedAt` contains a valid date.
* Only supported article fields are submitted.
* The article ID is a valid MongoDB ObjectId when an ID is supplied.

### Validation error example

```json
{
  "success": false,
  "message": "Invalid article data",
  "errors": [
    "title is required"
  ]
}
```

---

# Authentication Middleware

Protected endpoints use JWT authentication.

The client must send the token using the `Authorization` header:

```text
Authorization: Bearer <token>
```

Possible authentication errors include:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

```json
{
  "success": false,
  "message": "Token not found"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

# HTTP Status Codes

| Status | Meaning                             |
| ------ | ----------------------------------- |
| `200`  | Request successful                  |
| `201`  | Resource successfully created       |
| `400`  | Invalid request or validation error |
| `401`  | Authentication required or invalid  |
| `404`  | Resource or route not found         |
| `500`  | Internal server error               |

---

# Current Article CRUD Status

The article controller currently contains functions for:

* Creating articles
* Retrieving all articles
* Retrieving an article by ID
* Updating an article
* Deleting an article

The currently registered article routes are:

```text
POST   /api/v1/articles
GET    /api/v1/articles
GET    /api/v1/articles/:id
```

The update and delete controller functions exist but their routes are not currently registered in `articleRoutes.js`.

---

# API Endpoint Summary

| Method | Endpoint                         | Authentication | Purpose              |
| ------ | -------------------------------- | -------------- | -------------------- |
| GET    | `/api/v1/health`                 | No             | Check API status     |
| POST   | `/api/v1/auth/register`          | No             | Register a user      |
| POST   | `/api/v1/auth/login`             | No             | Log in a user        |
| GET    | `/api/v1/news`                   | No             | Search news          |
| GET    | `/api/v1/news/filters`           | No             | Get news filters     |
| GET    | `/api/v1/news/headlines`         | No             | Get top headlines    |
| GET    | `/api/v1/news/sections/:section` | No             | Get section news     |
| POST   | `/api/v1/articles`               | Yes            | Create an article    |
| GET    | `/api/v1/articles`               | No             | Get all articles     |
| GET    | `/api/v1/articles/:id`           | No             | Get an article by ID |

---

# Dependencies

### Runtime dependencies

* Express
* Mongoose
* bcryptjs
* jsonwebtoken
* dotenv
* Helmet
* CORS

### Development dependencies

* Nodemon
* Supertest

---

# Security

The backend follows several security practices:

* Passwords are hashed before storage.
* JWT is used for authentication.
* Protected routes require authentication.
* Helmet is used for HTTP security headers.
* CORS is configured through environment settings.
* API keys and secrets are stored in environment variables.
* Passwords and secrets should not be exposed in API responses or committed to the repository.

---

# Development

Start the development server with:

```bash
npm run dev
```

Start the application using Node:

```bash
npm start
```

Run the test command:

```bash
npm test
```

---

# Delivery Phases

1. **Backend foundation** — API setup, authentication, news providers, article model, routes, and validation.
2. **Frontend integration** — React frontend connected to the backend API.
3. **Personalization** — Saved articles and user preferences.
4. **Quality and production readiness** — Testing, validation improvements, rate limiting, logging, deployment, and CI checks.
