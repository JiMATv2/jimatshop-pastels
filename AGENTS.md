# JimatShop Pastels Agent Guidelines & Workflow

## Backend & Database Access
- Hosted Supabase is sunset. Do not call `*.supabase.co` or hosted project IDs.
- Backend gateway is `ex_supabase` (`https://exsupabase.jimatlabs.com`).
- **BANNED: SQL Database Functions**: Do not create new SQL / PL/pgSQL database functions in PostgreSQL. All business logic must be implemented as Elixir business contexts in `ex_supabase`.
- **BANNED: Client-side table chains**: Do not query a table, collect IDs, and run separate `.in('id', ...)` queries against other tables. Joined data must be returned directly from `ex_supabase`.

## Production Deployment & Port
- **Process Manager**: PM2 (`v2_jimatshop`).
- **Production Port**: `4184` (reverse-proxied via Nginx for `shop3.jimatlabs.com`).
- **Preview Command**: `pnpm preview --host 0.0.0.0 --port 4184`.

## Git Workflow & Push Policy
- **Production Target Branch**: `main`.
- Push to `origin main`:
  ```bash
  git push origin main
  ```

## Ship and Trigger Flask CI
When any coding task or bug fix is finished, stage relevant files, commit, push, and immediately trigger the Flask CI build:
```bash
curl --noproxy '*' -sS -X POST http://127.0.0.1:5000/api/build/trigger \
  -H 'Content-Type: application/json' \
  -d '{"project": "jimatshop-pastels", "environment": "prod"}'
```
- Poll build status:
  ```bash
  curl --noproxy '*' -sS -H "X-CI-Token: jimat-ci-admin-token-2026" http://127.0.0.1:5000/api/build/<build_id>/status
  ```
- Flask CI compiles the frontend bundle (`pnpm build`) and starts/reloads PM2 process `v2_jimatshop` on port `4184`.
