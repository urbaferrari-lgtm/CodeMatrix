# CodeMatrix — AI-Powered Online Code Editor

> **Code smarter. Build beyond limits.**

CodeMatrix is a full-stack, AI-powered online code editor built with the MERN stack. It features a Monaco-based editor, real-time collaboration, an integrated AI assistant (Google Gemini), code execution, and a beautiful dark IDE-inspired UI.

---

## Project Structure

```
CodeMatrix/
├── frontend/       → Next.js + React + TypeScript + Tailwind
├── backend/        → Node.js + Express + TypeScript + MongoDB
├── docs/           → Full documentation
└── README.md
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5000
```

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Editor    | Monaco Editor, xterm.js                                 |
| State     | Zustand, TanStack Query                                 |
| Backend   | Node.js, Express.js, TypeScript                         |
| Database  | MongoDB Atlas + Mongoose                                |
| Auth      | JWT + Refresh Tokens + bcrypt                           |
| AI        | Google Gemini (primary), OpenAI (optional)              |
| Realtime  | Socket.IO + Yjs                                         |
| Email     | Nodemailer                                              |

---

## Documentation

See the [`docs/`](./docs) folder for complete guides.

---

## License

MIT

