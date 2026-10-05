# TheFeeds — News Aggregator (Capstone MVP)

A full-stack news aggregator that combines live headlines from external providers
(GNews, The Guardian) with original editorial articles written by editors and admins.

## Features

- **Live news aggregation** from GNews and The Guardian, with deduplication and provider fallback
- **Editorial articles** — full CRUD by editors/admins, publicly readable
- **Authentication** — JWT-based, with persisted sessions
- **Role-based authorization** — `user`, `editor`, `admin`
- **Search + filtering + pagination** across both news streams
- **Responsive UI** with loading skeletons, empty states, and accessible error handling
- **Full-stack integration** — frontend consumes the deployed backend API

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, Tailwind, react-hook-form + Zod |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt |
| Database | MongoDB Atlas |
| External APIs | GNews, The Guardian Open Platform |

## Project structure

```
news-aggregator/
├── Backend/
│   ├── src/
│   │   ├── config/         # env, database
│   │   ├── controllers/    # auth, news, article
│   │   ├── middleware/     # auth, error, article validation
│   │   ├── models/         # User, Article
│   │   ├── routes/         # auth, news, article
│   │   ├── services/       # news aggregation logic
│   │   └── app.js
│   ├── server.js
│   └── README.md           # API documentation
│
├── Frontend/
│   ├── src/
│   │   ├── api/            # axios + typed API wrappers
│   │   ├── components/     # layout, news, auth, ui
│   │   ├── hooks/          # React Query hooks
│   │   ├── pages/          # Home, News, Search, Articles, Editor, Auth
│   │   ├── schemas/        # Zod schemas
│   │   ├── store/          # AuthContext
│   │   └── types/          # TS types
│   └── vite.config.ts
│
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- GNews API key (free tier)

### Backend

```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

API runs at `http://localhost:5000/api/v1`.

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api/v1
npm run dev
```

App runs at `http://localhost:5173`.

## Roles

| Role | Capabilities |
|---|---|
| `user` | Browse news, search, view editorial articles |
| `editor` | + Create and edit articles via `/editor` |
| `admin` | + Delete articles |

## API documentation

See [`Backend/README.md`](./Backend/README.md) for the full endpoint reference.

## Known limitations

- Article **details for external news** (GNews/Guardian) are passed via router state and do not survive a page refresh — there is no dedicated single-article fetch endpoint for external content. Editorial articles have proper `GET /articles/:id` support.
- External news is fetched on-demand and not cached — each request hits the provider. GNews free tier allows 100 requests/day.

## Team

- [Your names here]

## License

Educational project — not for commercial use.