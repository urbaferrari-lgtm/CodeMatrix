# CodeMatrix — Project Workflow Guide

## Development Workflow

### Phase Order

```
Phase 1 → Root Setup ✅
Phase 2 → Frontend UI
Phase 3 → Test Frontend
Phase 4 → Backend + DB
Phase 5 → Auth + Email
Phase 6 → Project + File APIs
Phase 7 → AI + Execution
Phase 8 → Test Backend
Phase 9 → Integration
Phase 10 → Collab + Deploy
```

---

## Git Workflow

```bash
# Initial setup
git init
git add .
git commit -m "feat: initial project structure"

# Feature branch workflow
git checkout -b feat/frontend-landing
# ... work ...
git commit -m "feat(frontend): add landing page"
git checkout main
git merge feat/frontend-landing
```

### Commit Message Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting, no logic change
refactor: Code restructure
test:     Tests
chore:    Build tools, deps
```

---

## Running the Full Stack (Development)

### Option 1: Two Terminals

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

### Option 2: Root concurrently (future)

```bash
npm run dev  # Starts both
```

---

## Testing Workflow

### Frontend
```bash
cd frontend
npm run build      # TypeScript check + build
npm run lint       # ESLint check
```

### Backend
```bash
cd backend
npm run build      # TypeScript compile
npm run test       # Jest tests
# Manual: use Postman or curl
curl http://localhost:5000/api/health
```

---

## Adding a New Feature

### Frontend feature checklist:
- [ ] Add TypeScript types to `src/types/index.ts`
- [ ] Add API calls to `src/services/api.ts`
- [ ] Add TanStack Query hook in `src/hooks/`
- [ ] Update Zustand store if needed
- [ ] Create component in correct `src/components/` subfolder
- [ ] Add page in `src/app/` if needed
- [ ] Handle loading + error states
- [ ] Test on `localhost:3000`

### Backend feature checklist:
- [ ] Add Zod validator in `src/validators/`
- [ ] Add Mongoose model in `src/models/`
- [ ] Add service logic in `src/services/`
- [ ] Add controller in `src/controllers/`
- [ ] Add routes in `src/routes/`
- [ ] Register route in `app.ts`
- [ ] Test with Postman/curl

---

## Environment Files

| File | Tracked? | Purpose |
|---|---|---|
| `frontend/.env.local` | ❌ gitignored | Local dev config |
| `frontend/.env.example` | ✅ tracked | Template for team |
| `backend/.env` | ❌ gitignored | Local dev secrets |
| `backend/.env.example` | ✅ tracked | Template for team |

---

## Common Issues & Solutions

| Issue | Solution |
|---|---|
| Monaco Editor SSR error | Use `dynamic(() => import(...), { ssr: false })` |
| xterm.js SSR error | Same dynamic import trick |
| CORS error | Check `CORS_ORIGIN` in backend `.env` |
| JWT expired | Implement token refresh in `api.ts` interceptor |
| MongoDB connection fail | Check IP whitelist in Atlas |
| Email not sending | Use Gmail App Password, not account password |

---

## Deployment Checklist

### Frontend (Vercel)
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Set `NEXT_PUBLIC_SOCKET_URL` to production backend URL
- [ ] Run `npm run build` without errors

### Backend (Railway / Render / VPS)
- [ ] Set all env vars in dashboard
- [ ] MongoDB Atlas: whitelist `0.0.0.0/0` or server IP
- [ ] Set `NODE_ENV=production`
- [ ] Set `CLIENT_URL` to production frontend URL

