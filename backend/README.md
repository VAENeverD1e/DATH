# DATH backend (minimal)

This folder contains a minimal Node.js scaffold that connects to Supabase. It's intentionally small — no routes or business logic yet.

Setup
1. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
```

2. Install dependencies (run from repository root or inside `backend/`):

```powershell
cd backend
npm install
```

3. Run the simple connection test:

```powershell
npm start
```

Notes
- The test script runs a lightweight `select 1` query against the `Users` table by default. If your table name differs, set the `TEST_TABLE` environment variable in `.env`.

Example `.env` when testing a different table:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
TEST_TABLE=Slot
```
