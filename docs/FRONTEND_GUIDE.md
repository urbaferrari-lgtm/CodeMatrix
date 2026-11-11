# CodeMatrix Frontend Guide

## Overview

The frontend is a **Next.js 14** application using the App Router, TypeScript, Tailwind CSS, and a suite of developer-focused libraries. It runs independently at `http://localhost:3000`.

---

## Folder Structure

```
frontend/
├── public/                   → Static assets (favicon, images, fonts)
├── src/
│   ├── app/                  → Next.js App Router pages
│   │   ├── (auth)/           → Auth route group (login, register, etc.)
│   │   │   ├── login/        → /login page
│   │   │   ├── register/     → /register page
│   │   │   ├── forgot-password/ → /forgot-password page
│   │   │   └── reset-password/  → /reset-password page
│   │   ├── dashboard/        → /dashboard (project list)
│   │   ├── editor/
│   │   │   └── [projectId]/  → /editor/:id (main code editor)
│   │   ├── settings/         → /settings
│   │   ├── profile/          → /profile
│   │   ├── admin/            → /admin (admin panel)
│   │   ├── layout.tsx        → Root layout (providers, fonts)
│   │   └── page.tsx          → Landing page (/)
│   │
│   ├── components/           → Reusable React components
│   │   ├── landing/          → Landing page sections
│   │   ├── dashboard/        → Dashboard components
│   │   ├── editor/           → Monaco editor wrapper + tabs
│   │   ├── explorer/         → File tree explorer
│   │   ├── terminal/         → xterm.js terminal
│   │   ├── preview/          → Live preview iframe panel
│   │   ├── ai-assistant/     → AI chat panel
│   │   ├── navbar/           → Top navigation
│   │   ├── sidebar/          → Left sidebar
│   │   └── ui/               → Base UI primitives (Button, Card, etc.)
│   │
│   ├── hooks/                → Custom React hooks
│   │   ├── useAuth.ts        → Authentication state hook
│   │   ├── useProjects.ts    → Project CRUD with TanStack Query
│   │   ├── useEditor.ts      → Editor operations
│   │   └── useSocket.ts      → Socket.IO connection hook
│   │
│   ├── services/             → API communication layer
│   │   └── api.ts            → Axios instance + all API calls
│   │
│   ├── store/                → Zustand global state stores
│   │   ├── authStore.ts      → User auth state
│   │   ├── editorStore.ts    → Editor tabs, settings
│   │   ├── projectStore.ts   → Current project state
│   │   └── uiStore.ts        → Panel visibility, layout
│   │
│   ├── context/              → React context providers
│   │   └── QueryProvider.tsx → TanStack Query provider
│   │
│   ├── lib/                  → Utilities and constants
│   │   ├── utils.ts          → cn() helper (clsx + tailwind-merge)
│   │   └── constants.ts      → App-wide constants
│   │
│   ├── types/                → TypeScript type definitions
│   │   └── index.ts          → All shared types (User, Project, File, etc.)
│   │
│   └── styles/               → Global CSS
│       └── globals.css       → Tailwind directives + CSS variables
│
├── .env.local                → Local environment variables
├── .env.example              → Template for environment variables
├── package.json              → Frontend dependencies
├── tailwind.config.ts        → Tailwind + design tokens
├── tsconfig.json             → TypeScript config
└── next.config.ts            → Next.js config (Monaco webpack)
```

---

## Design System

### Colors

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#0A0A0A` | Root background |
| `--surface` | `#121212` | Cards, panels |
| `--elevated` | `#1A1A1A` | Modals, dropdowns |
| `--border` | `#242424` | Borders, dividers |
| `--text-primary` | `#F2F2F2` | Headings, body text |
| `--text-secondary` | `#A1A1AA` | Subtitles, hints |
| `--green-primary` | `#22D472` | CTAs, accents |
| `--green-secondary` | `#18A355` | Hover states |

### Purple Glow Effect

Every card/panel/box in CodeMatrix has a subtle purple backlight:

```css
box-shadow: 0 0 24px rgba(124, 58, 237, 0.15);
```

On hover it intensifies:
```css
box-shadow: 0 0 32px rgba(124, 58, 237, 0.25);
```

This creates the "dim purplish dark light coming from behind the box" effect.

### Typography

- **UI Font**: Sora (Google Fonts) — clean, modern
- **Code Font**: JetBrains Mono (Google Fonts) — monospaced, developer-friendly

---

## State Management

### Zustand Stores

| Store | Purpose |
|---|---|
| `authStore` | Logged-in user, JWT token, auth status |
| `editorStore` | Open tabs, active file, editor settings |
| `projectStore` | Current project data, file tree |
| `uiStore` | Panel open/close, layout preferences |

### TanStack Query

Used for all server-state (data fetched from backend APIs):
- User data
- Projects list
- Files list
- AI conversation history

---

## Editor Features

- The AI panel sends the active file and its language to the authenticated `/api/ai/generate` endpoint. Monaco's context menu includes **CodeMatrix: Generate AI completion** to insert a completion at the cursor.
- The Run button and terminal's `run` command execute the active buffer through `/api/execution/run`; the backend requires Judge0 credentials.
- Live Preview renders the project's HTML file with its local CSS and JavaScript files inside a sandboxed iframe. Desktop, tablet, and mobile viewport controls are available.
- Save stores the active file content in browser storage for the current project. Reopening that file restores the last saved content.

---

## How to Run Frontend Independently

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Start dev server
npm run dev

# → Opens at http://localhost:3000
```

> **Note**: Some authentication and project screens still use DEV_FIXTURE data when the backend is not connected. AI requests and code execution require a reachable backend and report connection/configuration errors in the editor.

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `next` | React framework with App Router |
| `@monaco-editor/react` | VS Code-like code editor |
| `xterm` | Terminal emulator |
| `framer-motion` | Animations |
| `zustand` | Global UI state |
| `@tanstack/react-query` | Server state management |
| `socket.io-client` | Real-time collaboration |
| `lucide-react` | Icon library |
| `react-resizable-panels` | Resizable panel layout |
| `@radix-ui/*` | Accessible UI primitives |
| `tailwind-merge` + `clsx` | Conditional class utilities |

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api    # Backend API base URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000     # Socket.IO server URL
NEXT_PUBLIC_APP_NAME=CodeMatrix                  # Application name
```

> ⚠️ **Never** put private keys, JWT secrets, or database credentials in `NEXT_PUBLIC_*` variables — they are exposed to the browser.
