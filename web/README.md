# FlashGuard Web

Local development and instructions for the FlashGuard UI migration.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Create environment file (optional):

```bash
cp .env.example .env
# edit .env to point VITE_API_URL to your API server
```

3. Start dev server:

```bash
npm run dev
```

Notes

- The app uses `VITE_API_URL` to connect to the backend (fallback: `window.location.hostname:4000`).
- `fetchJson` will attach an Authorization header if a session token is stored in `localStorage` under `flashguard-session`.

- For local development without a backend, set `VITE_USE_MOCK=true` to enable built-in mock responses for `/auth/login` and `/auth/register`.

Database seeding (Windows Integrated Auth)

- If your SQL Server uses Windows Integrated Authentication (no SQL user/password), run the included PowerShell seeder from the host where your Windows credentials are valid.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\seed-with-windows-auth.ps1 -Server "localhost" -Database "FlashGuard"
```

The script uses `sqlcmd -E` (Trusted Connection).

- If `db\init\01-schema.sql` exists, it runs that on `master`.
- Otherwise it falls back to `scripts\create-flashguard-db.sql` to create the DB only.
- If `db\init\99-reset-and-seed.sql` exists, it runs it on the target DB.

This keeps app/API deployment in Docker while DB creation happens directly on your host SQL Server via Windows auth.
