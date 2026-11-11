# CodeMatrix API Documentation

Base URL: `http://localhost:5000/api`

Protected endpoints require `Authorization: Bearer <accessToken>`. For requests with a JSON body, select **Body → raw → JSON** in Postman (which sets `Content-Type: application/json`). Postman does not enforce browser CORS rules.

## Before testing

1. Start MongoDB. By default the backend connects to `mongodb://localhost:27017/codematrix`.
2. From the `backend` folder run `npm run dev`. The default API address is `http://localhost:5000`.
3. Configure `EMAIL_USER`, `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` in `backend/.env` to send registration/password-reset OTPs. See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).
4. Optional services: configure `GEMINI_API_KEY` for live AI responses and `JUDGE0_API_KEY`/`JUDGE0_API_URL` for code execution.

## Postman environment setup

Create a Postman environment with these variables:

| Variable | Initial value |
|---|---|
| `baseUrl` | `http://localhost:5000/api` |
| `accessToken` | (empty) |
| `projectId` | (empty) |
| `fileId` | (empty) |

For protected requests, select **Authorization → Bearer Token** and enter `{{accessToken}}`.

## Health check

### GET `{{baseUrl}}/health`

No authentication required. This is a MongoDB readiness check: HTTP `200` means connected; HTTP `503` means MongoDB is connecting or unavailable. Email is optional for health.

Example response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "app": "CodeMatrix Backend API",
    "version": "1.0.0",
    "timestamp": "2026-11-10T00:00:00.000Z",
    "database": "connected",
    "emailConfigured": true
  }
}
```

## Authentication

### POST `{{baseUrl}}/auth/register`

No authentication required.

```json
{
  "name": "Aman Kumar",
  "email": "aman@example.com",
  "password": "SecurePass123!"
}
```

Name must be 2–50 characters; password must be 6–100 characters. A six-digit verification OTP is emailed and expires after 10 minutes. A mail configuration/send failure returns an error; configure email before testing registration.

### POST `{{baseUrl}}/auth/verify-email`

```json
{ "email": "aman@example.com", "otp": "123456" }
```

OTP must be six digits. Verification attempts are rate limited.

### POST `{{baseUrl}}/auth/resend-verification`

```json
{ "email": "aman@example.com" }
```

The response does not reveal whether the address has an unverified account.

### POST `{{baseUrl}}/auth/login`

```json
{ "email": "aman@example.com", "password": "SecurePass123!" }
```

Email verification is required. Save the returned access token with **Scripts → Post-response**:
```javascript
pm.environment.set("accessToken", pm.response.json().data.accessToken);
```

The access token expires after 15 minutes. A refresh-token cookie is also set, but the backend currently has no token-refresh endpoint; log in again when the access token expires.

### GET `{{baseUrl}}/auth/me`

Requires Bearer authentication. Returns the user data from the access token.

### POST `{{baseUrl}}/auth/logout`

No authentication required. Clears the refresh-token cookie; an already issued access token remains valid until it expires.

### POST `{{baseUrl}}/auth/forgot-password`

No authentication required.
```json
{ "email": "aman@example.com" }
```

If the email belongs to an account, a six-digit OTP is sent. The response is intentionally the same for existing and unknown accounts. OTP expires after 10 minutes.

### POST `{{baseUrl}}/auth/reset-password`

No authentication required. Submit the same email, OTP, and new password:
```json
{
  "email": "aman@example.com",
  "otp": "123456",
  "password": "NewSecurePass123!"
}
```

Password must be 6–100 characters. OTP is single-use; log in with the new password to verify.

## Projects

All project routes require Bearer authentication.

### POST `{{baseUrl}}/projects`

```json
{
  "name": "Postman Test",
  "description": "Test project",
  "language": "typescript",
  "template": "ts-utility",
  "visibility": "private"
}
```

`name` is required (1–100 characters); `description` is optional (up to 500 characters); `language` defaults to `typescript`; `visibility` defaults to `private`. Creating a project also creates a starter file. Save `data._id` as `projectId`:
```javascript
pm.environment.set("projectId", pm.response.json().data._id);
```

### GET `{{baseUrl}}/projects`

Returns an array of the authenticated user's projects. Search, pagination, and sorting query parameters are not currently implemented.

### GET `{{baseUrl}}/projects/{{projectId}}`

Get one project by its MongoDB ID.

## Files

All file routes require Bearer authentication.

The authenticated user must own the project or be a collaborator to list its files. Creating, editing, and deleting files requires project ownership or collaborator `write`/`admin` permission.

### GET `{{baseUrl}}/files/{{projectId}}`

Returns the project's files as an array. A newly created project has a starter `main.ts`.

### POST `{{baseUrl}}/files`

```json
{
  "projectId": "{{projectId}}",
  "name": "hello.js",
  "path": "/src/hello.js",
  "fileType": "file",
  "content": "console.log('Hello');"
}
```

Required: `projectId`, `name`, `path`, and `fileType` (`file` or `folder`). `content` and `parent` are optional. Save `data._id` as `fileId`:
```javascript
pm.environment.set("fileId", pm.response.json().data._id);
```

### PUT `{{baseUrl}}/files/{{fileId}}`

```json
{ "content": "console.log('Updated');" }
```

### DELETE `{{baseUrl}}/files/{{fileId}}`

Deletes the file with that ID.

## AI

### POST `{{baseUrl}}/ai/generate`

Requires Bearer authentication. `prompt` is required (1–10,000 characters); `context` is optional (up to 20,000 characters).
```json
{
  "prompt": "Explain a JavaScript closure",
  "context": "Optional code context"
}
```

With `GEMINI_API_KEY` configured this calls Gemini. Without it, the current service returns a local sandbox example.

## Code execution

### POST `{{baseUrl}}/execution/run`

Requires Bearer authentication and valid Judge0 configuration.
```json
{
  "language": "javascript",
  "code": "console.log('Hello from Postman');"
}
```

Allowed languages: `javascript`, `typescript`, `python`, `cpp`, `java`, `rust`, `go`. Code must be 1–50,000 characters. Upstream Judge0/configuration failures return an error.

## Complete Postman test order

1. `GET {{baseUrl}}/health` — wait for HTTP `200` and `database: "connected"`.
2. `POST {{baseUrl}}/auth/register` — create an account; get the registration OTP from the configured mailbox.
3. `POST {{baseUrl}}/auth/verify-email` — submit email and OTP.
4. `POST {{baseUrl}}/auth/login` — submit email/password; post-response script saves `accessToken`.
5. `GET {{baseUrl}}/auth/me` — confirm the token works.
6. `POST {{baseUrl}}/projects` — create a project; post-response script saves `projectId`.
7. `GET {{baseUrl}}/projects` and `GET {{baseUrl}}/projects/{{projectId}}`.
8. `GET {{baseUrl}}/files/{{projectId}}`; optionally create a file and save its `fileId`.
9. `PUT {{baseUrl}}/files/{{fileId}}`, then `DELETE {{baseUrl}}/files/{{fileId}}` to test file changes.
10. Optional: `POST {{baseUrl}}/ai/generate` and `POST {{baseUrl}}/execution/run` if their providers are configured.
11. Optional password reset: `POST {{baseUrl}}/auth/forgot-password`, read the OTP email, then `POST {{baseUrl}}/auth/reset-password`; log in with the new password.
12. `POST {{baseUrl}}/auth/logout` clears the refresh cookie.

Do not send a Bearer token for health, register, verify-email, resend-verification, login, logout, forgot-password, or reset-password. The API also applies rate limits; a `429` response means wait and retry later.

## Error format

```json
{
  "success": false,
  "error": "Validation Error: prompt: Too small: expected string to have >=1 characters",
  "code": "VALIDATION_ERROR"
}
```

Common statuses: `400` invalid input, `401` missing/invalid/expired access token, `404` resource not found, `429` rate limit exceeded, `502` AI/execution provider failure, and `503` MongoDB not ready.
