# Frontend & Node.js Deployment Rules

1. **Stack & Process Management**:
   - React-Vite and Node.js applications use **NVM** for Node version control, **pnpm** for package management, and **PM2** for process lifecycle and runtime deployment.
   - Applications running under PM2 include `v2_jimatbiz` (port 4183), `v2_jimatshop` (port 4184), `v2_jimathub`, etc.

2. **Deployment Workflow**:
   - **Flask CI**:
     - Project name: `jimatshop-pastels` (or `jimatshop-pastel`)
     - Production branch: `main` (`git push origin main`)
     - Trigger CI build:
       ```bash
       curl --noproxy '*' -sS -X POST http://127.0.0.1:5000/api/build/trigger \
         -H 'Content-Type: application/json' \
         -d '{"project": "jimatshop-pastels", "environment": "prod"}'
       ```
     - Flask CI automatically builds and deploys via PM2:
       `pm2 start "pnpm preview --host 0.0.0.0 --port 4184" --name v2_jimatshop`
   - Local / manual builds:
     - Build assets using `pnpm build`.
     - PM2 commands: `pm2 reload v2_jimatshop --update-env` or `pm2 restart v2_jimatshop`.
