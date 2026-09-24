# Kôdo

Kôdo is a bilingual multi-tenant SaaS for Cameroonian SMEs.

## Stack

- Backend: NestJS + MongoDB/Mongoose + JWT
- Frontend: React + Vite + TypeScript + Tailwind CSS
- State: Zustand
- i18n: i18next (FR / EN)
- API docs: Swagger

## Current modules

- ✅ Authentication + Multi-tenancy
- ✅ Roles & Permissions
- ✅ **Facturation (Invoicing)** — Quotes, Invoices, Credit Notes, Customers, auto-numbering, TVA calculation
- ⏳ CRM
- ⏳ Inventory
- ⏳ HR & Payroll
- ⏳ Projects
- ⏳ E-commerce

## Run

### 1. MongoDB
Run MongoDB locally or set `MONGODB_URI`.

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Frontend: http://localhost:5173

## Billing routes

- `/billing` — list of documents
- `/billing/invoices/:id` — invoice detail
- `/billing/invoices/new` — create (placeholder)
- `/payment/not-found` — payment coming soon page (no real payment integration)

## Notes

- Payments (Orange Money / MTN MoMo) are **not** integrated yet. Clicking "Pay" redirects to `/payment/not-found`.
- All data is scoped by `companyId` (multi-tenant).
- Interface is fully bilingual (FR/EN) and supports dark mode.

## Free deployment

Recommended free setup with Netlify:

1. Create a MongoDB Atlas free cluster and allow network access from `0.0.0.0/0` for the first deployment. Copy its connection string.
2. Push this repository to GitHub.
3. On Render, create a Web Service from the repository using `render.yaml`. Set `MONGODB_URI` and leave `FRONTEND_URL` temporarily empty. The API will be available at `https://<service>.onrender.com`.
4. On Netlify, import the repository. The included `netlify.toml` builds the `frontend` directory automatically. Set `VITE_API_URL` to `https://<service>.onrender.com/api` and deploy.
5. Set Render's `FRONTEND_URL` to the Netlify URL, then redeploy the API.

The public health check is `https://<service>.onrender.com/api/health`. Free Render services may sleep after inactivity, so the first request can take several seconds.
