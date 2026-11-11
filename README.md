# Habit Manager

**Language:** English | [မြန်မာဘာသာ](README.mm.md)

This workspace contains the React/Vite frontend and Spring Boot API in separate folders.

> **Rotate exposed credentials before deployment.** The supplied backend archive contained database, mail, and JWT credentials. They have been removed from the application source, but changing the code does not invalidate credentials that were already exposed. Replace them with new values before deploying.

## Requirements

- Java 25
- Node.js 20.19+ or 22.12+, with npm
- MySQL 8
- Ollama (optional; required only for the local AI Coach)

## Run locally

### 1. Create the MySQL database and app user

Install and start MySQL Server 8. Open MySQL Workbench, connect to your server, and run the SQL below. Replace `Choose-A-New-Password` with a new password. Use an admin account only for this setup step; the app should connect as the dedicated `habit_manager` user, not as `root`.

```sql
CREATE DATABASE habit_manager CHARACTER SET utf8mb4;
CREATE USER 'habit_manager'@'localhost' IDENTIFIED BY 'Choose-A-New-Password';
GRANT ALL PRIVILEGES ON habit_manager.* TO 'habit_manager'@'localhost';
```

### 2. Configure the backend once

Copy `.env.example` to `.env`, then open `.env`:

```powershell
cd D:\Habit-Manager\Habit-Manager-Backend-main
Copy-Item .env.example .env
notepad .env
```

Set `DB_PASSWORD` to the password chosen in step 1. Replace `JWT_SECRET` with a unique secret of at least 32 bytes. To generate one in PowerShell, run the command below and copy its output after `JWT_SECRET=` in `.env`:

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Save the file. `.env` is ignored by Git. You only need to configure it once for local development.

### 3. Start the backend

Open PowerShell in the backend folder and run:

```powershell
cd D:\Habit-Manager\Habit-Manager-Backend-main
.\mvnw.cmd spring-boot:run
```

Spring Boot reads `.env` from the backend folder. The first start may download Maven dependencies. A successful start shows `Started HabitManagerApplication`; the API listens at `http://localhost:8080`. For a new database, Flyway applies migrations V1–V6. Keep this PowerShell window open; press `Ctrl+C` to stop the backend.

New registrations currently require a password of 5–12 characters. Password reset requires SMTP settings. For local development, set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, and `FRONTEND_BASE_URL`. Reset links expire after 20 minutes and can be used once. New passwords are stored with PBKDF2; existing BCrypt passwords remain supported for login.

### 4. Optional: enable the free local AI Coach

Install [Ollama](https://ollama.com/download). In PowerShell, download the model once:

```powershell
ollama pull qwen2.5:3b
```

The model download needs an internet connection and about 1.9 GB of disk space. Keep Ollama running, then start the backend. In the app, open **AI Coach** and choose **Get my coaching plan**. The Coach generates advice in English from active habits and the last seven days of progress. Processing stays on your computer; no paid AI API key is required. Ollama listens at `http://localhost:11434` by default. You can change `OLLAMA_BASE_URL` and `OLLAMA_MODEL` in `.env`.

### 5. Start the frontend

Open a second PowerShell window. Keep the backend window open, then run:

```powershell
cd D:\Habit-Manager\Habit-Manager-Frontend-main
npm ci
npm run dev
```

Open the local URL printed in the terminal, usually `http://localhost:5173`. Register and sign in there. During development, the frontend proxies `/api` requests to `http://localhost:8080`; no `VITE_API_URL` or CORS changes are needed for local use.

## Troubleshooting

- If MySQL cannot be reached, confirm that MySQL Server is running, the database name is correct, and port `3306` is available.
- For `Access denied`, check `DB_USERNAME` and `DB_PASSWORD` against the MySQL app user.
- If `JWT_SECRET` is missing, confirm that `.env` exists in the backend folder and contains `JWT_SECRET` (not only `.env.example`).
- If a port is already in use, stop the existing backend or frontend process before restarting it.
- If the AI Coach says Ollama is unavailable, open the Ollama app or run `ollama serve`; confirm the model is installed with `ollama list`.

## Existing databases

Back up the database before deploying this version. New databases receive Flyway migrations V1–V6 in order. For a database created by an earlier version, inspect its schema and migration history before baselining Flyway. Do not baseline an unverified schema. Do not use `DB_DDL_AUTO=update` in production.

## User features

- The dashboard shows habits scheduled for today and distinguishes completed from partial progress. Incomplete check-ins can be edited.
- Create and edit habits, filter by category, archive habits, and restore them later. Archiving preserves check-in history.
- The calendar and weekly insights calculate progress only on scheduled days. Users can set their timezone.
- Set reminder times and days for each habit. In-app reminders appear only while the app is open in a browser. Email reminders require SMTP configuration.
- Export data as JSON or delete the account after confirming the password. Users can request password-reset emails from the login page.
- The sidebar supports light/dark themes and collapsed mode.

## Production checklist

Provide secrets through a secret manager or environment variables. Use TLS between the client and API, a least-privilege MySQL account, a strong unique JWT signing key, and a dedicated mail account or provider. Set `CORS_ALLOWED_ORIGINS` to the exact public frontend origins. When possible, serve the frontend and API behind a reverse proxy on the same origin.

Spring Boot health and readiness/liveness probes are available under `/actuator/health`; detailed health information is not exposed publicly.

Registration currently requires a username of 3–50 characters, a valid email, and a password of 5–12 characters. The authentication token is stored in browser `sessionStorage` for the current session and normally expires after one hour. Before a public production launch, reconsider the short password limit and move authentication to HttpOnly cookies; add authentication rate limiting as well. Users can export their data or delete their account from Settings.

## Useful checks

- Frontend lint: `npm run lint`
- Frontend production build: `npm run build`
- Backend package without running tests: `mvn -DskipTests package`
