# ZoneBridge — Apprentice Knowledge Network

Peer knowledge network for Zone01 Kisumu apprentices. Built to connect learners through shared skills, project post-mortems, and real-time mentorship — without duplicating Discord, Gitea, or the edu-platform.

---

## What It Is

ZoneBridge is the connective tissue between the tools you already use:

### SkillSpot

Tag yourself with skills you're comfortable helping others with (`"Go channels"`, `"Docker basics"`, `"CSS Grid"`). When someone is stuck, they search and find 2–3 peers a bit ahead — not mentors, just fellow apprentices.

### ProjectDNA

Structured post-mortems linked to Gitea projects. Future cohorts search `"authentication"` or `"WebSockets"` and learn how past teams solved it — what worked, what didn't, what they'd do differently.

---

## The Loop

```plain
1. Stuck on "Go channels" or "Docker networking"
2. Search ProjectDNA → find a past project's post-mortem → maybe get unstuck
3. Still stuck? Flip to SkillSpot → find a peer who tagged that skill → reach out
4. After solving it, update your SkillSpot profile + contribute a ProjectDNA note for the next person
```

---

## Why ZoneBridge Exists

ZoneBridge was built to solve three core challenges in the apprentice learning journey:

### Discover peer expertise by skill

Search for apprentices who have tagged skills like `"Go channels"`, `"Docker networking"`, or `"CSS Grid"` — and reach out to someone who's just a step ahead. This eliminates noisy channels, static roles while retaining just targeted, contextual help.

### Learn from structured project reflections

Browse post-mortems linked to real Gitea projects. Each entry captures the _biggest challenge_, the _clever solution_, and the _tech choice regret_ — turning individual struggle into cohort-wide wisdom.

### Close the peer-learning loop

Get unstuck → update your skill profile → contribute a post-mortem → help the next apprentice. ZoneBridge makes informal mentorship visible, searchable, and cumulative across intakes.

> ZoneBridge is pedagogy-aligned: it amplifies the zone01 model of peer-to-peer learning, ensuring knowledge isn't lost when a cohort graduates — it's preserved, tagged, and ready for the next apprentice who needs it.

---

## Core Features

### MVP (Built)

- **Skill Profiles** — Tag yourself with skills you can help with. Auto-linked to your Gitea activity.
- **Project Post-Mortems** — Short, structured reflections: biggest challenge, clever solution, tech choice regret.
- **Dual Search** — Find projects by tech/tag or find peers by skill.
- **Help Requests** — Structured asks (skill + project + title + description). Accept and resolve flow.
- **Real-Time Presence** — See who's online and available to help via WebSocket.
- **Gitea OAuth** — Single sign-on. No new passwords.

## Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| **Backend**   | Go 1.22 + Gin                          |
| **Frontend**  | React 18 + Vite + TypeScript           |
| **Styling**   | Tailwind CSS v4 + shadcn/ui            |
| **Database**  | PostgreSQL + uuid-ossp                 |
| **Auth**      | Gitea OAuth2 + JWT (HTTP-only cookies) |
| **Real-Time** | Gorilla WebSocket                      |

---

## Architecture Decisions

- **No direct messaging** — Discord already handles this.
- **No React Query** — Raw `useEffect` + `useState` (can migrate later).
- **Cookie-based JWT** — No `localStorage` tokens. More secure against XSS.
- **No polling** — WebSocket for real-time, not HTTP polling.

---

## Project Structure

```plain
zonebridge/
├── backend/
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers.go
│   │   │   ├── routes.go
│   │   │   └── websocket.go
│   │   ├── models/
│   │   │   └── models.go
│   │   ├── store/
│   │   │   └── postgres.go
│   │   ├── auth/
│   │   ├── client/
│   │   │   └── gitea.go
│   │   └── config/
│   │       └── config.go
│   ├── migrations/
│   ├── go.mod
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   │   ├── layout/Layout.tsx
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/api.ts
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Go 1.22+
- Node.js 20+
- PostgreSQL 15+
- Gitea OAuth app credentials

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB URL, JWT secret, and Gitea credentials
go mod download
go run cmd/server/main.go
```

> Server runs at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Dev server runs at `http://localhost:5173` (proxies API to `:8080`).

---

## Environment Variables

```bash
# backend/.env
DATABASE_URL=postgres://user:pass@localhost:5432/zonebridge?sslmode=disable
JWT_SECRET=your-secret-key
GITEA_CLIENT_ID=your-gitea-client-id
GITEA_CLIENT_SECRET=your-gitea-client-secret
GITEA_BASE_URL=https://learn.zone01kisumu.ke/git
FRONTEND_URL=http://localhost:5173
```

---

## API Overview

| Method  | Route                            | Description                                  |
| ------- | -------------------------------- | -------------------------------------------- |
| `GET`   | `/auth/gitea`                    | Initiate OAuth login                         |
| `GET`   | `/auth/callback`                 | OAuth callback + JWT cookie set              |
| `POST`  | `/auth/logout`                   | Clear auth cookie                            |
| `GET`   | `/api/me`                        | Current user profile                         |
| `PUT`   | `/api/me/skills`                 | Update your skills                           |
| `PATCH` | `/api/me/availability`           | Toggle availability status                   |
| `GET`   | `/api/skills`                    | List all skills                              |
| `POST`  | `/api/skills`                    | Create new skill                             |
| `GET`   | `/api/users`                     | Find users by skill                          |
| `GET`   | `/api/users/online`              | Available users right now                    |
| `GET`   | `/api/projects`                  | List Gitea-linked projects                   |
| `GET`   | `/api/postmortems`               | Browse project post-mortems                  |
| `POST`  | `/api/postmortems`               | Write a post-mortem                          |
| `POST`  | `/api/postmortems/:id/upvote`    | Upvote useful post-mortem                    |
| `GET`   | `/api/help-requests`             | List help requests                           |
| `POST`  | `/api/help-requests`             | Create help request                          |
| `PATCH` | `/api/help-requests/:id/accept`  | Accept a request                             |
| `PATCH` | `/api/help-requests/:id/resolve` | Mark as resolved                             |
| `GET`   | `/ws`                            | WebSocket connection (presence + activities) |

---

## Contributing

This project is built by and for Zone01 Kisumu apprentices. Contributions welcome:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit with Conventional Commits
4. Open a pull request

## License

**MIT** — built for the Zone01 Kisumu apprentice community.

> _"Knowledge shared is knowledge multiplied."_ — ZoneBridge
