# CodeMatrix Backend Guide

## Overview

The backend is a **Node.js + Express.js** application written in TypeScript. It runs independently at `http://localhost:5000`.

---

## Folder Structure

```
backend/
├── src/
│   ├── config/                     → App configuration
│   │   ├── database.ts             → MongoDB Atlas connection
│   │   ├── env.ts                  → Environment variable validation (Zod)
│   │   └── cors.ts                 → CORS configuration
│   │
│   ├── controllers/                → Route handlers (thin layer)
│   │   ├── auth.controller.ts      → Register, login, logout, verify email
│   │   ├── user.controller.ts      → Get/update user profile
│   │   ├── project.controller.ts   → Project CRUD
│   │   ├── file.controller.ts      → File/folder CRUD
│   │   ├── ai.controller.ts        → AI assistant endpoints
│   │   └── execution.controller.ts → Code execution endpoints
│   │
│   ├── models/                     → Mongoose schema definitions
│   │   ├── User.ts                 → User model + schema
│   │   ├── Project.ts              → Project model + schema
│   │   ├── File.ts                 → File/folder model + schema
│   │   ├── AIConversation.ts       → AI chat history model
│   │   ├── Execution.ts            → Code execution log model
│   │   └── Collaboration.ts        → Collaboration session model
│   │
│   ├── routes/                     → Express route definitions
│   │   ├── auth.routes.ts          → /api/auth/*
│   │   ├── user.routes.ts          → /api/users/*
│   │   ├── project.routes.ts       → /api/projects/*
│   │   ├── file.routes.ts          → /api/files/*
│   │   ├── ai.routes.ts            → /api/ai/*
│   │   ├── execution.routes.ts     → /api/execution/*
│   │   └── github.routes.ts        → /api/github/*
│   │
│   ├── middleware/                 → Express middleware
│   │   ├── auth.middleware.ts      → JWT verification
│   │   ├── error.middleware.ts     → Centralized error handler
│   │   ├── validation.middleware.ts → Zod schema validation
│   │   └── admin.middleware.ts     → Role-based access control
│   │
│   ├── services/                   → Business logic layer
│   │   ├── auth.service.ts         → Auth logic (hash, tokens, verify)
│   │   ├── email.service.ts        → Nodemailer email sending
│   │   ├── project.service.ts      → Project operations
│   │   ├── file.service.ts         → File operations
│   │   ├── ai/
│   │   │   ├── ai.service.ts       → AI abstraction layer
│   │   │   ├── gemini.service.ts   → Google Gemini integration
│   │   │   └── openai.service.ts   → OpenAI integration (optional)
│   │   ├── execution/
│   │   │   ├── execution.service.ts → Execution orchestrator
│   │   │   └── judge0.service.ts   → Judge0 API integration
│   │   └── github/
│   │       └── github.service.ts   → GitHub API integration
│   │
│   ├── validators/                 → Zod validation schemas
│   │   ├── auth.validator.ts
│   │   ├── project.validator.ts
│   │   └── file.validator.ts
│   │
│   ├── templates/                  → Email HTML templates
│   │   ├── welcome.html
│   │   ├── verify-email.html
│   │   ├── reset-password.html
│   │   └── password-changed.html
│   │
│   ├── sockets/                    → Socket.IO event handlers
│   │   ├── index.ts                → Socket.IO initialization
│   │   └── collaboration.socket.ts → Collaboration events
│   │
│   ├── utils/                      → Utility functions
│   │   ├── jwt.ts                  → JWT sign/verify helpers
│   │   ├── crypto.ts               → Token generation helpers
│   │   ├── response.ts             → Standardized API responses
│   │   └── logger.ts               → Logging utility
│   │
│   ├── app.ts                      → Express app setup (middleware, routes)
│   └── server.ts                   → HTTP server + Socket.IO init
│
├── .env                            → Local environment variables (git-ignored)
├── .env.example                    → Environment variable template
├── package.json                    → Backend dependencies
└── tsconfig.json                   → TypeScript config
```

---

## Architecture Pattern

```
HTTP Request
    ↓
Routes (routes/*.ts)
    ↓
Middleware (auth, validation)
    ↓
Controllers (controllers/*.ts)   ← Thin: only req/res handling
    ↓
Services (services/*.ts)         ← Business logic lives here
    ↓
Models (models/*.ts)             ← Database operations
    ↓
MongoDB Atlas
```

---

## Authentication Flow (current implementation)

Registration and password recovery use six-digit email OTPs that expire after 10 minutes. Login issues a 15-minute access token and a 7-day `httpOnly` refresh cookie. No refresh-token endpoint is currently implemented; log in again when the access token expires. Logout clears the cookie but does not revoke an access token already issued.

1. **Register**: Hash password → save user → email a six-digit verification OTP
2. **Login**: Find user → compare password → issue access token (15min) + refresh token (7d, httpOnly cookie)
3. **Email Verification**: Submit email and six-digit OTP to `/api/auth/verify-email` (10-minute expiry)
4. **Password Reset**: Request a six-digit OTP, then submit email, OTP, and new password (10-minute expiry)

---

## API Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Clear refresh cookie | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/verify-email` | Verify registration OTP | No |
| POST | `/api/auth/resend-verification` | Resend registration OTP | No |
| POST | `/api/auth/forgot-password` | Request password reset OTP | No |
| POST | `/api/auth/reset-password` | Reset password with OTP | No |
| GET | `/api/projects` | Get user's projects | Yes |
| POST | `/api/projects` | Create project | Yes |
| GET | `/api/projects/:id` | Get project | Yes |
| GET | `/api/files/:projectId` | Get project files | Yes |
| POST | `/api/files` | Create file/folder | Yes |
| PUT | `/api/files/:id` | Update file content | Yes |
| DELETE | `/api/files/:id` | Delete file | Yes |
| POST | `/api/ai/generate` | Generate code | Yes |
| POST | `/api/execution/run` | Execute code | Yes |
| GET | `/api/health` | Health check | No |

---

## How to Run Backend Independently

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# → Fill in MONGODB_URI, JWT secrets, Gmail OAuth2 settings, and optional AI/Judge0 keys

# 4. Start dev server
npm run dev

# → Runs at http://localhost:5000
# → Test health: GET http://localhost:5000/api/health
```

---

## Security Implementation

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| JWT access token | 15 minute expiry, `Authorization: Bearer` header |
| JWT refresh token | 7 day expiry, `httpOnly` secure cookie |
| Token refresh | Not implemented |
| Rate limiting | 200 req/15min general; OTP routes have stricter per-route limits |
| Input validation | Zod schemas on auth, project creation, file writes, AI generation, and code execution requests |
| SQL injection | N/A (MongoDB); Mongoose sanitizes inputs |
| NoSQL injection | `express-mongo-sanitize` |
| CORS | Allows configured `CLIENT_URL` and `CORS_ORIGIN`, plus `http://localhost:3000` |
| Helmet | Full HTTP header security |
| Environment | Zod validates all env vars at startup |

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codematrix
JWT_ACCESS_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-different-secret
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-google-oauth-refresh-token
EMAIL_USER=your@gmail.com
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=optional
GITHUB_CLIENT_ID=optional
GITHUB_CLIENT_SECRET=optional
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-rapidapi-key
```

Code execution is unavailable until both Judge0 values are configured. The backend executes JavaScript, TypeScript, Python, C++, Java, Rust, and Go via Judge0; unsupported languages return an error rather than a simulated success.
