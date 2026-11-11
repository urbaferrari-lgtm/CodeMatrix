# CodeMatrix — Database Guide

## MongoDB Atlas Setup

CodeMatrix uses **MongoDB Atlas** (cloud-hosted MongoDB) with **Mongoose** ODM.

---

## Collections Overview

| Collection | Description |
|---|---|
| `users` | Registered users + preferences |
| `projects` | Code projects with metadata |
| `files` | Individual files and folders |
| `aiconversations` | AI chat history per project |
| `executions` | Code execution logs |
| `collaborations` | Project collaboration sessions |

---

## Schemas

### User Schema

```typescript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  passwordHash: String (required, bcrypt hashed),
  avatar: String (optional, URL),
  role: 'user' | 'admin' (default: 'user'),
  isEmailVerified: Boolean (default: false),
  emailVerificationOtpHash: String (HMAC hashed, not indexed),
  emailVerificationExpires: Date,
  passwordResetOtpHash: String (HMAC hashed, not indexed),
  passwordResetExpires: Date,
  refreshTokens: [String] (schema field; not currently used by auth routes),
  preferences: {
    theme: String (default: 'codematrix-dark'),
    fontSize: Number (default: 14),
    tabSize: Number (default: 2),
    fontFamily: String (default: 'JetBrains Mono'),
    wordWrap: Boolean (default: false),
    minimap: Boolean (default: true),
    autoSave: Boolean (default: true),
  },
  createdAt: Date (auto),
  updatedAt: Date (auto),
}
```

**Indexes:** `email (unique)`

---

### Project Schema

```typescript
{
  owner: ObjectId (ref: 'User', required),
  name: String (required, 1-100 chars),
  description: String (optional, max 500 chars),
  language: String (required),
  template: String (optional),
  visibility: 'public' | 'private' (default: 'private'),
  collaborators: [{
    user: ObjectId (ref: 'User'),
    permission: 'read' | 'write' | 'admin'
  }],
  createdAt: Date (auto),
  updatedAt: Date (auto),
}
```

**Indexes:** `owner`, `visibility`, `name (text search)`

---

### File Schema

```typescript
{
  project: ObjectId (ref: 'Project', required),
  name: String (required),
  path: String (required),         // e.g., /src/index.ts
  content: String (default: ''),
  fileType: 'file' | 'folder' (required),
  parent: ObjectId (ref: 'File', optional),  // null = root
  createdAt: Date (auto),
  updatedAt: Date (auto),
}
```

**Indexes:** `project`, `project + path (unique compound)`

---

### AIConversation Schema

```typescript
{
  user: ObjectId (ref: 'User', required),
  project: ObjectId (ref: 'Project', optional),
  messages: [{
    role: 'user' | 'assistant',
    content: String,
    timestamp: Date,
  }],
  createdAt: Date (auto),
  updatedAt: Date (auto),
}
```

---

### Execution Schema

```typescript
{
  user: ObjectId (ref: 'User', required),
  project: ObjectId (ref: 'Project', optional),
  language: String (required),
  code: String (required),
  status: 'pending' | 'running' | 'completed' | 'error' | 'timeout',
  output: String,
  errors: String,
  duration: Number (milliseconds),
  createdAt: Date (auto),
}
```

---

### Collaboration Schema

```typescript
{
  project: ObjectId (ref: 'Project', required, unique),
  members: [{
    user: ObjectId (ref: 'User'),
    socketId: String,
    cursor: { line: Number, column: Number },
    color: String,
    joinedAt: Date,
  }],
  updatedAt: Date (auto),
}
```

---

## Relationships

```
User (1) ──────────── (N) Projects
Project (1) ─────────── (N) Files
Project (1) ─────────── (N) AIConversations
Project (1) ─────────── (N) Executions
Project (1) ─────────── (1) Collaboration
User (N) ──────────────── (N) Projects [via collaborators]
```

---

## Connection Code

```typescript
// config/database.ts
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI!;
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
};
```

---

## Pagination Pattern

All list endpoints support cursor-based or offset pagination:

```typescript
const { page = 1, limit = 12 } = req.query;
const skip = (Number(page) - 1) * Number(limit);
const [items, total] = await Promise.all([
  Model.find(filter).skip(skip).limit(Number(limit)).sort({ updatedAt: -1 }),
  Model.countDocuments(filter),
]);
```

---

## Security Notes

- Passwords are **never stored** — only bcrypt hashes
- Email verification and password-reset OTPs are stored as HMAC-SHA-256 hashes; raw OTPs are only sent by email
- Login issues a refresh-token cookie, but refresh-token persistence, rotation, and revocation are not currently implemented
- Project/file access is restricted to the owner or an authorized collaborator
