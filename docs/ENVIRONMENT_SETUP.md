# CodeMatrix — Environment Setup Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Included with Node |
| MongoDB Atlas | Any | https://cloud.mongodb.com |
| Google Gemini API | - | https://aistudio.google.com |

---

## 1. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0 Sandbox)
3. Create a database user with read/write permissions
4. Whitelist IP `0.0.0.0/0` (dev) or your server IP (prod)
5. Get the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/codematrix?retryWrites=true&w=majority
   ```
6. Add to `backend/.env` as `MONGODB_URI`

---

## 2. JWT Secret Generation

Generate strong secrets (run in terminal):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice — one for `JWT_ACCESS_SECRET`, one for `JWT_REFRESH_SECRET`.

---

## 3. Email Setup (Gmail OAuth2)

Create a Google OAuth client and obtain an OAuth refresh token with Gmail sending permission for the account you will use as `EMAIL_USER`. Configure the values in `backend/.env`:
   ```env
   CLIENT_ID=your-google-oauth-client-id
   CLIENT_SECRET=your-google-oauth-client-secret
   REFRESH_TOKEN=your-google-oauth-refresh-token
   EMAIL_USER=your@gmail.com
   ```
   `EMAIL_USER` must be the Gmail account associated with the OAuth grant. When all four values are present, the backend verifies the Gmail connection at startup. Registration verification codes and password reset codes are sent to this address and expire after 10 minutes.

---

## 4. Google Gemini API

1. Go to https://aistudio.google.com/app/apikey
2. Create an API key
3. Add to backend `.env`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIza...
   ```

---

## 5. GitHub OAuth (Optional)

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Callback URL: `http://localhost:5000/api/github/callback`
5. Copy Client ID and Secret to backend `.env`

---

## 6. Judge0 Code Execution (Optional)

1. Sign up at https://rapidapi.com/judge0-official/api/judge0-ce
2. Subscribe to the free tier
3. Copy API key to backend `.env`

---

## Frontend Environment: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=CodeMatrix
```

## Backend Environment: `backend/.env`

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codematrix

# JWT
JWT_ACCESS_SECRET=generate-with-node-crypto-32bytes
JWT_REFRESH_SECRET=generate-different-secret-32bytes

# App URLs
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Email (Gmail OAuth2)
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-google-oauth-refresh-token
EMAIL_USER=your@gmail.com

# AI Provider
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

# Optional
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=
```

---

## Running the Full Stack

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```
