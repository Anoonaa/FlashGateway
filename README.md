# FlashGateway

FlashGateway is a decoupled merchant settlement system built as a three-tier application for quality engineering practice.

## Structure
- Web: React + Vite merchant portal
- API: Node.js + Express REST API with JWT and RBAC
- Database: Microsoft SQL Server schema and seed scripts
- Verification: requirement traceability and test strategy docs
- Verification: requirement traceability and test strategy docs (automated test scripts are NOT included in this delivery)

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

