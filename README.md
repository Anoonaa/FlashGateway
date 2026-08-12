# FlashGateway

![Docker](https://img.shields.io/badge/Docker-%2332495e?style=flat&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%23339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-%2320232a?style=flat&logo=react&logoColor=%2361DAFB)
![MS SQL](https://img.shields.io/badge/MSSQL-%23007ACC?style=flat&logo=microsoft-sql-server&logoColor=white)
![OpenAPI / Swagger](https://img.shields.io/badge/OpenAPI-Swagger-%23FFCC00?style=flat&logo=swagger&logoColor=black)

A small, production-style merchant gateway with:
- a SQL Server schema + seed scripts (db/)
- a Node.js REST API (api/)
- a React web UI (web/)

This README focuses on a clear, reliable setup path (database first → API second → web last), Docker-first workflow, and the most important runtime links you need to operate or evaluate the system.

---


Architecture at a glance
- db/ — SQL Server schema + seeds. This is the authoritative source for data layout.
- api/ — Node.js Express REST API. Exposes /api/v1/* endpoints, /api-docs (Swagger UI) and /openapi.json.
- web/ — React + Vite UI served by nginx in the Dockerfile; uses the API base URL at build time.
How it fits together: The web UI calls the API. The API reads/writes data in SQL Server. When DB is unavailable the API runs a small in-memory fallback demo set (useful for quick demos).

Requirements
- Docker Engine + Docker Compose (Compose V2) — recommended for the simplest, reproducible run.
- For local/manual dev: Node 18+, npm, and either a local SQL Server instance (Linux/Mac via Docker or native Windows SQL Server).
- (Windows only) If you connect to a local Windows SQL Server instance using native drivers you may need the optional msnodesqlv8 driver.

Ports used by default (changeable via env)
- 80 → web (nginx)
- 4000 → API (host) mapped to container port 4001
- 1433 → SQL Server

Recommended order (explicit)
1. Database (db) — ensure schema + seed applied
2. API (api) — confirm it can connect to DB and returns healthy
3. Web (web) — build/serve after API is available (web is configured at build-time with the API URL)

Docker (recommended) — step-by-step (explicit DB → API → Web)
All compose commands assume you run them from the repository root.

1) Clone repo
```bash
git clone https://github.com/Anoonaa/FlashGateway.git
cd FlashGateway
```

## Quick start

### All services
```bash
cd web
npm install
cd ../api
npm install
cd ..
npm run start
```

This starts:
- `db`: Microsoft SQL Server with the `FlashGateway` database
- `api`: Node.js backend exposed on `http://localhost:4000`
- `web`: React UI served on `http://localhost`

### Manual startup
If you need to run services separately:
```bash
npm run start:db
npm run start:api
npm run start:web
```

### Verify
- API health: `http://localhost:4000/health`
- Web app: `http://localhost`

### Database
The compose setup includes a one-shot `db-init` service that creates and seeds the `FlashGateway` database from `db/01-schema.sql` and `db/02-seed.sql`.

### Windows Authentication
For student SQL Server setups using Windows Authentication, set these environment values before starting the service:

```bash
export DB_SERVER=localhost\SQLEXPRESS
export DB_NAME=FlashGateway
export DB_TRUSTED_CONNECTION=true
```

Do not set `DB_USER` or `DB_PASSWORD` when using trusted connection mode. If you run the API in Docker on Linux, Windows auth is not supported; use the containerized SQL Server service instead.


